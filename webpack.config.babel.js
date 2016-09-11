import webpack from 'webpack';
import path  from 'path';

const script = (name, min=false) => {
    return {
        entry: path.join(__dirname, 'index.js'),
        output: {
            path: __dirname,
            filename: min?`${name}.min.js`:`${name}.js`
        },
        devtool: min?'source-map':null,
        module: {
            loaders: [{
                test: /\.js/,
                loader: 'babel-loader'
            }]
        },
        plugins: !min?[]:[
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.UglifyJsPlugin(),
        ],
    };
};

export default [
    script('frontexpress'),
    script('frontexpress', true)
];