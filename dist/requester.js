'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Module dependencies.
 * @private
 */

var Requester = function () {
    function Requester() {
        _classCallCheck(this, Requester);
    }

    _createClass(Requester, [{
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
            var _this = this;

            var method = request.method;
            var uri = request.uri;
            var headers = request.headers;
            var data = request.data;
            var history = request.history;


            var success = function success(responseText) {
                resolve(request, { status: 200, statusText: 'OK', responseText: responseText });
            };

            var fail = function fail(_ref) {
                var status = _ref.status;
                var statusText = _ref.statusText;
                var errorThrown = _ref.errorThrown;

                var errors = _this._analyzeErrors({ status: status, statusText: statusText, errorThrown: errorThrown });
                reject(request, { status: status, statusText: statusText, errorThrown: errorThrown, errors: errors });
            };

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4) {
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
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = Object.keys(headers)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var header = _step.value;

                            xmlhttp.setRequestHeader(header, headers[header]);
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

        /**
         * Analyse response errors.
         *
         * @private
         */

    }, {
        key: '_analyzeErrors',
        value: function _analyzeErrors(response) {
            // manage exceptions
            if (response.errorThrown) {
                if (response.errorThrown.name === 'SyntaxError') {
                    return 'Problem during data decoding [JSON]';
                }
                if (response.errorThrown.name === 'TimeoutError') {
                    return 'Server is taking too long to reply';
                }
                if (response.errorThrown.name === 'AbortError') {
                    return 'Request cancelled on server';
                }
                if (response.errorThrown.name === 'NetworkError') {
                    return 'A network error occurred';
                }
                throw response.errorThrown;
            }

            // manage status
            if (response.status === 0) {
                return 'Server access problem. Check your network connection';
            }
            if (response.status === 401) {
                return 'Your session has expired, Please reconnect. [code: 401]';
            }
            if (response.status === 404) {
                return 'Page not found on server. [code: 404]';
            }
            if (response.status === 500) {
                return 'Internal server error. [code: 500]';
            }
            return 'Unknown error. ' + (response.statusText ? response.statusText : '');
        }
    }]);

    return Requester;
}();

exports.default = Requester;