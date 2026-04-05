var path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: 'development',
	devServer: {
		static: {
			directory: path.join(__dirname, 'public'),
		},
		compress: true,
		port: 9000
	},
	optimization: {
		minimize: false
	},
	resolve: {
		extensions: ['.ts', '.js'],
		modules: ['node_modules/', 'src/'],
		symlinks: false,
	},
	performance : {
		hints : false
	},
	output: {
		path: path.join(__dirname, 'public'),
		filename: 'arquillEditor.js',
	},
	entry:  './src/index.ts',
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: 'ts-loader',
			},
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ["@babel/preset-env"]
					}
				}
			},
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'arquillEditor.css'
		})
	],
};