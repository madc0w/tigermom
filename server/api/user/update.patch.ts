import { createError, defineEventHandler, getHeader, readBody } from 'h3';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { randomBytes, scryptSync } from 'node:crypto';
import { getCollection, UserDoc } from '../../utils/mongo';

interface JWTPayload {
	userId: string;
	email: string;
	firstName: string;
	lastName: string;
}

function verifyPassword(password: string, stored: string): boolean {
	const [salt, key] = stored.split(':');
	const derived = scryptSync(password, salt, 64);
	return key === derived.toString('hex');
}

function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const derived = scryptSync(password, salt, 64);
	return `${salt}:${derived.toString('hex')}`;
}

function capitalizeFirstChar(str: string): string {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function getUserIdFromToken(token: string): string | null {
	try {
		const secret = process.env.JWT_SECRET;
		if (secret) {
			const payload = jwt.verify(token, secret) as JWTPayload;
			return payload.userId;
		} else {
			throw new Error('JWT_SECRET is not defined');
		}
	} catch (e) {
		return null;
	}
}

export default defineEventHandler(async (event) => {
	try {
		console.log('🔧 User update request received');
		// Get token from Authorization header
		const authHeader = getHeader(event, 'Authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw createError({
				statusCode: 401,
				statusMessage: 'Unauthorized',
			});
		}

		const token = authHeader.substring(7); // Remove 'Bearer ' prefix
		const userId = getUserIdFromToken(token);

		if (!userId) {
			throw createError({
				statusCode: 401,
				statusMessage: 'Invalid token',
			});
		}

		console.log('👤 User ID:', userId);
		const body = await readBody(event);
		const { firstName, lastName, email, phone, currentPassword, newPassword } =
			body || {};

		console.log('🔌 Connecting to database...');
		const users = await getCollection<UserDoc>('users');

		// Verify user exists
		let objectId: ObjectId;
		try {
			objectId = new ObjectId(userId);
		} catch (e) {
			throw createError({
				statusCode: 401,
				statusMessage: 'Invalid user ID',
			});
		}

		console.log('🔍 Looking up user...');
		const user = await users.findOne({ _id: objectId });
		if (!user) {
			throw createError({
				statusCode: 404,
				statusMessage: 'User not found',
			});
		}

		const updateFields: Partial<UserDoc> = {};

		// If updating password
		if (currentPassword && newPassword) {
			console.log('🔐 Updating password...');
			if (!verifyPassword(currentPassword, user.passwordHash)) {
				throw createError({
					statusCode: 401,
					statusMessage: 'Current password is incorrect',
				});
			}

			if (typeof newPassword !== 'string' || newPassword.length < 8) {
				throw createError({
					statusCode: 400,
					statusMessage: 'New password must be at least 8 characters',
				});
			}

			updateFields.passwordHash = hashPassword(newPassword);
		}

		// Update profile fields if provided
		if (firstName !== undefined) {
			if (!firstName || typeof firstName !== 'string') {
				throw createError({
					statusCode: 400,
					statusMessage: 'First name is required',
				});
			}
			updateFields.firstName = capitalizeFirstChar(firstName.trim());
		}

		if (lastName !== undefined) {
			if (!lastName || typeof lastName !== 'string') {
				throw createError({
					statusCode: 400,
					statusMessage: 'Last name is required',
				});
			}
			updateFields.lastName = capitalizeFirstChar(lastName.trim());
		}

		if (email !== undefined) {
			if (!email || typeof email !== 'string') {
				throw createError({
					statusCode: 400,
					statusMessage: 'Email is required',
				});
			}

			const normalizedEmail = email.toLowerCase();

			// Check if email is already taken by another user
			const existingUser = await users.findOne({
				email: normalizedEmail,
				_id: { $ne: objectId },
			});

			if (existingUser) {
				throw createError({
					statusCode: 409,
					statusMessage: 'Email is already in use',
				});
			}

			updateFields.email = normalizedEmail;
		}

		if (phone !== undefined) {
			updateFields.phone = phone || undefined;
		}

		// Perform the update
		if (Object.keys(updateFields).length > 0) {
			console.log('💾 Updating user in database...');
			await users.updateOne({ _id: objectId }, { $set: updateFields });
			console.log('✅ User updated successfully');
		} else {
			console.log('ℹ️ No fields to update');
		}

		return { success: true };
	} catch (error: any) {
		console.error('❌ User update error:', error);
		console.error('Error stack:', error?.stack);
		// Re-throw if it's already an H3 error
		if (error.statusCode) {
			throw error;
		}
		// Otherwise wrap it
		throw createError({
			statusCode: 500,
			statusMessage: error?.message || 'Failed to update user',
		});
	}
});
