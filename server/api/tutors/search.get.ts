import { defineEventHandler, getQuery } from 'h3';
import { getCollection, type TutorDoc } from '../../utils/mongo';

export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event);
		const category = query.category as string;

		if (!category) {
			return { tutors: [] };
		}

		const tutorsCollection = await getCollection<TutorDoc>('tutors');

		// Find tutors where the categories array contains the specified category
		const tutors = await tutorsCollection
			.find({ categories: category })
			.limit(50)
			.toArray();

		// Return tutors with _id converted to string
		return {
			tutors: tutors.map((tutor) => ({
				id: tutor._id.toString(),
				firstName: tutor.firstName,
				lastName: tutor.lastName,
				email: tutor.email,
				phone: tutor.phone,
				categories: tutor.categories,
				bio: tutor.bio,
				hourlyRate: tutor.hourlyRate,
			})),
		};
	} catch (error: any) {
		console.error('Error fetching tutors:', error);
		throw createError({
			statusCode: 500,
			message: 'Failed to fetch tutors',
		});
	}
});
