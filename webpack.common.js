const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: [
    './src/front/js/index.js'
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/'
  },
  module: {
    rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.css$/, 
          use: [
              'style-loader',
              'css-loader',
              'postcss-loader'
          ]
      },
        {
          test: /\.(png|svg|jpg|gif|jpeg|webp)$/, use: {
            loader: 'file-loader',
            options: { name: '[name].[ext]' }
          }
        }, //for images
        { test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/, use: ['file-loader'] } //for fonts
    ]
  },
  resolve: {
    extensions: ['*', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/front'),
      '@components': path.resolve(__dirname, 'src/front/js/component'),
      '@ui': path.resolve(__dirname, 'src/front/js/component/ui'),
      '@utils': path.resolve(__dirname, 'src/front/js/lib/utils.js'),
      '@lib': path.resolve(__dirname, 'src/front/js/lib'),
      '@hooks': path.resolve(__dirname, 'src/front/js/hooks')
    },
	fallback: {
		path: require.resolve("path-browserify"),
		http2: false, // Ignorar http2 si no es necesario
		tls: false,  // Ignorar tls si no es necesario
		stream: require.resolve("stream-browserify"),
	}
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
        favicon: '4geeks.ico',
        template: 'template.html'
    }),
    new Dotenv({ safe: true, systemvars: true })
  ]
};