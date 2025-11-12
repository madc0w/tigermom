import { createError, defineEventHandler } from 'h3';
import { ObjectId } from 'mongodb';
import { getCollection, type TutorDoc } from '../../utils/mongo';

export default defineEventHandler(async (event) => {
	try {
		const tutorId = event.context.params?.id;

		if (!tutorId) {
			throw createError({
				statusCode: 400,
				message: 'Tutor ID is required',
			});
		}

		// Validate ObjectId format
		if (!ObjectId.isValid(tutorId)) {
			throw createError({
				statusCode: 400,
				message: 'Invalid tutor ID format',
			});
		}

		const tutorsCollection = await getCollection<TutorDoc>('tutors');

		// Find the tutor by ID
		const tutor = await tutorsCollection.findOne({
			_id: new ObjectId(tutorId),
		});

		if (!tutor) {
			throw createError({
				statusCode: 404,
				message: 'Tutor not found',
			});
		}

		// Return tutor with _id converted to string
		return {
			tutor: {
				_id: tutor._id.toString(),
				firstName: tutor.firstName,
				lastName: tutor.lastName,
				email: tutor.email,
				// phone: tutor.phone,
				categories: tutor.categories,
				bio: tutor.bio,
				hourlyRate: tutor.hourlyRate,
			},
		};
	} catch (error: any) {
		console.error('Error fetching tutor:', error);

		// Re-throw if it's already an H3 error
		if (error.statusCode) {
			throw error;
		}

		throw createError({
			statusCode: 500,
			message: 'Failed to fetch tutor details',
		});
	}
});
