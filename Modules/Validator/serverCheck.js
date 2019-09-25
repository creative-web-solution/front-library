import { defer } from 'front-library/Helpers/defer';
import { createState, addValidator } from 'front-library/Modules/Validator';

/**
 * Server validation
 *
 * data-servercheck="url_to_call.json"
 * data-servercheck-method="get|post"
 *
 * Return JSON format:
 * {
 * 		"isValid": true|false
 * }
 *
 * Validator parameters:
 * {
 * 		"beforeCall": function( $input, value ),
 * 		"afterCall": function( $input, value ),
 * 		"normalize": fuction( response ){ return { "isValid": true|false } }
 * 		"onFail": function( $input, value ),
 * }
 */
addValidator(
    'servercheck',
    '[data-servercheck]',
    true,
    ( $input, value, options = {} ) => {
        let paramName, prom, url, method, data, myHeaders;

        let { beforeCall, afterCall, normalize, onFail } = options;

        if ( !( "AbortController" in window ) ) {
            throw 'This plugin uses fecth and AbortController. You may need to add a polyfill for this browser.';
        }

        prom = defer();
        paramName = $input.getAttribute( 'name' );
        url = $input.getAttribute( 'data-servercheck' );
        method = $input.getAttribute( 'data-servercheck-method' ) || 'GET';
        method = method.toUpperCase();

        data = `${ paramName }=${ value }`;

        if ( method === 'GET' ) {
            url = [ url, url.indexOf('?') > -1 ? '&' : '?', data ].join( '' );
        }

        // Helper to create state
        function state( isValid ) {
            return createState(
                $input,
                value,
                isValid,
                'servercheck'
            );
        }

        if ( beforeCall ) {
            beforeCall( $input, value );
        }

        myHeaders = new Headers();
        myHeaders.append( 'X-Requested-With', 'XMLHttpRequest' );

        fetch(
            url,
            {
                method,
                "body": method !== 'GET' ? data : undefined,
                "headers": myHeaders
            }
        )
        .then( response => {
            if ( response.status >= 200 && response.status < 300 ) {
                return response;
            }
            else {
                let error = new Error( response.statusText );
                error.response = response;
                throw error;
            }
        } )
        .then( response => {
            return response.json();
        } )
        .then( response => {
            if ( normalize ) {
                response = normalize( $input, value );
            }
            prom.resolve( state( response.isValid ) );
        } )
        .catch( err => {
            if ( onFail ) {
                onFail( $input, value, err );
            }
            prom.resolve( state( true ) );
        } )
        .finally( () => {
            if ( afterCall ) {
                afterCall( $input, value );
            }
        } );

        return prom;
    }
)
