/**
 * Module dependencies.
 * @private
 */
import {routeMatcher} from './router';
import Requester, {httpGetTransformer} from './requester';


function errorIfNotFunction(toTest, message) {
    if(typeof toTest !== 'function') {
        throw new TypeError(message);
    }
}

/**
 * Settings object.
 * @private
 */

export default class Settings {


    /**
     * Initialize the settings.
     *
     *   - setup default configuration
     *
     * @private
     */

    constructor() {
        // default settings
        this.settings = {
            'http requester': new Requester(),
            'http GET transformer': httpGetTransformer,
            // 'http POST transformer': httpPostTransformer,
            'route matcher': routeMatcher
        };

        this.rules = {
            'http requester': (requester) => {
                errorIfNotFunction(requester.fetch , 'setting http requester has no fetch function');
            },
            'http GET transformer': (transformer) => {
                if (!transformer || (!transformer.uri && !transformer.headers && !transformer.data)) {
                    throw new TypeError('setting http transformer one of functions: uri, headers, data is missing');
                }
            },
            'route matcher': (routeMatcher) => {
                errorIfNotFunction(routeMatcher, 'setting route matcher is not a function');
            }
        };
    }


    /**
     * Assign `setting` to `val`
     *
     * @param {String} setting
     * @param {*} [val]
     * @private
     */

    set(name, value) {
        const checkRules = this.rules[name];
        if (checkRules) {
            checkRules(value);
        }
        this.settings[name] = value;
    }


    /**
     * Return `setting`'s value.
     *
     * @param {String} setting
     * @private
     */

    get(name) {
        return this.settings[name];
    }
};
