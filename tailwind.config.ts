import flowbitePlugin from 'flowbite/plugin';
import typography from '@tailwindcss/typography';

import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
	darkMode: 'selector',

	plugins: [flowbitePlugin, typography]
} as Config;
