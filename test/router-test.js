/*eslint-env mocha*/
import chai, {assert} from 'chai';
import sinon from 'sinon';
import frontexpress from '../lib/frontexpress';
import {HTTP_METHODS} from '../lib/requester';

describe('Router', () => {

    describe('generated methods', () => {
        it('checks http methods are exposed', ()=> {
            const router = frontexpress.Router();
            assert(typeof router.all === 'function');
            assert(typeof router.get === 'function');
            assert(typeof router.put === 'function');
            assert(typeof router.post === 'function');
            assert(typeof router.delete === 'function');
        });
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

            const r1 = router.routes('/', 'GET');
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

            const r1 = router.routes('/route1', 'GET');
            assert(r1.length === 1);
            assert(r1[0].uri === '/route1');
            assert(r1[0].method === 'GET');
            assert(r1[0].middleware === middleware1);

            const r2 = router.routes('/route2', 'POST');
            assert(r2.length === 1);
            assert(r2[0].uri === '/route2');
            assert(r2[0].method === 'POST');
            assert(r2[0].middleware === middleware2);

            let r3 = router.routes('/route3', 'GET');
            assert(r3.length === 1);
            assert(r3[0].uri === '/route3');
            assert(r3[0].method === 'GET');
            assert(r3[0].middleware === middleware3);

            r3 = router.routes('/route3', 'POST');
            assert(r3.length === 1);
            assert(r3[0].uri === '/route3');
            assert(r3[0].method === 'POST');
            assert(r3[0].middleware === middleware3);

            r3 = router.routes('/route3', 'PUT');
            assert(r3.length === 1);
            assert(r3[0].uri === '/route3');
            assert(r3[0].method === 'PUT');
            assert(r3[0].middleware === middleware3);

            r3 = router.routes('/route3', 'DELETE');
            assert(r3.length === 1);
            assert(r3[0].uri === '/route3');
            assert(r3[0].method === 'DELETE');
            assert(r3[0].middleware === middleware3);
        });

        it('no root path and regexp uri', ()=> {
            const router = frontexpress.Router();
            const middleware = frontexpress.Middleware();

            router.get(/^\/route1/, middleware);

            const r = router.routes('/route1', 'GET');
            assert(r.length === 1);
            assert(r[0].uri instanceof RegExp);
            assert(r[0].uri.toString() === new RegExp('^\/route1').toString());
            assert(r[0].method === 'GET');
            assert(r[0].middleware === middleware);
        });

        it('with root path /route1 and path /subroute', () => {
            const router = frontexpress.Router('/route1');

            router.get('/subroute', frontexpress.Middleware());

            const r = router.routes('/route1/subroute', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');
        });

        it('with root path /route1 and no path uri', () => {
            const router = frontexpress.Router('/route1');

            router.get(frontexpress.Middleware());

            const r = router.routes('/route1', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1');
        });

        it('duplicate / in route', () => {
            const router = frontexpress.Router('/route1/');

            router.get('/subroute', frontexpress.Middleware());

            const r = router.routes('/route1/subroute', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');
        });

        it('spaces in route', () => {
            let router = frontexpress.Router(' /route1 ');

            router.get('/subroute  ', frontexpress.Middleware());

            let r = router.routes('/route1/subroute', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');

            // ----

            router = frontexpress.Router(' /route1 ');

            router.get(frontexpress.Middleware());

            r = router.routes('/route1', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1');
        });

        it('route with query string', () => {
            let router = frontexpress.Router('/route1 ');

            router.get('/subroute', frontexpress.Middleware());

            let r = router.routes('/route1/subroute?a=b&c=d', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');
            assert(r[0].data === undefined);
        });

        it('route with anchor', () => {
            let router = frontexpress.Router('/route1 ');

            router.get('/subroute', frontexpress.Middleware());

            let r = router.routes('/route1/subroute#a=b&c=d', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');
            assert(r[0].data === undefined);
        });

        it('route with query string and anchor', () => {
            let router = frontexpress.Router('/route1 ');

            router.get('/subroute', frontexpress.Middleware());

            let r = router.routes('/route1/subroute?a=b&c=d#anchor1', 'GET');
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
            const middleware = frontexpress.Middleware();

            const spied_methods = [];
            for (const method of Object.keys(HTTP_METHODS)) {
                spied_methods.push(sinon.spy(router, method.toLowerCase()));
            }

            router.all(middleware);

            for (const spied_method of spied_methods) {
                assert(spied_method.calledOnce);
            }
        });

        it('with path /route1 and middleware as arguments', () => {
            const router = frontexpress.Router();
            const middleware = frontexpress.Middleware();

            const spied_methods = [];
            for (const method of Object.keys(HTTP_METHODS)) {
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
            const middleware = frontexpress.Middleware();

            router.get(middleware);

            const r = router.routes('/', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/');
            assert(r[0].method === 'GET');
            assert(r[0].middleware === middleware);
        });

        it('with path /route1 and middleware as arguments', () => {
            const router = frontexpress.Router();
            const middleware = frontexpress.Middleware();

            router.get('/route1', middleware);

            const r = router.routes('/route1', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1');
            assert(r[0].method === 'GET');
            assert(r[0].middleware === middleware);
        });

        it('router with regexp and route with /route1', () => {
            const router = frontexpress.Router(/^\//);
            const middleware = frontexpress.Middleware();
            chai.expect(() => router.get('/route1', middleware)).to.throw(TypeError);
        });

        it('router with regexp and route without uri', () => {
            const router = frontexpress.Router(/^\/part/);
            const middleware = frontexpress.Middleware();
            router.get(middleware);

            const r = router.routes('/part1', 'GET');
            assert(r.length === 1);
            assert(r[0].uri instanceof RegExp);
            assert(r[0].uri.toString() === new RegExp('^\/part').toString());
            assert(r[0].method === 'GET');
            assert(r[0].middleware === middleware);
        });
    });
});
