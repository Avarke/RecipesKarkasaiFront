const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = "style-loader";

const config = {
	//this points to entry script
	entry: "./src/index.tsx",
	//this tells where to place build output
	output: {
		path: path.resolve(__dirname, "dist"),

		//this forces resource paths to be server relative instead of page relative
		publicPath : "/"
	},
	//this configures development server
	devServer: {		
		host: "0.0.0.0",
		port: 3000,

		//this instructs webpack development server to return contents of index.html for all resource paths
		historyApiFallback: true,

		//this turns off the errors/warnings overlay
		client: {
			overlay: {
				warnings: false,
				errors: false,
				runtimeErrors : false
			}
		},
	},
	plugins: [
		new HtmlWebpackPlugin({
			//this points to entry html
			template: "index.html",

			//this inserts favicon into html
			favicon: "favicon.ico"
		}),

		// Add your plugins here
		// Learn more about plugins from https://webpack.js.org/configuration/plugins/
	],
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/i,
				loader: "ts-loader",
				exclude: ["/node_modules/"],
			},
			{
				test: /\.css$/i,
				use: [stylesHandler, "css-loader"],
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					stylesHandler, 
					"css-loader",
					{
						loader: "sass-loader",
						options: {
							sassOptions: {
								//this will allow to pull in sass styles from './src' without requiring relative paths
								loadPaths: ["./src"],
							}
						}
					}
				],
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
				type: "asset",
			},

			// Add your rules for custom modules here
			// Learn more about loaders from https://webpack.js.org/loaders/
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
	},
};

module.exports = () => {
	if (isProduction) {
		config.mode = "production";
	} else {
		config.mode = "development";
	}
	return config;
};
