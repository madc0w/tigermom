import { createError, defineEventHandler, readBody } from 'h3';
import jwt from 'jsonwebtoken';
import { scryptSync } from 'node:crypto';
import { getCollection, UserDoc } from '../../utils/mongo';

function verifyPassword(password: string, stored: string): boolean {
	const [salt, hashHex] = stored.split(':');
	if (!salt || !hashHex) return false;
	const derived = scryptSync(password, salt, 64);
	return (derived as any).toString('hex') === hashHex;
}

function generateToken(user: UserDoc) {
	const secret = process.env.JWT_SECRET;
	if (secret) {
		const payload = {
			userId: user._id?.toString() || '',
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
		};

		return jwt.sign(payload, secret);
	} else {
		throw new Error('JWT_SECRET is not defined');
	}
}

export default defineEventHandler(async (event) => {
	try {
		console.log('🔑 Signin request received');
		const body = await readBody(event);
		const { email, password } = body || {};

		console.log('📧 Email:', email);

		if (!email || typeof email !== 'string') {
			throw createError({
				statusCode: 400,
				data: { errorCode: 'EMAIL_REQUIRED' },
			});
		}
		if (!password || typeof password !== 'string') {
			throw createError({
				statusCode: 400,
				data: { errorCode: 'PASSWORD_REQUIRED' },
			});
		}

		console.log('🔌 Connecting to database...');
		const users = await getCollection<UserDoc>('users');

		console.log('🔍 Looking up user...');
		const user = await users.findOne({ email: email.toLowerCase() });
		if (!user) {
			console.log('❌ User not found');
			throw createError({
				statusCode: 401,
				data: { errorCode: 'INVALID_CREDENTIALS' },
			});
		}

		console.log('🔐 Verifying password...');
		if (!verifyPassword(password, user.passwordHash)) {
			console.log('❌ Invalid password');
			throw createError({
				statusCode: 401,
				data: { errorCode: 'INVALID_CREDENTIALS' },
			});
		}

		console.log('✅ Sign in successful:', user._id.toString());
		return {
			user: {
				_id: user._id.toString(),
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				phone: user.phone || null,
				createdAt: user.createdAt,
			},
			token: generateToken(user),
		};
	} catch (error: any) {
		console.error('❌ Signin error:', error);
		console.error('Error stack:', error?.stack);
		// Re-throw if it's already an H3 error with errorCode
		if (error.statusCode && error.data?.errorCode) {
			throw error;
		}
		// Otherwise wrap it
		throw createError({
			statusCode: 500,
			data: { errorCode: 'SIGNIN_FAILED' },
		});
	}
});
