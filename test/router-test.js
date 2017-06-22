/*eslint-env mocha*/
import chai, {assert} from 'chai';
import sinon from 'sinon';
import frontexpress from '../lib/frontexpress';
import HTTP_METHODS from '../lib/methods';

const application = frontexpress();
const routeMatcher = application.get('route matcher');

describe('Router', () => {

    describe('generated methods', () => {
        it('checks http methods are exposed', ()=> {
            const router = frontexpress.Router();
            assert(typeof router.all === 'function');
            assert(typeof router.get === 'function');
            assert(typeof router.put === 'function');
            assert(typeof router.patch === 'function');
            assert(typeof router.post === 'function');
            assert(typeof router.delete === 'function');
        });
    });

    describe('use method', () => {
        const router = frontexpress.Router();
        chai.expect(() => {
            router.use();
        }).to.throw(TypeError);
        chai.expect(() => {
            router.use('dddd');
        }).to.throw(TypeError);
    });

    describe('visited method', () => {
        it('get visited route', ()=> {
            const router = frontexpress.Router();
            const middleware = (request, response) => {};

            router.get(middleware);

            const r1 = router.visited();
            assert(r1.length === 0);
        });
    });

    describe('routes method', () => {
        it('no root path and no path uri', ()=> {
            const router = frontexpress.Router();
            const middleware = (request, response) => {};

            router.get(middleware);

            const r1 = router.routes(application, {uri: '/', method: 'GET'});
            assert(r1.length === 1);
            assert(r1[0].uri === undefined);
            assert(r1[0].method === 'GET');
            assert(r1[0].middleware === middleware);
        });

        it('no root path and path /routeX', ()=> {
            const router = frontexpress.Router();
            const middleware1 = (request, response) => {};
            const middleware2 = (request, response) => {};
            const middleware3 = (request, response) => {};

            router
                .get('/route1', middleware1)
                .post('/route2', middleware2)
                .all('/route3', middleware3);

            const r1 = router.routes(application, {uri: '/route1', method: 'GET'});
            assert(r1.length === 1);
            assert(r1[0].uri === '/route1');
            assert(r1[0].method === 'GET');
            assert(r1[0].middleware === middleware1);

            const r2 = router.routes(application, {uri: '/route2', method: 'POST'});
            assert(r2.length === 1);
            assert(r2[0].uri === '/route2');
            assert(r2[0].method === 'POST');
            assert(r2[0].middleware === middleware2);

            let r3 = router.routes(application, {uri: '/route3', method: 'GET'});
            assert(r3.length === 1);
            assert(r3[0].uri === '/route3');
            assert(r3[0].method === 'GET');
            assert(r3[0].middleware === middleware3);

            r3 = router.routes(application, {uri: '/route3', method: 'POST'});
            assert(r3.length === 1);
            assert(r3[0].uri === '/route3');
            assert(r3[0].method === 'POST');
            assert(r3[0].middleware === middleware3);

            r3 = router.routes(application, {uri: '/route3', method: 'PUT'});
            assert(r3.length === 1);
            assert(r3[0].uri === '/route3');
            assert(r3[0].method === 'PUT');
            assert(r3[0].middleware === middleware3);

            r3 = router.routes(application, {uri: '/route3', method: 'DELETE'});
            assert(r3.length === 1);
            assert(r3[0].uri === '/route3');
            assert(r3[0].method === 'DELETE');
            assert(r3[0].middleware === middleware3);
        });

        it('no root path and regexp uri', ()=> {
            const router = frontexpress.Router();
            const middleware = new frontexpress.Middleware();

            router.get(/^\/route1/, middleware);

            const r = router.routes(application, {uri: '/route1', method: 'GET'});
            assert(r.length === 1);
            assert(r[0].uri instanceof RegExp);
            assert(r[0].uri.toString() === new RegExp('^\/route1').toString());
            assert(r[0].method === 'GET');
            assert(r[0].middleware === middleware);
        });

        it('with root path /route1 and path /subroute', () => {
            const router = frontexpress.Router('/route1');

            router.get('/subroute', new frontexpress.Middleware());

            const r = router.routes(application, {uri: '/route1/subroute', method: 'GET'});
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');
        });

        it('with root path /route1 and no path uri', () => {
            const router = frontexpress.Router('/route1');

            router.get(new frontexpress.Middleware());

            const r = router.routes(application, {uri: '/route1', method: 'GET'});
            assert(r.length === 1);
            assert(r[0].uri === '/route1');
        });

        it('duplicate / in route', () => {
            const router = frontexpress.Router('/route1/');

            router.get('/subroute', new frontexpress.Middleware());

            const r = router.routes(application, {uri: '/route1/subroute', method: 'GET'});
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');
        });

        it('spaces in route', () => {
            let router = frontexpress.Router(' /route1 ');

            router.get('/subroute  ', new frontexpress.Middleware());

            let r = router.routes(application, {uri: '/route1/subroute', method: 'GET'});
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');

            // ----

            router = frontexpress.Router(' /route1 ');

            router.get(new frontexpress.Middleware());

            r = router.routes(application, {uri: '/route1', method: 'GET'});
            assert(r.length === 1);
            assert(r[0].uri === '/route1');
        });

        it('route with query string', () => {
            let router = frontexpress.Router('/route1 ');

            router.get('/subroute', new frontexpress.Middleware());

            let r = router.routes(application, {uri: '/route1/subroute?a=b&c=d', method: 'GET'});
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');
            assert(r[0].data === undefined);
        });

        it('route with anchor', () => {
            let router = frontexpress.Router('/route1 ');

            router.get('/subroute', new frontexpress.Middleware());

            let r = router.routes(application, {uri: '/route1/subroute#a=b&c=d', method: 'GET'});
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');
            assert(r[0].data === undefined);
        });

        it('route with query string and anchor', () => {
            let router = frontexpress.Router('/route1 ');

            router.get('/subroute', new frontexpress.Middleware());

            let r = router.routes(application, {uri: '/route1/subroute?a=b&c=d#anchor1', method: 'GET'});
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');
            assert(r[0].data === undefined);
        });
    });

    describe('all method', () => {
        it('no arguments', () => {
            const router = frontexpress.Router('/route1');
            assert.throws(router.all, TypeError);
        });

        it('bad argument', () => {
            const router = frontexpress.Router('/route1');
            chai.expect(() => router.all('ddd')).to.throw(TypeError);
            chai.expect(() => router.all('ddd', 'eee')).to.throw(TypeError);
            chai.expect(() => router.all('ddd', frontexpress.Router())).to.throw(TypeError);
        });

        it('only middleware as argument', () => {
            const router = frontexpress.Router('/route1');
            const middleware = new frontexpress.Middleware();

            const spied_methods = [];
            for (const method of HTTP_METHODS) {
                spied_methods.push(sinon.spy(router, method.toLowerCase()));
            }

            router.all(middleware);

            for (const spied_method of spied_methods) {
                assert(spied_method.calledOnce);
            }
        });

        it('with path /route1 and middleware as arguments', () => {
            const router = frontexpress.Router();
            const middleware = new frontexpress.Middleware();

            const spied_methods = [];
            for (const method of HTTP_METHODS) {
                spied_methods.push(sinon.spy(router, method.toLowerCase()));
            }

            router.all('/route1', middleware);

            for (const spied_method of spied_methods) {
                assert(spied_method.calledOnce);
            }
        });
    });

    describe('one http method (get)', () => {
        it('no arguments', () => {
            const router = frontexpress.Router('/route1');
            assert.throws(router.get, TypeError);
        });

        it('bad argument', () => {
            const router = frontexpress.Router('/route1');
            chai.expect(() => router.get('ddd')).to.throw(TypeError);
            chai.expect(() => router.get('ddd', 'eee')).to.throw(TypeError);
            chai.expect(() => router.get('ddd', frontexpress.Router())).to.throw(TypeError);
        });

        it('only middleware as argument', () => {
            const router = frontexpress.Router('/');
            const middleware = new frontexpress.Middleware();

            router.get(middleware);

            const r = router.routes(application, {uri: '/', method: 'GET'});
            assert(r.length === 1);
            assert(r[0].uri === '/');
            assert(r[0].method === 'GET');
            assert(r[0].middleware === middleware);
        });

        it('with path /route1 and middleware as arguments', () => {
            const router = frontexpress.Router();
            const middleware = new frontexpress.Middleware();

            router.get('/route1', middleware);

            const r = router.routes(application, {uri: '/route1', method: 'GET'});
            assert(r.length === 1);
            assert(r[0].uri === '/route1');
            assert(r[0].method === 'GET');
            assert(r[0].middleware === middleware);
        });

        it('router with regexp and route with /route1', () => {
            const router = frontexpress.Router(/^\//);
            const middleware = new frontexpress.Middleware();
            chai.expect(() => router.get('/route1', middleware)).to.throw(TypeError);
        });

        it('router with regexp and route without uri', () => {
            const router = frontexpress.Router(/^\/part/);
            const middleware = new frontexpress.Middleware();
            router.get(middleware);

            const r = router.routes(application, {uri: '/part1', method: 'GET'});
            assert(r.length === 1);
            assert(r[0].uri instanceof RegExp);
            assert(r[0].uri.toString() === new RegExp('^\/part').toString());
            assert(r[0].method === 'GET');
            assert(r[0].middleware === middleware);
        });
    });

    describe('check route matcher', () => {
        it('/', () => {
            const route = {uri: '/', method: 'GET'};

            const request = {uri: '/', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.deepEqual(request.params, {});
        });

        it('/a/b/c', () => {
            const route = {uri: '/a/b/c', method: 'GET'};

            let request = {uri: '/a/b/c', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.deepEqual(request.params, {});

            request = {uri: '/a/b/c/', method: 'GET', params: {}};
            assert.strictEqual(routeMatcher(request, route), false);
        });

        it('/^\//', () => {
            const route = {uri: /^\//, method: 'GET'};

            const request = {uri: '/a/b/c', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.deepEqual(request.params, {});
        });

        it('/:id', () => {
            const route = {uri: '/:id', method: 'GET'};

            const request = {uri: '/1000', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.strictEqual(request.params.id, 1000);
        });

        it('/user/:id', () => {
            const route = {uri: '/user/:id', method: 'GET'};

            let request = {uri: '/user/1000', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.strictEqual(request.params.id, 1000);

            request = {uri: '/user/100.2122', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.strictEqual(request.params.id, 100.2122);

            request = {uri: '/user', method: 'GET', params: {}};
            assert.strictEqual(routeMatcher(request, route), false);

            request = {uri: '/user/', method: 'GET', params: {}};
            assert.strictEqual(routeMatcher(request, route), false);
        });

        it('/user/:id with id as coma separated values', () => {
            const route = {uri: '/user/:id', method: 'GET'};

            let request = {uri: '/user/1,2,3', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.deepEqual(request.params, {id: [1,2,3]});

            request = {uri: '/user/1.5,2.55,4.25', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.deepEqual(request.params, {id: [1.5,2.55,4.25]});

            request = {uri: '/user/a,b,c', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.deepEqual(request.params, {id: ['a','b','c']});
        });

        it('/user/:id?', () => {
            const route = {uri: '/user/:id?', method: 'GET'};

            let request = {uri: '/user/1000', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.strictEqual(request.params.id, 1000);

            request = {uri: '/user', method: 'GET', params: {}};
            assert.strictEqual(routeMatcher(request, route), true);
            assert.deepEqual(request.params, {id: undefined});

            request = {uri: '/user/', method: 'GET', params: {}};
            assert.strictEqual(routeMatcher(request, route), false);
        });

        it('/user/:firstname/:lastname', () => {
            const route = {uri: '/user/:firstname/:lastname', method: 'GET'};

            let request = {uri: '/user/camel/aissani', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.deepEqual(request.params, {firstname: 'camel', lastname:'aissani'} );

            request = {uri: '/user/camel', method: 'GET', params: {}};
            assert.strictEqual(routeMatcher(request, route), false);
        });

        it('/user/:firstname?/:lastname', () => {
            const route = {uri: '/user/:firstname?/:lastname', method: 'GET'};

            let request = {uri: '/user/camel/aissani', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.deepEqual(request.params, {firstname: 'camel', lastname:'aissani'} );

            request = {uri: '/user/aissani', method: 'GET', params: {}};
            assert(routeMatcher(request, route));
            assert.deepEqual(request.params, {firstname: undefined, lastname:'aissani'} );
        });
    });
});
