<template>
	<ClientOnly>
		<div class="page">
			<div class="container">
				<!-- Back Button -->
				<div class="back-button-wrapper">
					<NuxtLink to="/" class="btn btn-back">
						← {{ t.common?.back }}
					</NuxtLink>
				</div>

				<!-- Loading State -->
				<div v-if="isLoading" class="loading-container">
					<div class="spinner"></div>
					<p>{{ t.tutorSearch?.loadingTutor }}</p>
				</div>

				<!-- Error State -->
				<div v-else-if="error" class="error-container">
					<div class="error-icon">⚠️</div>
					<h2>{{ t.common?.error }}</h2>
					<p>{{ error }}</p>
					<NuxtLink to="/" class="btn btn-primary">
						{{ t.common?.backToHome }}
					</NuxtLink>
				</div>

				<!-- Tutor Details -->
				<div v-else-if="tutor" class="tutor-details">
					<div class="tutor-header">
						<div class="tutor-avatar">
							{{ getInitials(tutor.firstName, tutor.lastName) }}
						</div>
						<div class="tutor-header-info">
							<h1 class="tutor-name">
								{{ tutor.firstName }} {{ tutor.lastName }}
							</h1>
							<div class="tutor-meta">
								<span v-if="tutor.hourlyRate" class="rate-badge">
									€{{ tutor.hourlyRate }}/{{ t.tutorSearch?.perHour || 'hour' }}
								</span>
							</div>
						</div>
					</div>

					<div class="tutor-content">
						<!-- Contact Button -->
						<div class="info-section">
							<button @click="openContactModal" class="btn btn-contact">
								{{ t.tutorSearch?.contactButton }}
							</button>
						</div>

						<!-- Categories -->
						<div class="info-section">
							<h2 class="section-title">
								{{ t.tutorSearch?.tableCategories }}
							</h2>
							<div class="categories-grid">
								<span
									v-for="cat in tutor.categories"
									:key="cat"
									class="category-badge"
								>
									{{ getCategoryLabel(cat) }}
								</span>
							</div>
						</div>

						<!-- Bio/Description (if available) -->
						<div v-if="tutor.bio" class="info-section">
							<h2 class="section-title">
								{{ t.tutorSearch?.about }}
							</h2>
							<p class="bio-text">{{ tutor.bio }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Contact Modal -->
		<div
			v-if="showContactModal"
			class="modal-overlay"
			@click="closeContactModal"
		>
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h2 class="modal-title">
						{{
							t.tutorSearch?.contactModalTitle?.replace(
								'{tutorName}',
								`${tutor?.firstName} ${tutor?.lastName}`
							)
						}}
					</h2>
					<button @click="closeContactModal" class="modal-close">×</button>
				</div>
				<div class="modal-body">
					<textarea
						v-model="contactMessage"
						:placeholder="t.tutorSearch?.contactMessagePlaceholder"
						class="contact-textarea"
						rows="10"
					></textarea>
				</div>
				<div class="modal-footer">
					<button @click="closeContactModal" class="btn btn-secondary">
						{{ t.tutorSearch?.cancelButton }}
					</button>
					<button
						@click="sendContactMessage"
						:disabled="isSending"
						class="btn btn-primary"
					>
						{{
							isSending
								? t.tutorSearch?.sendingButton
								: t.tutorSearch?.sendButton
						}}
					</button>
				</div>
				<div v-if="contactError" class="modal-error">
					{{ contactError }}
				</div>
				<div v-if="contactSuccess" class="modal-success">
					{{ t.tutorSearch?.contactSuccess }}
				</div>
			</div>
		</div>
	</ClientOnly>
</template>

<script setup lang="ts">
import { $fetch } from 'ofetch';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { translations as t } from '../composables/useI18n';

const route = useRoute();
const router = useRouter();
const { auth } = useAuth();

const tutor = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Contact modal state
const showContactModal = ref(false);
const contactMessage = ref('');
const isSending = ref(false);
const contactError = ref('');
const contactSuccess = ref(false);

// Handle ESC key to close modal
function handleKeyDown(event: KeyboardEvent) {
	if (event.key === 'Escape' && showContactModal.value) {
		closeContactModal();
	}
}

onMounted(async () => {
	// Add event listener for ESC key
	window.addEventListener('keydown', handleKeyDown);

	const tutorId = route.query.id;

	if (!tutorId || typeof tutorId !== 'string') {
		error.value = t.tutorSearch?.tutorNotFound || 'Tutor not found';
		isLoading.value = false;
		return;
	}

	try {
		// Fetch tutor details from API
		const response = await $fetch(`/api/tutors/${tutorId}`);
		tutor.value = response.tutor;
	} catch (err: any) {
		console.error('Error fetching tutor details:', err);
		error.value =
			err.message ||
			t.tutorSearch?.errorLoadingTutor ||
			'Error loading tutor details';
	} finally {
		isLoading.value = false;
	}
});

onUnmounted(() => {
	// Remove event listener for ESC key
	window.removeEventListener('keydown', handleKeyDown);
});

function getInitials(firstName: string, lastName: string): string {
	return `${firstName?.charAt(0) || ''}${
		lastName?.charAt(0) || ''
	}`.toUpperCase();
}

function getCategoryLabel(categoryPath: string): string {
	if (!categoryPath || !t.tutorCategories) {
		return categoryPath;
	}

	const parts = categoryPath.split('.');
	const tutorCats = t.tutorCategories;

	if (parts.length === 1) {
		const category = tutorCats[parts[0] as keyof typeof tutorCats];
		return typeof category === 'string' ? category : parts[0] || categoryPath;
	} else if (parts.length === 2) {
		const [parent, child] = parts;
		const parentCategory = tutorCats[parent as keyof typeof tutorCats];

		if (typeof parentCategory === 'object' && parentCategory !== null) {
			const parentLabel = parentCategory._ || parent;
			const childLabel = parentCategory[child as keyof typeof parentCategory];

			if (typeof childLabel === 'string') {
				return `${parentLabel}${
					t.tutorSearch?.categorySeparator || ' / '
				}${childLabel}`;
			}
		}
	}

	return categoryPath;
}

function openContactModal() {
	// Check if user is authenticated
	if (!auth.value) {
		alert(t.tutorSearch?.signInToContact);
		router.push('/auth/signin');
		return;
	}

	// Get current locale
	const locale = (window as any).__locale || 'en';

	// Get user info
	const user = auth.value.user;
	const userPhone = user.phone || t.tutorSearch?.phoneNotProvided;

	// Pre-fill message with template
	const template = t.tutorSearch?.contactMessageTemplate || '';
	contactMessage.value = template
		.replace('{tutorName}', `${tutor.value.firstName} ${tutor.value.lastName}`)
		.replace('{userEmail}', user.email)
		.replace('{userPhone}', userPhone);

	showContactModal.value = true;
	contactError.value = '';
	contactSuccess.value = false;
}

function closeContactModal() {
	showContactModal.value = false;
	contactMessage.value = '';
	contactError.value = '';
	contactSuccess.value = false;
}

async function sendContactMessage() {
	if (!auth.value || !tutor.value) return;

	// Check if tutor email is available
	if (!tutor.value.email) {
		console.error('Tutor email is missing. Please refresh the page.');
		contactError.value =
			'Tutor information is incomplete. Please refresh the page and try again.';
		return;
	}

	isSending.value = true;
	contactError.value = '';
	contactSuccess.value = false;

	try {
		const locale = (window as any).__locale || 'en';

		const requestBody = {
			tutorId: tutor.value._id,
			tutorEmail: tutor.value.email,
			tutorName: `${tutor.value.firstName} ${tutor.value.lastName}`,
			message: contactMessage.value,
			locale,
		};

		console.log('Sending request body:', requestBody);

		await $fetch('/api/tutors/contact', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${auth.value.token}`,
				'Content-Type': 'application/json',
			},
			body: requestBody,
		});

		contactSuccess.value = true;
		setTimeout(() => {
			closeContactModal();
		}, 2000);
	} catch (err: any) {
		console.error('Error sending contact message:', err);
		contactError.value =
			t.tutorSearch?.contactError ||
			'Failed to send message. Please try again.';
	} finally {
		isSending.value = false;
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
	max-width: 800px;
	margin: 0 auto;
}

.back-button-wrapper {
	margin-bottom: 20px;
}

.btn-back {
	background: rgba(255, 255, 255, 0.95);
	color: #374151;
	padding: 10px 20px;
	border-radius: 10px;
	text-decoration: none;
	font-weight: 600;
	display: inline-block;
	transition: all 0.3s ease;
	border: 2px solid transparent;
}

.btn-back:hover {
	background: white;
	border-color: #667eea;
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Loading State */
.loading-container {
	text-align: center;
	padding: 60px 20px;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.spinner {
	width: 50px;
	height: 50px;
	margin: 0 auto 20px;
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

.loading-container p {
	color: #6b7280;
	font-size: 16px;
	margin: 0;
}

/* Error State */
.error-container {
	text-align: center;
	padding: 60px 40px;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.error-icon {
	font-size: 64px;
	margin-bottom: 20px;
}

.error-container h2 {
	font-size: 28px;
	font-weight: 700;
	color: #dc2626;
	margin: 0 0 12px;
}

.error-container p {
	color: #6b7280;
	font-size: 16px;
	margin: 0 0 24px;
}

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

/* Tutor Details */
.tutor-details {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	overflow: hidden;
}

.tutor-header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40px;
	display: flex;
	align-items: center;
	gap: 24px;
	color: white;
}

.tutor-avatar {
	width: 100px;
	height: 100px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36px;
	font-weight: 700;
	border: 4px solid rgba(255, 255, 255, 0.3);
	flex-shrink: 0;
}

.tutor-header-info {
	flex: 1;
}

.tutor-name {
	font-size: 36px;
	font-weight: 800;
	margin: 0 0 12px;
	color: white;
}

.tutor-meta {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
}

.rate-badge {
	display: inline-block;
	padding: 8px 16px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 8px;
	font-size: 18px;
	font-weight: 600;
	border: 2px solid rgba(255, 255, 255, 0.3);
}

.tutor-content {
	padding: 40px;
}

.info-section {
	margin-bottom: 40px;
}

.info-section:last-child {
	margin-bottom: 0;
}

.section-title {
	font-size: 24px;
	font-weight: 700;
	color: #111827;
	margin: 0 0 20px;
	padding-bottom: 12px;
	border-bottom: 3px solid #667eea;
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 24px;
}

.info-item {
	background: #f9fafb;
	padding: 20px;
	border-radius: 12px;
	border: 2px solid #e5e7eb;
	transition: all 0.3s ease;
}

.info-item:hover {
	border-color: #667eea;
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.info-label {
	font-size: 12px;
	font-weight: 600;
	text-transform: uppercase;
	color: #6b7280;
	letter-spacing: 0.5px;
	margin-bottom: 8px;
}

.info-value {
	font-size: 16px;
	color: #111827;
	font-weight: 500;
}

.link {
	color: #667eea;
	text-decoration: none;
	transition: color 0.3s ease;
}

.link:hover {
	color: #764ba2;
	text-decoration: underline;
}

.categories-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
}

.category-badge {
	display: inline-block;
	padding: 10px 18px;
	background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%);
	color: #6b21a8;
	border-radius: 10px;
	font-size: 14px;
	font-weight: 600;
	border: 2px solid #ddd6fe;
	transition: all 0.3s ease;
}

.category-badge:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(107, 33, 168, 0.2);
}

.bio-text {
	font-size: 16px;
	line-height: 1.7;
	color: #374151;
	margin: 0;
	background: #f9fafb;
	padding: 24px;
	border-radius: 12px;
	border: 2px solid #e5e7eb;
}

/* Contact Button */
.btn-contact {
	width: 100%;
	padding: 16px 32px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	border: none;
	border-radius: 12px;
	font-weight: 600;
	font-size: 18px;
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-contact:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

/* Modal Styles */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: 20px;
}

.modal-content {
	background: white;
	border-radius: 20px;
	max-width: 600px;
	width: 100%;
	max-height: 90vh;
	overflow-y: auto;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24px;
	border-bottom: 2px solid #e5e7eb;
}

.modal-title {
	font-size: 24px;
	font-weight: 700;
	color: #111827;
	margin: 0;
}

.modal-close {
	background: none;
	border: none;
	font-size: 32px;
	color: #6b7280;
	cursor: pointer;
	padding: 0;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	transition: all 0.3s ease;
}

.modal-close:hover {
	background: #f3f4f6;
	color: #111827;
}

.modal-body {
	padding: 24px;
}

.contact-textarea {
	width: 100%;
	padding: 16px;
	border: 2px solid #e5e7eb;
	border-radius: 12px;
	font-size: 16px;
	font-family: inherit;
	line-height: 1.6;
	resize: vertical;
	transition: border-color 0.3s ease;
	box-sizing: border-box;
}

.contact-textarea:focus {
	outline: none;
	border-color: #667eea;
}

.modal-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	padding: 24px;
	border-top: 2px solid #e5e7eb;
}

.btn-secondary {
	background: #f3f4f6;
	color: #374151;
	padding: 12px 24px;
	border-radius: 12px;
	font-weight: 600;
	font-size: 16px;
	cursor: pointer;
	transition: all 0.3s ease;
	border: none;
}

.btn-secondary:hover {
	background: #e5e7eb;
}

.modal-error {
	margin: 0 24px 24px;
	padding: 12px 16px;
	background: #fef2f2;
	color: #dc2626;
	border-radius: 8px;
	border: 2px solid #fecaca;
	font-size: 14px;
}

.modal-success {
	margin: 0 24px 24px;
	padding: 12px 16px;
	background: #f0fdf4;
	color: #16a34a;
	border-radius: 8px;
	border: 2px solid #bbf7d0;
	font-size: 14px;
}

.btn-primary:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none !important;
}

/* Responsive Design */
@media (max-width: 640px) {
	.tutor-header {
		flex-direction: column;
		padding: 30px 20px;
		text-align: center;
	}

	.tutor-avatar {
		width: 80px;
		height: 80px;
		font-size: 28px;
	}

	.tutor-name {
		font-size: 28px;
	}

	.tutor-meta {
		justify-content: center;
	}

	.tutor-content {
		padding: 24px 20px;
	}

	.section-title {
		font-size: 20px;
	}

	.info-grid {
		grid-template-columns: 1fr;
		gap: 16px;
	}
}
</style>
