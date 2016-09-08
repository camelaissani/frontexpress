'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _application = require('./application');

var _application2 = _interopRequireDefault(_application);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _middleware = require('./middleware');

var _middleware2 = _interopRequireDefault(_middleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a frontexpress application.
 *
 * @return {Function}
 * @api public
 */

var frontexpress = function frontexpress() {
  return new _application2.default();
};

/**
 * Expose Router, Middleware constructors.
 */
/**
 * Module dependencies.
 */

frontexpress.Router = function (baseUri) {
  return new _router2.default(baseUri);
};
frontexpress.Middleware = function (name) {
  return new _middleware2.default(name);
};

exports.default = frontexpress;