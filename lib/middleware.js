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
     * Invoked by the app before an ajax request is sent or
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
     * Invoked by the app before a new ajax request is sent or before the DOM is unloaded.
     * See Application#_callMiddlewareExited documentation for details.
     *
     * Override this method to add your custom behaviour
     *
     * @param {Object} request
     * @public
     */

    exited(request) { }


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

    updated(request, response) { }


    /**
     * Invoked by the app when an ajax request has failed.
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
