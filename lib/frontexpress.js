/**
 * Module dependencies.
 */

import Application from './application';
import Router from './router';
import Middleware from './middleware';


/**
 * Create a frontexpress application.
 *
 * @return {Function}
 * @api public
 */

const frontexpress = () => new Application();

/**
 * Expose Router, Middleware constructors.
 */
frontexpress.Router = (baseUri) => new Router(baseUri);
frontexpress.Middleware = (name) => new Middleware(name);

export default frontexpress;
