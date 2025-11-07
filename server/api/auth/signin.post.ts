import { createError, defineEventHandler, readBody } from 'h3';
import { scryptSync } from 'node:crypto';
import { getCollection, UserDoc } from '../../utils/mongo';

function verifyPassword(password: string, stored: string): boolean {
	const [salt, hashHex] = stored.split(':');
	if (!salt || !hashHex) return false;
	const derived = scryptSync(password, salt, 64);
	return (derived as any).toString('hex') === hashHex;
}

function generateToken(userId: string) {
	return Buffer.from(userId).toString('base64url');
}

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { email, password } = body || {};

	if (!email || typeof email !== 'string') {
		throw createError({ statusCode: 400, statusMessage: 'Email is required' });
	}
	if (!password || typeof password !== 'string') {
		throw createError({
			statusCode: 400,
			statusMessage: 'Password is required',
		});
	}

	const users = await getCollection<UserDoc>('users');
	const user = await users.findOne({ email: email.toLowerCase() });
	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Invalid credentials',
		});
	}
	if (!verifyPassword(password, user.passwordHash)) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Invalid credentials',
		});
	}

	return {
		user: {
			_id: user._id.toString(),
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			phone: user.phone || null,
			createdAt: user.createdAt,
		},
		token: generateToken(user._id.toString()),
	};
});
