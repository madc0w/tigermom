export const en = {
	app: {
		title: 'TigerMom',
		logoAlt: 'TigerMom Logo',
		tagline: 'Stay organized. Stay on top of your tasks.',
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
		emptyState: 'No tasks yet. Add one above to get started!',
	},
	features: {
		simpleTaskManagement: {
			title: 'Simple Task Management',
			description: 'Add and track your tasks with ease.',
		},
		secureAndPrivate: {
			title: 'Secure & Private',
			description: 'Your data is protected and private.',
		},
		fastAndResponsive: {
			title: 'Fast & Responsive',
			description: 'Built for speed and efficiency',
		},
	},
	settings: {
		title: 'Settings',
		accountSettings: 'Account Settings',
		personalInformation: 'Personal Information',
		updateProfile: 'Update Profile',
		updating: 'Updating...',
		changePassword: 'Change Password',
		currentPassword: 'Current Password',
		currentPasswordPlaceholder: 'Enter your current password',
		newPassword: 'New Password',
		newPasswordPlaceholder: 'At least 8 characters',
		confirmPassword: 'Confirm New Password',
		confirmPasswordPlaceholder: 'Re-enter your new password',
		updatePassword: 'Update Password',
		updatingPassword: 'Updating...',
		successProfileUpdated: 'Profile updated successfully!',
		successPasswordUpdated: 'Password updated successfully!',
		errorUpdateFailed: 'Failed to update. Please try again.',
		errorPasswordMismatch: 'Passwords do not match',
		errorPasswordTooShort: 'Password must be at least 8 characters',
		backToHome: 'Back to Home',
		accountInformation: 'Account Information',
		memberSince: 'Member since',
		leavePasswordBlank: 'Leave blank to keep current password',
		passwordsDoNotMatch: 'New passwords do not match',
	},
	email: {
		fromEmail: 'tigermom@runbox.com',
		fromName: 'TigerMom',
		appName: 'TigerMom',
		welcomeSubject: 'Welcome to TigerMom!',
		welcomeTextBody: `Hi {name},

Welcome to {appName}! We're excited to have you on board.

{appName} helps you stay organized and on top of your tasks. You can start adding tasks right away and manage them efficiently.

If you have any questions or need help, feel free to reach out to us.

Best regards,
The {appName} Team`,
		welcomeHeading: 'Welcome to {appName}! 🎉',
		greeting: 'Hi <strong>{name}</strong>,',
		welcomeMessage: "We're excited to have you on board!",
		descriptionMessage:
			'{appName} helps you stay organized and on top of your tasks. You can start adding tasks right away and manage them efficiently.',
		gettingStartedHeading: 'Getting Started',
		step1: 'Sign in to your account',
		step2: 'Add your first task',
		step3: 'Stay organized and productive',
		helpMessage:
			'If you have any questions or need help, feel free to reach out to us.',
		closingMessage: 'Best regards,',
		signature: 'The {appName} Team',
	},
} as const;

export type Translations = typeof en;
