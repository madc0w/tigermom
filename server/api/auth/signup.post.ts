import { createError, defineEventHandler, readBody } from 'h3';
import { randomBytes, scryptSync } from 'node:crypto';
import { sendWelcomeEmail } from '../../utils/email';
import { getCollection, UserDoc } from '../../utils/mongo';

// Minimal token generation (non-JWT) for demo purposes
function generateToken(userId: string) {
	return Buffer.from(`${userId}.${randomBytes(16).toString('hex')}`).toString(
		'base64url'
	);
}

function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const derived = scryptSync(password, salt, 64);
	return `${salt}:${(derived as any).toString('hex')}`;
}

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { email, firstName, lastName, password, phone } = body || {};

	if (!email || typeof email !== 'string') {
		throw createError({ statusCode: 400, statusMessage: 'Email is required' });
	}
	if (!firstName || typeof firstName !== 'string') {
		throw createError({
			statusCode: 400,
			statusMessage: 'First name is required',
		});
	}
	if (!lastName || typeof lastName !== 'string') {
		throw createError({
			statusCode: 400,
			statusMessage: 'Last name is required',
		});
	}
	if (!password || typeof password !== 'string' || password.length < 8) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Password must be at least 8 characters',
		});
	}

	const users = await getCollection<UserDoc>('users');

	const existing = await users.findOne({ email: email.toLowerCase() });
	if (existing) {
		throw createError({
			statusCode: 409,
			statusMessage: 'Email already registered',
		});
	}

	const passwordHash = hashPassword(password);
	const doc: UserDoc = {
		email: email.toLowerCase(),
		firstName: firstName.trim(),
		lastName: lastName.trim(),
		phone: phone ? String(phone).trim() : undefined,
		passwordHash,
		createdAt: new Date(),
	};

	const insertResult = await users.insertOne(doc);
	const _id = insertResult.insertedId.toString();
	const token = generateToken(_id);

	// Send welcome email asynchronously (don't wait for it)
	sendWelcomeEmail(doc).catch((error) => {
		console.error('Failed to send welcome email:', error);
	});

	return {
		user: {
			_id,
			email: doc.email,
			firstName: doc.firstName,
			lastName: doc.lastName,
			phone: doc.phone || null,
			createdAt: doc.createdAt,
		},
		token,
	};
});
