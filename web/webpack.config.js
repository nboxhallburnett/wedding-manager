const glob = require('glob');
const path = require('path');
const { readdirSync } = require('fs');

const miniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

const config = require('../conf');

const devServerPort = 8468;

module.exports = function ({ WEBPACK_SERVE }) {
	const conf = {
		mode: 'production',
		context: __dirname,

		entry: {
			index: [ './src/js/index' ]
		},
		module: {
			rules: [
				{ test: /\.vue$/, loader: 'vue-loader' },
				{
					test: /\.scss$/,
					use: [
						WEBPACK_SERVE ? 'style-loader' : miniCssExtractPlugin.loader,
						{ loader: 'css-loader', options: { url: false } },
						{
							loader: 'postcss-loader',
							options: {
								postcssOptions: {
									plugins: () => [
										require('autoprefixer')
									]
								}
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sassOptions: {
									quietDeps: true,
									silenceDeprecations: [ 'import' ]
								}
							}
						}
					]
				}
			]
		},
		output: {
			publicPath: `//${config.host}${config.server.external_port !== 443 ? ':' + config.server.external_port : ''}/`,
			path: path.resolve(__dirname, 'public'),
			filename: 'js/[name].[contenthash].js'
		},
		plugins: [
			new VueLoaderPlugin(),
			new DefinePlugin({
				CONFIG: JSON.stringify(config),
				// Vue ESM builds require these options to be defined, even if they are the default values
				__VUE_OPTIONS_API__: true,
				__VUE_PROD_DEVTOOLS__: false,
				__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
			})
		],
		resolve: {
			modules: [ './src/js', '../node_modules' ],
			alias: { vue: 'vue/dist/vue.runtime.esm-bundler.js' }
		}
	};

	// If we're running using the dev server, overload conf as necessary
	if (WEBPACK_SERVE) {
		// Switch to dev build with sourcemap
		conf.mode = 'development';
		conf.devtool = 'eval-source-map';

		// Switch the public path to the dev server and remove content hashing from the output filename
		conf.output.publicPath = `//${config.host}:${devServerPort}/`;
		conf.output.filename = 'js/[name].js';

		// Establish the dev server
		conf.devServer = {
			allowedHosts: 'all',
			compress: true,
			hot: true,
			port: devServerPort,
			host: config.host.split(':')[0],
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, OPTIONS'
			},
			static: [
				{ directory: path.resolve(__dirname, './public/') }
			]
		};
	} else {
		// If we're doing a production build...
		conf.plugins.push(
			// extract CSS to their own files
			new miniCssExtractPlugin({
				filename: 'css/[name].[contenthash].css'
			}),
			// Purge unused CSS
			new PurgeCSSPlugin({
				paths: glob.sync([
					`${path.join(__dirname, 'src')}/**/*`,
					'node_modules/bootstrap/js/dist/carousel.js',
					'node_modules/bootstrap/js/dist/collapse.js',
					'node_modules/bootstrap/js/dist/dropdown.js',
					'node_modules/bootstrap/js/dist/modal.js',
					'node_modules/bootstrap/js/dist/popover.js',
					'node_modules/bootstrap/js/dist/toast.js',
					'node_modules/bootstrap/js/dist/tooltip.js'
				], { nodir: true }),
				safelist: { greedy: [ /data-v-.*/ ], standard: [ 'body', 'html' ] }
			}),
			// And generate a manifest file for the index handler to reference hashed assets
			new WebpackManifestPlugin()
		);
	}

	return conf;
};
