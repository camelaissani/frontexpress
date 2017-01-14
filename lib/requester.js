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
                {
                    status: 200,
                    statusText: 'OK',
                    responseText
                }
            );
        };

        const fail = ({status, statusText, errorThrown}) => {
            reject(
                request,
                {
                    status,
                    statusText,
                    errorThrown,
                    errors: `HTTP ${status} ${statusText?statusText:''}`
                }
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
}
