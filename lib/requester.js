export const HTTP_METHODS = {
    'GET': {
        uri({uri, headers, data}) {
            if (!data) {
                return uri;
            }
            return Object.keys(data).reduce((gUri, d, index) => {
                if (index === 0) {
                    gUri += '?';
                } else {
                    gUri += '&';
                }
                gUri += `${d}=${data[d]}`;
                return gUri;
            }, uri);
        },
        data({uri, headers, data}) {
            return undefined;
        }
    },
    'POST': {
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
    },
    'PUT': {
        //TODO
    },
    'DELETE': {
        //TODO
    }
    // non exhaustive list
};

export default class Requester {

    fetch({uri, method, headers, data}, resolve, reject) {
        const transformer = HTTP_METHODS[method];
        uri = transformer.uri ? transformer.uri({uri, headers, data}) : uri;
        headers = transformer.headers ? transformer.headers({uri, headers, data}) : headers;
        data = transformer.data ? transformer.data({uri, headers, data}) : data;

        const success = (responseText) => {
            resolve(
                {uri, method, headers, data},
                {status: 200, statusText: 'OK', responseText}
            );
        };

        const fail = ({status, statusText, errorThrown}) => {
            const errors = this._analyzeErrors({status, statusText, errorThrown});
            reject(
                {uri, method, headers, data},
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

    _analyzeErrors(response) {
        let error = '';
        if (response.status === 0) {
            error = 'Server access problem. Check your network connection';
        } else if (response.status === 401) {
            error = 'Your session has expired, Please reconnect. [code: 401]';
        } else if (response.status === 404) {
            error = 'Page not found on server. [code: 404]';
        } else if (response.status === 500) {
            error = 'Internal server error. [code: 500]';
        } else if (response.errorThrown) {
            if (response.errorThrown.name === 'SyntaxError') {
                error = 'Problem during data decoding [JSON]';
            } else if (response.errorThrown.name === 'TimeoutError') {
                error = 'Server is taking too long to reply';
            } else if (response.errorThrown.name === 'AbortError') {
                error = 'Request cancelled on server';
            } else if (response.errorThrown.name === 'NetworkError') {
                error = 'A network error occurred';
            } else {
                error = `${response.errorThrown.name} ${response.errorThrown.message}`;
            }
        } else {
            error = `Unknown error. ${response.statusText?response.statusText:''}`;
        }
        return error;
    }
}