/*eslint-env mocha*/
import chai, {assert} from 'chai';
import sinon from 'sinon';
import frontexpress from '../lib/frontexpress';
import Requester from '../lib/requester';

describe('Test sample from README', () => {
    let window, requester;

    beforeEach(() => {
        global.document = {};
        global.window = {
            location: {
                pathname: '/',
                search: ''
            },
            addEventListener(eventType, callback) {}
        };
        requester = new Requester();
        sinon.stub(requester, 'fetch', ({uri, method, headers, data}, resolve, reject) => {
            resolve(
                {uri, method, headers, data},
                {status: 200, statusText: 'OK', responseText:''}
            );
        });
    });

    it('main sample', (done) => {
        const app = frontexpress();

        // listen HTTP GET request on path (/)
        app.get('/', (req, res) => {
            done();
        });

        // start listening frontend application requests
        app.listen();

        //simulate readystatechange
        document.readyState = 'interactive';
        document.onreadystatechange();
    });


    it('route handlers', (done) => {
        const spy_log = sinon.spy();

        const h1 = (req, res, next) => { spy_log('h1!'); next(); };
        const h2 = (req, res, next) => { spy_log('h2!');};
        const h3 = (req, res, next) => { spy_log('h3!'); next(); };

        const app = frontexpress();
        app.set('http requester', requester);

        app.get('/example/a', h1);
        app.get('/example/a', h2);
        app.get('/example/a', h3);

        // start listening frontend application requests
        app.listen();

        // simulate readystatechange
        document.readyState = 'interactive';
        document.onreadystatechange();

        // make an ajax request on /example/a
        app.httpGet('/example/a', (req, res) => {
            assert(spy_log.calledTwice);
            assert(spy_log.withArgs('h1!').calledOnce);
            assert(spy_log.withArgs('h2!').calledOnce);
            assert(spy_log.neverCalledWith('h3!'));
            done();
        });
    });

    it('app.route()', (done) => {
        const spy_log = sinon.spy();

        const app = frontexpress();
        app.set('http requester', requester);

        app.route('/book')
            .get((req, res) => { spy_log('Get a random book');})
            .post((req, res) => { spy_log('Add a book');})
            .put((req, res) => { spy_log('Update the book');});

        // start listening frontend application requests
        app.listen();

        // simulate readystatechange
        document.readyState = 'interactive';
        document.onreadystatechange();

        // make an ajax request on /book
        app.httpGet('/book', (req, res) => {
            app.httpPost('/book', (req, res) => {
                app.httpPut('/book', (req, res) => {
                    // Yes I know Promise :-) Next evolution
                    assert(spy_log.callCount === 3);
                    assert(spy_log.withArgs('Get a random book').calledOnce);
                    assert(spy_log.withArgs('Add a book').calledOnce);
                    assert(spy_log.withArgs('Update the book').calledOnce);
                    done();
                });
            });
        });
    });

    it('frontexpress.Router', (done) => {
        const spy_log = sinon.spy();

        const router = frontexpress.Router();

        // middleware that is specific to this router
        router.use((req, res, next) => {
            spy_log(`Time: ${Date.now()}`);
            next();
        });

        // react on home page route
        router.get('/', (req, res) => {
            spy_log('<p>Birds home page</p>');
        });

        // react on about route
        router.get('/about', (req, res) => {
            spy_log('<p>About birds</p>');
        });

        const app = frontexpress();
        app.set('http requester', requester);
        app.use('/birds', router);

        // make an ajax request on /birds
        app.httpGet('/birds/', (req, res) => {
            assert(spy_log.callCount === 2);
            assert(spy_log.withArgs('<p>Birds home page</p>').calledOnce);
            assert(spy_log.neverCalledWith('<p>About birds</p>'));

            spy_log.reset();
            // make an ajax request on /birds/about
            app.httpGet('/birds/about', (req, res) => {
                assert(spy_log.callCount === 2);
                assert(spy_log.withArgs('<p>About birds</p>').calledOnce);
                assert(spy_log.neverCalledWith('<p>Birds home page</p>'));
                done();
            });
        });

    });
});