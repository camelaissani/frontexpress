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
        const {method, uri, headers=[], data} = request;

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
                    resolve(
                        request,
                        {
                            status: 200,
                            statusText: 'OK',
                            responseText: xmlhttp.responseText
                        }
                    );
                } else {
                    fail({
                        status: xmlhttp.status,
                        statusText: xmlhttp.statusText
                    });
                }
            }
        };
        try {
            xmlhttp.open(method, uri, true);
            Object.keys(headers).forEach((header) => xmlhttp.setRequestHeader(header, headers[header]));
            xmlhttp.send(data);
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

        return `${uriWithoutAnchor}${uriWithoutAnchor.indexOf('?') === -1 ? '?' : '&'}${encodeURIObject(data)}${anchor}`;
    }
};

const encodeURIObject = (obj, branch=[], results=[]) => {
    if (obj instanceof Object) {
        Object.keys(obj).forEach(key => {
            const newBranch = new Array(...branch);
            newBranch.push(key);
            encodeURIObject(obj[key], newBranch, results);
        });
        return results.join('&');
    }

    if (branch.length>0){
        results.push(`${encodeURIComponent(branch[0])}${branch.slice(1).map(el => encodeURIComponent(`[${el}]`)).join('')}=${encodeURIComponent(obj)}`);
    } else if (typeof(obj) === 'string') {
        return obj.split('').map((c,idx) => `${idx}=${encodeURIComponent(c)}`).join('&');
    } else {
        return '';
    }
};

export const httpPostPatchTransformer = {
    data({data}) {
        if (!data) {
            return data;
        }
        return encodeURIObject(data);
    },
    headers({uri, headers, data}) {
        const updatedHeaders = headers || {};
        if (!updatedHeaders['Content-Type']) {
            updatedHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        return updatedHeaders;
    }
};
