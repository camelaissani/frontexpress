/**
 * Module dependencies.
 * @private
 */

import HTTP_METHODS from './methods';
import Settings from './settings';
import Router, {Route} from './router';
import Middleware from './middleware';


/**
 * Application class.
 */

export default class Application {


    /**
     * Initialize the application.
     *
     *   - setup default configuration
     *
     * @private
     */

    constructor() {
        this.routers = [];
        // this.isDOMLoaded = false;
        // this.isDOMReady = false;
        this.settings = new Settings();
    }


    /**
     * Assign `setting` to `val`, or return `setting`'s value.
     *
     *    app.set('foo', 'bar');
     *    app.set('foo');
     *    // => "bar"
     *
     * @param {String} setting
     * @param {*} [val]
     * @return {app} for chaining
     * @public
     */

    set(...args) {
        // get behaviour
        if (args.length === 1) {
            return this.settings.get([args]);
        }

        // set behaviour
        const [name, value] = args;
        this.settings.set(name, value);

        return this;
    }


    /**
     * Listen for DOM initialization and history state changes.
     *
     * The callback function is called once the DOM has
     * the `document.readyState` equals to 'interactive'.
     *
     *    app.listen(()=> {
     *        console.log('App is listening requests');
     *        console.log('DOM is ready!');
     *    });
     *
     *
     * @param {Function} callback
     * @public
     */

    listen(callback) {

        // manage history
        window.onpopstate = (event) => {
            if (event.state) {
                const {request, response} = event.state;
                const currentRoutes = this._routes(request.uri, request.method);

                this._callMiddlewareMethod('entered', currentRoutes, request);
                this._callMiddlewareMethod('updated', currentRoutes, request, response);
            }
        };

        // manage page loading/refreshing
        const request = {method: 'GET', uri: window.location.pathname + window.location.search};
        const response = {status: 200, statusText: 'OK'};
        const currentRoutes = this._routes();

        const whenPageIsInteractiveFn = () => {
            this._callMiddlewareMethod('updated', currentRoutes, request, response);
            if (callback) {
                callback(request, response);
            }
        };

        window.onbeforeunload = () => {
            this._callMiddlewareMethod('exited');
        };

        document.onreadystatechange = () => {
            // DOM ready state
            switch (document.readyState) {
            case 'loading':
                this._callMiddlewareMethod('entered', currentRoutes, request);
                break;
            case 'interactive':
                whenPageIsInteractiveFn();
                break;
            }
        };

        if (['interactive', 'complete'].indexOf(document.readyState) !== -1) {
            whenPageIsInteractiveFn();
        }
    }


    /**
     * Returns a new `Router` instance for the _uri_.
     * See the Router api docs for details.
     *
     *    app.route('/');
     *    // =>  new Router instance
     *
     * @param {String} uri
     * @return {Router} for chaining
     *
     * @public
     */

    route(uri) {
        const router = new Router(uri);
        this.routers.push(router);
        return router;
    }


    /**
     * Use the given middleware function or object, with optional _uri_.
     * Default _uri_ is "/".
     *
     *    // middleware function will be applied on path "/"
     *    app.use((req, res, next) => {console.log('Hello')});
     *
     *    // middleware object will be applied on path "/"
     *    app.use(new Middleware());
     *
     * @param {String} uri
     * @param {Middleware|Function} middleware object or function
     * @return {app} for chaining
     *
     * @public
     */

    use(...args) {
        let {baseUri, router, middleware} = toParameters(args);
        if (router) {
            router.baseUri = baseUri;
        } else if (middleware) {
            router = new Router(baseUri);
            HTTP_METHODS.forEach((method) => {
                router[method.toLowerCase()](middleware);
            });
        } else {
            throw new TypeError('method takes at least a middleware or a router');
        }
        this.routers.push(router);

        return this;
    }


    /**
     * Gather routes from all routers filtered by _uri_ and HTTP _method_.
     * See Router#routes() documentation for details.
     *
     * @private
     */

    _routes(uri=window.location.pathname + window.location.search, method='GET') {
        const currentRoutes = [];
        this.routers.forEach((router) => {
            currentRoutes.push(...router.routes(uri, method));
        });

        return currentRoutes;
    }


    /**
     * Call `Middleware` method or middleware function on _currentRoutes_.
     *
     * @private
     */

    _callMiddlewareMethod(meth, currentRoutes, request, response) {
        if (meth === 'exited') {
            // currentRoutes, request, response params not needed
            this.routers.forEach((router) => {
                router.visited().forEach((route) => {
                    if (route.middleware.exited) {
                        route.middleware.exited(route.visited);
                        route.visited = null;
                    }
                });
            });
            return;
        }

        currentRoutes.some((route) => {
            if (meth === 'updated') {
                route.visited = request;
            }

            if (route.middleware[meth]) {
                route.middleware[meth](request, response);
                if (route.middleware.next && !route.middleware.next()) {
                    return true;
                }
            } else if (meth !== 'entered') {
                // calls middleware method
                let breakMiddlewareLoop = true;
                const next = () => {
                    breakMiddlewareLoop = false;
                };
                route.middleware(request, response, next);
                if (breakMiddlewareLoop) {
                    return true;
                }
            }

            return false;
        });
    }


    /**
     * Make an ajax request. Manage History#pushState if history object set.
     *
     * @private
     */

    _fetch(req, resolve, reject) {
        let {method, uri, headers, data, history} = req;

        const httpMethodTransformer = this.get(`http ${method} transformer`);
        if (httpMethodTransformer) {
            const {uri: _uriFn, headers: _headersFn, data: _dataFn } = httpMethodTransformer;
            uri = _uriFn ? _uriFn({uri, headers, data}) : uri;
            headers = _headersFn ? _headersFn({uri, headers, data}) : headers;
            data = _dataFn ? _dataFn({uri, headers, data}) : data;
        }

        // calls middleware exited method
        this._callMiddlewareMethod('exited');

        // gathers all routes impacted by the uri
        const currentRoutes = this._routes(uri, method);

        // calls middleware entered method
        this._callMiddlewareMethod('entered', currentRoutes, req);

        // invokes http request
        this.settings.get('http requester').fetch(req,
            (request, response) => {
                if (history) {
                    window.history.pushState({request, response}, history.title, history.uri);
                }
                this._callMiddlewareMethod('updated', currentRoutes, request, response);
                if (resolve) {
                    resolve(request, response);
                }
            },
            (request, response) => {
                this._callMiddlewareMethod('failed', currentRoutes, request, response);
                if (reject) {
                    reject(request, response);
                }
            });
    }
}

HTTP_METHODS.reduce((reqProto, method) => {


    /**
     * Use the given middleware function or object, with optional _uri_ on
     * HTTP methods: get, post, put, delete...
     * Default _uri_ is "/".
     *
     *    // middleware function will be applied on path "/"
     *    app.get((req, res, next) => {console.log('Hello')});
     *
     *    // middleware object will be applied on path "/" and
     *    app.get(new Middleware());
     *
     *    // get a setting value
     *    app.set('foo', 'bar');
     *    app.get('foo');
     *    // => "bar"
     *
     * @param {String} uri or setting
     * @param {Middleware|Function} middleware object or function
     * @return {app} for chaining
     * @public
     */

    const middlewareMethodName = method.toLowerCase();
    reqProto[middlewareMethodName] = function(...args) {
        let {baseUri, middleware, which} = toParameters(args);
        if (middlewareMethodName === 'get' && typeof which === 'string') {
            return this.settings.get(which);
        }
        if (!middleware) {
            throw new TypeError(`method takes a middleware ${middlewareMethodName === 'get' ? 'or a string' : ''}`);
        }
        const router = new Router();
        router[middlewareMethodName](baseUri, middleware);

        this.routers.push(router);

        return this;
    };

    /**
     * Ajax request (get, post, put, delete...).
     *
     *   // HTTP GET method
     *   httpGet('/route1');
     *
     *   // HTTP GET method
     *   httpGet({uri: '/route1', data: {'p1': 'val1'});
     *   // uri invoked => /route1?p1=val1
     *
     *   // HTTP GET method with browser history management
     *   httpGet({uri: '/api/users', history: {state: {foo: "bar"}, title: 'users page', uri: '/view/users'});
     *
     *   Samples above can be applied on other HTTP methods.
     *
     * @param {String|Object} uri or object containing uri, http headers, data, history
     * @param {Function} success callback
     * @param {Function} failure callback
     * @public
     */
    const httpMethodName = 'http'+method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
    reqProto[httpMethodName] = function(request, resolve, reject) {
        let {uri, headers, data, history} = request;
        if (!uri) {
            uri = request;
        }
        return this._fetch({
            uri,
            method,
            headers,
            data,
            history
        }, resolve, reject);
    };

    return reqProto;
}, Application.prototype);


export function toParameters(args) {
    let baseUri, middleware, router, which;
    if (args && args.length > 0) {
        if (args.length === 1) {
            [which,] = args;
        } else {
            [baseUri, which,] = args;
        }

        if (which instanceof Router) {
            router = which;
        } else if ((which instanceof Middleware) || (typeof which === 'function')) {
            middleware = which;
        }
    }
    return {baseUri, middleware, router, which};
}
