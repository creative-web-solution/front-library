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
 * @param callback - Function called on image load (`{` $element, type: string `}`) =&gt; `{}`
 * @param handleError - If true reject the promise on error
 *
 * @example
 * ```ts
 * onImageLoad( $image, callback, handleError ).then( () => {} )
 *
 * // To allow event cancelation, don't chain .then() directly after onImageLoad
 * let preload = onImageLoad( $image, callback, handleError );
 * preload.then( () => {} );
 * ...
 *
 * preload.off();
 * ```
 *
 * @returns Return a standard Promise + an .off() function to cancel event
 */
export function onImageLoad( $element: Element, callback?: ( data: FLib.Events.ImagesLoad.CallbackParam ) => void, handleError = false ): FLib.Events.ImagesLoad.PromiseLoad {
    let _remove;

    const PROM: FLib.Events.ImagesLoad.PromiseLoad = new Promise( function( resolve, reject ) {
        let $img;

        function onImageLoaded( e ) {
            _remove();

            $img = null;

            if ( callback ) {
                callback( {
                    $element,
                    "type": e.type
                } );
            }

            if ( handleError && e.type === 'error' ) {
                reject();
            }
            else {
                resolve( {
                    $element,
                    "type": e.type
                } );
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
                    callback({
                        $element,
                        "type": 'complete'
                    });
                }

                resolve({
                    $element,
                    "type": 'complete'
                });
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
    } ) as FLib.Events.ImagesLoad.PromiseLoad;

    PROM.off = _remove;

    return PROM;
}


/**
 * Preload a list of images
 *
 * @param $elements - Array of images to preload
 * @param callback - Function called on each image load (`{` $element, type:string `}`) =&gt; `{}`
 * @param handleError - If true reject the promise on error
 *
 * @example
 * ```ts
 * onAllImagesLoad( $images, partialCallback, handleError ).then( () => {} )
 *
 * // To allow event cancelation, don't chain .then() directly after onAllImagesLoad
 * let preload = onAllImagesLoad( $images, callback, handleError );
 * preload.then( () => {} );
 * ...
 *
 * preload.off();
 * ```
 *
 * @returns Return a standard Promise + an .off() function to cancel event
 */
export function onAllImagesLoad( $images: NodeList | Element[], ...args: any[] ): FLib.Events.ImagesLoad.PromisesLoad {
    const promArray: FLib.Events.ImagesLoad.PromiseLoad[] = [];

    $images.forEach( $img => {
        promArray.push( onImageLoad( $img, ...args ) );
    } );

    const promResult: FLib.Events.ImagesLoad.PromisesLoad = Promise.all( promArray ) as FLib.Events.ImagesLoad.PromisesLoad;

    promResult.off = function() {
        promArray.forEach( imageLoad => {
            imageLoad.off();
        } );
    }

    return promResult;
}
