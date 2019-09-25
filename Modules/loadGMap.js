let gMapLoadingPromise;


/**
 * Google Map loader
 *
 * @function
 * @param {String} apiUrl
 * @param {String} [callbackFunctionName=initworldMap]
 *
 * @example loadGMap( urlAPI ).then(
 *      googleAPI =>
 *      {
 *          new googleAPI.maps.Map( $container, googleMapOptions );
 *      }
 *  );
 *
 * @returns {Promise} - a promise resolved when the API is loaded
 */
export function loadGMap( apiUrl, callbackFunctionName = 'initworldMap' ) {
    if ( window.google ) {
        gMapLoadingPromise = Promise.resolve( window.google );
    }

    if ( gMapLoadingPromise ) {
        return gMapLoadingPromise;
    }

    apiUrl = [
        apiUrl,
        apiUrl.indexOf( '?' ) > -1 ? '&' : '?',
        'callback=',
        callbackFunctionName
    ].join( '' );


    gMapLoadingPromise = new Promise( function( resolve ) {
        let script;

        window[ callbackFunctionName ] = function() {
            resolve( window.google );
        };

        script = document.createElement( 'script' );
        script.type = 'text/javascript';
        script.src = apiUrl;

        document.body.appendChild( script );
    })

    return gMapLoadingPromise;
}

