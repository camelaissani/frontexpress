/*eslint-env mocha*/
import {assert} from 'chai';
import sinon from 'sinon';
import frontexpress from '../frontexpress';
import {HTTP_METHODS} from '../lib/requester';

describe('Router', () => {

    describe('generated methods', () => {
        it('checks http methods are exposed', ()=> {
            assert(typeof frontexpress.Router.prototype.all === 'function');
            assert(typeof frontexpress.Router.prototype.get === 'function');
            assert(typeof frontexpress.Router.prototype.put === 'function');
            assert(typeof frontexpress.Router.prototype.post === 'function');
            assert(typeof frontexpress.Router.prototype.delete === 'function');
        });
    });

    describe('getRoutes method', () => {
        it('no root path and no path uri', ()=> {
            const router = new frontexpress.Router();
            const middleware = (request, response) => {};

            router.get(middleware);

            const r1 = router.getRoutes('/', 'GET');
            assert(r1.length === 1);
            assert(r1[0].uri === undefined);
            assert(r1[0].method === 'GET');
            assert(r1[0].middleware === middleware);
        });

        it('no root path and path /routeX', ()=> {
            const router = new frontexpress.Router();
            const middleware1 = (request, response) => {};
            const middleware2 = (request, response) => {};
            const middleware3 = (request, response) => {};

            router
                .get('/route1', middleware1)
                .post('/route2', middleware2)
                .all('/route3', middleware3);

            const r1 = router.getRoutes('/route1', 'GET');
            assert(r1.length === 1);
            assert(r1[0].uri === '/route1');
            assert(r1[0].method === 'GET');
            assert(r1[0].middleware === middleware1);

            const r2 = router.getRoutes('/route2', 'POST');
            assert(r2.length === 1);
            assert(r2[0].uri === '/route2');
            assert(r2[0].method === 'POST');
            assert(r2[0].middleware === middleware2);

            let r3 = router.getRoutes('/route3', 'GET');
            assert(r3.length === 1);
            assert(r3[0].uri === '/route3');
            assert(r3[0].method === 'GET');
            assert(r3[0].middleware === middleware3);

            r3 = router.getRoutes('/route3', 'POST');
            assert(r3.length === 1);
            assert(r3[0].uri === '/route3');
            assert(r3[0].method === 'POST');
            assert(r3[0].middleware === middleware3);

            r3 = router.getRoutes('/route3', 'PUT');
            assert(r3.length === 1);
            assert(r3[0].uri === '/route3');
            assert(r3[0].method === 'PUT');
            assert(r3[0].middleware === middleware3);

            r3 = router.getRoutes('/route3', 'DELETE');
            assert(r3.length === 1);
            assert(r3[0].uri === '/route3');
            assert(r3[0].method === 'DELETE');
            assert(r3[0].middleware === middleware3);
        });

        it('no root path and regexp uri', ()=> {
            const router = new frontexpress.Router();
            const middleware = new frontexpress.Middleware();

            router.get(/^\/route1/, middleware);

            const r = router.getRoutes('/route1', 'GET');
            assert(r.length === 1);
            assert(r[0].uri instanceof RegExp);
            assert(r[0].uri.toString() === new RegExp('^\/route1').toString());
            assert(r[0].method === 'GET');
            assert(r[0].middleware === middleware);
        });

        it('with root path /route1 and path /subroute', () => {
            const router = new frontexpress.Router('/route1');

            router.get('/subroute', new frontexpress.Middleware());

            const r = router.getRoutes('/route1/subroute', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');
        });

        it('with root path /route1 and no path uri', () => {
            const router = new frontexpress.Router('/route1');

            router.get(new frontexpress.Middleware());

            const r = router.getRoutes('/route1', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1');
        });

        it('duplicate / in route', () => {
            const router = new frontexpress.Router('/route1/');

            router.get('/subroute', new frontexpress.Middleware());

            const r = router.getRoutes('/route1/subroute', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');
        });

        it('spaces in route', () => {
            let router = new frontexpress.Router(' /route1 ');

            router.get('/subroute  ', new frontexpress.Middleware());

            let r = router.getRoutes('/route1/subroute', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1/subroute');

            // ----

            router = new frontexpress.Router(' /route1 ');

            router.get(new frontexpress.Middleware());

            r = router.getRoutes('/route1', 'GET');
            assert(r.length === 1);
            assert(r[0].uri === '/route1');
        });
    });

    describe('all method', () => {
        it('no arguments', () => {
            const router = new frontexpress.Router('/route1');
            assert.throws(router.all, TypeError);
        });

        it('bad argument', () => {
            const router = new frontexpress.Router('/route1');
            try {
                router.all('ddd');
            } catch(ex) {
                assert(ex instanceof TypeError);
            }
            try {
                router.all('ddd', 'eee');
            } catch(ex) {
                assert(ex instanceof TypeError);
            }
            try {
                router.all('ddd', new frontexpress.Router());
            } catch(ex) {
                assert(ex instanceof TypeError);
            }
        });

        it('only middleware as argument', () => {
            const router = new frontexpress.Router('/route1');
            const middleware = new frontexpress.Middleware();

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
            const router = new frontexpress.Router();
            const middleware = new frontexpress.Middleware();

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

    describe('one http (get) method', () => {
        it('no arguments', () => {
            const router = new frontexpress.Router('/route1');
            assert.throws(router.get, TypeError);
        });

        it('bad argument', () => {
            const router = new frontexpress.Router('/route1');
            try {
                router.get('ddd');
            } catch(ex) {
                assert(ex instanceof TypeError);
            }
            try {
                router.get('ddd', 'eee');
            } catch(ex) {
                assert(ex instanceof TypeError);
            }
            try {
                router.get('ddd', new frontexpress.Router());
            } catch(ex) {
                assert(ex instanceof TypeError);
            }
        });

        it('only middleware as argument', () => {
            const router = new frontexpress.Router('/');
            const middleware = new frontexpress.Middleware();

            router.get(middleware);

            const r1 = router.getRoutes('/', 'GET');
            assert(r1.length === 1);
            assert(r1[0].uri === '/');
            assert(r1[0].method === 'GET');
            assert(r1[0].middleware === middleware);
        });

        it('with path /route1 and middleware as arguments', () => {
            const router = new frontexpress.Router();
            const middleware = new frontexpress.Middleware();

            router.get('/route1', middleware);

            const r1 = router.getRoutes('/route1', 'GET');
            assert(r1.length === 1);
            assert(r1[0].uri === '/route1');
            assert(r1[0].method === 'GET');
            assert(r1[0].middleware === middleware);
        });
    });
});
