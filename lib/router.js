/**
 * Module dependencies.
 * @private
 */

import HTTP_METHODS from './methods';
import {toParameters} from './application';
import Middleware from './middleware';


/**
 * Route object.
 * @private
 */

export class Route {


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

        if (this.router.baseUri) {
            const baseUri = this.router.baseUri.trim();
            if (this.uriPart) {
                return ( baseUri + this.uriPart.trim()).replace(/\/{2,}/, '/');
            }
            return baseUri;
        }

        return this.uriPart;
    }
}


/**
 * Router object.
 * @public
 */

const error_middleware_message = 'method takes at least a middleware';
export default class Router {


    /**
     * Initialize the router.
     *
     * @private
     */

    constructor(uri) {
        this._baseUri = uri;
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

        if (typeof this._baseUri !== typeof uri) {
            throw new TypeError('router cannot mix regexp and uri');
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
            if (route.method && route.method !== method) {
                return false;
            }

            if (!route.uri || !uri) {
                return true;
            }

            //remove query string from uri to test
            //remove anchor from uri to test
            const match = /^(.*)\?.*#.*|(.*)(?=\?|#)|(.*[^\?#])$/.exec(uri);
            const baseUriToCheck = match[1] || match[2] || match[3];

            if (route.uri instanceof RegExp) {
                return baseUriToCheck.match(route.uri);
            }

            return route.uri === baseUriToCheck;
        });
    }


    /**
     * Gather visited routes from routers.
     *
     * @private
     */

    visited() {
        return this._routes.filter(route => route.visited);
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
            throw new TypeError(error_middleware_message);
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
        const {middleware} = toParameters(args);
        if (!middleware) {
            throw new TypeError(error_middleware_message);
        }

        HTTP_METHODS.forEach((method) => {
            this[method.toLowerCase()](...args);
        });
        return this;
    }
}

HTTP_METHODS.forEach((method) => {


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
        const {baseUri, middleware} = toParameters(args);
        if (!middleware) {
            throw new TypeError(error_middleware_message);
        }

        if (baseUri && this._baseUri && this._baseUri instanceof RegExp) {
            throw new TypeError('router cannot mix uri/regexp');
        }

        this._add(new Route(this, baseUri, method, middleware));

        return this;
    };
});
