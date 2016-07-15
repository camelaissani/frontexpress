/**
 * Module dependencies.
 * @private
 */

import Requester from './requester';


/**
 * Settings object.
 * @private
 */

export default class {


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

                    let anchor = '';
                    let uriWithoutAnchor = uri;
                    const hashIndex = uri.indexOf('#');
                    if (hashIndex >=1) {
                        uriWithoutAnchor = uri.slice(0, hashIndex);
                        anchor = uri.slice(hashIndex, uri.length);
                    }

                    uriWithoutAnchor = Object.keys(data).reduce((gUri, d, index) => {
                        if (index === 0 && gUri.indexOf('?') === -1) {
                            gUri += '?';
                        } else {
                            gUri += '&';
                        }
                        gUri += `${d}=${data[d]}`;
                        return gUri;
                    }, uriWithoutAnchor);

                    return uriWithoutAnchor + anchor;
                },
                data({uri, headers, data}) {
                    return undefined;
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