/*eslint-env mocha*/
import chai, {assert} from 'chai';
import Settings from '../lib/settings';

describe('Settings', () => {
    const settings = new Settings();
    let defaultRouteMatcher;
    let defaultHttpGetTransformer;
    let defaultHttpPostTransformer;
    let defaultHttpPatchTransformer;

    beforeEach(()=>{
        defaultRouteMatcher = settings.get('route matcher');
        defaultHttpGetTransformer = settings.get('http GET transformer');
        defaultHttpPostTransformer = settings.get('http POST transformer');
        defaultHttpPatchTransformer = settings.get('http PATCH transformer');
    });

    afterEach(()=>{
        settings.set('route matcher', defaultRouteMatcher);
        settings.set('http GET transformer', defaultHttpGetTransformer);
        settings.set('http POST transformer', defaultHttpPostTransformer);
        settings.set('http PATCH transformer', defaultHttpPatchTransformer);
    });

    describe('http GET method transformer', () => {
        it('check setting rule', () => {
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

            assert.strictEqual(uriFn({uri: '/route?x=y&z=a', data:{a:'b', c:'d'}}), '/route?x=y&z=a&a=b&c=d');
            assert(dataFn === undefined);
        });

        it('uri with query string and anchor', () => {
            const uriFn = settings.get('http GET transformer').uri;
            const dataFn = settings.get('http GET transformer').data;

            assert.strictEqual(uriFn({uri: '/route?x=y&z=a#anchor1', data:{a:'b', c:'d'}}), '/route?x=y&z=a&a=b&c=d#anchor1');
            assert(dataFn === undefined);
        });
    });

    describe('http PATCH method transformer', () => {
        it('check setting rule', () => {
            assert(settings.get('http PATCH transformer').data);
            assert(settings.get('http PATCH transformer').headers);
            assert.deepEqual(settings.get('http PATCH transformer').headers({}), {'Content-Type': 'application/x-www-form-urlencoded'});
            assert.deepEqual(settings.get('http PATCH transformer').headers({headers: null}), {'Content-Type': 'application/x-www-form-urlencoded'});
            assert.deepEqual(settings.get('http PATCH transformer').headers({headers: {'Content-Type': 'b'}}), {'Content-Type': 'b'});
            assert.deepEqual(settings.get('http PATCH transformer').headers({headers: {a:'b'}}), {a:'b', 'Content-Type': 'application/x-www-form-urlencoded'});
            assert.strictEqual(settings.get('http PATCH transformer').uri, undefined);

            chai.expect(() => settings.set('http PATCH transformer', null)).to.throw(TypeError);
            chai.expect(() => settings.set('http PATCH transformer', {})).to.throw(TypeError);
            chai.expect(() => settings.set('http PATCH transformer', {foo:()=>{}})).to.throw(TypeError);
        });

        it('check data sent is a null, undefined, string, number', () => {
            const dataFn = settings.get('http PATCH transformer').data;

            assert.strictEqual(dataFn({}), undefined);
            assert.strictEqual(dataFn({data: null}), null);
            assert.strictEqual(dataFn({data: undefined}), undefined);
            assert.strictEqual(decodeURIComponent(dataFn({data:'test'})), '0=t&1=e&2=s&3=t');
            assert.strictEqual(decodeURIComponent(dataFn({data:'tést'})), '0=t&1=é&2=s&3=t');
            assert.strictEqual(dataFn({data:1}), '');
        });

        it('check data sent is Array', () => {
            const dataFn = settings.get('http PATCH transformer').data;

            assert.strictEqual(decodeURIComponent(dataFn({data: ['t','e','s','t']})), '0=t&1=e&2=s&3=t');
            assert.strictEqual(decodeURIComponent(dataFn({data: ['t','é','s','t']})), '0=t&1=é&2=s&3=t');
        });

        it('check data sent is Object', () => {
            const dataFn = settings.get('http PATCH transformer').data;

            assert.strictEqual(decodeURIComponent(dataFn({data: {
                a: 1,
                b: 'test',
                c: null,
                d: undefined
            }})), 'a=1&b=test&c=null&d=undefined');
        });

        it('check data sent is deep Object', () => {
            const dataFn = settings.get('http PATCH transformer').data;

            assert.strictEqual(decodeURIComponent(dataFn({data: {
                a: {
                    b: {
                        c: {
                            d: {
                                e:1
                            },
                            d1: {
                                e1: 1
                            }
                        },
                        c1: {
                            d: {
                                e:1
                            },
                            d1: {
                                e1: 1
                            }
                        }
                    },
                    b1: 1
                }
            }})), 'a[b][c][d][e]=1&a[b][c][d1][e1]=1&a[b][c1][d][e]=1&a[b][c1][d1][e1]=1&a[b1]=1');
        });

        it('check data sent is deep Object with Array', () => {
            const dataFn = settings.get('http PATCH transformer').data;

            assert.strictEqual(decodeURIComponent(dataFn({data: {
                a: {
                    b: {
                        c: {
                            d: {
                                e:['a', 'b', 'c']
                            },
                            d1: {
                                e1: 1
                            }
                        },
                        c1: {
                            d: {
                                e:[1]
                            },
                            d1: {
                                e1: 1
                            }
                        }
                    },
                    b1: [1,2,3,4]
                },
                a1: 'câmél'

            }})), 'a[b][c][d][e][0]=a&a[b][c][d][e][1]=b&a[b][c][d][e][2]=c&a[b][c][d1][e1]=1&a[b][c1][d][e][0]=1&a[b][c1][d1][e1]=1&a[b1][0]=1&a[b1][1]=2&a[b1][2]=3&a[b1][3]=4&a1=câmél');
        });
    });

    describe('http POST method transformer', () => {
        it('check setting rule', () => {
            assert(settings.get('http POST transformer').data);
            assert(settings.get('http POST transformer').headers);
            assert.deepEqual(settings.get('http POST transformer').headers({}), {'Content-Type': 'application/x-www-form-urlencoded'});
            assert.deepEqual(settings.get('http POST transformer').headers({headers: null}), {'Content-Type': 'application/x-www-form-urlencoded'});
            assert.deepEqual(settings.get('http POST transformer').headers({headers: {'Content-Type': 'b'}}), {'Content-Type': 'b'});
            assert.deepEqual(settings.get('http POST transformer').headers({headers: {a:'b'}}), {a:'b', 'Content-Type': 'application/x-www-form-urlencoded'});
            assert.strictEqual(settings.get('http POST transformer').uri, undefined);

            chai.expect(() => settings.set('http POST transformer', null)).to.throw(TypeError);
            chai.expect(() => settings.set('http POST transformer', {})).to.throw(TypeError);
            chai.expect(() => settings.set('http POST transformer', {foo:()=>{}})).to.throw(TypeError);
        });
    });

    it('route matcher', () => {
        const defaultRouteMatcher = settings.get('route matcher');
        chai.expect(() => settings.set('route matcher', null)).to.throw(TypeError);
        chai.expect(() => settings.set('route matcher', {})).to.throw(TypeError);
        chai.expect(() => settings.set('route matcher', 1)).to.throw(TypeError);

        const routeMatcher = () => {};
        settings.set('route matcher', routeMatcher);
        assert.strictEqual(settings.get('route matcher'), routeMatcher);
    });
});
