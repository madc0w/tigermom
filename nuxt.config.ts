// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	pages: true,
	// Force Vite builder to ensure pages are picked up (fallback if experimental config changed)
	future: {
		compatibilityVersion: 4,
	},
	app: {
		head: {
			link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
		},
	},
	// Heroku assigns a dynamic port via PORT env variable
	nitro: {
		preset: 'node-server',
	},
});
