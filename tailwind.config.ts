import flowbitePlugin from 'flowbite/plugin';

import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',

	plugins: [flowbitePlugin]
} as Config;
