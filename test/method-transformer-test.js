/*eslint-env mocha*/
import {assert} from 'chai';
import Settings from '../lib/settings';

describe('HTTP_METHODS', () => {
    const settings = new Settings();

    it('GET method simple uri', () => {
        const uriFn = settings.get('http GET transformer').uri;
        const dataFn = settings.get('http GET transformer').data;

        assert(uriFn({uri: '/route', data:{a:'b', c:'d'}}) === '/route?a=b&c=d');
        assert(dataFn({uri: '/route', data:{a:'b', c:'d'}}) === undefined);
    });

    it('GET method uri with query string', () => {
        const uriFn = settings.get('http GET transformer').uri;
        const dataFn = settings.get('http GET transformer').data;

        assert(uriFn({uri: '/route?x=y&z=a', data:{a:'b', c:'d'}}) === '/route?x=y&z=a&a=b&c=d');
        assert(dataFn({uri: '/route?x=y&z=a', data:{a:'b', c:'d'}}) === undefined);
    });

    it('GET method uri with query string and anchor', () => {
        const uriFn = settings.get('http GET transformer').uri;
        const dataFn = settings.get('http GET transformer').data;

        assert(uriFn({uri: '/route?x=y&z=a#anchor1', data:{a:'b', c:'d'}}) === '/route?x=y&z=a&a=b&c=d#anchor1');
        assert(dataFn({uri: '/route?x=y&z=a#anchor1', data:{a:'b', c:'d'}}) === undefined);
    });
});