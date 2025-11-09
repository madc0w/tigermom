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
		fromEmail: 'noreply@tigermom.app',
		fromName: 'TigerMom',
		appName: 'TigerMom',
		welcomeSubject: 'Welcome to TigerMom!',
		welcomeTextBody: `Hi {name},

Welcome to {appName}! We're excited to have you on board.

{appName} helps you stay organized and on top of your tasks. You can start adding tasks right away and manage them efficiently.

If you have any questions or need help, feel free to reach out to us.

Best regards,
The {appName} Team`,
		welcomeHtmlBody: `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Welcome to {appName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
		<h1 style="color: #2c3e50; margin-top: 0;">Welcome to {appName}! 🎉</h1>
		<p style="font-size: 16px;">Hi <strong>{name}</strong>,</p>
		<p style="font-size: 16px;">We're excited to have you on board!</p>
		<p style="font-size: 16px;">{appName} helps you stay organized and on top of your tasks. You can start adding tasks right away and manage them efficiently.</p>
	</div>
	<div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
		<h2 style="color: #2c3e50; font-size: 18px;">Getting Started</h2>
		<ul style="font-size: 15px;">
			<li>Sign in to your account</li>
			<li>Add your first task</li>
			<li>Stay organized and productive</li>
		</ul>
	</div>
	<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #6c757d;">
		<p>If you have any questions or need help, feel free to reach out to us.</p>
		<p style="margin-top: 20px;">Best regards,<br><strong>The {appName} Team</strong></p>
	</div>
</body>
</html>`,
	},
} as const;

export type Translations = typeof en;
