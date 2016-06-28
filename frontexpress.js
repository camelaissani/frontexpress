import Application from './lib/application';
import Router from './lib/router';
import Middleware from './lib/middleware';

function frontexpress() {
    return new Application();
}

frontexpress.Router = Router;
frontexpress.Middleware = Middleware;

export default frontexpress;
