/*eslint-env mocha*/
import {assert} from 'chai';
import sinon from 'sinon';
import chai from 'chai';
import frontexpress from '../lib/frontexpress';
import Requester from '../lib/requester';

describe('Application', () => {
    let requester;

    describe('generated methods', () => {
        it('checks http methods are exposed', ()=> {
            const app = frontexpress();
            assert(typeof app.httpGet === 'function');
            assert(typeof app.httpPut === 'function');
            assert(typeof app.httpPost === 'function');
            assert(typeof app.httpDelete === 'function');
        });

        it('checks middleware methods are exposed', ()=> {
            const app = frontexpress();
            assert(typeof app.get === 'function');
            assert(typeof app.put === 'function');
            assert(typeof app.post === 'function');
            assert(typeof app.delete === 'function');
        });
    });

    describe('listen method', () => {
        let eventFn = {};

        beforeEach(() => {
            global.document = {};
            global.window = {
                addEventListener(eventType, callback) {
                    eventFn[eventType] = callback;
                },
                location: {
                    pathname: '/route1',
                    search: '?a=b'
                }
            }
        });

        it('with function middleware readyState===interactive', (done) => {
            const app = frontexpress();
            app.use('/route1', (request, response, next) => {
                done();
            });
            app.listen();

            //simulate readystatechange
            document.readyState = 'interactive';
            document.onreadystatechange();
        });

        it('with middleware object readyState===loading', (done) => {
            const app = frontexpress();
            const m = new frontexpress.Middleware();
            sinon.stub(m, 'entered', () => {
                done();
            });

            app.use('/route1', m);
            app.listen();

            //simulate readystatechange
            document.readyState = 'loading';
            document.onreadystatechange();
        });

        it('with middleware object readyState===interactive', (done) => {
            const app = frontexpress();
            const m = new frontexpress.Middleware();
            sinon.stub(m, 'updated', () => {
                done();
            });

            app.use('/route1', m);
            app.listen();

            //simulate readystatechange
            document.readyState = 'interactive';
            document.onreadystatechange();
        });

        it('with middleware object event beforeunload', (done) => {
            const app = frontexpress();
            const m = new frontexpress.Middleware();
            sinon.stub(m, 'exited', () => {
                done();
            });

            app.use('/route1', m);
            app.listen(() => {
                //simulate beforeunload
                eventFn['beforeunload']();
            });

            //simulate readystatechange
            document.readyState = 'interactive';
            document.onreadystatechange();
        });
    });

    describe('set method', () => {
        it('unsupported setting', () => {
            const app = frontexpress();
            chai.expect(() => app.set('blabla', 'value')).to.throw(ReferenceError);
        });

        it('supported setting', () => {
            const requester = new Requester();
            const app = frontexpress();
            app.set('http-requester', requester);
            assert(app.requester === requester);
        });
    });

    describe('use method', () => {
        beforeEach(()=>{
            requester = new Requester();
            sinon.stub(requester, 'fetch', ({uri, method, headers, data}, resolve, reject) => {
                resolve(
                    {uri, method, headers, data},
                    {status: 200, statusText: 'OK', responseText:''}
                );
            });
        });

        it('no arguments', () => {
            const app = frontexpress();
            app.set('http-requester', requester);
            assert.throws(app.use, TypeError);
        });

        it('bad arguments', () => {
            const app = frontexpress();
            app.set('http-requester', requester);
            chai.expect(() => app.use('eee')).to.throw(TypeError);
        });

        it('mixing uri and regexp', () => {
            let router = frontexpress.Router('/subroute');
            let app = frontexpress();
            app.set('http-requester', requester);
            chai.expect(() => app.use(/route/, router)).to.throw(TypeError);

            router = frontexpress.Router(/subroute/);
            app = frontexpress();
            app.set('http-requester', requester);
            chai.expect(() => app.use('/route', router)).to.throw(TypeError);
        });

        it('middleware as function on path /', (done) => {
            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http-requester', requester);
            app.use((request, response, next) => {spy()});

            app.httpGet('/', (request, response) => {
                assert(spy.callCount === 1);

                app.httpPost('/route1', (request, response) => {
                    assert(spy.callCount === 2);
                    done();
                });
            });
        });

        it('middleware as function on path /route1', (done) => {
            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http-requester', requester);
            app.use('/route1', (request, response, next) => {spy()});

            app.httpGet('/route1', (request, response) => {
                assert(spy.callCount === 1);

                app.httpPost('/route1', (request, response) => {
                    assert(spy.callCount === 2);
                    done();
                });
            });
        });

        it('middleware as function on path / request fails', (done) => {
            requester = new Requester();
            sinon.stub(requester, 'fetch', ({uri, method, headers, data}, resolve, reject) => {
                reject(
                    {uri, method, headers, data},
                    {status: 401, statusText: 'not logged'}
                );
            });

            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http-requester', requester);
            app.use((request, response, next) => {spy()});

            app.httpGet('/', null, (request, response) => {
                assert(spy.callCount === 1);
                assert(response.status === 401);
                done();
            });
        });

        it('middleware as object on path /', (done) => {
            const middleware = new frontexpress.Middleware('on path /');
            const spy = sinon.spy(middleware, 'updated');

            const app = frontexpress();
            app.set('http-requester', requester);
            app.use(middleware);

            app.httpGet('/', (request, response) => {
                assert(spy.callCount === 1);

                app.httpPost('/route1', (request, response) => {
                    assert(spy.callCount === 2);
                    done();
                });
            });
        });

        it('middleware as object on path /route1', (done) => {
            const middleware = new frontexpress.Middleware('on path /route1');
            const spy = sinon.spy(middleware, 'updated');

            const app = frontexpress();
            app.set('http-requester', requester);
            app.use('/route1', middleware);

            app.httpGet('/route1', (request, response) => {
                assert(spy.callCount === 1);

                app.httpPost('/route1', (request, response) => {
                    assert(spy.callCount === 2);
                    done();
                });
            });
        });

        it('middleware as object on path / request fails', (done) => {
            requester = new Requester();
            sinon.stub(requester, 'fetch', ({uri, method, headers, data}, resolve, reject) => {
                reject(
                    {uri, method, headers, data},
                    {status: 401, statusText: 'not logged'}
                );
            });

            const middleware = new frontexpress.Middleware('on path /');
            const spy = sinon.spy(middleware, 'failed');

            const app = frontexpress();
            app.set('http-requester', requester);
            app.use(middleware);

            app.httpGet('/', null, (request, response) => {
                assert(spy.callCount === 1);
                assert(response.status === 401);
                done();
            });
        });

        it('router on path /', (done) => {
            const spy = sinon.spy();
            const router = frontexpress.Router();
            router
                .get((request, response, next) => {spy()})
                .post((request, response, next) => {spy()});

            const app = frontexpress();
            app.set('http-requester', requester);
            app.use(router);

            app.httpGet('/', (request, response) => {
                assert(spy.callCount === 1);

                app.httpPost('/route1', (request, response) => {
                    assert(spy.callCount === 2);
                    done();
                });
            });
        });

        it('router on path /route1', (done) => {
            const spy = sinon.spy();
            const router = frontexpress.Router();
            router
                .get((request, response, next) => {spy()})
                .post((request, response, next) => {spy()});

            const app = frontexpress();
            app.set('http-requester', requester);
            app.use('/route1', router);

            app.httpGet('/route1', (request, response) => {
                assert(spy.callCount === 1);

                app.httpPost('/route1', (request, response) => {
                    assert(spy.callCount === 2);
                    done();
                });
            });
        });

        it('router with base uri', (done)=> {
            const middleware = new frontexpress.Middleware('get middleware');
            const spy = sinon.spy(middleware, 'updated');

            const app = frontexpress();
            app.set('http-requester', requester);

            const router = frontexpress.Router();
            router.get('/subroute1', middleware);

            app.use('/route1', router);

            app.httpGet('/route1/subroute1', (request, response) => {
                assert(spy.calledOnce);
                done();
            },
            (request, response) => {
                done(response);
            });
        });
    });

    describe('get method', () => {
        beforeEach(()=>{
            requester = new Requester();
            sinon.stub(requester, 'fetch', ({uri, method, headers, data}, resolve, reject) => {
                resolve(
                    {uri, method, headers, data},
                    {status: 200, statusText: 'OK', responseText:''}
                );
            });
        });

        it('no arguments', () => {
            const app = frontexpress();
            app.set('http-requester', requester);
            assert.throws(app.get, TypeError);
        });

        it('bad arguments', () => {
            const app = frontexpress();
            app.set('http-requester', requester);
            chai.expect(() => app.get('eee')).to.throw(TypeError);
            chai.expect(() => app.get(frontexpress.Router())).to.throw(TypeError);
            chai.expect(() => app.get('/route1', frontexpress.Router())).to.throw(TypeError);
        });

        it('middleware as function on path /', (done) => {
            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http-requester', requester);
            app.get((request, respons, next) => {spy()});

            app.httpGet('/', (request, response) => {
                assert(spy.callCount === 1);

                app.httpPost('/route1', (request, response) => {
                    assert(spy.callCount === 1);
                    done();
                });
            });
        });

        it('middleware as function on path /route1', (done) => {
            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http-requester', requester);
            app.get('/route1', (request, response, next) => {spy()});

            app.httpGet('/route1', (request, response) => {
                assert(spy.callCount === 1);

                app.httpPost('/route1', (request, response) => {
                    assert(spy.callCount === 1);
                    done();
                });
            });
        });

        it('middleware as object on path /', (done) => {
            const middleware = new frontexpress.Middleware('on path /');
            const spy = sinon.spy(middleware, 'updated');

            const app = frontexpress();
            app.set('http-requester', requester);
            app.get(middleware);

            app.httpGet('/', (request, response) => {
                assert(spy.callCount === 1);

                app.httpPost('/route1', (request, response) => {
                    assert(spy.callCount === 1);
                    done();
                });
            });
        });

        it('middleware as object on path /route1', (done) => {
            const middleware = new frontexpress.Middleware('on path /route1');
            const spy = sinon.spy(middleware, 'updated');

            const app = frontexpress();
            app.set('http-requester', requester);
            app.get(middleware);

            app.httpGet('/route1', (request, response) => {
                assert(spy.callCount === 1);

                app.httpPost('/route1', (request, response) => {
                    assert(spy.callCount === 1);
                    done();
                });
            });
        });
    });

    describe('route method', () => {
        beforeEach(()=>{
            requester = new Requester();
            sinon.stub(requester, 'fetch', ({uri, method, headers, data}, resolve, reject) => {
                resolve(
                    {uri, method, headers, data},
                    {status: 200, statusText: 'OK', responseText:''}
                );
            });
        });

        it('on root path not specified', (done) => {
            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http-requester', requester);
            app.route().get((request, response, next) => {spy()});

            app.httpGet('/', (request, response) => {
                assert(spy.calledOnce);
                app.httpPost('/', (request, response) => {
                    assert(spy.calledOnce);
                    done();
                });
            });

        });

        it('on root path /', (done) => {
            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http-requester', requester);
            app.route('/').get((request, response, next) => {spy()});

            app.httpGet('/', (request, response) => {
                assert(spy.calledOnce);
                app.httpPost('/', (request, response) => {
                    assert(spy.calledOnce);
                    done();
                });
            });

        });

        it('on root path /route1', (done) => {
            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http-requester', requester);
            app.route('/route1').get((request, response, next) => {spy()});

            app.httpGet('/route1', (request, response) => {
                assert(spy.calledOnce);
                app.httpPost('/route1', (request, response) => {
                    assert(spy.calledOnce);
                    done();
                });
            });

        });

        it('on root path undefined with sub path /subroute1', (done) => {
            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http-requester', requester);
            app.route().get('/subroute1', (request, response, next) => {spy()});

            app.httpGet('/subroute1', (request, response) => {
                assert(spy.calledOnce);
                app.httpPost('/subroute1', (request, response) => {
                    assert(spy.calledOnce);
                    done();
                });
            });
        });

        it('on root path / with sub path /subroute1', (done) => {
            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http-requester', requester);
            app.route('/').get('/subroute1', (request, response, next) => {spy()});

            app.httpGet('/subroute1', (request, response) => {
                assert(spy.calledOnce);
                app.httpPost('/subroute1', (request, response) => {
                    assert(spy.calledOnce);
                    done();
                });
            });
        });

        it('on root path /route1 with sub path /subroute1', (done) => {
            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http-requester', requester);
            app.route('/route1').get('/subroute1', (request, response, next) => {spy()});

            app.httpGet('/route1/subroute1', (request, response) => {
                assert(spy.calledOnce);
                app.httpPost('/route1/subroute1', (request, response) => {
                    assert(spy.calledOnce);
                    done();
                });
            });
        });
    });

    describe('middleware object lifecycle', () => {
        beforeEach(()=>{
            requester = new Requester();
            sinon.stub(requester, 'fetch', ({uri, method, headers, data}, resolve, reject) => {
                resolve(
                    {uri, method, headers, data},
                    {status: 200, statusText: 'OK', responseText:''}
                );
            });
        });

        it('http GET request', (done) => {
            const app = frontexpress();
            app.set('http-requester', requester);

            const getMiddleware = new frontexpress.Middleware('get middleware');
            const spy_get_entered = sinon.spy(getMiddleware, 'entered');
            const spy_get_updated = sinon.spy(getMiddleware, 'updated');
            const spy_get_exited = sinon.spy(getMiddleware, 'exited');
            const spy_get_next = sinon.spy(getMiddleware, 'next');

            app.route('/route1').get(getMiddleware);

            app.httpGet({uri:'/route1', data: {p1: 'a', p2: 'b', p3: 'c'}}, (request, response) => {
                assert(spy_get_entered.callCount === 1);
                assert(spy_get_updated.callCount === 1);
                assert(spy_get_exited.callCount === 0);
                assert(spy_get_next.callCount === 2);

                assert(spy_get_entered.calledBefore(spy_get_updated));
                assert(spy_get_next.calledAfter(spy_get_entered));
                assert(spy_get_next.calledAfter(spy_get_updated));
                done();
            },
            (request, response) => {
                done(response);
            });
        });

        it('http GET followed by http POST requests', (done) => {
            const app = frontexpress();
            app.set('http-requester', requester);

            const allMiddleware = new frontexpress.Middleware('all middleware');
            const spy_all_entered = sinon.spy(allMiddleware, 'entered');
            const spy_all_updated = sinon.spy(allMiddleware, 'updated');
            const spy_all_exited = sinon.spy(allMiddleware, 'exited');

            const getMiddleware = new frontexpress.Middleware('get middleware');
            const spy_get_entered = sinon.spy(getMiddleware, 'entered');
            const spy_get_updated = sinon.spy(getMiddleware, 'updated');
            const spy_get_exited = sinon.spy(getMiddleware, 'exited');

            const postMiddleware = new frontexpress.Middleware('post middleware');
            const spy_post_entered = sinon.spy(postMiddleware, 'entered');
            const spy_post_updated = sinon.spy(postMiddleware, 'updated');
            const spy_post_exited = sinon.spy(postMiddleware, 'exited');

            app.route('/route1')
                .all(allMiddleware)
                .get(getMiddleware)
                .post(postMiddleware);

            app.httpGet('/route1', (request, response) => {
                assert(spy_all_entered.callCount === 1);
                assert(spy_all_updated.callCount === 1);
                assert(spy_all_exited.callCount === 0);
                assert(spy_all_entered.calledBefore(spy_get_entered));
                assert(spy_all_entered.calledBefore(spy_post_entered));

                assert(spy_get_entered.callCount === 1);
                assert(spy_get_updated.callCount === 1);
                assert(spy_get_exited.callCount === 0);
                assert(spy_get_entered.calledBefore(spy_post_entered));

                assert(spy_post_entered.callCount === 0);
                assert(spy_post_updated.callCount === 0);
                assert(spy_post_exited.callCount === 0);

                spy_all_entered.reset();
                spy_all_updated.reset();
                spy_all_exited.reset();

                spy_get_entered.reset();
                spy_get_updated.reset();
                spy_get_exited.reset();

                spy_post_entered.reset();
                spy_post_updated.reset();
                spy_post_exited.reset();

                app.httpPost('/route1', (request, response) => {
                    assert(spy_all_entered.callCount === 1);
                    assert(spy_all_updated.callCount === 1);
                    assert(spy_all_exited.callCount === 1);
                    assert(spy_all_exited.calledBefore(spy_all_entered));
                    assert(spy_all_exited.calledBefore(spy_all_updated));

                    assert(spy_get_entered.callCount === 0);
                    assert(spy_get_updated.callCount === 0);
                    assert(spy_get_exited.callCount === 1);

                    assert(spy_post_entered.callCount === 1);
                    assert(spy_post_updated.callCount === 1);
                    assert(spy_post_exited.callCount === 0);

                    done();
                }, (request, response) => {
                    done('should fail');
                });
            }, (request, response) => {
                done('should fail');
            });
        });

        it('request returning error', (done) => {
            requester = new Requester();
            sinon.stub(requester, 'fetch', ({uri, method, headers, data}, resolve, reject) => {
                reject(
                    {uri, method, headers, data},
                    {status: 404, statusText: 'page not found'}
                );
            });
            const app = frontexpress();
            app.set('http-requester', requester);

            const getMiddleware = new frontexpress.Middleware('get middleware');
            const spy_get_failed = sinon.spy(getMiddleware, 'failed');


            app.route('/route1').get(getMiddleware);

            app.httpGet('/route1', (request, response) => {
                done('should fail');
            },
            (request, response) => {
                assert(spy_get_failed.callCount === 1);
                done();
            });
        });

        it('next method', (done) => {
            const app = frontexpress();
            app.set('http-requester', requester);

            const m1 = new frontexpress.Middleware('m1');
            const m2 = new frontexpress.Middleware('m2');
            m2.next = () => false;
            const m3 = new frontexpress.Middleware('m3');

            const spy_m1 = sinon.spy(m1, 'updated');
            const spy_m2 = sinon.spy(m2, 'updated');
            const spy_m3 = sinon.spy(m3, 'updated');

            app.route('/route1').get(m1).get(m2).get(m3);
            app.httpGet('/route1', (request, response) => {
                assert(spy_m1.calledOnce);
                assert(spy_m2.calledOnce);
                assert(spy_m3.callCount === 0);
                done();
            });
        });
    });

    describe('middleware as function', () => {
        beforeEach(()=>{
            requester = new Requester();
            sinon.stub(requester, 'fetch', ({uri, method, headers, data}, resolve, reject) => {
                resolve(
                    {uri, method, headers, data},
                    {status: 200, statusText: 'OK', responseText:''}
                );
            });
        });

        it('next method', (done) => {
            const app = frontexpress();
            app.set('http-requester', requester);

            const m1 = (req, res, next) => {next()};
            const m2 = (req, res, next) => {};
            const m3 = (req, res, next) => {next()};

            const spy_m1 = sinon.spy(m1);
            const spy_m2 = sinon.spy(m2);
            const spy_m3 = sinon.spy(m3);

            app.route('/route1').get(spy_m1).get(spy_m2).get(spy_m3);
            app.httpGet('/route1', (request, response) => {
                assert(spy_m1.calledOnce);
                assert(spy_m2.calledOnce);
                assert(spy_m3.callCount === 0);
                done();
            });
        });
    });
});
