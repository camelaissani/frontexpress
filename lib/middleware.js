import Application from './application';

export default class Middleware {
    constructor(name='') {
        this.name = name;
    }

    entered(request) {
    }

    exited(request) {
    }

    updated(request, response) {
    }

    failed(request, response) {
    }
}
