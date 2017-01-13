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
            // exclude: 'node_modules/**',
            presets: ['es2015-rollup'],
            // externalHelpers: true,
            // plugins: ['external-helpers']
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
