import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/**
 * This will add autocompletion if you're working with SvelteKit
 *
 * @type {import('@sveltejs/kit').Config}
 */

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			'global.css': 'src/global.css',
			'prism-theme.css': 'src/prism-theme.css',
			$src: 'src'
		}
	}
};

export default config;
