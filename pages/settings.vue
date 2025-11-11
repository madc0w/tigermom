<template>
	<div class="settings-page">
		<div class="settings-container">
			<div class="settings-header">
				<h1>{{ t.value.settings.title }}</h1>
				<NuxtLink to="/" class="btn btn-outline">
					{{ t.value.settings.backToHome }}
				</NuxtLink>
			</div>

			<div v-if="!isAuthenticated" class="not-authenticated">
				<p>{{ t.value.tasks.pleaseSignIn }}</p>
				<NuxtLink to="/auth/signin" class="btn btn-primary">
					{{ t.value.auth.signIn }}
				</NuxtLink>
			</div>

			<template v-else>
				<!-- Personal Information Section -->
				<div class="settings-section">
					<h2>{{ t.value.settings.personalInformation }}</h2>
					<form class="settings-form" @submit.prevent="updateProfile">
						<div class="form-row">
							<label>
								<span>{{ t.value.auth.firstName }}</span>
								<input
									v-model.trim="profileForm.firstName"
									type="text"
									required
									:disabled="updatingProfile"
								/>
							</label>
							<label>
								<span>{{ t.value.auth.lastName }}</span>
								<input
									v-model.trim="profileForm.lastName"
									type="text"
									required
									:disabled="updatingProfile"
								/>
							</label>
						</div>

						<label>
							<span>{{ t.value.auth.email }}</span>
							<input
								v-model.trim="profileForm.email"
								type="email"
								required
								:disabled="updatingProfile"
							/>
						</label>

						<label>
							<span>{{ t.value.auth.phone }}</span>
							<input
								v-model.trim="profileForm.phone"
								type="tel"
								:placeholder="t.value.auth.phonePlaceholder"
								:disabled="updatingProfile"
							/>
						</label>

						<div v-if="profileSuccess" class="success-message">
							{{ t.value.settings.successProfileUpdated }}
						</div>
						<div v-if="profileError" class="error-message">
							{{ profileError }}
						</div>

						<button class="btn btn-primary" :disabled="updatingProfile">
							{{
								updatingProfile ? t.settings.updating : t.settings.updateProfile
							}}
						</button>
					</form>
				</div>

				<!-- Change Password Section -->
				<div class="settings-section">
					<h2>{{ t.value.settings.changePassword }}</h2>
					<form class="settings-form" @submit.prevent="updatePassword">
						<label>
							<span>{{ t.value.settings.currentPassword }}</span>
							<input
								v-model="passwordForm.currentPassword"
								type="password"
								:placeholder="t.value.settings.currentPasswordPlaceholder"
								required
								:disabled="updatingPassword"
							/>
						</label>

						<label>
							<span>{{ t.value.settings.newPassword }}</span>
							<input
								v-model="passwordForm.newPassword"
								type="password"
								:placeholder="t.value.settings.newPasswordPlaceholder"
								required
								:disabled="updatingPassword"
							/>
						</label>

						<label>
							<span>{{ t.value.settings.confirmPassword }}</span>
							<input
								v-model="passwordForm.confirmPassword"
								type="password"
								:placeholder="t.value.settings.confirmPasswordPlaceholder"
								required
								:disabled="updatingPassword"
							/>
						</label>

						<div v-if="passwordSuccess" class="success-message">
							{{ t.value.settings.successPasswordUpdated }}
						</div>
						<div v-if="passwordError" class="error-message">
							{{ passwordError }}
						</div>

						<button class="btn btn-primary" :disabled="updatingPassword">
							{{
								updatingPassword
									? t.settings.updatingPassword
									: t.settings.updatePassword
							}}
						</button>
					</form>
				</div>

				<!-- Account Information Section -->
				<div class="settings-section">
					<h2>{{ t.value.settings.accountInformation }}</h2>
					<div class="account-info">
						<div class="info-row">
							<span class="info-label">{{ t.value.settings.memberSince }}</span>
							<span class="info-value">{{
								formatDate(auth?.user.createdAt)
							}}</span>
						</div>
						<div class="info-row">
							<span class="info-label">{{ t.value.auth.email }}</span>
							<span class="info-value">{{ auth?.user.email }}</span>
						</div>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { $fetch } from 'ofetch';
import { onMounted, ref } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useI18n } from '../composables/useI18n';

const i18n = useI18n();
const t = i18n.t;
const { auth, isAuthenticated, setAuth } = useAuth();

// Profile form state
const profileForm = ref({
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
});

const updatingProfile = ref(false);
const profileSuccess = ref(false);
const profileError = ref('');

// Password form state
const passwordForm = ref({
	currentPassword: '',
	newPassword: '',
	confirmPassword: '',
});

const updatingPassword = ref(false);
const passwordSuccess = ref(false);
const passwordError = ref('');

// Initialize form with user data
onMounted(() => {
	if (auth.value?.user) {
		profileForm.value = {
			firstName: auth.value.user.firstName,
			lastName: auth.value.user.lastName,
			email: auth.value.user.email,
			phone: auth.value.user.phone || '',
		};
	}
});

function formatDate(date: string | Date | undefined): string {
	if (!date) return '-';
	return new Date(date).toLocaleDateString();
}

async function updateProfile() {
	profileSuccess.value = false;
	profileError.value = '';
	updatingProfile.value = true;

	try {
		const response = await $fetch('/api/user/update', {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${auth.value?.token}`,
			},
			body: {
				firstName: profileForm.value.firstName,
				lastName: profileForm.value.lastName,
				email: profileForm.value.email,
				phone: profileForm.value.phone || null,
			},
		});

		// Update local auth state
		if (auth.value) {
			setAuth({
				...auth.value,
				user: {
					...auth.value.user,
					firstName: profileForm.value.firstName,
					lastName: profileForm.value.lastName,
					email: profileForm.value.email,
					phone: profileForm.value.phone || null,
				},
			});
		}

		profileSuccess.value = true;
		setTimeout(() => {
			profileSuccess.value = false;
		}, 3000);
	} catch (e: any) {
		profileError.value =
			e?.data?.statusMessage ||
			e?.message ||
			t.value.settings.errorUpdateFailed;
	} finally {
		updatingProfile.value = false;
	}
}

async function updatePassword() {
	passwordSuccess.value = false;
	passwordError.value = '';

	// Validate passwords match
	if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
		passwordError.value = t.value.settings.passwordsDoNotMatch;
		return;
	}

	// Validate password length
	if (passwordForm.value.newPassword.length < 8) {
		passwordError.value = t.settings.errorPasswordTooShort;
		return;
	}

	updatingPassword.value = true;

	try {
		await $fetch('/api/user/update', {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${auth.value?.token}`,
			},
			body: {
				currentPassword: passwordForm.value.currentPassword,
				newPassword: passwordForm.value.newPassword,
			},
		});

		// Clear password fields
		passwordForm.value = {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		};

		passwordSuccess.value = true;
		setTimeout(() => {
			passwordSuccess.value = false;
		}, 3000);
	} catch (e: any) {
		passwordError.value =
			e?.data?.statusMessage ||
			e?.message ||
			t.value.settings.errorUpdateFailed;
	} finally {
		updatingPassword.value = false;
	}
}
</script>

<style scoped>
.settings-page {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 20px;
}

.settings-container {
	max-width: 800px;
	margin: 0 auto;
}

.settings-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30px;
	background: rgba(255, 255, 255, 0.95);
	padding: 30px;
	border-radius: 20px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.settings-header h1 {
	font-size: 36px;
	font-weight: 800;
	margin: 0;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.not-authenticated {
	background: rgba(255, 255, 255, 0.95);
	padding: 60px 40px;
	border-radius: 20px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	text-align: center;
}

.not-authenticated p {
	font-size: 18px;
	color: #6b7280;
	margin-bottom: 24px;
}

.settings-section {
	background: rgba(255, 255, 255, 0.95);
	padding: 40px;
	border-radius: 20px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	margin-bottom: 24px;
}

.settings-section h2 {
	font-size: 24px;
	font-weight: 700;
	color: #111827;
	margin: 0 0 24px;
	padding-bottom: 16px;
	border-bottom: 2px solid #e5e7eb;
}

.settings-form {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.form-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
}

label {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

label span {
	font-weight: 600;
	color: #374151;
	font-size: 14px;
}

input {
	padding: 12px 16px;
	border: 2px solid #e5e7eb;
	border-radius: 10px;
	font-size: 16px;
	transition: all 0.3s ease;
}

input:focus {
	outline: none;
	border-color: #667eea;
	box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:disabled {
	background-color: #f3f4f6;
	cursor: not-allowed;
}

.btn {
	padding: 12px 24px;
	border-radius: 12px;
	font-weight: 600;
	font-size: 16px;
	cursor: pointer;
	transition: all 0.3s ease;
	border: none;
	text-decoration: none;
	display: inline-block;
	text-align: center;
}

.btn-primary {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover:not(:disabled) {
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-outline {
	background: white;
	color: #667eea;
	border: 2px solid #667eea;
}

.btn-outline:hover {
	background: #f3f4f6;
	transform: translateY(-2px);
}

.btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none !important;
}

.success-message {
	padding: 12px 16px;
	background: #d1fae5;
	color: #065f46;
	border-radius: 10px;
	border: 2px solid #6ee7b7;
	font-weight: 600;
}

.error-message {
	padding: 12px 16px;
	background: #fee2e2;
	color: #991b1b;
	border-radius: 10px;
	border: 2px solid #fca5a5;
	font-weight: 600;
}

.account-info {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px;
	background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
	border: 2px solid #e5e7eb;
	border-radius: 12px;
}

.info-label {
	font-weight: 600;
	color: #6b7280;
	font-size: 14px;
}

.info-value {
	font-weight: 600;
	color: #111827;
	font-size: 16px;
}

/* Responsive Design */
@media (max-width: 640px) {
	.settings-header {
		flex-direction: column;
		gap: 16px;
		padding: 20px 16px;
	}

	.settings-header h1 {
		font-size: 28px;
	}

	.settings-section {
		padding: 24px 16px;
	}

	.form-row {
		grid-template-columns: 1fr;
	}

	.info-row {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
}
</style>
