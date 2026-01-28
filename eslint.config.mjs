import axwayNode from 'eslint-config-axway/env-node.js';
import axwayBrowser from 'eslint-config-axway/env-browser.js';
import axwayVue from 'eslint-config-axway/+vue.js';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		ignores: [ 'node_modules/', 'web/public/', 'jsconfig.json' ],
		files: [ 'src/**/*.{js,mjs}','web/src/**/*.{js,vue}' ],
		extends: [ axwayNode ]
	},
	{ files: [ 'src/**/*.js', 'web/src/**/*.js' ], languageOptions: { sourceType: 'commonjs' } },
	{
		files: [ 'web/src/**/*.{js,vue}' ],
		extends: [ axwayBrowser, axwayVue ],
		languageOptions: { globals: {
			'__webpack_nonce__': 'writeable',
			'CONFIG': 'readonly'
		} }
	}
]);
