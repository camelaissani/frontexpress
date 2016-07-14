import Requester from './requester';

export default class {
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
            },

            'http POST transformer': {
                headers({uri, headers, data}) {
                    const postHeaders = {};
                    postHeaders['Content-type'] = 'application/x-www-form-urlencoded';
                    if (headers) {
                        Object.keys(headers).reduce((phds, headKey) => {
                            phds[headKey] = headers[headKey];
                            return phds;
                        }, postHeaders);
                    }
                    return postHeaders;
                },
                data({uri, headers, data}) {
                    if (!data) {
                        return data;
                    }
                    return Object.keys(data).reduce((newData, d, index) => {
                        if (index !== 0) {
                            newData += '&';
                        }
                        newData += `${d}=${data[d]}`;
                        return newData;
                    }, '');
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

    set(name, value) {
        const checkRules = this.rules[name];
        if (checkRules) {
            checkRules(value);
        }
        this.settings[name] = value;
    }

    get(name) {
        return this.settings[name];
    }
};