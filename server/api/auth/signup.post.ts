import { createError, defineEventHandler, readBody } from 'h3';
import { randomBytes, scryptSync } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import { sendWelcomeEmail } from '../../utils/email';
import { getCollection, UserDoc } from '../../utils/mongo';

// Helper to log to both console and file
function log(message: string, ...args: any[]) {
	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] ${message} ${args
		.map((a) => JSON.stringify(a))
		.join(' ')}\n`;
	console.log(message, ...args);
	try {
		appendFileSync('signup-debug.log', logMessage);
	} catch (e) {
		// Ignore file errors
	}
}

function logError(message: string, error: any) {
	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] ${message}\n${JSON.stringify(
		error,
		Object.getOwnPropertyNames(error),
		2
	)}\n`;
	console.error(message, error);
	try {
		appendFileSync('signup-debug.log', logMessage);
	} catch (e) {
		// Ignore file errors
	}
}

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
	try {
		log('📝 Signup request received');
		const body = await readBody(event);
		const { email, firstName, lastName, password, phone } = body || {};

		log('📧 Email:', email);
		log('👤 Name:', firstName, lastName);

		if (!email || typeof email !== 'string') {
			throw createError({
				statusCode: 400,
				statusMessage: 'Email is required',
			});
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

		log('🔌 Connecting to database...');
		const users = await getCollection<UserDoc>('users');

		log('🔍 Checking for existing user...');
		const existing = await users.findOne({ email: email.toLowerCase() });
		if (existing) {
			throw createError({
				statusCode: 409,
				statusMessage: 'Email already registered',
			});
		}

		log('🔐 Hashing password...');
		const passwordHash = hashPassword(password);
		const doc: UserDoc = {
			email: email.toLowerCase(),
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			phone: phone ? String(phone).trim() : undefined,
			passwordHash,
			createdAt: new Date(),
		};

		log('💾 Inserting user into database...');
		const insertResult = await users.insertOne(doc);
		const _id = insertResult.insertedId.toString();
		const token = generateToken(_id);

		log('✅ User created successfully:', _id);

		// Send welcome email asynchronously (don't wait for it)
		sendWelcomeEmail(doc).catch((error) => {
			logError('❌ Failed to send welcome email:', error);
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
	} catch (error: any) {
		logError('❌ Signup error:', error);
		// Re-throw if it's already an H3 error
		if (error.statusCode) {
			throw error;
		}
		// Otherwise wrap it
		throw createError({
			statusCode: 500,
			statusMessage: error?.message || 'Failed to create account',
		});
	}
});
