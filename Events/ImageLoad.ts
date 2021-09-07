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
 *
 * @param $element - DOM image to preload
 * @param manageError - If true reject the promise on error (false)
 * @param callback - Function called on image load
 *
 * @example
 * onImageLoad( $image, manageError, callback ).then( () => {} )
 *
 * // To allow event cancelation, don't chain .then() directly after onImageLoad
 * let preload = onImageLoad( $image, callback, manageError );
 * preload.then( () => {} );
 * ...
 *
 * preload.off();
 *
 * @returns Return a standard Promise + an .off() function to cancel event
 */
export function onImageLoad( $element: Element, manageError?: boolean, callback?: ( $element: Element, type: ImageLoadEventType ) => void ): ImagePromiseType {
    let _remove;

    const PROM: ImagePromiseType = new Promise( function( this: ImagePromiseType, resolve, reject ) {
        let $img;

        function onImageLoaded( e ) {
            _remove();

            $img = null;

            if ( callback ) {
                callback( $element, e.type );
            }

            if ( manageError && e.type === 'error' ) {
                reject();
            }
            else {
                resolve( [ $element, e.type ] );
            }
        }


        _remove = function() {
            if ( !$img ) {
                return;
            }
            $img.removeEventListener( 'error', onImageLoaded );
            $img.removeEventListener( 'load', onImageLoaded );
        }


        getSrc( $element ).then( src => {

            // Image already loaded
            if (
                ( hasNativePicture &&
                    src &&
                    !isDataURI(src) &&
                    ($element as HTMLImageElement).complete) ||
                ( !hasNativePicture && ($element as HTMLImageElement).complete && !isDataURI( src ) )
            ) {
                if ( callback ) {
                    callback( $element, 'complete' );
                }

                resolve( [ $element, 'complete' ] );
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
    } ) as ImagePromiseType;

    PROM.off = _remove;

    return PROM;
}


/**
 * Preload a list of images
 *
 * @param $elements - Array of images to preload
 * @param manageError - If true reject the promise on error (false)
 * @param callback - Function called on each image load ($element, eventType:string) => {}
 *
 * @example
 * onAllImagesLoad( $images, partialCallback, manageError ).then( () => {} )
 *
 * // To allow event cancelation, don't chain .then() directly after onAllImagesLoad
 * let preload = onAllImagesLoad( $images, manageError, callback );
 * preload.then( () => {} );
 * ...
 *
 * preload.off();
 *
 * @returns Return a standard Promise + an .off() function to cancel event
 */
export function onAllImagesLoad( $images: NodeList | Element[], ...args ): ImagesPromiseType {
    const promArray: ImagePromiseType[] = [];

    $images.forEach( $img => {
        promArray.push( onImageLoad( $img, ...args ) );
    } );

    const promResult: ImagesPromiseType = Promise.all( promArray ) as ImagesPromiseType;

    promResult.off = function() {
        promArray.forEach( imageLoad => {
            imageLoad.off();
        } );
    }

    return promResult;
}
