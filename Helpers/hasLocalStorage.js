let hasStorage;

/**
 * Check if the localstorage is available.
 *
 * @example hasStorage = hasLocalStorage();
 *
 * @returns {Boolean}
 */
export function hasLocalStorage() {
    if ( typeof hasStorage !== 'undefined' ) {
        return hasStorage;
    }

    hasStorage                      = ( 'localStorage' in window );
    const STORAGE_TEST_KEY                = [ '__AVLBL__', Math.round( Math.random() * 100000000 ) ].join( '' );

    if ( !hasStorage ) {
        return false;
    }

    try {
        localStorage.setItem( STORAGE_TEST_KEY, 'available' );
        localStorage.removeItem( STORAGE_TEST_KEY );
        hasStorage                  = true;
    }
    catch( e ) {
        // Local storage not available (maybe browsing in private mode)
        hasStorage                  = false;
    }

    return hasStorage;
}
