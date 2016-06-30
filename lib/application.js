import Router, {Route} from './router';
import Middleware from './middleware';
import Requester, {HTTP_METHODS} from './requester';

export default class Application {
    constructor() {
        this.routers = [];
        this.requester = new Requester();
        this.lastVisited = null;

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
            throw  new TypeError(`use method takes at least a middleware or a router`);
        }

        let baseUri, middleware, router, which;

        if (args.length === 1) {
            [which,] = args;
        } else {
            [baseUri, which,] = args;
        }

        if (!(which instanceof Middleware) && (typeof which !== 'function') && !(which instanceof Router)) {
            throw  new TypeError(`use method takes at least a middleware or a router`);
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

    ///////////////////////////////////////////////////////
    // Ajax request
    _fetch({method, uri, headers, data}, resolve, reject) {
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

        // gathers all routes impacted by the uri
        const currentRoutes = [];
        for (const router of this.routers) {
            const routes = router.routes(uri, method);
            currentRoutes.push(...routes);
        }

        // calls middleware entered method
        for (const route of currentRoutes) {
            if (route.middleware.entered) {
                route.middleware.entered({method, uri, headers, data});
            }
            if (route.middleware.next && !route.middleware.next()) {
                break;
            }
        }

        // invokes http request
        this.requester.fetch({uri, method},
            (request, response) => {
                for (const route of currentRoutes) {
                    route.visited = {method, uri, headers, data};
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
                if (resolve) {
                    resolve(request, response);
                }
            },
            (request, response) => {
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
            throw  new TypeError(`${middlewareMethodeName} method takes at least a middleware`);
        }

        let baseUri, middleware, which;

        if (args.length === 1) {
            [which,] = args;
        } else {
            [baseUri, which,] = args;
        }

        if (!(which instanceof Middleware) && (typeof which !== 'function')) {
            throw  new TypeError(`${middlewareMethodeName} method takes at least a middleware`);
        }

        const router = new Router();
        middleware = which;
        router[middlewareMethodeName](baseUri, middleware);

        this.routers.push(router);
    }

    // HTTP methods
    const transformer = HTTP_METHODS[method];
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
            data,
        }, resolve, reject);
    }

    return reqProto;
}, Application.prototype);
