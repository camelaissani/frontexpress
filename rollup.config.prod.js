import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-js';
import babel from 'rollup-plugin-babel';

export default {
    entry: 'lib/frontexpress.js',
    format: 'iife',
    sourceMap: true,
    moduleName:'frontexpress',
    dest: 'frontexpress.min.js',
    plugins: [
        babel({
            babelrc: false,
            presets: ['es2015-rollup']
        }),
        uglify({
            compress: {
                warnings: false,
            },
            output: {
                comments: false
            }
        }, minify)
    ]
};
