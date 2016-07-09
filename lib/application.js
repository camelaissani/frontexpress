import Router, {Route} from './router';
import Middleware from './middleware';
import Requester, {HTTP_METHODS} from './requester';

export default class Application {
    constructor() {
        this.routers = [];
        this.requester = new Requester();
        this.DOMLoading = false;

        this.settingsDef = {
            'http-requester': (requester) => {this.requester = requester}
        };
    }

    ////////////////////////////////////////////////////////
    // Setting
    set(name, value) {
        const settingFn = this.settingsDef[name];
        if (!settingFn) {
            throw new ReferenceError(`unsupported setting ${name}`);
        }
        settingFn(value);
    }

    ////////////////////////////////////////////////////////
    // Routes
    route(uri) {
        const router = new Router(uri);
        this.routers.push(router);
        return router;
    }

    use(...args) {
        if (args.length === 0) {
            throw new TypeError(`use method takes at least a middleware or a router`);
        }

        let baseUri, middleware, router, which;

        if (args.length === 1) {
            [which,] = args;
        } else {
            [baseUri, which,] = args;
        }

        if (!(which instanceof Middleware) && (typeof which !== 'function') && !(which instanceof Router)) {
            throw new TypeError(`use method takes at least a middleware or a router`);
        }

        if (which instanceof Router) {
            router = which;
            router.baseUri = baseUri;
        } else {
            middleware = which;
            router = new Router(baseUri);
            for (const method of Object.keys(HTTP_METHODS)) {
                router[method.toLowerCase()](middleware);
            }
        }
        this.routers.push(router);
    }

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
                this._callMiddlewareEntered(currentRoutes, request)
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

    _routes(uri, method) {
        const currentRoutes = [];
        for (const router of this.routers) {
            const routes = router.routes(uri, method);
            currentRoutes.push(...routes);
        }
        return currentRoutes;
    }

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
                }
                route.middleware(request, response, next);
                if (breakMiddlewareLoop) {
                    break;
                }
            }
        }
    }

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
                }
                route.middleware(request, response, next);
                if (breakMiddlewareLoop) {
                    break;
                }
            }
        }
    }

    ///////////////////////////////////////////////////////
    // Ajax request
    _fetch({method, uri, headers, data}, resolve, reject) {
        // calls middleware exited method
        this._callMiddlewareExited();

        // gathers all routes impacted by the uri
        const currentRoutes = this._routes(uri, method);

        // calls middleware entered method
        this._callMiddlewareEntered(currentRoutes, {method, uri, headers, data});

        // invokes http request
        this.requester.fetch({uri, method},
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

Object.keys(HTTP_METHODS).reduce((reqProto, method) => {
    // Middleware methods
    const middlewareMethodeName = method.toLowerCase();
    reqProto[middlewareMethodeName] = function(...args) {
        if (args.length === 0) {
            throw new TypeError(`${middlewareMethodeName} method takes at least a middleware`);
        }

        let baseUri, middleware, which;

        if (args.length === 1) {
            [which,] = args;
        } else {
            [baseUri, which,] = args;
        }

        if (!(which instanceof Middleware) && (typeof which !== 'function')) {
            throw new TypeError(`${middlewareMethodeName} method takes at least a middleware`);
        }

        const router = new Router();
        middleware = which;
        router[middlewareMethodeName](baseUri, middleware);

        this.routers.push(router);
    }

    // HTTP methods
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
    }

    return reqProto;
}, Application.prototype);