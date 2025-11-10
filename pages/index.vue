<template>
	<div class="page">
		<div class="container">
			<!-- Hero Section -->
			<div class="hero">
				<div class="logo-wrapper">
					<img src="/tutorlux.png" :alt="t.app.logoAlt" class="logo" />
				</div>
				<h1 class="app-title">{{ t.app.title }}</h1>
				<p class="tagline">{{ t.app.tagline }}</p>

				<!-- Auth Section -->
				<div v-if="!isAuthenticated" class="auth-section">
					<div class="auth-buttons">
						<NuxtLink to="/auth/signin" class="btn btn-primary">
							{{ t.auth.signIn }}
						</NuxtLink>
						<NuxtLink to="/auth/signup" class="btn btn-secondary">
							{{ t.auth.signUp }}
						</NuxtLink>
					</div>
				</div>
				<div v-else class="user-header">
					<span class="welcome-message">{{
						t.auth.welcome.replace('{name}', currentUser?.firstName || '')
					}}</span>
					<div class="user-actions">
						<NuxtLink to="/settings" class="btn btn-outline">
							{{ t.settings.title }}
						</NuxtLink>
						<button class="btn btn-outline" @click="logout">
							{{ t.auth.signOut }}
						</button>
					</div>
				</div>
			</div>

			<!-- Content Section -->
			<div v-if="!isAuthenticated" class="welcome-content">
				<div class="feature-grid">
					<div class="feature-card">
						<div class="feature-icon">✓</div>
						<h3>{{ t.features.simpleTaskManagement.title }}</h3>
						<p>{{ t.features.simpleTaskManagement.description }}</p>
					</div>
					<div class="feature-card">
						<div class="feature-icon">🔒</div>
						<h3>{{ t.features.secureAndPrivate.title }}</h3>
						<p>{{ t.features.secureAndPrivate.description }}</p>
					</div>
					<div class="feature-card">
						<div class="feature-icon">⚡</div>
						<h3>{{ t.features.fastAndResponsive.title }}</h3>
						<p>{{ t.features.fastAndResponsive.description }}</p>
					</div>
				</div>
			</div>

			<template v-else>
				<!-- Task Input Section -->
				<div class="task-section">
					<form class="task-form" @submit.prevent="add">
						<input
							v-model="newTitle"
							class="task-input"
							:placeholder="t.tasks.addPlaceholder"
							:disabled="adding"
						/>
						<button class="btn btn-add" :disabled="adding || !newTitle.trim()">
							{{ adding ? t.tasks.addingButton : t.tasks.addButton }}
						</button>
					</form>

					<!-- Task List -->
					<div class="task-list-wrapper">
						<div v-if="pending" class="loading">{{ t.tasks.loading }}</div>
						<div v-else-if="error" class="error">{{ error.message }}</div>
						<div v-else-if="!tasks || tasks.length === 0" class="empty-state">
							<div class="empty-icon">📝</div>
							<p>{{ t.tasks.emptyState }}</p>
						</div>
						<ul v-else class="task-list">
							<li v-for="t in tasks || []" :key="asKey(t)" class="task-item">
								<span class="task-title">{{ t.title }}</span>
								<time class="task-date">{{ fmt(t.createdAt) }}</time>
							</li>
						</ul>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { $fetch } from 'ofetch';
import { computed, ref, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { en } from '../i18n/en';

const t = en;

type Task = {
	_id: string | { $oid: string } | any;
	title: string;
	createdAt: string | Date;
};

const newTitle = ref('');
const adding = ref(false);
const tasks = ref<Task[] | null>(null);
const pending = ref(false);
const error = ref<Error | null>(null);
const { auth, isAuthenticated, signOut } = useAuth();
// Computed user object to help template type narrowing (avoids possibly null error)
const currentUser = computed(() => auth.value?.user || null);

function logout() {
	signOut();
	tasks.value = [];
}

async function refresh() {
	pending.value = true;
	try {
		tasks.value = await $fetch<Task[]>('/api/tasks');
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

function asKey(t: Task) {
	// Handle possible different shapes for ObjectId when serialized
	return typeof t._id === 'string'
		? t._id
		: t._id?.$oid ?? JSON.stringify(t._id);
}

function fmt(d: string | Date) {
	return new Date(d).toLocaleString();
}

async function add() {
	if (!newTitle.value.trim()) return;
	adding.value = true;
	try {
		await $fetch('/api/tasks', {
			method: 'POST',
			body: { title: newTitle.value },
		});
		newTitle.value = '';
		await refresh();
	} finally {
		adding.value = false;
	}
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

/* Task Section */
.task-section {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20px;
	padding: 40px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.task-form {
	display: flex;
	gap: 12px;
	margin-bottom: 30px;
}

.task-input {
	flex: 1;
	padding: 14px 20px;
	border: 2px solid #e5e7eb;
	border-radius: 12px;
	font-size: 16px;
	transition: all 0.3s ease;
}

.task-input:focus {
	outline: none;
	border-color: #667eea;
	box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

/* Task List */
.task-list-wrapper {
	min-height: 200px;
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

.task-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: grid;
	gap: 12px;
}

.task-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px 20px;
	background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
	border: 2px solid #e5e7eb;
	border-radius: 12px;
	transition: all 0.3s ease;
}

.task-item:hover {
	transform: translateX(5px);
	border-color: #667eea;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-title {
	font-weight: 600;
	color: #111827;
	font-size: 16px;
}

.task-date {
	color: #9ca3af;
	font-size: 13px;
	font-weight: 500;
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

	.welcome-content,
	.task-section {
		padding: 24px 16px;
	}

	.feature-grid {
		grid-template-columns: 1fr;
		gap: 20px;
	}

	.task-form {
		flex-direction: column;
	}

	.task-item {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
}
</style>
