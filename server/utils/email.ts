import { en } from '../../i18n/en';
import type { UserDoc } from './mongo';

interface MailjetMessage {
	From: {
		Email: string;
		Name: string;
	};
	To: [
		{
			Email: string;
			Name: string;
		}
	];
	Subject: string;
	TextPart?: string;
	HTMLPart?: string;
}

interface MailjetPayload {
	Messages: MailjetMessage[];
}

/**
 * Sends a welcome email to a newly registered user using Mailjet API
 */
export async function sendWelcomeEmail(
	user: UserDoc,
	locale: string = 'en'
): Promise<void> {
	const apiKey = process.env.MAILJET_API_KEY;
	const secretKey = process.env.MAILJET_SECRET_KEY;

	if (!apiKey || !secretKey) {
		console.error('Mailjet API credentials not configured');
		return;
	}

	// Use English translations (can be extended for other locales later)
	const t = en;

	const userName = `${user.firstName} ${user.lastName}`;

	const payload: MailjetPayload = {
		Messages: [
			{
				From: {
					Email: t.email.fromEmail,
					Name: t.email.fromName,
				},
				To: [
					{
						Email: user.email,
						Name: userName,
					},
				],
				Subject: t.email.welcomeSubject,
				TextPart: t.email.welcomeTextBody
					.replace('{name}', user.firstName)
					.replace('{appName}', t.email.appName),
				HTMLPart: t.email.welcomeHtmlBody
					.replace('{name}', user.firstName)
					.replace('{appName}', t.email.appName),
			},
		],
	};

	try {
		const response = await fetch('https://api.mailjet.com/v3.1/send', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization:
					'Basic ' + Buffer.from(`${apiKey}:${secretKey}`).toString('base64'),
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(
				'Failed to send welcome email:',
				response.status,
				errorText
			);
		} else {
			console.log('Welcome email sent successfully to:', user.email);
		}
	} catch (error) {
		console.error('Error sending welcome email:', error);
	}
}
