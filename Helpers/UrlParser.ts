/**
 * Parse an URL
 *
 * @param url
 *
 * @example
 * let url = new UrlParser( 'https://username:password@demo.domain.com:1337/section/page.html?param=1&param=2#anchor' );
 *
 * // Update the anchor and regenerate url
 * url.setAnchor( 'anchor' )
 *
 * // Get a query param
 * url.getParam( 'key' )
 *
 * // Get all query params
 * url.getParam()
 * // or
 * this.queryKey
 *
 * // Add/modify a query param
 * url.setParam( 'key', value )
 *
 * // Add/modify several query param
 * url.setParam( {
 *  "key1": "value1",
 *  "key2": "value2"
 * } )
 *
 * // Remove a query param
 * url.removeParam( 'key' )
 * url.removeParam( [ 'key1', 'key2', ... ] )
 *
 * // Remove all query param
 * url.removeAll()
 */
export class UrlParser {
    /** Complete url without userInfo and anchor. Ex: https://demo.domain.com:1337/section/page.html?param=2 */
    absolute     = '';
    /** Complete url with anchor but without userInfo. Ex: https://demo.domain.com:1337/section/page.html?param=2#anchor */
    absolute2    = '';
    /** Ex: anchor */
    anchor       = '';
    /** Ex: username:password@demo.domain.com:1337 */
    authority    = '';
    /** Ex: /section/ */
    directory    = '';
    /** Ex: page.html */
    file         = '';
    /** Complete url without anchor. Ex: https://username:password@demo.domain.com:1337/section/page.html?param=2 */
    full         = '';
    /** Complete url with anchor. Ex: https://username:password@demo.domain.com:1337/section/page.html?param=2#anchor*/
    full2        = '';
    /** Ex: demo.domain.com */
    host         = '';
    location;
    /** Ex: password */
    password     = '';
    /** Ex: /section/page.html */
    path         = '';
    /** Ex: 1337 */
    port         = '';
    /** Ex: https */
    protocol     = '';
    /** Ex: param=2 */
    query        = '';
    /** Ex: { "param": "2" } */
    queryKey: { [ key: string ]: string }     = {};
    /** Ex: Url without host, credential and anchor */
    relative     = '';
    /** Ex: Url without host, credential but with anchor */
    relative2    = '';
    /** Ex: Original Url, never changed: https://username:password@demo.domain.com:1337/section/page.html?param=2#anchor */
    source       = '';
    /** Ex: username */
    user         = '';
    /** Ex: username:password */
    userInfo     = '';
    /** True if the url point to the current page with an anchor */
    isAnchor     = false;
    /** True if the url point to the current domain  */
    isSameDomain = false;


    constructor( url: string = window.location.href ) {
        this.init( url );
    }


    /*
        Rebuild the complete url
    */
    private rebuild() {
        let portToAdd, queryToAdd;

        queryToAdd = '';
        portToAdd  = '';
        const anchor     = this.anchor ? '#' + this.anchor : '';
        const queryArray: string[] = [];

        this.query = '';

        Object.keys( this.queryKey ).forEach( key => {
            queryArray.push( `${ key }=${ this.queryKey[ key ] }` );
        } );

        this.query = queryArray.length ? queryArray.join( '&' ) : '';

        queryToAdd = this.query !== '' ? `?${ this.query }` : '';

        if ( this.host === '' ) {
            portToAdd = this.location.port === '' ? '' : `:${ this.location.port }`;

            this.absolute = [
                this.location.protocol,
                '://',
                this.location.host,
                portToAdd,
                this.path,
                queryToAdd
            ].join( '' );

            this.full = [
                this.location.protocol,
                '://',
                this.location.userInfo ? `${ this.location.userInfo }@` : '',
                this.location.host,
                portToAdd,
                this.path,
                queryToAdd
            ].join( '' );
        }
        else {
            portToAdd = this.port === '' ? '' : `:${ this.port }`;

            this.absolute = [
                this.protocol,
                '://',
                this.host,
                portToAdd,
                this.path,
                queryToAdd
            ].join( '' );

            this.full = [
                this.protocol,
                '://',
                this.userInfo ? `${ this.userInfo }@` : '',
                this.host,
                portToAdd,
                this.path,
                queryToAdd
            ].join( '' );
        }

        this.full2     = [ this.full, anchor ].join( '' );
        this.absolute2 = [ this.absolute, anchor ].join( '' );
        this.relative  = [ this.path, queryToAdd ].join( '' );
        this.relative2 = [ this.relative, anchor ].join( '' );
    }


    /**
     * Init
     */
    init( url: string ) {
        let location, result;

        const parseUri = function( str: string ) {
            let i = 14;

            const o = parseUri.options;
            const m = o.parser[ o.strictMode ? 'strict' : 'loose' ].exec( str );
            const uri: { [ key: string ]: any } = {};

            if ( m ) {
                while ( i-- ) {
                    uri[ o.key[ i ] ] = m[ i ] || '';
                }
            }

            uri[ o.q.name ] = {};

            uri[ o.key[ 12 ] ].replace( o.q.parser, function( $0: string, $1: string, $2 : string) {
                if ( $1 ) {
                    return ( uri[ o.q.name ][ $1 ] = $2 );
                }
            } );

            return uri;
        }

        location = null;
        result   = null;

        parseUri.options = {
            "anchorPage": false,
            "strictMode": false,
            "key": [
                'source',
                'protocol',
                'authority',
                'userInfo',
                'user',
                'password',
                'host',
                'port',
                'relative',
                'path',
                'directory',
                'file',
                'query',
                'anchor'
            ],
            "q": {
                "name":   "queryKey",
                "parser": /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            "parser": {
                "strict": /^(?:([^:/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:/?#]*)(?::(\d*))?))?((((?:[^?#/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                "loose": /^(?:(?![^:@]+:[^:@/]*@)([^:/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#/]*\.[^?#/.]+(?:[?#]|$)))*\/?)?([^?#/]*))(?:\?([^#]*))?(?:#(.*))?)/
            }
        };

        location        = parseUri( window.location.href );
        result          = parseUri( url );
        result.location = location;

        if ( !/^(http|ftp|\/)/.test( url ) ) {
            url = result.location.directory + url;
        }

        result.isAnchor = result.anchor !== '' && result.path === result.location.path;

        result.isSameDomain =
                    result.protocol === result.location.protocol &&
                    result.host === result.location.host &&
                    result.port === result.location.port;

        Object.keys( result ).forEach( ( key: string ) => {
            this[ key ] = result[ key ];
        } );

        this.rebuild();
    }


    /**
     * Change the anchor
     *
     * @param anchor
     */
    setAnchor( anchor: string ): this {
        this.anchor = anchor;

        this.rebuild();

        return this;
    }


    /**
     * Get the value of a query param
     *
     * @param key
     *
     * @returns The parameter value or undefined
     */
    getParam( key: string ): string {
        if ( !this.queryKey || !key ) {
            return '';
        }

        return this.queryKey[ key ];
    }


    /**
     * Add/modify one or several query param
     *
     * @param keys
     * @param value
     */
    setParam( keys: string | { [ keys: string ]: string }, value?: string ): this {
        if ( !this.queryKey ) {
            this.queryKey = {};
        }

        if ( typeof keys === 'string' && typeof value !== 'undefined' ) {
            this.queryKey[ keys ] = `${ value }`;
        }
        else if ( typeof keys === 'object' ) {
            Object.keys( keys ).forEach( key => {
                this.queryKey[ key ] = `${ keys[ key ] }`;
            } );
        }

        this.rebuild();

        return this;
    }


    /**
     * Remove one or several query param
     *
     * @param keys
     */
    removeParam( keys: string | string[] ): this {
        if ( !this.queryKey ) {
            return this;
        }

        if ( typeof keys === 'string' ) {
            delete this.queryKey[ keys ];
        }
        else if ( Array.isArray( keys ) ) {
            keys.forEach( key => {
                delete this.queryKey[ key ];
            } );
        }

        this.rebuild();

        return this;
    }


    /**
     * Delete all query param
     */
    removeAll(): this {
        this.queryKey = {};

        this.rebuild();

        return this;
    }
}
