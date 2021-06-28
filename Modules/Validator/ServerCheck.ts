import { addValidator } from './index';


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
 * 		"normalize": fuction( response ){ return { "isValid": true|false } },
 * 		"onFail": function( $input, value ),
 * 		"allowLiveValidation": true|false,
 * }
 */
addValidator(
    'servercheck',
    '[data-servercheck]',
    true,
    ( $input, value, isLiveValidation, options = {} ) => {

        return new Promise<ValidatorValidationState>( resolve => {
            let paramName, url, method, data, myHeaders;

            let { beforeCall, afterCall, normalize, onFail } = options;

            if ( !( "AbortController" in window ) ) {
                throw 'This plugin uses fecth and AbortController. You may need to add a polyfill for this browser.';
            }


            if ( isLiveValidation && !options.allowLiveValidation ) {
                return resolve( {
                    $input,
                    value,
                    "isValid": true,
                    "label":  "servercheck",
                    isLiveValidation
                 } );
            }

            paramName = $input.getAttribute( 'name' );
            url = $input.getAttribute( 'data-servercheck' );
            method = $input.getAttribute( 'data-servercheck-method' ) || 'GET';
            method = method.toUpperCase();

            data = `${ paramName }=${ value }`;

            if ( method === 'GET' ) {
                url = [ url, url.indexOf('?') > -1 ? '&' : '?', data ].join( '' );
            }

            // Helper to create state
            function state( isValid ): ValidatorValidationState {
                return {
                    $input,
                    value,
                    isValid,
                    "label": "servercheck",
                    isLiveValidation
                };
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
                    /** @ts-expect-error */
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
                resolve( state( response.isValid ) );
            } )
            .catch( err => {
                if ( onFail ) {
                    onFail( $input, value, err );
                }
                resolve( state( true ) );
            } )
            .finally( () => {
                if ( afterCall ) {
                    afterCall( $input, value );
                }
            } );
        } );
    }
)
