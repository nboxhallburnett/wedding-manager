import axwayNode from 'eslint-config-axway/env-node';
import axwayBrowser from 'eslint-config-axway/env-browser';
import axwayNodeTest from 'eslint-config-axway/+node-test';
import axwayVue from 'eslint-config-axway/+vue';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		files: [ 'src/**/*.js' ],
		extends: [ axwayNode ]
	},
	{
		files: [ 'test/**/*.js' ],
		extends: [ axwayNode, axwayNodeTest ]
	},
	{
		files: [ 'web/src/**/*.{js,vue}' ],
		extends: [ axwayBrowser, axwayVue ],
		languageOptions: { globals: {
			'__webpack_nonce__': 'writeable',
			'CONFIG': 'readonly'
		} }
	}
]);
