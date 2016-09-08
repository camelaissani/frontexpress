'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    _classCallCheck(this, Middleware);

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

  _createClass(Middleware, [{
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

exports.default = Middleware;