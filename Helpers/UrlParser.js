/**
 *
 * @typedef {Object} urlParser_Object
 * @memberof UrlParser
 * @property {String} absolute - https://demo.domain.com:1337/section/page.html?param=2
 * @property {String} absolute2 - https://demo.domain.com:1337/section/page.html?param=2#anchor
 * @property {String} anchor - anchor
 * @property {String} authority - username:password@demo.domain.com:1337
 * @property {String} directory - /section/
 * @property {String} file - page.html
 * @property {String} full - https://username:password@demo.domain.com:1337/section/page.html?param=2
 * @property {String} full2 - https://username:password@demo.domain.com:1337/section/page.html?param=2#anchor
 * @property {String} host - demo.domain.com
 * @property {String} location - new UrlParser(window.location)
 * @property {String} password - password
 * @property {String} path - /section/page.html
 * @property {String} port - 1337
 * @property {String} protocol - https
 * @property {String} query - param=2
 * @property {Object} queryKey - { param: "2" }
 * @property {String} relative - Url without host, credential and anchor
 * @property {String} relative2 - Url without host, credential but with anchor
 * @property {String} source - Original Url, never change: https://username:password@demo.domain.com:1337/section/page.html?param=1&amp;param=2#anchor
 * @property {String} user - username
 * @property {String} userInfo - username:password
 * @property {Boolean} isAnchor - false
 * @property {Boolean} isSameDomain - false
 * @property {Function} setAnchor
 * @property {Function} setParam
 * @property {Function} removeParam
 * @property {Function} removeAll
 */
/**
 * Parse an URL
 * @class
 *
 * @param {String} url
 *
 * @example let url = new UrlParser( 'https://username:password@demo.domain.com:1337/section/page.html?param=1&param=2#anchor' );
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
 *
 * @returns {urlParser_Object} the parsed url
 */
export function UrlParser(url) {
    this.absolute = '';

    if ( !url ) {
        url = window.location.href;
    }


    /*
        Rebuild the complete url
    */
    function rebuild() {
        let portToAdd, queryToAdd, anchor, queryArray;

        queryToAdd = '';
        portToAdd  = '';
        anchor     = this.anchor ? '#' + this.anchor : '';
        queryArray = [];

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


    /*
    Init
    */
    function init( url, obj ) {
        let location, parseUri, result;

        parseUri = function( str ) {
            let i, m, o, uri;

            o = parseUri.options;
            m = o.parser[ o.strictMode ? 'strict' : 'loose' ].exec( str );
            uri = {};
            i = 14;

            while  (i-- ) {
                uri[ o.key[ i ] ] = m[ i ] || '';
            }

            uri[ o.q.name ] = {};

            uri[ o.key[ 12 ] ].replace( o.q.parser, function( $0, $1, $2 ) {
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

        Object.keys( result ).forEach( key => {
            obj[ key ] = result[ key ];
        } );

        rebuild.call( obj );
    }

    init( url, this );


    /**
     * Change anchor and recreate all values
     *
     * @param {String} anchor
     *
     * @returns {UrlParser}
     */
    this.setAnchor = anchor => {
        this.anchor = anchor;
        rebuild.call( this );

        return this;
    }


    /**
     * Get the value of a query param
     *
     * @param {String} [key]
     *
     * @returns {String|Object}
     */
    this.getParam = key => {
        if ( !this.queryKey ) {
            return;
        }

        if ( !key ) {
            return this.queryKey;
        }

        return this.queryKey[ key ];
    }


    /**
     * Add/modify one or several query param
     *
     * @param {String|Object} keys
     * @param {String} value
     *
     * @returns {UrlParser}
     */
    this.setParam = ( keys, value ) => {
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

        rebuild.call( this );

        return this;
    }


    /**
     * Remove one or several query param
     *
     * @param {String|String[]} keys
     *
     * @returns {UrlParser}
     */
    this.removeParam = keys => {
        if ( !this.queryKey ) {
            return;
        }

        if ( typeof keys === 'string' ) {
            delete this.queryKey[ keys ];
        }
        else if ( Array.isArray( keys ) ) {
            keys.forEach( key => {
                delete this.queryKey[ key ];
            } );
        }

        rebuild.call( this );

        return this;
    }


    /**
     * Delete all query param
     *
     * @returns {UrlParser}
     */
    this.removeAll = () => {
        this.queryKey = {};

        rebuild.call( this );

        return this;
    }
}
