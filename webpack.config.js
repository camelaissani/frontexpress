var webpack = require('webpack');
var path = require('path');

var frontend = {
    entry: path.join(__dirname, 'lib','frontexpress.js'),
    output: {
        path: __dirname,
        filename: 'frontexpress.min.js'
    },
    module: {
        loaders: [
            { test: /\.js/, loader: 'babel-loader' },
        ]
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    ],
};

module.exports = [frontend];