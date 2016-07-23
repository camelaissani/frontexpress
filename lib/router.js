/**
 * Module dependencies.
 * @private
 */

import HTTP_METHODS from './methods';
import Middleware from './middleware';


/**
 * Route object.
 * @private
 */

class Route {


    /**
     * Initialize the route.
     *
     * @private
     */

    constructor(router, uriPart, method, middleware) {
        this.router = router;
        this.uriPart = uriPart;
        this.method = method;
        this.middleware = middleware;
        this.visited = false;
    }


    /**
     * Return route's uri.
     *
     * @private
     */

    get uri() {
        if (!this.uriPart && !this.method) {
            return undefined;
        }

        if (this.uriPart instanceof RegExp) {
            return this.uriPart;
        }

        if (this.router.baseUri instanceof RegExp) {
            return this.router.baseUri;
        }

        if (this.router.baseUri && this.uriPart) {
            return (this.router.baseUri.trim() + this.uriPart.trim()).replace(/\/{2,}/, '/');
        }

        if (this.router.baseUri) {
            return this.router.baseUri.trim();
        }

        return this.uriPart;
    }
}


/**
 * Router object.
 * @public
 */

export default class Router {


    /**
     * Initialize the router.
     *
     * @private
     */

    constructor(uri) {
        if (uri) {
            this._baseUri = uri;
        }
        this._routes = [];
    }


    /**
     * Do some checks and set _baseUri.
     *
     * @private
     */

    set baseUri(uri) {
        if (!uri) {
            return;
        }

        if (!this._baseUri) {
            this._baseUri = uri;
            return;
        }

        if (this._baseUri instanceof RegExp) {
            throw new TypeError(`the router already contains a regexp uri ${this._baseUri.toString()} It cannot be mixed with ${uri.toString()}`);
        }

        if (uri instanceof RegExp) {
            throw new TypeError(`the router already contains an uri ${this._baseUri.toString()} It cannot be mixed with regexp ${uri.toString()}`);
        }
    }


    /**
     * Return router's _baseUri.
     *
     * @private
     */

    get baseUri() {
        return this._baseUri;
    }


    /**
     * Add a route to the router.
     *
     * @private
     */

    _add(route) {
        this._routes.push(route);
        return this;
    }


    /**
     * Gather routes from routers filtered by _uri_ and HTTP _method_.
     *
     * @private
     */

    routes(uri, method) {
        return this._routes.filter((route) => {
            if (!route.uri && !route.method) {
                return true;
            }
            if (route.method !== method) {
                return false;
            }

            if (!route.uri) {
                return true;
            }

            let uriToCheck = uri;

            //remove query string from uri to test
            const questionMarkIndex = uriToCheck.indexOf('?');
            if (questionMarkIndex >= 0) {
                uriToCheck = uriToCheck.slice(0, questionMarkIndex);
            }

            //remove anchor from uri to test
            const hashIndex = uriToCheck.indexOf('#');
            if (hashIndex >= 0) {
                uriToCheck = uriToCheck.slice(0, hashIndex);
            }

            if (route.uri instanceof RegExp) {
                return uriToCheck.match(route.uri);
            }

            return route.uri === uriToCheck;
        });
    }


    /**
     * Gather visited routes from routers.
     *
     * @private
     */

    visited() {
        return this._routes.filter((route) => {
            return route.visited;
        });
    }


    /**
     * Use the given middleware function or object on this router.
     *
     *    // middleware function
     *    router.use((req, res, next) => {console.log('Hello')});
     *
     *    // middleware object
     *    router.use(new Middleware());
     *
     * @param {Middleware|Function} middleware object or function
     * @return {Router} for chaining
     *
     * @public
     */

    use(middleware) {
        if (!(middleware instanceof Middleware) && (typeof middleware !== 'function') ) {
            throw new TypeError('use method takes at least a middleware');
        }

        this._add(new Route(this, undefined, undefined, middleware));

        return this;
    }


    /**
     * Use the given middleware function or object on this router for
     * all HTTP methods.
     *
     *    // middleware function
     *    router.all((req, res, next) => {console.log('Hello')});
     *
     *    // middleware object
     *    router.all(new Middleware());
     *
     * @param {Middleware|Function} middleware object or function
     * @return {Router} for chaining
     *
     * @public
     */

    all(...args) {
        if (args.length === 0) {
            throw new TypeError('use all method takes at least a middleware');
        }
        let middleware;

        if (args.length === 1) {
            [middleware,] = args;
        } else {
            [, middleware,] = args;
        }

        if (!(middleware instanceof Middleware) && (typeof middleware !== 'function') ) {
            throw new TypeError('use all method takes at least a middleware');
        }

        for (const method of HTTP_METHODS) {
            this[method.toLowerCase()](...args);
        }
        return this;
    }
}

for (const method of HTTP_METHODS) {


    /**
     * Use the given middleware function or object, with optional _uri_ on
     * HTTP methods: get, post, put, delete...
     * Default _uri_ is "/".
     *
     *    // middleware function will be applied on path "/"
     *    router.get((req, res, next) => {console.log('Hello')});
     *
     *    // middleware object will be applied on path "/" and
     *    router.get(new Middleware());
     *
     *    // middleware function will be applied on path "/user"
     *    router.post('/user', (req, res, next) => {console.log('Hello')});
     *
     *    // middleware object will be applied on path "/user" and
     *    router.post('/user', new Middleware());
     *
     * @param {String} uri
     * @param {Middleware|Function} middleware object or function
     * @return {Router} for chaining
     * @public
     */

    const methodName = method.toLowerCase();
    Router.prototype[methodName] = function(...args) {
        if (args.length === 0) {
            throw new TypeError(`use ${methodName} method takes at least a middleware`);
        }
        let uri, middleware;

        if (args.length === 1) {
            [middleware,] = args;
        } else {
            [uri, middleware,] = args;
        }

        if (!(middleware instanceof Middleware) && (typeof middleware !== 'function') ) {
            throw new TypeError(`use ${methodName} method takes at least a middleware`);
        }

        if (uri && this._baseUri && this._baseUri instanceof RegExp) {
            throw new TypeError('router contains a regexp cannot mix with route uri/regexp');
        }

        this._add(new Route(this, uri, method, middleware));

        return this;
    };
}
