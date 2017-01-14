import babel from 'rollup-plugin-babel';

export default {
    entry: 'lib/frontexpress.js',
    format: 'iife',
    moduleName:'frontexpress',
    plugins: [babel({
        babelrc: false,
        presets: ['es2015-rollup']
    })],
    dest: 'frontexpress.js'
};
