/*eslint-env mocha*/
import {assert} from 'chai';
import Middleware from '../lib/middleware';

describe('Middleware', () => {
    it('check exposed methods', () => {
        const middleware = new Middleware();
        assert(middleware.entered);
        assert(middleware.exited);
        assert(middleware.updated);
        assert(middleware.failed);
        assert(middleware.next);

        middleware.entered();
        middleware.exited();
        middleware.updated();
        middleware.failed();
        assert(middleware.next());
    });
});