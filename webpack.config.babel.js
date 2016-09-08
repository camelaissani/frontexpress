import webpack from 'webpack';
import path  from 'path';

export default {
    entry: path.join(__dirname, 'index.js'),
    output: {
        path: __dirname,
        filename: 'frontexpress.min.js'
    },
    module: {
        loaders: [
            { test: /\.js/, loader: 'babel-loader' }
        ]
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    ],
};