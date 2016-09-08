/**
 * Module dependencies.
 * @private
 */

export default class Requester {

    /**
     * Make an ajax request.
     *
     * @param {Object} request
     * @param {Function} success callback
     * @param {Function} failure callback
     * @private
     */

    fetch(request, resolve, reject) {
        const {method, uri, headers, data} = request;

        const success = (responseText) => {
            resolve(
                request,
                {status: 200, statusText: 'OK', responseText}
            );
        };

        const fail = ({status, statusText, errorThrown}) => {
            const errors = this._analyzeErrors({status, statusText, errorThrown});
            reject(
                request,
                {status, statusText, errorThrown, errors}
            );
        };

        const xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    success(xmlhttp.responseText);
                } else {
                    fail({status: xmlhttp.status, statusText: xmlhttp.statusText});
                }
            }
        };
        try {
            xmlhttp.open(method, uri, true);
            if (headers) {
                for (const header of Object.keys(headers)) {
                    xmlhttp.setRequestHeader(header, headers[header]);
                }
            }
            if (data) {
                xmlhttp.send(data);
            } else {
                xmlhttp.send();
            }
        } catch (errorThrown) {
            fail({errorThrown});
        }
    }


    /**
     * Analyse response errors.
     *
     * @private
     */

    _analyzeErrors(response) {
        // manage exceptions
        if (response.errorThrown) {
            if (response.errorThrown.name === 'SyntaxError') {
                return 'Problem during data decoding [JSON]';
            }
            if (response.errorThrown.name === 'TimeoutError') {
                return 'Server is taking too long to reply';
            }
            if (response.errorThrown.name === 'AbortError') {
                return 'Request cancelled on server';
            }
            if (response.errorThrown.name === 'NetworkError') {
                return 'A network error occurred';
            }
            throw response.errorThrown;
        }

        // manage status
        if (response.status === 0) {
            return 'Server access problem. Check your network connection';
        }
        if (response.status === 401) {
            return 'Your session has expired, Please reconnect. [code: 401]';
        }
        if (response.status === 404) {
            return 'Page not found on server. [code: 404]';
        }
        if (response.status === 500) {
            return 'Internal server error. [code: 500]';
        }
        return `Unknown error. ${response.statusText?response.statusText:''}`;
    }
}