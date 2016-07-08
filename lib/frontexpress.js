import Application from './application';
import Router from './router';
import Middleware from './middleware';

function frontexpress() {
    return new Application();
}

frontexpress.Router = (baseUri) => new Router(baseUri);
frontexpress.Middleware = (name) => new Middleware(name);

export default frontexpress;
