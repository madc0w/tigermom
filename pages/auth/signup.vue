<template>
	<div class="auth-container">
		<h2>{{ t.value.auth.createYourAccount }}</h2>
		<form class="form" @submit.prevent="onSubmit">
			<label>
				<span>{{ t.value.auth.email }}</span>
				<input
					v-model.trim="email"
					type="email"
					required
					:placeholder="t.value.auth.emailPlaceholder"
				/>
			</label>
			<div class="row">
				<label>
					<span>{{ t.value.auth.firstName }}</span>
					<input v-model.trim="firstName" required />
				</label>
				<label>
					<span>{{ t.value.auth.lastName }}</span>
					<input v-model.trim="lastName" required />
				</label>
			</div>
			<label>
				<span>{{ t.value.auth.password }}</span>
				<input
					v-model="password"
					type="password"
					required
					minlength="8"
					:placeholder="t.value.auth.passwordPlaceholder"
				/>
			</label>
			<label>
				<span>{{ t.value.auth.phone }}</span>
				<input
					v-model.trim="phone"
					type="tel"
					:placeholder="t.value.auth.phonePlaceholder"
				/>
			</label>

			<button class="btn" :disabled="submitting">
				{{ submitting ? t.value.auth.creatingAccount : t.value.auth.signUp }}
			</button>

			<p v-if="errorMsg" class="error">{{ errorMsg }}</p>
			<p class="switch">
				{{ t.value.auth.alreadyHaveAccount }}
				<NuxtLink to="/auth/signin">{{ t.value.auth.signIn }}</NuxtLink>
			</p>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { AuthPayload } from '../../composables/useAuth';
import { useAuth } from '../../composables/useAuth';
import { useI18n } from '../../composables/useI18n';

const i18n = useI18n();
const t = i18n.t;

const email = ref('');
const firstName = ref('');
const lastName = ref('');
const password = ref('');
const phone = ref('');
const submitting = ref(false);
const errorMsg = ref('');
const { setAuth } = useAuth();
const router = useRouter();

async function onSubmit() {
	errorMsg.value = '';
	if (password.value.length < 8) {
		errorMsg.value = t.value.auth.passwordMinLength;
		return;
	}
	submitting.value = true;
	try {
		const res = await $fetch<AuthPayload>('/api/auth/signup', {
			method: 'POST',
			body: {
				email: email.value,
				firstName: firstName.value,
				lastName: lastName.value,
				password: password.value,
				phone: phone.value || undefined,
			},
		});
		// Persist credentials via composable
		setAuth(res);
		await router.push('/');
	} catch (e: any) {
		errorMsg.value =
			e?.data?.message || e?.message || t.value.auth.failedToSignUp;
	} finally {
		submitting.value = false;
	}
}
</script>

<style scoped>
.auth-container {
	max-width: 480px;
	margin: 40px auto;
	padding: 0 16px;
}
.form {
	display: grid;
	gap: 12px;
}
.row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
}
label {
	display: grid;
	gap: 6px;
}
input {
	padding: 10px 12px;
	border: 1px solid #d1d5db;
	border-radius: 6px;
}
.btn {
	padding: 10px 14px;
	background: #111827;
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
}
.error {
	color: #b91c1c;
}
.switch {
	font-size: 14px;
}
</style>
