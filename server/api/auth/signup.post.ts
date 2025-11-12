import { createError, defineEventHandler, readBody } from 'h3';
import jwt from 'jsonwebtoken';
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

// Generate JWT token
function generateToken(
	userId: string,
	email: string,
	firstName: string,
	lastName: string
) {
	const secret = process.env.JWT_SECRET;
	if (secret) {
		const payload = {
			userId,
			email,
			firstName,
			lastName,
		};

		return jwt.sign(payload, secret);
	} else {
		throw new Error('JWT_SECRET is not defined');
	}
}

function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const derived = scryptSync(password, salt, 64);
	return `${salt}:${(derived as any).toString('hex')}`;
}

function capitalizeFirstChar(str: string): string {
	if (!str) return str;
	return str[0].toUpperCase() + str.slice(1);
}

export default defineEventHandler(async (event) => {
	try {
		// log('📝 Signup request received');
		const body = await readBody(event);
		const { email, firstName, lastName, password, phone } = body || {};

		// log('📧 Email:', email);
		// log('👤 Name:', firstName, lastName);

		if (!email || typeof email !== 'string') {
			throw createError({
				statusCode: 400,
				data: { errorCode: 'EMAIL_REQUIRED' },
			});
		}
		if (!firstName || typeof firstName !== 'string') {
			throw createError({
				statusCode: 400,
				data: { errorCode: 'FIRST_NAME_REQUIRED' },
			});
		}
		if (!lastName || typeof lastName !== 'string') {
			throw createError({
				statusCode: 400,
				data: { errorCode: 'LAST_NAME_REQUIRED' },
			});
		}
		if (!password || typeof password !== 'string' || password.length < 8) {
			throw createError({
				statusCode: 400,
				data: { errorCode: 'PASSWORD_TOO_SHORT' },
			});
		}

		// log('🔌 Connecting to database...');
		const users = await getCollection<UserDoc>('users');

		// log('🔍 Checking for existing user...');
		const existing = await users.findOne({ email: email.toLowerCase() });
		if (existing) {
			throw createError({
				statusCode: 409,
				data: { errorCode: 'EMAIL_ALREADY_REGISTERED' },
			});
		}

		// log('🔐 Hashing password...');
		const passwordHash = hashPassword(password);
		const doc: UserDoc = {
			email: email.toLowerCase(),
			firstName: capitalizeFirstChar(firstName.trim()),
			lastName: capitalizeFirstChar(lastName.trim()),
			phone: phone ? String(phone).trim() : undefined,
			passwordHash,
			createdAt: new Date(),
		};

		// log('💾 Inserting user into database...');
		const insertResult = await users.insertOne(doc);
		const _id = insertResult.insertedId.toString();
		const token = generateToken(_id, doc.email, doc.firstName, doc.lastName);

		// log('✅ User created successfully:', _id);

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
		// Re-throw if it's already an H3 error with errorCode
		if (error.statusCode && error.data?.errorCode) {
			throw error;
		}
		// Otherwise wrap it
		throw createError({
			statusCode: 500,
			data: { errorCode: 'ACCOUNT_CREATION_FAILED' },
		});
	}
});
