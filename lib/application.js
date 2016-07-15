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
        this.DOMLoading = false;
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
            const name = [args];
            return this.settings.get(name);
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
        document.onreadystatechange = () => {
            const uri = window.location.pathname + window.location.search;
            const method = 'GET';
            const request = {method, uri};
            const response = {status: 200, statusText: 'OK'};

            // gathers all routes impacted by the current browser location
            const currentRoutes = this._routes(uri, method);

            // listen dom events
            if (document.readyState === 'loading') {
                this.DOMLoading = true;
                this._callMiddlewareEntered(currentRoutes, request);
            } else if (document.readyState === 'interactive') {
                if (!this.DOMLoading) {
                    this._callMiddlewareEntered(currentRoutes, request);
                }
                this._callMiddlewareUpdated(currentRoutes, request, response);
                if (callback) {
                    callback(request, response);
                }
            }
        };

        window.addEventListener('beforeunload', () => {
            this._callMiddlewareExited();
        });
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
     * @param {Middleware|Function} middleware or fn
     * @return {app} for chaining
     *
     * @public
     */

    use(...args) {
        if (args.length === 0) {
            throw new TypeError('use method takes at least a middleware or a router');
        }

        let baseUri, middleware, router, which;

        if (args.length === 1) {
            [which,] = args;
        } else {
            [baseUri, which,] = args;
        }

        if (!(which instanceof Middleware) && (typeof which !== 'function') && !(which instanceof Router)) {
            throw new TypeError('use method takes at least a middleware or a router');
        }

        if (which instanceof Router) {
            router = which;
            router.baseUri = baseUri;
        } else {
            middleware = which;
            router = new Router(baseUri);
            for (const method of HTTP_METHODS) {
                router[method.toLowerCase()](middleware);
            }
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

    _routes(uri, method) {
        const currentRoutes = [];
        for (const router of this.routers) {
            const routes = router.routes(uri, method);
            currentRoutes.push(...routes);
        }
        return currentRoutes;
    }


    /**
     * Call `Middleware#entered` on _currentRoutes_.
     * Invoked before sending ajax request or when DOM
     * is loading (document.readyState === 'loading').
     *
     * @private
     */

    _callMiddlewareEntered(currentRoutes, request) {
        for (const route of currentRoutes) {
            if (route.middleware.entered) {
                route.middleware.entered(request);
            }
            if (route.middleware.next && !route.middleware.next()) {
                break;
            }
        }
    }


    /**
     * Call `Middleware#updated` or middleware function on _currentRoutes_.
     * Invoked on ajax request responding or on DOM ready
     * (document.readyState === 'interactive').
     *
     * @private
     */

    _callMiddlewareUpdated(currentRoutes, request, response) {
        for (const route of currentRoutes) {
            route.visited = request;
            // calls middleware updated method
            if (route.middleware.updated) {
                route.middleware.updated(request, response);
                if (route.middleware.next && !route.middleware.next()) {
                    break;
                }
            } else {
            // calls middleware method
                let breakMiddlewareLoop = true;
                const next = () => {
                    breakMiddlewareLoop = false;
                };
                route.middleware(request, response, next);
                if (breakMiddlewareLoop) {
                    break;
                }
            }
        }
    }


    /**
     * Call `Middleware#exited` on _currentRoutes_.
     * Invoked before sending a new ajax request or before DOM unloading.
     *
     * @private
     */

    _callMiddlewareExited() {
        // calls middleware exited method
        for (const router of this.routers) {
            const routes = router.visited();
            for (const route of routes) {
                if (route.middleware.exited) {
                    route.middleware.exited(route.visited);
                    route.visited = null;
                }
            }
        }
    }


    /**
     * Call `Middleware#failed` or middleware function on _currentRoutes_.
     * Invoked when ajax request fails.
     *
     * @private
     */

    _callMiddlewareFailed(currentRoutes, request, response) {
        for (const route of currentRoutes) {
            // calls middleware failed method
            if (route.middleware.failed) {
                route.middleware.failed(request, response);
                if (route.middleware.next && !route.middleware.next()) {
                    break;
                }
            } else {
            // calls middleware method
                let breakMiddlewareLoop = true;
                const next = () => {
                    breakMiddlewareLoop = false;
                };
                route.middleware(request, response, next);
                if (breakMiddlewareLoop) {
                    break;
                }
            }
        }
    }


    /**
     * Make an ajax request.
     *
     * @private
     */

    _fetch({method, uri, headers, data}, resolve, reject) {

        const httpMethodTransformer = this.get(`http ${method} transformer`);
        if (httpMethodTransformer) {
            uri = httpMethodTransformer.uri ? httpMethodTransformer.uri({uri, headers, data}) : uri;
            headers = httpMethodTransformer.headers ? httpMethodTransformer.headers({uri, headers, data}) : headers;
            data = httpMethodTransformer.data ? httpMethodTransformer.data({uri, headers, data}) : data;
        }

        // calls middleware exited method
        this._callMiddlewareExited();

        // gathers all routes impacted by the uri
        const currentRoutes = this._routes(uri, method);

        // calls middleware entered method
        this._callMiddlewareEntered(currentRoutes, {method, uri, headers, data});

        // invokes http request
        this.settings.get('http requester').fetch({method, uri, headers, data},
            (request, response) => {
                this._callMiddlewareUpdated(currentRoutes, request, response);
                if (resolve) {
                    resolve(request, response);
                }
            },
            (request, response) => {
                this._callMiddlewareFailed(currentRoutes, request, response);
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
     * @param {Middleware|Function} middleware or fn
     * @return {app} for chaining
     * @public
     */

    const middlewareMethodName = method.toLowerCase();
    reqProto[middlewareMethodName] = function(...args) {
        if (middlewareMethodName === 'get') {
            if (args.length === 0) {
                throw new TypeError(`${middlewareMethodName} method takes at least a string or a middleware`);
            } else if (args.length === 1) {
                const [name] = args;
                if (typeof name === 'string') {
                    return this.settings.get(name);
                }
            }
        } else if (args.length === 0) {
            throw new TypeError(`${middlewareMethodName} method takes at least a middleware`);
        }

        let baseUri, middleware, which;

        if (args.length === 1) {
            [which,] = args;
        } else {
            [baseUri, which,] = args;
        }

        if (!(which instanceof Middleware) && (typeof which !== 'function')) {
            throw new TypeError(`${middlewareMethodName} method takes at least a middleware`);
        }

        const router = new Router();
        middleware = which;
        router[middlewareMethodName](baseUri, middleware);

        this.routers.push(router);

        return this;
    };

    /**
     * Ajax request (get, post, put, delete...).
     *
     *   // HTTP GET method
     *   httpGet('/route1');
     *   httpGet({uri: '/route1', data: {'p1': 'val1'});
     *   // uri invoked => /route1?p1=val1
     *
     *   // HTTP POST method
     *   httpPost('/user');
     *   ...
     *
     * @param {String|Object} uri or object containing uri, http headers, data
     * @param {Function} success callback
     * @param {Function} failure callback
     * @public
     */
    const httpMethodName = 'http'+method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
    reqProto[httpMethodName] = function(request, resolve, reject) {
        let {uri, headers, data} = request;
        if (!uri) {
            uri = request;
        }
        return this._fetch({
            uri,
            method,
            headers,
            data
        }, resolve, reject);
    };

    return reqProto;
}, Application.prototype);