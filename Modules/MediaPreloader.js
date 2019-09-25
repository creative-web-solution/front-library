/**
 * @callback mediaPreloader_Callback
 * @memberof MediaPreloader
 *
 * @param {Number} percent
 */

let videoCanPlayType, videoTemp, audioTemp, CHECK_DELAY;

videoTemp = document.createElement( 'VIDEO' );
audioTemp = document.createElement( 'AUDIO' );

videoCanPlayType = {
    "mp4":
        videoTemp.canPlayType( 'video/mp4' ) === 'probably' ||
        videoTemp.canPlayType( 'video/mp4' ) === 'maybe',
    "webm":
        videoTemp.canPlayType( 'video/webm' ) === 'probably' ||
        videoTemp.canPlayType( 'video/webm' ) === 'maybe',
    "mp3":
        audioTemp.canPlayType( 'video/mp3' ) === 'probably' ||
        audioTemp.canPlayType( 'video/mp3' ) === 'maybe'
};

videoTemp = null;
audioTemp = null;

CHECK_DELAY = 200; // ms

/**
 * Preload audio and video
 * @class MediaPreloader
 *
 * @example let mp = MediaPreloader(
 *             {
 *                 "$media": $myVideo,
 *                 "onProgress": percent => {
 *                  }
 *             }
 *         )
 *         .then( handler )
 *         .catch( handler );
 *
 * // Must start the load manually
 * mp.startLoad();
 *
 * // Browser capability
 * allowMP4 = MediaPreloader.videoCanPlayType.mp4;
 * allowWEBM = MediaPreloader.videoCanPlayType.WEBM;
 * allowMP3 = MediaPreloader.videoCanPlayType.mp3;
 *
 * MediaPreloader.getUrl( '/path/my-video' ) // => '/path/my-video.mp4' if the browser use mp4
 *
 * @param {Object} options
 * @param {HTMLElement} options.$media
 * @param {mediaPreloader_Callback} [options.onProgress]
*/
export function MediaPreloader( options ) {
    let lastBuffer,
        idleCount,
        idleMaxCount,
        $media,
        progress,
        preloadPromise,
        promiseVideoPlayPause;

    const SELF = this;
    const EVENTS_NAME = [
        'loadedmetadata',
        'canplaythrough',
        'error',
        'pause',
        'play'
    ];

    idleMaxCount = 4;
    $media = options.$media;
    progress = options.onProgress;

    preloadPromise = new Promise( function( resolve, reject ) {
        if ( !$media ) {
            reject();
        }

        function removeEvents() {
            for (
                let index = 0, len = EVENTS_NAME.length;
                index < len;
                ++index
            ) {
                $media.removeEventListener( EVENTS_NAME[ index ], capture );
            }
        }


        // Check the prgression every CHECK_DELAY ms
        function checkload() {
            let percent, buffer, bufferTotal;

            if ( $media.buffered.length ) {
                buffer = Math.floor( $media.buffered.end( 0 ) );
                bufferTotal = Math.floor( $media.duration );

                percent = Math.floor( buffer / bufferTotal * 100 );

                if ( progress ) {
                    progress( percent );
                }

                if ( buffer >= bufferTotal ) {
                    removeEvents();
                    $media.currentTime = 0;

                    if ( promiseVideoPlayPause ) {
                        promiseVideoPlayPause.then( resolve );
                    }
                    else {
                        resolve();
                    }

                    return;
                }
                else if ( lastBuffer === buffer ) {
                    // Chrome stop loading before the end, so play() pause() restart the loading
                    idleCount++;

                    if ( idleCount >= idleMaxCount ) {
                        // try/catch => fix for Chrome 50: "DOMException: The play() request was interrupted by a call to pause()."
                        promiseVideoPlayPause = $media.play();

                        if (
                            promiseVideoPlayPause &&
                            promiseVideoPlayPause.then
                        ) {
                            promiseVideoPlayPause.then( function() {
                                $media.pause();
                            } );
                        }
                        else {
                            $media.pause();
                        }

                        idleCount = 0;
                    }
                }
                else {
                    idleCount = 0;
                }

                lastBuffer = buffer;
            }

            setTimeout( function() {
                checkload.call( SELF );
            }, CHECK_DELAY );
        }


        function metadataLoaded() {
            let isMuted;

            isMuted = $media.muted;
            $media.muted = true;

            // try/catch => fix for Chrome 50: "DOMException: The play() request was interrupted by a call to pause()."
            promiseVideoPlayPause = $media.play();

            if ( promiseVideoPlayPause && promiseVideoPlayPause.then ) {
                promiseVideoPlayPause.then( function() {
                    $media.pause();
                    $media.muted = isMuted;
                    checkload.call( SELF );
                });
            }
            else {
                $media.pause();
                $media.muted = isMuted;
                checkload.call( SELF );
            }
        }


        function videoError( e ) {
            reject( e );
            console.log( 'Video/audio ' + SELF.src + ' not loaded!' );
        }


        function canplaythroughHandler() {}


        // Event capture
        function capture( e ) {
            switch (e.type) {
                case 'canplaythrough':
                    canplaythroughHandler.call( SELF, e );
                    break
                case 'loadedmetadata':
                    metadataLoaded.call( SELF, e );
                    break
                case 'error':
                    videoError.call( SELF, e );
                    break
            }
        }

        // Events bindings
        for (
            let index = 0, len = EVENTS_NAME.length;
            index < len;
            ++index
        ) {
            $media.addEventListener( EVENTS_NAME[ index ], capture, false );
        }
    } )

    /**
     * Start the preload of the media
     *
     * @function startLoad
     * @memberof MediaPreloader
     * @instance
     * @returns {Promise}
     */
    this.startLoad = function() {
        $media.preload = 'auto';

        $media.load();

        return preloadPromise;
    };
}


/**
 * @typedef MediaPreloader_PlayType
 * @memberof MediaPreloader
 * @property {Boolean} mp4
 * @property {Boolean} webm
 * @property {Boolean} mp3
 */
/**
 * Browser play capabilities
 *
 * @member videoCanPlayType
 * @memberof MediaPreloader
 * @static
 *
 * @type {MediaPreloader_PlayType}
 */
MediaPreloader.videoCanPlayType = videoCanPlayType;


/**
 * Add the correct extention depending on the browser capability
 *
 * @function getUrl
 * @memberof MediaPreloader
 * @static
 *
 * @param {String} url - File name without extention
 *
 * @returns {String}
 */
MediaPreloader.getUrl = url => {
    if ( videoCanPlayType.mp4 ) {
        return url + '.mp4';
    }
    else if ( videoCanPlayType.webm ) {
        return url + '.webm';
    }

    return url;
};
