/*eslint-env mocha*/
import {assert} from 'chai';
import Settings from '../lib/settings';

describe('Settings', () => {
    const settings = new Settings();

    describe('http GET method transformer', () => {
        it('simple uri', () => {
            const uriFn = settings.get('http GET transformer').uri;
            const dataFn = settings.get('http GET transformer').data;

            assert(uriFn({uri: '/route', data:{a:'b', c:'d'}}) === '/route?a=b&c=d');
            assert(dataFn === undefined);
        });

        it('uri with query string', () => {
            const uriFn = settings.get('http GET transformer').uri;
            const dataFn = settings.get('http GET transformer').data;

            assert(uriFn({uri: '/route?x=y&z=a', data:{a:'b', c:'d'}}) === '/route?x=y&z=a&a=b&c=d');
            assert(dataFn === undefined);
        });

        it('uri with query string and anchor', () => {
            const uriFn = settings.get('http GET transformer').uri;
            const dataFn = settings.get('http GET transformer').data;

            assert(uriFn({uri: '/route?x=y&z=a#anchor1', data:{a:'b', c:'d'}}) === '/route?x=y&z=a&a=b&c=d#anchor1');
            assert(dataFn === undefined);
        });
    });
});
