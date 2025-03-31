import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: [
			'5173-j4nsr-calendarconcierg-uekxomdmxgl.ws-eu118.gitpod.io'
		]
	}
});
