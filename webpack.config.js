/* eslint-disable no-undef */
const ESLintPlugin = require('eslint-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
    entry: './src/js/main.js',
    plugins: [new ESLintPlugin(), new NodePolyfillPlugin()],
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            }
        }]
    },
    target: "web",
    resolve: {
        fallback: {
            "fs": false,
            "tls": false,
            "net": false
        },
    }
};