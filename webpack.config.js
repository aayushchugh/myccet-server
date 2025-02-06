const path = require("path");

module.exports = {
	// Entry point of your application
	entry: "./src/index.ts",

	// Specify that we're targeting Node.js environment
	target: "node",

	// Output bundled file configuration
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js", // or index.js if you prefer
	},

	// Resolve these file extensions and setup aliases
	resolve: {
		extensions: [".ts", ".js"],
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},

	// Module rules to process TypeScript files
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},

	// Set mode to 'production' for optimized bundles or 'development' for easier debugging
	mode: "production",
};
