import { defineNitroPlugin } from 'nitropack/runtime';

console.log('🟢 Error handler plugin loading...');

export default defineNitroPlugin((nitroApp) => {
	console.log('🟢 Error handler plugin initialized!');

	nitroApp.hooks.hook('error', (error, { event }) => {
		console.error('❌ Nitro error:', {
			message: error.message,
			statusCode: (error as any).statusCode,
			url: event?.path,
			method: event?.method,
			stack: error.stack,
		});
	});

	nitroApp.hooks.hook('request', (event) => {
		console.log(`🔵 ${event.method} ${event.path}`);
	});

	nitroApp.hooks.hook('beforeResponse', (event, response) => {
		// Log response status for debugging
		const statusCode =
			(response as any)?.statusCode || event.node.res.statusCode;
		if (statusCode >= 400) {
			console.error(`🔴 ${event.method} ${event.path} - ${statusCode}`);
		}
	});
});
