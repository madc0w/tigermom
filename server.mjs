import { spawn } from 'child_process';

const port = process.env.PORT || 3000;
const host = '0.0.0.0';

console.log(`Starting Nitro server on ${host}:${port}`);

const child = spawn('node', ['.output/server/index.mjs'], {
	env: {
		...process.env,
		NITRO_PORT: port,
		NITRO_HOST: host,
		PORT: port,
		HOST: host,
	},
	stdio: 'inherit',
});

child.on('error', (err) => {
	console.error('Failed to start server:', err);
	process.exit(1);
});

child.on('exit', (code) => {
	console.log(`Server exited with code ${code}`);
	process.exit(code || 0);
});
