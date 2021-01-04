import { defer } from '@creative-web-solution/front-library/Helpers/defer';

/**
 * @callback onImageLoad_Callback
 * @memberof onImageLoad
 * @description Called when the orientation of the device change
 * @param {HTMLElement} $element - Loaded element
 * @param {string} eventType - Event type: load | error | complete
 *
*/


const hasNativePicture = 'HTMLPictureElement' in window;


// Safari take time to update currentSrc property
function getCurrentSrc( $element, callback ) {
    if ( $element.currentSrc ) {
        callback( $element.currentSrc );
        return;
    }

    setTimeout( () => {
        getCurrentSrc( $element, callback );
    }, 50 );
}


function getSrc( $element ) {
    return new Promise( resolve => {
        // Responsive image on browser that natively support it
        if (
            (
                $element.hasAttribute( 'srcset' ) ||
                $element.parentNode && $element.parentNode.nodeName === 'PICTURE'
            ) &&
            hasNativePicture
        ) {
            getCurrentSrc( $element, src => {
                resolve( src );
            } );
        }
        else {
            resolve( $element.src || $element.getAttribute( 'xlink:href' ) );
        }
    });
}


function isDataURI( src ) {
    return src.indexOf( 'data:' ) > -1;
}


/**
 * Preload an image
 * @function onImageLoad
 *
 * @param {HTMLElement} $element - DOM image to preload
 * @param {Boolean} manageError - If true reject the promise on error (false)
 * @param {onImageLoad_Callback} callback - Function called on image load
 *
 * @example  onImageLoad( $image, manageError, callback ).then( () => {} )
 *
 * // To allow event cancelation, don't chain .then() directly after onImageLoad
 * let preload = onImageLoad( $image, callback, manageError );
 * preload.then( () => {} );
 * ...
 *
 * preload.off();
 *
 * @returns {Promise} - Return a standard Promise + an .off() function to cancel event
 */
export function onImageLoad( $element, manageError, callback ) {
    let $img;
    let prom = defer();

    function onImageLoaded( e ) {
        remove();

        $img = null;

        if ( callback ) {
            callback( $element, e.type );
        }

        if ( manageError && e.type === 'error' ) {
            prom.reject();
        }
        else {
            prom.resolve( [$element, e.type] );
        }
    }

    function remove() {
        if (!$img) {
            return;
        }
        $img.removeEventListener('error', onImageLoaded);
        $img.removeEventListener('load', onImageLoaded);
    }

    getSrc( $element ).then( src => {

        // Image already loaded
        if (
            ( hasNativePicture &&
                src &&
                !isDataURI(src) &&
                $element.complete) ||
            ( !hasNativePicture && $element.complete && !isDataURI( src ) )
        ) {
            if ( callback ) {
                callback( $element, 'complete' );
            }

            prom.resolve( [ $element, 'complete' ] );
            return;
        }

        if ( !src || isDataURI( src ) ) {
            $img = $element;
        }
        else {
            $img = document.createElement( 'IMG' );
            $img.src = src;
        }

        $img.addEventListener( 'error', onImageLoaded );
        $img.addEventListener( 'load', onImageLoaded );
    } );


    prom.off = remove;

    return prom;
}


/**
 * Preload a list of images
 * @function onAllImagesLoad
 *
 * @param {HTMLElement[]} $elements - Array of images to preload
 * @param {Boolean} manageError - If true reject the promise on error (false)
 * @param {onImageLoad_Callback} callback - Function called on each image load ($element, eventType:string) => {}
 *
 * @example onAllImagesLoad( $images, partialCallback, manageError ).then( () => {} )
 *
 * // To allow event cancelation, don't chain .then() directly after onAllImagesLoad
 * let preload = onAllImagesLoad( $images, manageError, callback );
 * preload.then( () => {} );
 * ...
 *
 * preload.off();
 *
 * @returns {Promise} - Return a standard Promise + an .off() function to cancel event
 */
export function onAllImagesLoad( $images, ...args ) {
    let promArray, promResult;

    promArray = [];

    $images.forEach( $img => {
        promArray.push( onImageLoad( $img, ...args ) );
    } );

    promResult = Promise.all(promArray);

    promResult.off = function() {
        promArray.forEach( imageLoad => {
            imageLoad.off();
        } );
    }

    return promResult;
}
