/*eslint-env mocha*/
/*global global*/
import {assert} from 'chai';
import sinon from 'sinon';
import jsdom from 'mocha-jsdom';
import FakeXMLHttpRequest from 'fake-xml-http-request';
import Requester, {HTTP_METHODS} from '../lib/requester';

describe('HTTP_METHODS', () => {
    it('GET method simple uri', () => {
        const uriFn = HTTP_METHODS['GET'].uri;
        const dataFn = HTTP_METHODS['GET'].data;

        assert(uriFn({uri: '/route', data:{a:'b', c:'d'}}) === '/route?a=b&c=d');
        assert(dataFn({uri: '/route', data:{a:'b', c:'d'}}) === undefined);
    });

    it('GET method uri with query string', () => {
        const uriFn = HTTP_METHODS['GET'].uri;
        const dataFn = HTTP_METHODS['GET'].data;

        assert(uriFn({uri: '/route?x=y&z=a', data:{a:'b', c:'d'}}) === '/route?x=y&z=a&a=b&c=d');
        assert(dataFn({uri: '/route?x=y&z=a', data:{a:'b', c:'d'}}) === undefined);
    });

    it('GET method uri with query string and anchor', () => {
        const uriFn = HTTP_METHODS['GET'].uri;
        const dataFn = HTTP_METHODS['GET'].data;

        assert(uriFn({uri: '/route?x=y&z=a#anchor1', data:{a:'b', c:'d'}}) === '/route?x=y&z=a&a=b&c=d#anchor1');
        assert(dataFn({uri: '/route?x=y&z=a#anchor1', data:{a:'b', c:'d'}}) === undefined);
    });
});

describe('Requester', () => {
    function xHttpWillRespond(xhttp, readyState, status, statusText, responseText) {
        const stub_send = sinon.stub(xhttp, 'send', function() {
            this.readyState = readyState;
            this.status = status;
            this.statusText = statusText;
            this.responseText = responseText;
            this.onreadystatechange()
        });

        const stub_open = sinon.stub(xhttp, 'open', function() {});

        const stub_setRequestHeader = sinon.stub(xhttp, 'setRequestHeader', function() {});

        return {stub_open, stub_send, stub_setRequestHeader};
    }

    function xHttpWillThrow(xhttp, sendErrorName, openErrorName) {
        const stub_send = sinon.stub(xhttp, 'send', function() {
            if (sendErrorName) {
                throw {name: sendErrorName};
            }
        });

        const stub_open = sinon.stub(xhttp, 'open', function() {
            if (openErrorName) {
                throw {name: openErrorName};
            }
        });

        return {stub_open, stub_send};
    }

    let xhttp;

    // Init DOM with a fake document
    // <base> and uri (initial uri) allow to do pushState in jsdom
    jsdom({
        html:`
            <html>
                <head>
                    <base href="http://localhost:8080/"></base>
                </head>
            </html>
        `,
        url: 'http://localhost:8080/'
    });

    beforeEach(() => {
        // Stub XMLHttpRequest
        xhttp = new FakeXMLHttpRequest();
        global.XMLHttpRequest = () => {
            return xhttp;
        };
    });

    describe('GET Requests', () => {

        it('with data', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send} = xHttpWillRespond(xhttp, 4, 200, '', '<p>content!</p>');

            requester.fetch({method: 'GET', uri:'/route1', data:{p1: 'a', p2: 'b', p3: 'c'}},
                (request, response) => {
                    assert(request.uri === '/route1?p1=a&p2=b&p3=c');
                    done();
                },
                (err) => {
                    done(err);
                });
        });

        it('without data', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send} = xHttpWillRespond(xhttp, 4, 200, '', '<p>content!</p>');

            requester.fetch({method: 'GET', uri:'/route1'}, (request, response) => {
                assert(stub_open.calledOnce);
                assert(stub_send.calledOnce);
                assert(stub_open.calledBefore(stub_send));

                assert(request.uri === '/route1');
                assert(request.method === 'GET');
                assert(request.data === undefined);

                assert(response.status === 200);
                assert(response.statusText === 'OK');
                assert(response.responseText === '<p>content!</p>');
                assert(response.errorThrown === undefined);
                assert(response.errors === undefined);

                done();
            },
            (error) => {
                done(error);
            });
        });
    });

    describe('POST Requests', () => {

        it('with data', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send, stub_setRequestHeader} = xHttpWillRespond(xhttp, 4, 200, '', '<p>content!</p>');

            requester.fetch({method: 'POST', uri:'/route1', data:{p1: 'a', p2: 'b', p3: 'c'}},
                (request, response) => {
                    assert(stub_open.calledOnce);
                    assert(stub_setRequestHeader.calledOnce);
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledBefore(stub_send));
                    assert(stub_setRequestHeader.calledAfter(stub_open));
                    assert(stub_setRequestHeader.calledBefore(stub_send));

                    assert(request.uri === '/route1');
                    assert(request.headers['Content-type'] === 'application/x-www-form-urlencoded');
                    assert(request.data === 'p1=a&p2=b&p3=c');
                    done();
                },
                (err) => {
                    done(err);
                });
        });

        it('without data', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send, stub_setRequestHeader} = xHttpWillRespond(xhttp, 4, 200, '', '<p>content!</p>');

            requester.fetch({method: 'POST', uri:'/route1'},
                (request, response) => {
                    assert(stub_open.calledOnce);
                    assert(stub_setRequestHeader.calledOnce);
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledBefore(stub_send));
                    assert(stub_setRequestHeader.calledAfter(stub_open));
                    assert(stub_setRequestHeader.calledBefore(stub_send));

                    assert(request.uri === '/route1');
                    assert(request.headers['Content-type'] === 'application/x-www-form-urlencoded');
                    assert(request.data === undefined);
                    done();
                },
                (err) => {
                    done(err);
                });
        });

        it('with custom headers', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send, stub_setRequestHeader} = xHttpWillRespond(xhttp, 4, 200, '', '<p>content!</p>');

            requester.fetch({method: 'POST', uri:'/route1', headers: {'Accept-Charset': 'utf-8'}},
                (request, response) => {
                    assert(stub_open.calledOnce);
                    assert(stub_setRequestHeader.calledTwice);
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledBefore(stub_send));
                    assert(stub_setRequestHeader.calledAfter(stub_open));
                    assert(stub_setRequestHeader.calledBefore(stub_send));

                    assert(request.uri === '/route1');
                    assert(request.headers['Content-type'] === 'application/x-www-form-urlencoded');
                    assert(request.headers['Accept-Charset'] === 'utf-8');
                    assert(request.data === undefined);
                    done();
                },
                (err) => {
                    done(err);
                });
        });
    });

    describe('HTTP errors', () => {
        it('request returns no network', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send} = xHttpWillRespond(xhttp, 4, 0);

            requester.fetch({method: 'GET', uri: '/route1'}, null,
                (request, response) => {
                    assert(stub_open.calledOnce);
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledBefore(stub_send));

                    assert(response.status === 0);
                    assert(response.statusText === undefined);
                    assert(response.responseText === undefined);
                    assert(response.errorThrown === undefined);
                    assert(response.errors.length !== 0);

                    done();
                });
        });

        it('request returns 401', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send} = xHttpWillRespond(xhttp, 4, 401, 'not authenticated', '');

            requester.fetch({method: 'GET', uri:'/route1'}, null,
                (request, response) => {
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledOnce);

                    assert(response.status === 401);
                    assert(response.statusText === 'not authenticated');
                    assert(response.responseText === undefined);
                    assert(response.errorThrown === undefined);
                    assert(response.errors.length !== 0);

                    done();
                });
        });

        it('request returns 404', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send} = xHttpWillRespond(xhttp, 4, 404, 'page not found', '');

            requester.fetch({method: 'GET', uri:'/route1'}, null,
                (request, response) => {
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledOnce);

                    assert(response.status === 404);
                    assert(response.statusText === 'page not found');
                    assert(response.responseText === undefined);
                    assert(response.errorThrown === undefined);
                    assert(response.errors.length !== 0);

                    done();
                });
        });

        it('request returns 500', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send} = xHttpWillRespond(xhttp, 4, 500, 'server error', '');

            requester.fetch({method: 'GET', uri:'/route1'}, null,
                (request, response) => {
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledOnce);

                    assert(response.status === 500);
                    assert(response.statusText === 'server error');
                    assert(response.responseText === undefined);
                    assert(response.errorThrown === undefined);
                    assert(response.errors.length !== 0);

                    done();
                });
        });

        it('request returns 501 (http status not managed)', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send} = xHttpWillRespond(xhttp, 4, 501, 'Not Implemented', '');

            requester.fetch({method: 'GET', uri:'/route1'}, null,
                (request, response) => {
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledOnce);

                    assert(response.status === 501);
                    assert(response.statusText === 'Not Implemented');
                    assert(response.responseText === undefined);
                    assert(response.errorThrown === undefined);
                    assert(response.errors.length !== 0);

                    done();
                });
        });

        it('request returns syntax error', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send} = xHttpWillThrow(xhttp, 'SyntaxError');

            requester.fetch({method: 'GET', uri:'/route1'}, null,
                (request, response) => {
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledOnce);

                    assert(response.status === undefined);
                    assert(response.statusText === undefined);
                    assert(response.responseText === undefined);
                    assert(response.errorThrown.name === 'SyntaxError');
                    assert(response.errors.length !== 0);

                    done();
                });
        });

        it('request returns timeout error', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send} = xHttpWillThrow(xhttp, 'TimeoutError');

            requester.fetch({method: 'GET', uri:'/route1'}, null,
                (request, response) => {
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledOnce);

                    assert(response.status === undefined);
                    assert(response.statusText === undefined);
                    assert(response.responseText === undefined);
                    assert(response.errorThrown.name === 'TimeoutError');
                    assert(response.errors.length !== 0);

                    done();
                });
        });

        it('request returns abort error', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send} = xHttpWillThrow(xhttp, 'AbortError');

            requester.fetch({method: 'GET', uri:'/route1'}, null,
                (request, response) => {
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledOnce);

                    assert(response.status === undefined);
                    assert(response.statusText === undefined);
                    assert(response.responseText === undefined);
                    assert(response.errorThrown.name === 'AbortError');
                    assert(response.errors.length !== 0);

                    done();
                });
        });

        it('request returns network error', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send} = xHttpWillThrow(xhttp, 'NetworkError');

            requester.fetch({method: 'GET', uri:'/route1'}, null,
                (request, response) => {
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledOnce);

                    assert(response.status === undefined);
                    assert(response.statusText === undefined);
                    assert(response.responseText === undefined);
                    assert(response.errorThrown.name === 'NetworkError');
                    assert(response.errors.length !== 0);

                    done();
                });
        });

        it('request returns unknown error', (done) => {
            const requester = new Requester();

            const {stub_open, stub_send} = xHttpWillThrow(xhttp, 'BlaBlaError');

            requester.fetch({method: 'GET', uri:'/route1'}, null,
                (request, response) => {
                    assert(stub_send.calledOnce);
                    assert(stub_open.calledOnce);

                    assert(response.status === undefined);
                    assert(response.statusText === undefined);
                    assert(response.responseText === undefined);
                    assert(response.errorThrown.name === 'BlaBlaError');
                    assert(response.errors.length !== 0);

                    done();
                });
        });
    });
});
