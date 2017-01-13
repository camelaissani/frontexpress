/**
 * Module dependencies.
 * @private
 */

import Requester from './requester';


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

            'http GET transformer': {
                uri({uri, headers, data}) {
                    if (!data) {
                        return uri;
                    }
                    let [uriWithoutAnchor, anchor] = [uri, ''];
                    const match = /^(.*)(#.*)$/.exec(uri);
                    if (match) {
                        [,uriWithoutAnchor, anchor] = /^(.*)(#.*)$/.exec(uri);
                    }
                    uriWithoutAnchor = Object.keys(data).reduce((gUri, d, index) => {
                        gUri += `${(index === 0 && gUri.indexOf('?') === -1)?'?':'&'}${d}=${data[d]}`;
                        return gUri;
                    }, uriWithoutAnchor);
                    return uriWithoutAnchor + anchor;
                }
            }
        };

        this.rules = {
            'http requester': (requester) => {
                if(typeof requester.fetch !== 'function') {
                    throw new TypeError('setting http requester has no fetch method');
                }
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
