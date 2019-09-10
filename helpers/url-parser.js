/**
 *
 * @typedef {object} urlParser_Object
 * @memberof UrlParser
 * @property {string} absolute - https://demo.domain.com:1337/section/page.html?param=2
 * @property {string} absolute2 - https://demo.domain.com:1337/section/page.html?param=2#anchor
 * @property {string} anchor - anchor
 * @property {string} authority - username:password@demo.domain.com:1337
 * @property {string} directory - /section/
 * @property {string} file - page.html
 * @property {string} full - https://username:password@demo.domain.com:1337/section/page.html?param=2
 * @property {string} full2 - https://username:password@demo.domain.com:1337/section/page.html?param=2#anchor
 * @property {string} host - demo.domain.com
 * @property {string} location - new UrlParser(window.location)
 * @property {string} password - password
 * @property {string} path - /section/page.html
 * @property {string} port - 1337
 * @property {string} protocol - https
 * @property {string} query - param=2
 * @property {object} queryKey - { param: "2" }
 * @property {string} relative - Url without host, credential and anchor
 * @property {string} relative2 - Url without host, credential but with anchor
 * @property {string} source - Original Url, never change: https://username:password@demo.domain.com:1337/section/page.html?param=1&amp;param=2#anchor
 * @property {string} user - username
 * @property {string} userInfo - username:password
 * @property {boolean} isAnchor - false
 * @property {boolean} isSameDomain - false
 * @property {Function} setAnchor
 * @property {Function} setParam
 * @property {Function} removeParam
 * @property {Function} removeAll
 */
/**
 * Parse an URL
 * @class
 *
 * @param {string} url
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
    this.absolute = ''

    if (!url) {
        url = window.location.href
    }

    /*
        Rebuild the complete url
    */
    function rebuild() {
        let key, portToAdd, queryToAdd, anchor

        queryToAdd = ''
        portToAdd = ''
        this.query = ''
        anchor = this.anchor ? '#' + this.anchor : ''

        for (key in this.queryKey) {
            if (Object.prototype.hasOwnProperty.call( this.queryKey, key)) {
                this.query += key + '=' + this.queryKey[key] + '&'
            }
        }

        if (this.query.length > 1) {
            this.query = this.query.substr(0, this.query.length - 1)
        }

        queryToAdd = this.query !== '' ? '?' + this.query : ''

        if (this.host === '') {
            portToAdd =
                this.location.port === '' ? '' : ':' + this.location.port
            this.absolute = [
                this.location.protocol,
                '://',
                this.location.host,
                portToAdd,
                this.path,
                queryToAdd
            ].join('')
            this.full = [
                this.location.protocol,
                '://',
                this.location.userInfo ? this.location.userInfo + '@' : '',
                this.location.host,
                portToAdd,
                this.path,
                queryToAdd
            ].join('')
        } else {
            portToAdd = this.port === '' ? '' : ':' + this.port
            this.absolute = [
                this.protocol,
                '://',
                this.host,
                portToAdd,
                this.path,
                queryToAdd
            ].join('')
            this.full = [
                this.protocol,
                '://',
                this.userInfo ? this.userInfo + '@' : '',
                this.host,
                portToAdd,
                this.path,
                queryToAdd
            ].join('')
        }

        this.full2 = [this.full, anchor].join('')
        this.absolute2 = [this.absolute, anchor].join('')
        this.relative = [this.path, queryToAdd].join('')
        this.relative2 = [this.relative, anchor].join('')
    }

    /*
    Init
    */
    ;(function(url, obj) {
        let key, location, parseUri, result

        parseUri = function(str) {
            let i, m, o, uri

            o = parseUri.options
            m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str)
            uri = {}
            i = 14

            while (i--) {
                uri[o.key[i]] = m[i] || ''
            }

            uri[o.q.name] = {}

            uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
                if ($1) {
                    return (uri[o.q.name][$1] = $2)
                }
            })
            return uri
        }

        location = null
        result = null

        parseUri.options = {
            anchorPage: false,
            strictMode: false,
            key: [
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
            q: {
                name: 'queryKey',
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            parser: {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
            }
        }

        location = parseUri(window.location.href)
        result = parseUri(url)
        result.location = location

        if (!/^(http|ftp|\/)/.test(url)) {
            url = result.location.directory + url
        }

        result.isAnchor =
            result.anchor !== '' && result.path === result.location.path

        result.isSameDomain =
            result.protocol === result.location.protocol &&
            result.host === result.location.host &&
            result.port === result.location.port

        for (key in result) {
            if (Object.prototype.hasOwnProperty.call( result, key)) {
                obj[key] = result[key]
            }
        }

        rebuild.call(obj)
    })(url, this)

    /**
     * Change anchor and recreate all values
     *
     * @param {string} anchor
     *
     * @returns {object}
     */
    this.setAnchor = anchor => {
        this.anchor = anchor
        rebuild.call(this)

        return this
    }

    /**
     * get the value of a query param
     *
     * @param {string} [key]
     *
     * @returns {string|object}
     */
    this.getParam = key => {
        if (!this.queryKey) {
            return;
        }

        if (!key) {
            return this.queryKey;
        }

        return this.queryKey[key];
    }

    /**
     * Add/modify one or several query param
     *
     * @param {(string|object)} keys
     * @param {string} value
     *
     * @returns {object}
     */
    this.setParam = (keys, value) => {
        if (!this.queryKey) {
            this.queryKey = {}
        }

        if (typeof keys === 'string' && typeof value !== 'undefined') {
            this.queryKey[keys] = '' + value
        } else if (typeof keys === 'object') {
            for (let key in keys) {
                if (Object.prototype.hasOwnProperty.call(keys, key)) {
                    this.queryKey[key] = '' + keys[key]
                }
            }
        }

        rebuild.call(this)

        return this
    }

    /**
     * Remove one or several query param
     *
     * @param {(string|string[])} keys
     *
     * @returns {object}
     */
    this.removeParam = keys => {
        if (!this.queryKey) {
            return
        }

        if (typeof keys === 'string') {
            if (this.queryKey[keys]) {
                delete this.queryKey[keys]
            }
        } else if (Object.prototype.toString.call(keys) === '[object Array]') {
            let i = 0

            while (i < keys.length) {
                if (this.queryKey[keys[i]]) {
                    delete this.queryKey[keys[i]]
                }

                i++
            }
        }

        rebuild.call(this)

        return this
    }

    /**
     * Delete all query param
     *
     * @returns {object}
     */
    this.removeAll = () => {
        this.queryKey = {}

        rebuild.call(this)

        return this
    }
}
