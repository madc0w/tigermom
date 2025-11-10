import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
	console.log('🧪 TEST ENDPOINT HIT - Console logging is working!');
	console.error('🧪 TEST ERROR - Console.error is working!');

	// Force an error to test error handling
	throw new Error(
		'Test error - if you see this in console, error logging works!'
	);
});
