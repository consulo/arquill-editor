var path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	devServer: {
		index: 'index.html',
		contentBase: path.join(__dirname, 'public'),
		compress: true,
		port: 9000
	},
	optimization: {
		minimize: false
	},
	resolve: {
		extensions: ['.js'],
		modules: ['node_modules/', 'src/'],
		symlinks: false,
	},
	performance : {
		hints : false
	},
	output: {
		filename: 'arquillEditor.js',
	},
	entry:  './src/index.js',
	module: {
		rules: [
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