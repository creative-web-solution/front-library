const defaultOptions: CookieOptionsType = {
    "days": null,
    "secure": window.location.protocol.indexOf('https') > -1,
    "domain": window.location.hostname,
    "path": "/"
};


/**
 * Manage cookie
 * @class
 *
 * @example
 * cookie.create( 'cookieName', 'cookieValue' )
 * cookie.read( 'cookieName' )
 * cookie.delete( 'cookieName' )
 *
 * // All parameters
 * cookie.create( 'cookieName', 'cookieValue', {
 *  "days": 10,
 *  "secure": true,
 *  "domain": "test.com",
 *  "path": "/myDir"
 *  } );
 */
class Cookie {

    /**
     * Create a cookie
     *
     * @param name
     * @param value
     * @param userOptions
     */
    create( name: string, value: string, userOptions?: CookieOptionsType ): this {
        let date;

        const { days, secure, domain, path } = Object.assign( defaultOptions, userOptions || {} );

        const cookieText: string[] = [];

        cookieText.push( `${ name }=${ value }` );

        if ( days ) {
            date = new Date();
            date.setTime( date.getTime() + days * 24 * 60 * 60 * 1000 );
            cookieText.push( 'expires=' + date.toUTCString() );
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
    }


    /**
     * Read a cookie
     *
     * @param name
     */
    read( name: string ): string {
        let c;
        const nameEQ = name + '=';
        const ca = document.cookie.split( ';' );

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
    }


    /**
     * Delete a cookie
     *
     * @param name
     */
    delete( name: string ): this {
        this.create( name, '' );

        return this;
    }
}


const cookie = new Cookie();


export { cookie };
