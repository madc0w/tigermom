import { useState } from 'nuxt/app';
import { computed, onMounted, watch } from 'vue';

export type AuthPayload = {
	user: {
		_id: string;
		email: string;
		firstName: string;
		lastName: string;
		phone?: string | null;
		createdAt: string | Date;
	};
	token: string;
};

export function useAuth() {
	const auth = useState<AuthPayload | null>('auth', () => null);

	onMounted(() => {
		if (typeof window !== 'undefined') {
			try {
				const raw = localStorage.getItem('auth');
				if (raw) auth.value = JSON.parse(raw);
			} catch (_) {
				// ignore parse errors
			}
		}
	});

	watch(
		auth,
		(val) => {
			if (typeof window === 'undefined') return;
			if (val) localStorage.setItem('auth', JSON.stringify(val));
			else localStorage.removeItem('auth');
		},
		{ deep: true }
	);

	const isAuthenticated = computed(() => !!auth.value);

	function setAuth(value: AuthPayload | null) {
		auth.value = value;
	}

	function signOut() {
		setAuth(null);
	}

	return { auth, isAuthenticated, setAuth, signOut };
}
