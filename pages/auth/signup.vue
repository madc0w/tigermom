<template>
	<div class="auth-container">
		<h2>Create your account</h2>
		<form class="form" @submit.prevent="onSubmit">
			<label>
				<span>Email</span>
				<input
					v-model.trim="email"
					type="email"
					required
					placeholder="you@example.com"
				/>
			</label>
			<div class="row">
				<label>
					<span>First name</span>
					<input v-model.trim="firstName" required />
				</label>
				<label>
					<span>Last name</span>
					<input v-model.trim="lastName" required />
				</label>
			</div>
			<label>
				<span>Password</span>
				<input
					v-model="password"
					type="password"
					required
					minlength="8"
					placeholder="At least 8 characters"
				/>
			</label>
			<label>
				<span>Phone (optional)</span>
				<input v-model.trim="phone" type="tel" placeholder="+1 555 555 5555" />
			</label>

			<button class="btn" :disabled="submitting">
				{{ submitting ? 'Creating account…' : 'Sign up' }}
			</button>

			<p v-if="errorMsg" class="error">{{ errorMsg }}</p>
			<p class="switch">
				Already have an account? <NuxtLink to="/auth/signin">Sign in</NuxtLink>
			</p>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { AuthPayload } from '../../composables/useAuth';
import { useAuth } from '../../composables/useAuth';
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
		errorMsg.value = 'Password must be at least 8 characters';
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
		errorMsg.value = e?.data?.message || e?.message || 'Failed to sign up';
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
