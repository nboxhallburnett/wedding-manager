const glob = require('glob');
const path = require('path');

const { DefinePlugin } = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const miniCssExtractPlugin = require('mini-css-extract-plugin');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');

const pkg = require('../package.json');
const config = require('../conf');
const port = 8468;

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
			publicPath: WEBPACK_SERVE
				? `//${config.host}:${port}/`
				: `//${config.host}${config.server.external_port !== 443 ? ':' + config.server.external_port : ''}/`,
			path: path.resolve(__dirname, 'public'),
			filename: 'js/[name].js'
		},
		plugins: [
			new VueLoaderPlugin(),
			new DefinePlugin({
				CONFIG: JSON.stringify(config),
				SOURCE: JSON.stringify(pkg.repository.url.split('+')[1].slice(0, -4)),
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

	if (WEBPACK_SERVE) {
		conf.mode = 'development';
		conf.devtool = 'eval-source-map';
		conf.devServer = {
			allowedHosts: 'all',
			compress: true,
			hot: true,
			port,
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
		conf.plugins.push(
			new miniCssExtractPlugin({
				filename: 'css/[name].css'
			}),
			new PurgeCSSPlugin({
				paths: glob.sync(`${path.join(__dirname, 'src')}/**/*`, { nodir: true }),
				safelist: { greedy: [ /data-v-.*/ ], standard: [ 'body', 'html' ] }
			})
		);
	}

	return conf;
};
