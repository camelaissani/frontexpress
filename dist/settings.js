'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Module dependencies.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @private
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _requester = require('./requester');

var _requester2 = _interopRequireDefault(_requester);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
        _classCallCheck(this, Settings);

        // default settings
        this.settings = {
            'http requester': new _requester2.default(),

            'http GET transformer': {
                uri: function uri(_ref) {
                    var _uri = _ref.uri;
                    var headers = _ref.headers;
                    var data = _ref.data;

                    if (!data) {
                        return _uri;
                    }

                    var anchor = '';
                    var uriWithoutAnchor = _uri;
                    var hashIndex = _uri.indexOf('#');
                    if (hashIndex >= 1) {
                        uriWithoutAnchor = _uri.slice(0, hashIndex);
                        anchor = _uri.slice(hashIndex, _uri.length);
                    }

                    uriWithoutAnchor = Object.keys(data).reduce(function (gUri, d, index) {
                        if (index === 0 && gUri.indexOf('?') === -1) {
                            gUri += '?';
                        } else {
                            gUri += '&';
                        }
                        gUri += d + '=' + data[d];
                        return gUri;
                    }, uriWithoutAnchor);

                    return uriWithoutAnchor + anchor;
                },
                data: function data(_ref2) {
                    var uri = _ref2.uri;
                    var headers = _ref2.headers;
                    var _data = _ref2.data;

                    return undefined;
                }
            }
        };

        this.rules = {
            'http requester': function httpRequester(requester) {
                if (typeof requester.fetch !== 'function') {
                    throw new TypeError('setting http requester has no fetch method');
                }
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

    _createClass(Settings, [{
        key: 'set',
        value: function set(name, value) {
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
        value: function get(name) {
            return this.settings[name];
        }
    }]);

    return Settings;
}();

exports.default = Settings;
;