export const en = {
	app: {
		title: 'TigerMom',
	},
	auth: {
		signIn: 'Sign in',
		signUp: 'Sign up',
		signOut: 'Sign out',
		welcome: 'Welcome, {name}!',
		signingIn: 'Signing in…',
		creatingAccount: 'Creating account…',
		createYourAccount: 'Create your account',
		email: 'Email',
		emailPlaceholder: 'you@example.com',
		password: 'Password',
		passwordPlaceholder: 'At least 8 characters',
		firstName: 'First name',
		lastName: 'Last name',
		phone: 'Phone (optional)',
		phonePlaceholder: '+1 555 555 5555',
		noAccount: 'No account?',
		createOne: 'Create one',
		alreadyHaveAccount: 'Already have an account?',
		passwordMinLength: 'Password must be at least 8 characters',
		failedToSignIn: 'Failed to sign in',
		failedToSignUp: 'Failed to sign up',
	},
	tasks: {
		addPlaceholder: 'Add a task...',
		addButton: 'Add',
		addingButton: 'Adding...',
		loading: 'Loading...',
		pleaseSignIn: 'Please sign in to view and add tasks.',
	},
} as const;

export type Translations = typeof en;
