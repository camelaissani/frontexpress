/*eslint-env mocha*/
import chai, {assert} from 'chai';
import sinon from 'sinon';
//import jsdom from 'jsdom';
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

    // // JSDOM cannot manage pushState/onpopstate/window.location
    // see https://github.com/tmpvar/jsdom/issues/1565
    //
    // describe('listen method with JSDOM', () => {
    //     before(() => {
    //         // Init DOM with a fake document
    //         // <base> and uri (initial uri) allow to do pushState in jsdom
    //         jsdom.env({
    //             html:`
    //                 <html>
    //                     <head>
    //                         <base href="http://localhost:8080/"></base>
    //                     </head>
    //                 </html>
    //             `,
    //             url: 'http://localhost:8080/',
    //             done(err, window) {
    //                 global.window = window;
    //                 global.document = window.document;
    //                 window.console = global.console;
    //             }
    //         });
    //     });

    //     let requester;
    //     beforeEach(()=>{
    //         requester = new Requester();
    //         sinon.stub(requester, 'fetch', ({uri, method, headers, data}, resolve, reject) => {
    //             resolve(
    //                 {uri, method, headers, data},
    //                 {status: 200, statusText: 'OK', responseText:''}
    //             );
    //         });
    //     });

    //     it('history management without state object', (done) => {
    //         const spy_pushState = sinon.spy(window.history, 'pushState');

    //         const app = frontexpress();
    //         const m = frontexpress.Middleware();
    //         const spy_middleware = sinon.stub(m, 'updated');

    //         app.set('http requester', requester);
    //         app.use('/api/route1', m);
    //         app.listen();

    //         const spy_onpopstate = sinon.spy(window, 'onpopstate');

    //         app.httpGet({uri:'/api/route1', history: {
    //             uri: '/route1',
    //             title: 'route1'
    //         }},
    //         (req, res) => {
    //             // On request succeeded
    //             assert(spy_onpopstate.callCount === 0);
    //             assert(spy_pushState.calledOnce);
    //             assert(spy_middleware.calledOnce);

    //             spy_middleware.reset();
    //             window.history.back();
    //             window.history.forward();
    //             assert(spy_onpopstate.calledOnce);
    //             assert(spy_middleware.calledOnce);

    //             done();
    //         });
    //     });
    // });

    describe('listen method', () => {
        // Here I cannot use jsdon to make these tests :(
        // JSDOM cannot simulate readyState changes
        beforeEach(() => {
            const browserHistory = [{uri: '/'}];
            let browserHistoryIndex = 0;

            global.document = {};
            global.window = {
                location: {
                    pathname: '/route1',
                    search: '?a=b'
                },
                history: {
                    pushState(state, title, pathname) {
                        browserHistory.push({uri: pathname, state});
                        browserHistoryIndex++;
                        global.window.location.pathname = browserHistory[browserHistoryIndex].uri;
                    },
                    forward() {
                        browserHistoryIndex++;
                        global.window.location.pathname = browserHistory[browserHistoryIndex].uri;
                        if (browserHistory[browserHistoryIndex].state) {
                            window.onpopstate({state:browserHistory[browserHistoryIndex].state});
                        }
                    },
                    back() {
                        browserHistoryIndex--;
                        global.window.location.pathname = browserHistory[browserHistoryIndex].uri;
                        if (browserHistory[browserHistoryIndex].state) {
                            window.onpopstate({state: browserHistory[browserHistoryIndex].state});
                        }
                    }
                }
            };
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
            const m = frontexpress.Middleware();
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
            const m = frontexpress.Middleware();
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
            const m = frontexpress.Middleware();
            sinon.stub(m, 'exited', () => {
                done();
            });

            app.use('/route1', m);
            app.listen(() => {
                //simulate beforeunload
                window.onbeforeunload();
            });

            //simulate readystatechange
            document.readyState = 'interactive';
            document.onreadystatechange();
        });

        it('history management without state object', (done) => {
            const requester = new Requester();
            sinon.stub(requester, 'fetch', ({uri, method, headers, data}, resolve, reject) => {
                resolve(
                    {uri, method, headers, data},
                    {status: 200, statusText: 'OK', responseText:''}
                );
            });

            const spy_pushState = sinon.spy(window.history, 'pushState');

            const app = frontexpress();
            const m = frontexpress.Middleware();
            const spy_middleware = sinon.stub(m, 'updated');

            app.set('http requester', requester);
            app.use('/api/route1', m);
            app.listen();

            const spy_onpopstate = sinon.spy(window, 'onpopstate');

            app.httpGet({uri:'/api/route1', history: {
                uri: '/route1',
                title: 'route1'
            }},
            (req, res) => {
                // On request succeeded
                assert(spy_onpopstate.callCount === 0);
                assert(spy_pushState.calledOnce);
                assert(spy_middleware.calledOnce);

                spy_middleware.reset();
                window.history.back();
                window.history.forward();
                assert(spy_onpopstate.calledOnce);
                assert(spy_middleware.calledOnce);

                done();
            });
        });

        it('history management with state object', (done) => {
            let stateObj;
            const requester = new Requester();
            sinon.stub(requester, 'fetch', ({uri, method, headers, data}, resolve, reject) => {
                resolve(
                    {uri, method, headers, data},
                    {status: 200, statusText: 'OK', responseText:''}
                );
            });

            const spy_pushState = sinon.spy(window.history, 'pushState');

            const app = frontexpress();
            const m = frontexpress.Middleware();
            const spy_middleware = sinon.stub(m, 'updated', (req, res) => {
                stateObj = res.historyState;
            });

            app.set('http requester', requester);
            app.use('/api/route1', m);
            app.listen();

            const spy_onpopstate = sinon.spy(window, 'onpopstate');

            app.httpGet({uri:'/api/route1', history: {
                uri: '/route1',
                title: 'route1',
                state: {a: 'b', c: 'd'}
            }},
            (req, res) => {
                // On request succeeded
                assert(spy_onpopstate.callCount === 0);
                assert(spy_pushState.calledOnce);
                assert(spy_middleware.calledOnce);

                spy_middleware.reset();
                window.history.back();
                window.history.forward();
                assert(spy_onpopstate.calledOnce);
                assert(spy_middleware.calledOnce);
                assert(stateObj);
                assert(stateObj.a === 'b');
                assert(stateObj.c === 'd');

                done();
            });
        });
    });

    describe('set/get setting method', () => {
        it('custom setting', () => {
            const app = frontexpress();
            app.set('blabla', 'value');
            assert(app.get('blabla') === 'value');
        });

        it('core setting', () => {
            const requester = new Requester();
            const app = frontexpress();
            app.set('http requester', requester);
            assert(app.get('http requester') === requester);
            assert(app.set('http requester') === requester);
        });

        it('bad core setting', () => {
            const app = frontexpress();
            chai.expect(() => (app.set('http requester', 'not an object with fetch function'))).to.throw(TypeError);
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
            app.set('http requester', requester);
            assert.throws(app.use, TypeError);
        });

        it('bad arguments', () => {
            const app = frontexpress();
            app.set('http requester', requester);
            chai.expect(() => app.use('eee')).to.throw(TypeError);
        });

        it('mixing uri and regexp', () => {
            let router = frontexpress.Router('/subroute');
            let app = frontexpress();
            app.set('http requester', requester);
            chai.expect(() => app.use(/route/, router)).to.throw(TypeError);

            router = frontexpress.Router(/subroute/);
            app = frontexpress();
            app.set('http requester', requester);
            chai.expect(() => app.use('/route', router)).to.throw(TypeError);
        });

        it('middleware as function on path /', (done) => {
            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http requester', requester);
            app.use((request, response, next) => {spy();});

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
            app.set('http requester', requester);
            app.use('/route1', (request, response, next) => {spy();});

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
            app.set('http requester', requester);
            app.use((request, response, next) => {spy();});

            app.httpGet('/', null, (request, response) => {
                assert(spy.callCount === 1);
                assert(response.status === 401);
                done();
            });
        });

        it('middleware as object on path /', (done) => {
            const middleware = frontexpress.Middleware('on path /');
            const spy = sinon.spy(middleware, 'updated');

            const app = frontexpress();
            app.set('http requester', requester);
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
            const middleware = frontexpress.Middleware('on path /route1');
            const spy = sinon.spy(middleware, 'updated');

            const app = frontexpress();
            app.set('http requester', requester);
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

            const middleware = frontexpress.Middleware('on path /');
            const spy = sinon.spy(middleware, 'failed');

            const app = frontexpress();
            app.set('http requester', requester);
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
                .get((request, response, next) => {spy();})
                .post((request, response, next) => {spy();});

            const app = frontexpress();
            app.set('http requester', requester);
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
                .get((request, response, next) => {spy();})
                .post((request, response, next) => {spy();});

            const app = frontexpress();
            app.set('http requester', requester);
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
            const middleware = frontexpress.Middleware('get middleware');
            const spy = sinon.spy(middleware, 'updated');

            const app = frontexpress();
            app.set('http requester', requester);

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

        it('use two routers', (done)=> {

            const router1 = frontexpress.Router();
            const m1 = frontexpress.Middleware();
            const spy1 = sinon.spy(m1, 'updated');
            router1.get('/subroute1', m1);

            const router2 = frontexpress.Router();
            const m2 = frontexpress.Middleware();
            const spy2 = sinon.spy(m2, 'updated');
            router2.get('/subroute2', m2);

            assert(router1 !== router2);


            const app = frontexpress();
            app.set('http requester', requester);
            app.use(/^\/route1/, router1);
            app.use(/^\/route2/, router2);

            app.httpGet('/route1/subroute1',
                (request, response) => {
                    assert(spy1.calledOnce);
                    app.httpGet('/route2/subroute2', (request, response) => {
                        assert(spy2.calledOnce);
                        done();
                    },
                    (request, response) => {
                        done(response);
                    });
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
            app.set('http requester', requester);
            assert.throws(app.get, TypeError);
        });

        it('bad arguments', () => {
            const app = frontexpress();
            app.set('http requester', requester);
            chai.expect(() => app.get(frontexpress.Router())).to.throw(TypeError);
            chai.expect(() => app.get('/route1', frontexpress.Router())).to.throw(TypeError);
        });

        it('middleware as function on path /', (done) => {
            const spy = sinon.spy();

            const app = frontexpress();
            app.set('http requester', requester);
            app.get((request, respons, next) => {spy();});

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
            app.set('http requester', requester);
            app.get('/route1', (request, response, next) => {spy();});

            app.httpGet('/route1', (request, response) => {
                assert(spy.callCount === 1);

                app.httpPost('/route1', (request, response) => {
                    assert(spy.callCount === 1);
                    done();
                });
            });
        });

        it('middleware as object on path /', (done) => {
            const middleware = frontexpress.Middleware('on path /');
            const spy = sinon.spy(middleware, 'updated');

            const app = frontexpress();
            app.set('http requester', requester);
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
            const middleware = frontexpress.Middleware('on path /route1');
            const spy = sinon.spy(middleware, 'updated');

            const app = frontexpress();
            app.set('http requester', requester);
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

    describe('post method', () => {
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
            app.set('http requester', requester);
            assert.throws(app.post, TypeError);
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
            app.set('http requester', requester);
            app.route().get((request, response, next) => {spy();});

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
            app.set('http requester', requester);
            app.route('/').get((request, response, next) => {spy();});

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
            app.set('http requester', requester);
            app.route('/route1').get((request, response, next) => {spy();});

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
            app.set('http requester', requester);
            app.route().get('/subroute1', (request, response, next) => {spy();});

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
            app.set('http requester', requester);
            app.route('/').get('/subroute1', (request, response, next) => {spy();});

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
            app.set('http requester', requester);
            app.route('/route1').get('/subroute1', (request, response, next) => {spy();});

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
            app.set('http requester', requester);

            const getMiddleware = frontexpress.Middleware('get middleware');
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
            app.set('http requester', requester);

            const allMiddleware = frontexpress.Middleware('all middleware');
            const spy_all_entered = sinon.spy(allMiddleware, 'entered');
            const spy_all_updated = sinon.spy(allMiddleware, 'updated');
            const spy_all_exited = sinon.spy(allMiddleware, 'exited');

            const getMiddleware = frontexpress.Middleware('get middleware');
            const spy_get_entered = sinon.spy(getMiddleware, 'entered');
            const spy_get_updated = sinon.spy(getMiddleware, 'updated');
            const spy_get_exited = sinon.spy(getMiddleware, 'exited');

            const postMiddleware = frontexpress.Middleware('post middleware');
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
            app.set('http requester', requester);

            const getMiddleware = frontexpress.Middleware('get middleware');
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
            app.set('http requester', requester);

            const m1 = frontexpress.Middleware('m1');
            const m2 = frontexpress.Middleware('m2');
            m2.next = () => false;
            const m3 = frontexpress.Middleware('m3');

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
            app.set('http requester', requester);

            const m1 = (req, res, next) => {next();};
            const m2 = (req, res, next) => {};
            const m3 = (req, res, next) => {next();};

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
