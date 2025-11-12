import jwt from 'jsonwebtoken';
import { getTranslations } from '../../../i18n';

interface ContactTutorRequest {
	tutorId: string;
	tutorEmail: string;
	tutorName: string;
	message: string;
	locale: string;
}

interface JWTPayload {
	userId: string;
	email: string;
	firstName: string;
	lastName: string;
}

/**
 * API endpoint to send a contact message from a user to a tutor via email
 */
export default defineEventHandler(async (event) => {
	try {
		// Get the auth token from headers
		const authHeader = event.node.req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw createError({
				statusCode: 401,
				message: 'Unauthorized: No valid authentication token provided',
			});
		}

		const token = authHeader.substring(7);

		// Verify JWT token
		let userPayload: JWTPayload;
		try {
			const secret = process.env.JWT_SECRET;
			if (secret) {
				userPayload = jwt.verify(token, secret) as JWTPayload;
			} else {
				throw new Error('JWT_SECRET is not defined');
			}
		} catch (err) {
			throw createError({
				statusCode: 401,
				message: 'Invalid authentication token',
			});
		}

		// Parse request body
		const body = await readBody<ContactTutorRequest>(event);
		const { tutorEmail, tutorName, message, locale } = body;

		if (!tutorEmail || !tutorName || !message) {
			throw createError({
				statusCode: 400,
				message: 'Missing required fields: tutorEmail, tutorName, message',
			});
		}

		// Get Mailjet credentials
		const apiKey = process.env.MAILJET_API_KEY;
		const secretKey = process.env.MAILJET_SECRET_KEY;

		if (!apiKey || !secretKey) {
			throw createError({
				statusCode: 500,
				message: 'Email service is not configured',
			});
		}

		// Get translations based on locale
		const t = getTranslations(locale || 'en');

		// Compose the email with TutorLux promotion
		const userName = `${userPayload.firstName} ${userPayload.lastName}`;
		const userEmail = userPayload.email;

		const postscript = `\n\n---\n\nP.S. ${t.tutorSearch.contactEmailPostscript}`;

		const emailBody = `${message}${postscript}`;

		// Prepare Mailjet payload
		const payload = {
			Messages: [
				{
					From: {
						Email: t.email.fromEmail,
						Name: userName,
					},
					To: [
						{
							Email: tutorEmail,
							Name: tutorName,
						},
					],
					Subject: t.tutorSearch.contactEmailSubject.replace(
						'{userName}',
						userName
					),
					TextPart: emailBody,
					ReplyTo: {
						Email: userEmail,
						Name: userName,
					},
				},
			],
		};

		// Send email via Mailjet
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
				'Failed to send contact email:',
				response.status,
				errorText
			);
			throw createError({
				statusCode: 500,
				message: 'Failed to send email',
			});
		}

		const result = await response.json();
		console.log('Contact email sent successfully to:', tutorEmail);
		// console.log('Mailjet response:', JSON.stringify(result, null, 2));

		return {
			success: true,
			message: 'Email sent successfully',
		};
	} catch (error: any) {
		console.error('Error in contact tutor endpoint:', error);
		throw createError({
			statusCode: error.statusCode || 500,
			message: error.message || 'Failed to send contact message',
		});
	}
});
