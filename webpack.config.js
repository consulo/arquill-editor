var path = require('path');

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
		filename: '[name].js',
	},
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
				use: ["style-loader", "css-loader"],
			}
		]
	},
};