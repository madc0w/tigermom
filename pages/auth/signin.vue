<template>
	<div class="auth-container">
		<h2>{{ t.auth.signIn }}</h2>
		<form class="form" @submit.prevent="onSubmit">
			<label>
				<span>{{ t.auth.email }}</span>
				<input
					v-model.trim="email"
					type="email"
					required
					:placeholder="t.auth.emailPlaceholder"
				/>
			</label>
			<label>
				<span>{{ t.auth.password }}</span>
				<input v-model="password" type="password" required />
			</label>

			<button class="btn" :disabled="submitting">
				{{ submitting ? t.auth.signingIn : t.auth.signIn }}
			</button>

			<p v-if="errorMsg" class="error">{{ errorMsg }}</p>
			<p class="switch">
				{{ t.auth.noAccount }}
				<NuxtLink to="/auth/signup">{{ t.auth.createOne }}</NuxtLink>
			</p>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { AuthPayload } from '../../composables/useAuth';
import { useAuth } from '../../composables/useAuth';
import { translations as t } from '../../composables/useI18n';

const email = ref('');
const password = ref('');
const submitting = ref(false);
const errorMsg = ref('');
const { setAuth } = useAuth();
const router = useRouter();

async function onSubmit() {
	errorMsg.value = '';
	submitting.value = true;
	try {
		const res = await $fetch<AuthPayload>('/api/auth/signin', {
			method: 'POST',
			body: {
				email: email.value,
				password: password.value,
			},
		});
		// Persist credentials via composable
		setAuth(res);
		await router.push('/');
	} catch (e: any) {
		errorMsg.value = e?.data?.message || e?.message || t.auth.failedToSignIn;
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
