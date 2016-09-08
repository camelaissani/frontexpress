'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Module dependencies.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _methods = require('./methods');

var _methods2 = _interopRequireDefault(_methods);

var _middleware = require('./middleware');

var _middleware2 = _interopRequireDefault(_middleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Route object.
 * @private
 */

var Route = function () {

    /**
     * Initialize the route.
     *
     * @private
     */

    function Route(router, uriPart, method, middleware) {
        _classCallCheck(this, Route);

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

    _createClass(Route, [{
        key: 'uri',
        get: function get() {
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
    }]);

    return Route;
}();

/**
 * Router object.
 * @public
 */

var Router = function () {

    /**
     * Initialize the router.
     *
     * @private
     */

    function Router(uri) {
        _classCallCheck(this, Router);

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

    _createClass(Router, [{
        key: '_add',


        /**
         * Add a route to the router.
         *
         * @private
         */

        value: function _add(route) {
            this._routes.push(route);
            return this;
        }

        /**
         * Gather routes from routers filtered by _uri_ and HTTP _method_.
         *
         * @private
         */

    }, {
        key: 'routes',
        value: function routes(uri, method) {
            return this._routes.filter(function (route) {
                if (!route.uri && !route.method) {
                    return true;
                }
                if (route.method !== method) {
                    return false;
                }

                if (!route.uri) {
                    return true;
                }

                var uriToCheck = uri;

                //remove query string from uri to test
                var questionMarkIndex = uriToCheck.indexOf('?');
                if (questionMarkIndex >= 0) {
                    uriToCheck = uriToCheck.slice(0, questionMarkIndex);
                }

                //remove anchor from uri to test
                var hashIndex = uriToCheck.indexOf('#');
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

    }, {
        key: 'visited',
        value: function visited() {
            return this._routes.filter(function (route) {
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

    }, {
        key: 'use',
        value: function use(middleware) {
            if (!(middleware instanceof _middleware2.default) && typeof middleware !== 'function') {
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

    }, {
        key: 'all',
        value: function all() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            if (args.length === 0) {
                throw new TypeError('use all method takes at least a middleware');
            }
            var middleware = void 0;

            if (args.length === 1) {
                middleware = args[0];
            } else {
                middleware = args[1];
            }

            if (!(middleware instanceof _middleware2.default) && typeof middleware !== 'function') {
                throw new TypeError('use all method takes at least a middleware');
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = _methods2.default[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var method = _step.value;

                    this[method.toLowerCase()].apply(this, args);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return this;
        }
    }, {
        key: 'baseUri',
        set: function set(uri) {
            if (!uri) {
                return;
            }

            if (!this._baseUri) {
                this._baseUri = uri;
                return;
            }

            if (this._baseUri instanceof RegExp) {
                throw new TypeError('the router already contains a regexp uri ' + this._baseUri.toString() + ' It cannot be mixed with ' + uri.toString());
            }

            if (uri instanceof RegExp) {
                throw new TypeError('the router already contains an uri ' + this._baseUri.toString() + ' It cannot be mixed with regexp ' + uri.toString());
            }
        }

        /**
         * Return router's _baseUri.
         *
         * @private
         */

        ,
        get: function get() {
            return this._baseUri;
        }
    }]);

    return Router;
}();

exports.default = Router;
var _iteratorNormalCompletion2 = true;
var _didIteratorError2 = false;
var _iteratorError2 = undefined;

try {
    var _loop = function _loop() {
        var method = _step2.value;


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

        var methodName = method.toLowerCase();
        Router.prototype[methodName] = function () {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            if (args.length === 0) {
                throw new TypeError('use ' + methodName + ' method takes at least a middleware');
            }
            var uri = void 0,
                middleware = void 0;

            if (args.length === 1) {
                middleware = args[0];
            } else {
                uri = args[0];
                middleware = args[1];
            }

            if (!(middleware instanceof _middleware2.default) && typeof middleware !== 'function') {
                throw new TypeError('use ' + methodName + ' method takes at least a middleware');
            }

            if (uri && this._baseUri && this._baseUri instanceof RegExp) {
                throw new TypeError('router contains a regexp cannot mix with route uri/regexp');
            }

            this._add(new Route(this, uri, method, middleware));

            return this;
        };
    };

    for (var _iterator2 = _methods2.default[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        _loop();
    }
} catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
} finally {
    try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
        }
    } finally {
        if (_didIteratorError2) {
            throw _iteratorError2;
        }
    }
}