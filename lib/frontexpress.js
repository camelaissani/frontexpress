import Application from './application';
import Router from './router';
import Middleware from './middleware';

function frontexpress() {
    return new Application();
}

frontexpress.Router = Router;
frontexpress.Middleware = Middleware;

export default frontexpress;
