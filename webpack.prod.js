const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const Dotenv = require('dotenv-webpack');
module.exports = merge(common, {
    mode: 'production',
    output: {
        publicPath: '/'
    },
    plugins: [
        new Dotenv({
            safe: true,
            systemvars: true
        })
    ],
	optimization: {
		splitChunks: {
			chunks: 'all',
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
				},
			}
		},
	},
});