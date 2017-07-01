
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

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
        uglify({}, minify)
    ]
};
