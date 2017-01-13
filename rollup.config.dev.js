import babel from 'rollup-plugin-babel';

export default {
    entry: 'lib/frontexpress.js',
    format: 'iife',
    moduleName:'frontexpress',
    plugins: [babel({
        babelrc: false,
        // exclude: 'node_modules/**',
        presets: ['es2015-rollup'],
        // externalHelpers: true,
        // plugins: ['external-helpers']
    })],
    dest: 'frontexpress.js'
};
