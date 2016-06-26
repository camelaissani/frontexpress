import webpack from 'webpack';

const cmd = (arr) => { return process.argv.indexOf(arr) > -1; }
const production = cmd('-p') || cmd('--optimize-minimize');
const debug      = cmd('-d') || cmd('--debug');

const options = {
    uglifyjs: undefined
};

const webpackConfig = {
    entry: "./lib/frontexpress.js",
    output: {
        path: __dirname,
        filename: 'dist/frontexpress.js'
    },
    devtool: 'inline-source-map',
    module: {
        preLoaders: [
            // Javascript
            { test: /\.js$/, loader: 'eslint', exclude: /node_modules/ }
        ],
        loaders: [
          { test: /lib\/.+\.js$/, loader: 'babel', query: { presets: ['es2015'] } },
          { test: /\.css$/, loader: 'style!css' }
        ]
    },
    eslint: {
        failOnWarning: false,
        failOnError: true
    },
    plugins: []
};

if (production) {
    webpackConfig.plugins.push(
        // Prevents the inclusion of duplicate code
        new webpack.optimize.DedupePlugin(),
        // Add UglifyJs options to the compiler
        new webpack.optimize.UglifyJsPlugin(options.uglifyjs)
    );
}

export default webpackConfig;
