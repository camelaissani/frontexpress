import webpack from 'webpack';
import path  from 'path';

const entry = path.join(__dirname, 'index.js');
const module = {
    loaders: [{
        test: /\.js/,
        loader: 'babel-loader'
    }]
};
const output = (min=false) => {
    const filename = min?'frontexpress.min.js':'frontexpress.js';
    return {
        path: __dirname,
        filename
    };
};

export default [{
    entry,
    output: output(true),
    module,
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin(),
    ],
},
{
    entry,
    output: output(),
    module
}];