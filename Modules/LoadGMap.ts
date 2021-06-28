let gMapLoadingPromise;


/**
 * Google Map loader
 *
 * @param apiUrl
 * @param callbackFunctionName
 *
 * @example
 * loadGMap( urlAPI ).then(
 *      googleAPI =>
 *      {
 *          new googleAPI.maps.Map( $container, googleMapOptions );
 *      }
 *  );
 *
 * @returns {Promise} - a promise resolved when the API is loaded
 */
export default function loadGMap( apiUrl: string, callbackFunctionName = 'initworldMap' ): Promise<typeof window.google> {
    if ( gMapLoadingPromise ) {
        return gMapLoadingPromise;
    }

    if ( window.google ) {
        return gMapLoadingPromise = Promise.resolve( window.google );
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

        script      = document.createElement( 'script' );
        script.type = 'text/javascript';
        script.src  = apiUrl;

        document.body.appendChild( script );
    });

    return gMapLoadingPromise;
}

