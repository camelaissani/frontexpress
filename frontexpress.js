var frontexpress = (function () {
'use strict';

/**
 * HTTP method list
 * @private
 */

var HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
// not supported yet
// HEAD', 'CONNECT', 'OPTIONS', 'TRACE';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();



























var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * Middleware object.
 * @public
 */

var Middleware = function () {

  /**
   * Middleware initialization
   *
   * @param {String} middleware name
   */

  function Middleware() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    classCallCheck(this, Middleware);

    this.name = name;
  }

  /**
   * Invoked by the app before an ajax request is sent or
   * during the DOM loading (document.readyState === 'loading').
   * See Application#_callMiddlewareEntered documentation for details.
   *
   * Override this method to add your custom behaviour
   *
   * @param {Object} request
   * @public
   */

  createClass(Middleware, [{
    key: 'entered',
    value: function entered(request) {}

    /**
     * Invoked by the app before a new ajax request is sent or before the DOM is unloaded.
     * See Application#_callMiddlewareExited documentation for details.
     *
     * Override this method to add your custom behaviour
     *
     * @param {Object} request
     * @public
     */

  }, {
    key: 'exited',
    value: function exited(request) {}

    /**
     * Invoked by the app after an ajax request has responded or on DOM ready
     * (document.readyState === 'interactive').
     * See Application#_callMiddlewareUpdated documentation for details.
     *
     * Override this method to add your custom behaviour
     *
     * @param {Object} request
     * @param {Object} response
     * @public
     */

  }, {
    key: 'updated',
    value: function updated(request, response) {}

    /**
     * Invoked by the app when an ajax request has failed.
     *
     * Override this method to add your custom behaviour
     *
     * @param {Object} request
     * @param {Object} response
     * @public
     */

  }, {
    key: 'failed',
    value: function failed(request, response) {}

    /**
     * Allow the hand over to the next middleware object or function.
     *
     * Override this method and return `false` to break execution of
     * middleware chain.
     *
     * @return {Boolean} `true` by default
     *
     * @public
     */

  }, {
    key: 'next',
    value: function next() {
      return true;
    }
  }]);
  return Middleware;
}();

/**
 * Module dependencies.
 * @private
 */

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
        classCallCheck(this, Route);

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

    createClass(Route, [{
        key: 'uri',
        get: function get$$1() {
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
                var baseUri = this.router.baseUri.trim();
                if (this.uriPart) {
                    return (baseUri + this.uriPart.trim()).replace(/\/{2,}/, '/');
                }
                return baseUri;
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

var error_middleware_message = 'method takes at least a middleware';

var Router = function () {

    /**
     * Initialize the router.
     *
     * @private
     */

    function Router(uri) {
        classCallCheck(this, Router);

        this._baseUri = uri;
        this._routes = [];
    }

    /**
     * Do some checks and set _baseUri.
     *
     * @private
     */

    createClass(Router, [{
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
        value: function routes(application, request) {
            request.params = request.params || {};
            var isRouteMatch = application.get('route matcher');
            return this._routes.filter(function (route) {
                return isRouteMatch(request, route);
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
            if (!(middleware instanceof Middleware) && typeof middleware !== 'function') {
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

    }, {
        key: 'all',
        value: function all() {
            var _this = this;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var _toParameters = toParameters(args),
                middleware = _toParameters.middleware;

            if (!middleware) {
                throw new TypeError(error_middleware_message);
            }

            HTTP_METHODS.forEach(function (method) {
                _this[method.toLowerCase()].apply(_this, args);
            });
            return this;
        }
    }, {
        key: 'baseUri',
        set: function set$$1(uri) {
            if (!uri) {
                return;
            }

            if (!this._baseUri) {
                this._baseUri = uri;
                return;
            }

            if (_typeof(this._baseUri) !== (typeof uri === 'undefined' ? 'undefined' : _typeof(uri))) {
                throw new TypeError('router cannot mix regexp and uri');
            }
        }

        /**
         * Return router's _baseUri.
         *
         * @private
         */

        ,
        get: function get$$1() {
            return this._baseUri;
        }
    }]);
    return Router;
}();

HTTP_METHODS.forEach(function (method) {

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

        var _toParameters2 = toParameters(args),
            baseUri = _toParameters2.baseUri,
            middleware = _toParameters2.middleware;

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

function routeMatcher(request, route) {
    // check if http method are equals
    if (route.method && route.method !== request.method) {
        return false;
    }

    // route and uri not defined always match
    if (!route.uri || !request.uri) {
        return true;
    }

    //remove query string and anchor from uri to test
    var match = /^(.*)\?.*#.*|(.*)(?=\?|#)|(.*[^\?#])$/.exec(request.uri);
    var baseUriToCheck = match[1] || match[2] || match[3];

    // if route is a regexp path
    if (route.uri instanceof RegExp) {
        return baseUriToCheck.match(route.uri) !== null;
    }

    // if route is parameterized path
    if (route.uri.indexOf(':') !== -1) {

        var decodeParmeterValue = function decodeParmeterValue(v) {
            return !isNaN(parseFloat(v)) && isFinite(v) ? Number.isInteger(v) ? Number.parseInt(v, 10) : Number.parseFloat(v) : v;
        };

        // figure out key names
        var keys = [];
        var keysRE = /:([^\/\?]+)\??/g;
        var keysMatch = keysRE.exec(route.uri);
        while (keysMatch != null) {
            keys.push(keysMatch[1]);
            keysMatch = keysRE.exec(route.uri);
        }

        // change parameterized path to regexp
        var regExpUri = route.uri
        //                             :parameter?
        .replace(/\/:[^\/]+\?/g, '(?:\/([^\/]+))?')
        //                             :parameter
        .replace(/:[^\/]+/g, '([^\/]+)')
        //                             escape all /
        .replace('/', '\\/');

        // checks if uri match
        var routeMatch = baseUriToCheck.match(new RegExp('^' + regExpUri + '$'));
        if (!routeMatch) {
            return false;
        }

        // update params in request with keys
        request.params = Object.assign(request.params, keys.reduce(function (acc, key, index) {
            var value = routeMatch[index + 1];
            if (value) {
                value = value.indexOf(',') !== -1 ? value.split(',').map(function (v) {
                    return decodeParmeterValue(v);
                }) : value = decodeParmeterValue(value);
            }
            acc[key] = value;
            return acc;
        }, {}));
        return true;
    }

    // if route is a simple path
    return route.uri === baseUriToCheck;
}

/**
 * Module dependencies.
 * @private
 */

var Requester = function () {
    function Requester() {
        classCallCheck(this, Requester);
    }

    createClass(Requester, [{
        key: 'fetch',


        /**
         * Make an ajax request.
         *
         * @param {Object} request
         * @param {Function} success callback
         * @param {Function} failure callback
         * @private
         */

        value: function fetch(request, resolve, reject) {
            var method = request.method,
                uri = request.uri,
                headers = request.headers,
                data = request.data;


            var success = function success(responseText) {
                resolve(request, {
                    status: 200,
                    statusText: 'OK',
                    responseText: responseText
                });
            };

            var fail = function fail(_ref) {
                var status = _ref.status,
                    statusText = _ref.statusText,
                    errorThrown = _ref.errorThrown;

                reject(request, {
                    status: status,
                    statusText: statusText,
                    errorThrown: errorThrown,
                    errors: 'HTTP ' + status + ' ' + (statusText ? statusText : '')
                });
            };

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4) {
                    //XMLHttpRequest.DONE
                    if (xmlhttp.status === 200) {
                        success(xmlhttp.responseText);
                    } else {
                        fail({ status: xmlhttp.status, statusText: xmlhttp.statusText });
                    }
                }
            };
            try {
                xmlhttp.open(method, uri, true);
                if (headers) {
                    Object.keys(headers).forEach(function (header) {
                        xmlhttp.setRequestHeader(header, headers[header]);
                    });
                }
                if (data) {
                    xmlhttp.send(data);
                } else {
                    xmlhttp.send();
                }
            } catch (errorThrown) {
                fail({ errorThrown: errorThrown });
            }
        }
    }]);
    return Requester;
}();

var httpGetTransformer = {
    uri: function uri(_ref2) {
        var _uri = _ref2.uri,
            headers = _ref2.headers,
            data = _ref2.data;

        if (!data) {
            return _uri;
        }
        var uriWithoutAnchor = _uri,
            anchor = '';

        var match = /^(.*)(#.*)$/.exec(_uri);
        if (match) {
            var _$exec = /^(.*)(#.*)$/.exec(_uri);

            var _$exec2 = slicedToArray(_$exec, 3);

            uriWithoutAnchor = _$exec2[1];
            anchor = _$exec2[2];
        }

        return '' + uriWithoutAnchor + (uriWithoutAnchor.indexOf('?') === -1 ? '?' : '&') + encodeURIObject(data) + anchor;
    }
};

var encodeURIObject = function encodeURIObject(obj) {
    var branch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var results = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    if (obj instanceof Object) {
        Object.keys(obj).forEach(function (key) {
            var newBranch = new (Function.prototype.bind.apply(Array, [null].concat(toConsumableArray(branch))))();
            newBranch.push(key);
            encodeURIObject(obj[key], newBranch, results);
        });
        return results.join('&');
    }

    if (branch.length > 0) {
        results.push('' + encodeURIComponent(branch[0]) + branch.slice(1).map(function (el) {
            return encodeURIComponent('[' + el + ']');
        }).join('') + '=' + encodeURIComponent(obj));
    } else if (typeof obj === 'string') {
        return obj.split('').map(function (c, idx) {
            return idx + '=' + encodeURIComponent(c);
        }).join('&');
    } else {
        return '';
    }
};

var httpPostPatchTransformer = {
    data: function data(_ref3) {
        var _data = _ref3.data;

        if (!_data) {
            return _data;
        }
        return encodeURIObject(_data);
    },
    headers: function headers(_ref4) {
        var uri = _ref4.uri,
            _headers = _ref4.headers,
            data = _ref4.data;

        var updatedHeaders = _headers || {};
        if (!updatedHeaders['Content-Type']) {
            updatedHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        return updatedHeaders;
    }
};

/**
 * Module dependencies.
 * @private
 */
function errorIfNotFunction(toTest, message) {
    if (typeof toTest !== 'function') {
        throw new TypeError(message);
    }
}

function errorIfNotHttpTransformer(toTest) {
    if (!toTest || !toTest.uri && !toTest.headers && !toTest.data) {
        throw new TypeError('setting http transformer one of functions: uri, headers, data is missing');
    }
}

/**
 * Settings object.
 * @private
 */

var Settings = function () {

    /**
     * Initialize the settings.
     *
     *   - setup default configuration
     *
     * @private
     */

    function Settings() {
        classCallCheck(this, Settings);

        // default settings
        this.settings = {
            'http requester': new Requester(),
            'http GET transformer': httpGetTransformer,
            'http POST transformer': httpPostPatchTransformer,
            'http PATCH transformer': httpPostPatchTransformer,
            'route matcher': routeMatcher
        };

        this.rules = {
            'http requester': function httpRequester(requester) {
                errorIfNotFunction(requester.fetch, 'setting http requester has no fetch function');
            },
            'http GET transformer': function httpGETTransformer(transformer) {
                errorIfNotHttpTransformer(transformer);
            },
            'http POST transformer': function httpPOSTTransformer(transformer) {
                errorIfNotHttpTransformer(transformer);
            },
            'http PATCH transformer': function httpPATCHTransformer(transformer) {
                errorIfNotHttpTransformer(transformer);
            },
            'route matcher': function routeMatcher$$1(_routeMatcher) {
                errorIfNotFunction(_routeMatcher, 'setting route matcher is not a function');
            }
        };
    }

    /**
     * Assign `setting` to `val`
     *
     * @param {String} setting
     * @param {*} [val]
     * @private
     */

    createClass(Settings, [{
        key: 'set',
        value: function set$$1(name, value) {
            var checkRules = this.rules[name];
            if (checkRules) {
                checkRules(value);
            }
            this.settings[name] = value;
        }

        /**
         * Return `setting`'s value.
         *
         * @param {String} setting
         * @private
         */

    }, {
        key: 'get',
        value: function get$$1(name) {
            return this.settings[name];
        }
    }]);
    return Settings;
}();

/**
 * Module dependencies.
 * @private
 */

/**
 * Application class.
 */

var Application = function () {

    /**
     * Initialize the application.
     *
     *   - setup default configuration
     *
     * @private
     */

    function Application() {
        classCallCheck(this, Application);

        this.routers = [];
        this.settings = new Settings();
        this.plugins = [];
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

    createClass(Application, [{
        key: 'set',
        value: function set$$1() {
            var _settings;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            // get behaviour
            if (args.length === 1) {
                return this.settings.get([args]);
            }

            // set behaviour
            (_settings = this.settings).set.apply(_settings, args);

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

    }, {
        key: 'listen',
        value: function listen(callback) {
            var _this = this;

            var request = { method: 'GET', uri: window.location.pathname + window.location.search };
            var response = { status: 200, statusText: 'OK' };
            var currentRoutes = this._routes(request);

            this._callMiddlewareMethod('entered', currentRoutes, request);

            // manage history
            window.onpopstate = function (event) {
                if (event.state) {
                    var _event$state = event.state,
                        _request = _event$state.request,
                        _response = _event$state.response;

                    ['exited', 'entered', 'updated'].forEach(function (middlewareMethod) {
                        return _this._callMiddlewareMethod(middlewareMethod, _this._routes(_request), _request, _response);
                    });
                }
            };

            // manage page loading/refreshing
            window.onbeforeunload = function () {
                _this._callMiddlewareMethod('exited');
            };

            var whenPageIsInteractiveFn = function whenPageIsInteractiveFn() {
                _this.plugins.forEach(function (pluginObject) {
                    return pluginObject.plugin(_this);
                });
                _this._callMiddlewareMethod('updated', currentRoutes, request, response);
                if (callback) {
                    callback(request, response);
                }
            };

            document.onreadystatechange = function () {
                // DOM ready state
                if (document.readyState === 'interactive') {
                    whenPageIsInteractiveFn();
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

    }, {
        key: 'route',
        value: function route(uri) {
            var router = new Router(uri);
            this.routers.push(router);
            return router;
        }

        /**
         * Use the given middleware function or object, with optional _uri_.
         * Default _uri_ is "/".
         * Or use the given plugin
         *
         *    // middleware function will be applied on path "/"
         *    app.use((req, res, next) => {console.log('Hello')});
         *
         *    // middleware object will be applied on path "/"
         *    app.use(new Middleware());
         *
         *    // use a plugin
         *    app.use({
         *      name: 'My plugin name',
         *      plugin(application) {
         *        // here plugin implementation
         *      }
         *    });
         *
         * @param {String} uri
         * @param {Middleware|Function|plugin} middleware object, middleware function, plugin
         * @return {app} for chaining
         *
         * @public
         */

    }, {
        key: 'use',
        value: function use() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            var _toParameters = toParameters(args),
                baseUri = _toParameters.baseUri,
                router = _toParameters.router,
                middleware = _toParameters.middleware,
                plugin = _toParameters.plugin;

            if (plugin) {
                this.plugins.push(plugin);
            } else {
                if (router) {
                    router.baseUri = baseUri;
                } else if (middleware) {
                    router = new Router(baseUri);
                    HTTP_METHODS.forEach(function (method) {
                        router[method.toLowerCase()](middleware);
                    });
                } else {
                    throw new TypeError('method takes at least a middleware or a router');
                }
                this.routers.push(router);
            }

            return this;
        }

        /**
         * Gather routes from all routers filtered by _uri_ and HTTP _method_.
         * See Router#routes() documentation for details.
         *
         * @private
         */

    }, {
        key: '_routes',
        value: function _routes(request) {
            var _this2 = this;

            return this.routers.reduce(function (acc, router) {
                acc.push.apply(acc, toConsumableArray(router.routes(_this2, request)));
                return acc;
            }, []);
        }

        /**
         * Call `Middleware` method or middleware function on _currentRoutes_.
         *
         * @private
         */

    }, {
        key: '_callMiddlewareMethod',
        value: function _callMiddlewareMethod(meth, currentRoutes, request, response) {
            if (meth === 'exited') {
                // currentRoutes, request, response params not needed
                this.routers.forEach(function (router) {
                    router.visited().forEach(function (route) {
                        if (route.middleware.exited) {
                            route.middleware.exited(route.visited);
                            route.visited = null;
                        }
                    });
                });
                return;
            }

            currentRoutes.some(function (route) {
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
                    var breakMiddlewareLoop = true;
                    var next = function next() {
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

    }, {
        key: '_fetch',
        value: function _fetch(req, resolve, reject) {
            var _this3 = this;

            var method = req.method,
                uri = req.uri,
                headers = req.headers,
                data = req.data,
                history = req.history;


            var httpMethodTransformer = this.get('http ' + method + ' transformer');
            if (httpMethodTransformer) {
                var _uriFn = httpMethodTransformer.uri,
                    _headersFn = httpMethodTransformer.headers,
                    _dataFn = httpMethodTransformer.data;

                req.uri = _uriFn ? _uriFn({ uri: uri, headers: headers, data: data }) : uri;
                req.headers = _headersFn ? _headersFn({ uri: uri, headers: headers, data: data }) : headers;
                req.data = _dataFn ? _dataFn({ uri: uri, headers: headers, data: data }) : data;
            }

            // calls middleware exited method
            this._callMiddlewareMethod('exited');

            // gathers all routes impacted by the uri
            var currentRoutes = this._routes(req);

            // calls middleware entered method
            this._callMiddlewareMethod('entered', currentRoutes, req);

            // invokes http request
            this.settings.get('http requester').fetch(req, function (request, response) {
                if (history) {
                    window.history.pushState({ request: request, response: response }, history.title, history.uri);
                }
                _this3._callMiddlewareMethod('updated', currentRoutes, request, response);
                if (resolve) {
                    resolve(request, response);
                }
            }, function (request, response) {
                _this3._callMiddlewareMethod('failed', currentRoutes, request, response);
                if (reject) {
                    reject(request, response);
                }
            });
        }
    }]);
    return Application;
}();

HTTP_METHODS.reduce(function (reqProto, method) {

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

    var middlewareMethodName = method.toLowerCase();
    reqProto[middlewareMethodName] = function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        var _toParameters2 = toParameters(args),
            baseUri = _toParameters2.baseUri,
            middleware = _toParameters2.middleware,
            which = _toParameters2.which;

        if (middlewareMethodName === 'get' && typeof which === 'string') {
            return this.settings.get(which);
        }
        if (!middleware) {
            throw new TypeError('method takes a middleware ' + (middlewareMethodName === 'get' ? 'or a string' : ''));
        }
        var router = new Router();
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
    var httpMethodName = 'http' + method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
    reqProto[httpMethodName] = function (request, resolve, reject) {
        var uri = request.uri,
            headers = request.headers,
            data = request.data,
            history = request.history;

        if (!uri) {
            uri = request;
        }
        return this._fetch({
            uri: uri,
            method: method,
            headers: headers,
            data: data,
            history: history
        }, resolve, reject);
    };

    return reqProto;
}, Application.prototype);

function toParameters(args) {
    var _args, _args2, _args3, _args4;

    var baseUri = void 0,
        middleware = void 0,
        router = void 0,
        plugin = void 0,
        which = void 0;

    args.length === 1 ? (_args = args, _args2 = slicedToArray(_args, 1), which = _args2[0], _args) : (_args3 = args, _args4 = slicedToArray(_args3, 2), baseUri = _args4[0], which = _args4[1], _args3);

    if (which instanceof Router) {
        router = which;
    } else if (which instanceof Middleware || typeof which === 'function') {
        middleware = which;
    } else if (which && which.plugin && typeof which.plugin === 'function') {
        plugin = which;
    }

    return { baseUri: baseUri, middleware: middleware, router: router, plugin: plugin, which: which };
}

/**
 * Module dependencies.
 */

/**
 * Create a frontexpress application.
 *
 * @return {Function}
 * @api public
 */

var frontexpress = function frontexpress() {
  return new Application();
};

/**
 * Expose Router, Middleware constructors.
 */
frontexpress.Router = function (baseUri) {
  return new Router(baseUri);
};
frontexpress.Middleware = Middleware;

return frontexpress;

}());
