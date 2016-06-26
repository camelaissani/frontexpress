import {HTTP_METHODS} from './requester';
import Middleware from './middleware';

class Route {
    constructor(router, uriPart, method, middleware) {
        this.router = router;
        this.uriPart = uriPart;
        this.method = method;
        this.middleware = middleware;
    }

    get uri() {
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

export default class Router {
    constructor(baseUri) {
        if (baseUri) {
            this.baseUri = baseUri;
        }
        this.routes = [];
    }

    _add(route) {
        this.routes.push(route);
        return this;
    }

    getRoutes(uri, method) {
        return this.routes.filter((route) => {
            if (route.method !== method) {
                return false;
            }
            if (route.uri instanceof RegExp) {
                return uri.match(route.uri);
            }

            if (!route.uri) {
                return true;
            }

            return route.uri === uri;
        });
    }

    all(...args) {
        if (args.length === 0) {
            throw  new TypeError(`use all method takes at least a middleware`);
        }
        let middleware;

        if (args.length === 1) {
            [middleware,] = args;
        } else {
            [, middleware,] = args;
        }

        if (!(middleware instanceof Middleware) && (typeof middleware !== 'function') ) {
            throw  new TypeError(`use all method takes at least a middleware`);
        }

        for (const method of Object.keys(HTTP_METHODS)) {
            this[method.toLowerCase()](...args);
        }
        return this;
    }
}

for (const method of Object.keys(HTTP_METHODS)) {
    const methodName = method.toLowerCase();
    Router.prototype[methodName] = function(...args) {
        if (args.length === 0) {
            throw  new TypeError(`use ${methodName} method takes at least a middleware`);
        }
        let uri, middleware;

        if (args.length === 1) {
            [middleware,] = args;
        } else {
            [uri, middleware,] = args;
        }

        if (!(middleware instanceof Middleware) && (typeof middleware !== 'function') ) {
            throw  new TypeError(`use ${methodName} method takes at least a middleware`);
        }

        this._add(new Route(this, uri, method, middleware));

        return this;
    }
}
