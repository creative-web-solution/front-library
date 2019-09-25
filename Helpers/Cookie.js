
let defaultOptions = {
    "days": null,
    "secure": window.location.protocol.indexOf('https') > -1,
    "domain": window.location.hostname,
    "path": "/"
};


/**
 * Manage cookie
 * @class
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
function Cookie() {

    /**
     * Create a cookie
     *
     * @memberof Cookie
     * @instance
     *
     * @param {String} name
     * @param {String} value
     * @param {Object} [userOptions]
     * @param {Number} [userOptions.days=10]
     * @param {Boolean} [userOptions.secure=true] - Default value is true if the location protocol is https
     * @param {String} [userOptions.domain=window.location.hostname]
     * @param {String} [userOptions.path='/']
     *
     * @returns {Cookie}
     */
    this.create = ( name, value, userOptions ) => {
        let date, cookieText;

        let { days, secure, domain, path } = Object.assign( defaultOptions, userOptions );

        cookieText = [];

        cookieText.push( name + '=' + value );

        if ( days ) {
            date = new Date();
            date.setTime( date.getTime() + days * 24 * 60 * 60 * 1000 );
            cookieText.push( 'expires=' + date.toGMTString() );
        }

        if ( domain ) {
            cookieText.push( `domain=${ domain }` );
        }

        cookieText.push( `path=${ path }` );

        if ( secure ) {
            cookieText.push( 'secure' );
        }

        document.cookie = cookieText.join( '; ' );

        return this;
    };


    /**
     * Read a cookie
     *
     * @memberof Cookie
     * @instance
     * @param {String} name
     * @alias read
     *
     * @returns {String}
     */
    this.read = name => {
        let nameEQ, ca, c;
        nameEQ = name + '=';
        ca = document.cookie.split( ';' );

        for ( let i = 0; i < ca.length; i++ ) {
            c = ca[ i ];
            while ( c.charAt( 0 ) === ' ' ) {
                c = c.substring( 1, c.length );
            }
            if ( c.indexOf( nameEQ ) === 0 ) {
                return c.substring( nameEQ.length, c.length );
            }
        }

        return '';
    };


    /**
     * Delete a cookie
     *
     * @memberof Cookie
     * @instance
     * @param {String} name
     *
     * @returns {Cookie}
     */
    this.delete = name => {
        this.create( name, '', -1 );

        return this;
    };
}


let cookie = new Cookie();


export { cookie };
