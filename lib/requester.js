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
            if (xmlhttp.readyState === 4) { //XMLHttpRequest.DONE
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
                Object.keys(headers).forEach((header) => {
                    xmlhttp.setRequestHeader(header, headers[header]);
                });
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

export const httpGetTransformer = {
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
};

// export const httpPostTransformer = {
//     headers({uri, headers, data}) {
//         if (!data) {
//             return headers;
//         }
//         const updatedHeaders = headers || {};
//         if (!updatedHeaders['Content-Type']) {
//             updatedHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
//         }
//         return updatedHeaders;
//     }
// };
