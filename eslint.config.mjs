import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{ ignores: [ 'node_modules/', 'web/public/', 'jsconfig.json' ] },
	{ files: [ 'src/**/*.{js,mjs}', 'web/src/**/*.{js,vue}' ], plugins: { js }, extends: [ 'js/recommended' ] },
	{ files: [ 'src/**/*.js', 'web/src/**/*.js' ], languageOptions: { sourceType: 'commonjs' } },
	{ files: [ 'src/**/*.{js,mjs}' ], languageOptions: { globals: globals.node } },
	{ files: [ 'web/src/**/*.{js,vue}' ], languageOptions: { globals: {
		...globals.browser,
		'__webpack_nonce__': 'writeable',
		'CONFIG': 'readonly',
		'SOURCE': 'readonly',
		'GALLERY_IMAGES': 'readonly',
		'GALLERY_TEXT': 'readonly'
	} } },
	pluginVue.configs['flat/recommended'],
	{ rules: {
		'array-bracket-spacing': [ 'error', 'always' ],
		'comma-dangle': [ 'error' ],
		'indent': [ 'error', 'tab', { 'SwitchCase': 1 } ],
		'no-multi-spaces': [ 'error', { 'exceptions': { 'Property': false, 'ImportAttribute': false } } ],
		'quotes': [ 'error', 'single' ],
		'semi': [ 'error' ],
		'vue/html-indent': [ 'error', 'tab' ],
		'vue/max-attributes-per-line': [ 'error', { 'singleline': { 'max': 3 }, 'multiline': { 'max': 1 } } ],
		'vue/multi-word-component-names': [ 'error', { 'ignores': [ 'Index' ] } ]
	} }
]);
