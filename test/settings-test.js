/*eslint-env mocha*/
import chai, {assert} from 'chai';
import Settings from '../lib/settings';

describe('Settings', () => {
    const settings = new Settings();

    describe('http GET method transformer', () => {
        it('check setting rule', () => {
            const defaultHttpGetTransformer = settings.get('http GET transformer');

            chai.expect(() => settings.set('http GET transformer', null)).to.throw(TypeError);
            chai.expect(() => settings.set('http GET transformer', {})).to.throw(TypeError);
            chai.expect(() => settings.set('http GET transformer', {foo:()=>{}})).to.throw(TypeError);

            const uri = () => {};
            settings.set('http GET transformer', {uri});
            assert.deepEqual(settings.get('http GET transformer'), {uri});

            const headers = () => {};
            settings.set('http GET transformer', {headers});
            assert.deepEqual(settings.get('http GET transformer'), {headers});

            const data = () => {};
            settings.set('http GET transformer', {data});
            assert.deepEqual(settings.get('http GET transformer'), {data});

            settings.set('http GET transformer', defaultHttpGetTransformer);


            const defaultRouteMatcher = settings.get('route matcher');
            chai.expect(() => settings.set('route matcher', null)).to.throw(TypeError);
            chai.expect(() => settings.set('route matcher', {})).to.throw(TypeError);
            chai.expect(() => settings.set('route matcher', 1)).to.throw(TypeError);

            const routeMatcher = () => {};
            settings.set('route matcher', routeMatcher);
            assert.strictEqual(settings.get('route matcher'), routeMatcher);
        });

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
