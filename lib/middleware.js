/**
 * Middleware object.
 * @public
 */

export default class Middleware {


    /**
     * Middleware initialization
     *
     * @param {String} middleware name
     */

    constructor(name='') {
        this.name = name;
    }

    /**
     * Invoked by the app before ajax request are sent or
     * during the DOM loading (document.readyState === 'loading').
     * See Application#_callMiddlewareEntered documentation for details.
     *
     * Override this method to add your custom behaviour
     *
     * @param {Object} request
     * @public
     */

    entered(request) { }


    /**
     * Invoked by the app before a new ajax request is sent or before the DOM unloading.
     * See Application#_callMiddlewareExited documentation for details.
     *
     * Override this method to add your custom behaviour
     *
     * @param {Object} request
     * @public
     */

    exited(request) { }


    /**
     * Invoked on ajax request responding or on DOM ready
     * (document.readyState === 'interactive').
     * See Application#_callMiddlewareUpdated documentation for details.
     *
     * Override this method to add your custom behaviour
     *
     * @param {Object} request
     * @param {Object} response
     * @public
     */

    updated(request, response) { }


    /**
     * Invoked when ajax request fails.
     *
     * Override this method to add your custom behaviour
     *
     * @param {Object} request
     * @param {Object} response
     * @public
     */
    failed(request, response) { }


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

    next() {
        return true;
    }
}
