import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
    entry: 'lib/frontexpress.js',
    format: 'umd',
    moduleName:'frontexpress',
    plugins: [babel({
        babelrc: false,
        presets: ['es2015-rollup']
    })],
    dest: 'frontexpress.js'
};