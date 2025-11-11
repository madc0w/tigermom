<template>
	<ClientOnly>
		<div class="page">
			<div class="container">
				<!-- Hero Section -->
				<div class="hero">
					<div class="logo-wrapper">
						<img src="/tutorlux.png" :alt="t.app?.logoAlt" class="logo" />
					</div>
					<h1 class="app-title">{{ t.app?.title }}</h1>
					<p class="tagline">{{ t.app?.tagline }}</p>
					<!-- Auth Section -->
					<div v-if="isAuthenticated" class="auth-section">
						<span class="welcome-message">{{
							t.auth?.welcome?.replace('{name}', currentUser?.firstName || '')
						}}</span>
						<div class="user-actions">
							<NuxtLink to="/settings" class="btn btn-outline">
								{{ t.settings?.title }}
							</NuxtLink>
							<button class="btn btn-outline" @click="logout">
								{{ t.auth?.signOut }}
							</button>
						</div>
					</div>
					<div v-else class="user-header">
						<div class="auth-buttons">
							<NuxtLink to="/auth/signin" class="btn btn-primary">
								{{ t.auth?.signIn }}
							</NuxtLink>
							<NuxtLink to="/auth/signup" class="btn btn-secondary">
								{{ t.auth?.signUp }}
							</NuxtLink>
						</div>
					</div>
				</div>

				<!-- Content Section -->
				<div class="search-section">
					<div class="search-wrapper">
						<input
							v-model="searchQuery"
							type="text"
							:placeholder="t.tutorSearch?.searchPlaceholder"
							class="search-input"
							@input="handleSearchInput"
							@focus="isShowingDropdown = true"
							@blur="handleBlur"
							@keydown="handleKeyDown"
						/>
						<div
							v-if="isShowingDropdown && filteredCategories.length > 0"
							class="autocomplete-dropdown"
						>
							<div
								v-for="(item, index) in filteredCategories"
								:key="item.value"
								class="autocomplete-item"
								:class="{ active: index === selectedIndex }"
								@mousedown.prevent="selectCategory(item)"
								@mouseenter="selectedIndex = index"
							>
								{{ item.label }}
							</div>
						</div>
					</div>

					<!-- Loading Spinner -->
					<div v-if="isLoadingTutors" class="spinner-container">
						<div class="spinner"></div>
						<p>{{ t.tutorSearch?.loadingTutors }}</p>
					</div>

					<!-- Tutors Table -->
					<div v-else-if="tutors.length > 0" class="tutors-table-container">
						<h3 class="table-title">{{ t.tutorSearch?.availableTutors }}</h3>
						<div class="table-wrapper">
							<table class="tutors-table">
								<thead>
									<tr>
										<th>{{ t.tutorSearch?.tableName }}</th>
										<th>{{ t.tutorSearch?.tableEmail }}</th>
										<th>{{ t.tutorSearch?.tablePhone }}</th>
										<th>{{ t.tutorSearch?.tableRate }}</th>
										<th>{{ t.tutorSearch?.tableCategories }}</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="tutor in tutors" :key="tutor.id">
										<td :data-label="t.tutorSearch?.tableName">
											{{ tutor.firstName }} {{ tutor.lastName }}
										</td>
										<td :data-label="t.tutorSearch?.tableEmail">
											{{ tutor.email }}
										</td>
										<td :data-label="t.tutorSearch?.tablePhone">
											{{ tutor.phone || '—' }}
										</td>
										<td :data-label="t.tutorSearch?.tableRate">
											{{ tutor.hourlyRate ? `$${tutor.hourlyRate}` : '—' }}
										</td>
										<td :data-label="t.tutorSearch?.tableCategories">
											<div class="categories-cell">
												<span
													v-for="cat in tutor.categories"
													:key="cat"
													class="category-tag"
												>
													{{ cat }}
												</span>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<!-- No Results Message -->
					<div
						v-else-if="selectedCategory && !isLoadingTutors"
						class="no-results"
					>
						<p>{{ t.tutorSearch?.noTutorsFound }}</p>
					</div>
				</div>
				<div v-if="!isAuthenticated" class="welcome-content">
					<div class="feature-grid">
						<div class="feature-card">
							<div class="feature-icon">✓</div>
							<h3>{{ t.features?.simpleTaskManagement?.title }}</h3>
							<p>{{ t.features?.simpleTaskManagement?.description }}</p>
						</div>
						<div class="feature-card">
							<div class="feature-icon">🔒</div>
							<h3>{{ t.features?.secureAndPrivate?.title }}</h3>
							<p>{{ t.features?.secureAndPrivate?.description }}</p>
						</div>
						<div class="feature-card">
							<div class="feature-icon">⚡</div>
							<h3>{{ t.features?.fastAndResponsive?.title }}</h3>
							<p>{{ t.features?.fastAndResponsive?.description }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</ClientOnly>
</template>

<script setup lang="ts">
import { $fetch } from 'ofetch';
import { computed, onMounted, ref, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { translations as t } from '../composables/useI18n';

const isReady = ref(false);

onMounted(() => {
	isReady.value = true;
});

const searchQuery = ref('');
const isShowingDropdown = ref(false);
const selectedCategory = ref<string | null>(null);
const selectedIndex = ref(-1);
const isLoadingTutors = ref(false);
const tutors = ref<any[]>([]);
let debounceTimer: NodeJS.Timeout | null = null;

// Build flat list of categories with parent/child labels
const allCategories = computed(() => {
	const categories: Array<{ label: string; value: string }> = [];
	const tutorCats = t.tutorCategories;

	if (!tutorCats) return categories;

	Object.keys(tutorCats).forEach((categoryKey) => {
		const category = tutorCats[categoryKey as keyof typeof tutorCats];

		if (typeof category === 'string') {
			// Top-level category like "other"
			categories.push({
				label: category,
				value: categoryKey,
			});
		} else if (typeof category === 'object' && category !== null) {
			// Nested category with subcategories
			const parentLabel = category._ || categoryKey;

			Object.keys(category).forEach((subKey) => {
				if (subKey !== '_') {
					const subLabel = category[subKey as keyof typeof category];
					if (typeof subLabel === 'string') {
						categories.push({
							label: `${parentLabel} / ${subLabel}`,
							value: `${categoryKey}.${subKey}`,
						});
					}
				}
			});
		}
	});

	return categories;
});

// Filter categories based on search query
const filteredCategories = computed(() => {
	const query = searchQuery.value.trim();

	// Require at least 2 characters before showing results
	if (query.length < 2) {
		return [];
	}

	const queryLower = query.toLowerCase();
	return allCategories.value
		.filter((cat) => cat.label.toLowerCase().includes(queryLower))
		.slice(0, 10); // Limit results to 10
});

function handleSearchInput() {
	isShowingDropdown.value = true;
	selectedIndex.value = -1; // Reset selection when typing
}

function handleBlur() {
	// Delay to allow click on dropdown item
	setTimeout(() => {
		isShowingDropdown.value = false;
		selectedIndex.value = -1;
	}, 200);
}

function handleKeyDown(event: KeyboardEvent) {
	if (!isShowingDropdown.value || filteredCategories.value.length === 0) {
		return;
	}

	switch (event.key) {
		case 'ArrowDown':
			event.preventDefault();
			selectedIndex.value = Math.min(
				selectedIndex.value + 1,
				filteredCategories.value.length - 1
			);
			scrollToSelected();
			break;

		case 'ArrowUp':
			event.preventDefault();
			selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
			scrollToSelected();
			break;

		case 'Enter':
			event.preventDefault();
			if (
				selectedIndex.value >= 0 &&
				selectedIndex.value < filteredCategories.value.length
			) {
				const item = filteredCategories.value[selectedIndex.value];
				if (item) {
					selectCategory(item);
				}
			}
			break;

		case 'Escape':
			event.preventDefault();
			isShowingDropdown.value = false;
			selectedIndex.value = -1;
			break;
	}
}

function scrollToSelected() {
	// Scroll the selected item into view
	setTimeout(() => {
		const dropdown = document.querySelector('.autocomplete-dropdown');
		const selectedItem = document.querySelector('.autocomplete-item.active');
		if (dropdown && selectedItem) {
			const dropdownRect = dropdown.getBoundingClientRect();
			const itemRect = selectedItem.getBoundingClientRect();

			if (itemRect.bottom > dropdownRect.bottom) {
				selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			} else if (itemRect.top < dropdownRect.top) {
				selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			}
		}
	}, 0);
}

function selectCategory(item: { label: string; value: string }) {
	searchQuery.value = item.label;
	selectedCategory.value = item.value;
	isShowingDropdown.value = false;

	// Fetch tutors for the selected category
	fetchTutors(item.value);
}

async function fetchTutors(category: string) {
	if (!category) {
		tutors.value = [];
		return;
	}

	isLoadingTutors.value = true;

	// Clear existing debounce timer
	if (debounceTimer) {
		clearTimeout(debounceTimer);
	}

	// Debounce the API call
	debounceTimer = setTimeout(async () => {
		try {
			const response = await $fetch(
				`/api/tutors/search?category=${encodeURIComponent(category)}`
			);
			tutors.value = response.tutors || [];
		} catch (error) {
			console.error('Error fetching tutors:', error);
			tutors.value = [];
		} finally {
			isLoadingTutors.value = false;
		}
	}, 200);
}

const newTitle = ref('');
const adding = ref(false);
const pending = ref(false);
const error = ref<Error | null>(null);
const { auth, isAuthenticated, signOut } = useAuth();
// Computed user object to help template type narrowing (avoids possibly null error)
const currentUser = computed(() => auth.value?.user || null);

function logout() {
	signOut();
}

async function refresh() {
	pending.value = true;
	try {
		error.value = null;
	} catch (e: any) {
		error.value = e;
	} finally {
		pending.value = false;
	}
}

watch(
	isAuthenticated,
	(val) => {
		if (val) void refresh();
	},
	{ immediate: true }
);

function fmt(d: string | Date) {
	return new Date(d).toLocaleString();
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 20px;
}

.container {
	max-width: 900px;
	margin: 0 auto;
}

/* Hero Section */
.hero {
	text-align: center;
	padding: 40px 20px;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	margin-bottom: 30px;
}

.logo-wrapper {
	margin-bottom: 20px;
}

.logo {
	width: 120px;
	height: 120px;
	object-fit: contain;
	filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.app-title {
	font-size: 48px;
	font-weight: 800;
	margin: 0 0 12px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.tagline {
	font-size: 18px;
	color: #6b7280;
	margin: 0 0 32px;
	font-weight: 500;
}

/* Auth Section */
.auth-section {
	margin-top: 20px;
}

.auth-buttons {
	display: flex;
	gap: 16px;
	justify-content: center;
	flex-wrap: wrap;
}

.user-header {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 20px;
	flex-wrap: wrap;
}

.user-actions {
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
}

.welcome-message {
	font-size: 20px;
	font-weight: 600;
	color: #374151;
}

/* Buttons */
.btn {
	padding: 12px 32px;
	border-radius: 12px;
	font-weight: 600;
	font-size: 16px;
	cursor: pointer;
	transition: all 0.3s ease;
	border: none;
	text-decoration: none;
	display: inline-block;
}

.btn-primary {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
	background: white;
	color: #667eea;
	border: 2px solid #667eea;
}

.btn-secondary:hover {
	background: #f3f4f6;
	transform: translateY(-2px);
}

.btn-outline {
	background: transparent;
	color: #6b7280;
	border: 2px solid #d1d5db;
	padding: 8px 20px;
	font-size: 14px;
}

.btn-outline:hover {
	background: #f9fafb;
	border-color: #9ca3af;
}

.btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none !important;
}

/* Welcome Content */
.welcome-content {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20px;
	padding: 40px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Search Section */
.search-section {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20px;
	padding: 30px 40px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	margin-bottom: 30px;
}

.search-wrapper {
	position: relative;
	max-width: 600px;
	margin: 0 auto;
}

.search-input {
	width: 100%;
	padding: 14px 20px;
	font-size: 16px;
	border: 2px solid #e5e7eb;
	border-radius: 12px;
	outline: none;
	transition: all 0.3s ease;
	font-family: inherit;
}

.search-input:focus {
	border-color: #667eea;
	box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.autocomplete-dropdown {
	position: absolute;
	top: calc(100% + 8px);
	left: 0;
	right: 0;
	background: white;
	border: 2px solid #e5e7eb;
	border-radius: 12px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
	max-height: 300px;
	overflow-y: auto;
	z-index: 1000;
}

.autocomplete-item {
	padding: 12px 20px;
	cursor: pointer;
	transition: background-color 0.2s ease;
	font-size: 15px;
	color: #374151;
}

.autocomplete-item:hover,
.autocomplete-item.active {
	background-color: #f3f4f6;
}

.autocomplete-item.active {
	background-color: #ede9fe;
	color: #6b21a8;
}

.autocomplete-item:not(:last-child) {
	border-bottom: 1px solid #f3f4f6;
}

/* Spinner */
.spinner-container {
	text-align: center;
	padding: 40px 20px;
	margin-top: 30px;
}

.spinner {
	width: 40px;
	height: 40px;
	margin: 0 auto 16px;
	border: 4px solid #e5e7eb;
	border-top-color: #667eea;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.spinner-container p {
	color: #6b7280;
	font-size: 16px;
	margin: 0;
}

/* Tutors Table */
.tutors-table-container {
	margin-top: 30px;
}

.table-title {
	font-size: 24px;
	font-weight: 700;
	color: #111827;
	margin: 0 0 20px;
	text-align: center;
}

.table-wrapper {
	overflow-x: auto;
	border-radius: 12px;
	border: 2px solid #e5e7eb;
}

.tutors-table {
	width: 100%;
	border-collapse: collapse;
	background: white;
}

.tutors-table thead {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
}

.tutors-table th {
	padding: 14px 16px;
	text-align: left;
	font-weight: 600;
	font-size: 14px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.tutors-table td {
	padding: 14px 16px;
	border-bottom: 1px solid #f3f4f6;
	color: #374151;
	font-size: 15px;
}

.tutors-table tbody tr:hover {
	background-color: #f9fafb;
}

.tutors-table tbody tr:last-child td {
	border-bottom: none;
}

.categories-cell {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.category-tag {
	display: inline-block;
	padding: 4px 10px;
	background: #ede9fe;
	color: #6b21a8;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 500;
}

/* No Results */
.no-results {
	text-align: center;
	padding: 40px 20px;
	margin-top: 30px;
	color: #6b7280;
	font-size: 16px;
}

.no-results p {
	margin: 0;
}

.feature-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 30px;
	margin-top: 20px;
}

.feature-card {
	text-align: center;
	padding: 30px;
	background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
	border-radius: 16px;
	border: 2px solid #e5e7eb;
	transition: all 0.3s ease;
}

.feature-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	border-color: #667eea;
}

.feature-icon {
	font-size: 48px;
	margin-bottom: 16px;
}

.feature-card h3 {
	font-size: 20px;
	font-weight: 700;
	color: #111827;
	margin: 0 0 12px;
}

.feature-card p {
	color: #6b7280;
	margin: 0;
	line-height: 1.6;
}

.btn-add {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-add:hover:not(:disabled) {
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.loading {
	text-align: center;
	padding: 40px;
	color: #6b7280;
	font-size: 18px;
}

.error {
	color: #dc2626;
	background: #fef2f2;
	padding: 16px;
	border-radius: 12px;
	border: 1px solid #fecaca;
	text-align: center;
}

.empty-state {
	text-align: center;
	padding: 60px 20px;
	color: #9ca3af;
}

.empty-icon {
	font-size: 64px;
	margin-bottom: 16px;
	opacity: 0.5;
}

.empty-state p {
	font-size: 16px;
	margin: 0;
}

/* Responsive Design */
@media (max-width: 640px) {
	.hero {
		padding: 30px 16px;
	}

	.app-title {
		font-size: 36px;
	}

	.tagline {
		font-size: 16px;
	}

	.logo {
		width: 80px;
		height: 80px;
	}

	.welcome-content {
		padding: 24px 16px;
	}

	.feature-grid {
		grid-template-columns: 1fr;
		gap: 20px;
	}

	.search-section {
		padding: 20px 16px;
	}

	.tutors-table {
		font-size: 14px;
	}

	.tutors-table th,
	.tutors-table td {
		padding: 10px 8px;
	}

	.table-title {
		font-size: 20px;
	}

	/* Stack table on mobile for better readability */
	.tutors-table thead {
		display: none;
	}

	.tutors-table,
	.tutors-table tbody,
	.tutors-table tr,
	.tutors-table td {
		display: block;
	}

	.tutors-table tr {
		margin-bottom: 16px;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
	}

	.tutors-table td {
		padding: 12px;
		text-align: left;
		position: relative;
		padding-left: 50%;
		border-bottom: 1px solid #f3f4f6;
	}

	.tutors-table td:before {
		content: attr(data-label);
		position: absolute;
		left: 12px;
		font-weight: 600;
		text-transform: uppercase;
		font-size: 11px;
		color: #6b7280;
	}

	.tutors-table td:last-child {
		border-bottom: none;
	}
}
</style>
