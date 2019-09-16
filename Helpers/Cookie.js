/**
 * Manage cookie
 * @namespace cookie
 *
 * @example cookie.create( 'cookieName', 'cookieValue' )
 * cookie.read( 'cookieName' )
 * cookie.erase( 'cookieName' )
 *
 * // All parameters
 * cookie.create( 'cookieName', 'cookieValue', {
 *  "days": 10,
 *  "secure": true,
 *  "domain": "test.com",
 *  "path": "/myDir"
 *  } );
 */
let cookie;

{
    let defaultOptions = {
        "days": null,
        "secure": window.location.protocol.indexOf('https') > -1,
        "domain": window.location.hostname,
        "path": "/"
    };

    function Cookie() {
        /**
         * Create a cookie
         *
         * @memberof cookie
         * @param {string} name
         * @param {string} value
         * @param {?Object} userOptions
         * @param {number} userOptions.days
         * @param {boolean} [userOptions.secure] - Default value is true if the location protocol is https
         * @param {string} [userOptions.domain=window.location.hostname]
         * @param {string} [userOptions.path='/']
         */
        function createCookie(name, value, userOptions) {
            let date, cookieText;

            let { days, secure, domain, path } = Object.assign(defaultOptions, userOptions);

            cookieText = [];

            cookieText.push(name + '=' + value);

            if (days) {
                date = new Date();
                date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                cookieText.push('expires=' + date.toGMTString());
            }

            if (domain) {
                cookieText.push('domain=' + domain);
            }

            cookieText.push('path=' + path);

            if (secure) {
                cookieText.push('secure');
            }

            document.cookie = cookieText.join('; ');
        }

        /**
         * Read a cookie
         *
         * @memberof cookie
         * @param {string} name
         *
         * @returns {string}
         */
        function readCookie(name) {
            let nameEQ, ca, c;
            nameEQ = name + '=';
            ca = document.cookie.split(';');

            for (let i = 0; i < ca.length; i++) {
                c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }

            return '';
        }

        /**
         * Delete a cookie
         *
         * @memberof cookie
         * @param {string} name
         */
        function eraseCookie(name) {
            createCookie(name, '', -1);
        }

        return {
            create: createCookie,
            read: readCookie,
            erase: eraseCookie
        };
    }

    cookie = new Cookie();
}

export { cookie };
