import {assert} from 'chai';
import sinon from 'sinon';
import frontexpress from '../lib/frontexpress';
import Application from '../lib/application';
import Router from '../lib/router';
import Middleware from '../lib/middleware';

describe('frontexpress', () => {
    it('test Router class exposed', () => {
        assert(frontexpress.Router);
        assert(frontexpress.Router() instanceof Router);

        const router1 = frontexpress.Router();
        const router2 = frontexpress.Router();
        assert(router1 !== router2);
    });

    it('test Middleware class exposed', () => {
        assert(frontexpress.Middleware);
        assert(frontexpress.Middleware() instanceof Middleware);

        const m1 = frontexpress.Middleware();
        const m2 = frontexpress.Middleware();
        assert(m1 !== m2);
    });

    it('test Application class exposed', () => {
        assert(frontexpress);
        assert(frontexpress() instanceof Application);

        const app1 = frontexpress();
        const app2 = frontexpress();
        assert(app1 !== app2);
    });
});