import { extend } from 'front-library/Helpers/Extend';
import { defer } from 'front-library/Helpers/defer';

/**
 * Youtube Player loader
 * @class
 *
 * @param {Object} userOptions
 * @property {number} [userOptions.height]
 * @property {number} [userOptions.width]
 * @property {string} [userOptions.videoId]
 * @property {HTMLElement} [userOptions.$wrapper]
 * @property {string} [userOptions.apiUrl=//www.youtube.com/iframe_api]
 * @property {Function} [userOptions.onPlayerStateChange]
 * @property {YTPlayer_PlayerVars} [userOptions.playerVars] - Google API parameters. You can add all variable handle by the API.
 * @property {number} [userOptions.playerVars.autoplay=0]
 * @property {number} [userOptions.playerVars.controls=2]
 * @property {number} [userOptions.playerVars.autohide=1]
 * @property {number} [userOptions.playerVars.modestbranding=1]
 * @property {number} [userOptions.playerVars.showinfo=0]
 * @property {number} [userOptions.playerVars.html5=1]
 *
 * @see extra/modules/youtube.md
 *
 * @example  let YouTubePlayer = new YouTubePlayer( {
 *         "height": 1920,
 *         "width": 1080,
 *         "videoId": 'youtube-video-id-here',
 *         "wrapper": $wrapper,
 *         "apiUrl": "//www.youtube.com/iframe_api",
 *         "onPlayerStateChange": ( newState ) => {
 *             if ( newState.data === YT.PlayerState.ENDED ) {
 *                  // Code here for video ended
 *             }
 *         },
 *         "playerVars": {
 *             "autoplay": 0,
 *             "controls": 2,
 *             "autohide": 1,
 *             "modestbranding": 1,
 *             "showinfo": 0,
 *             "html5": 1,
 *             // ... All available youtube player options
 *         }
 *     }
 * )
 * .then( ytPlayerInstance => {} );
 *
 * @returns {Promise}
 */
let YouTubePlayer;

{
    let ytAPILoadingPromise, defaultOptions

    defaultOptions = {
        height: 0,
        width: 0,
        videoId: 0,
        $wrapper: null,

        apiUrl: '//www.youtube.com/iframe_api',
        onPlayerStateChange: null,

        playerVars: {
            autoplay: 0,
            controls: 2,
            autohide: 1,
            modestbranding: 1,
            showinfo: 0,
            html5: 1
        }
    }

    YouTubePlayer = function(userOptions = {}) {
        let options = extend(defaultOptions, userOptions)

        if (!options.$wrapper) {
            throw 'YTPlayer: wrapper is missing'
        }

        function loadYouTubeAPI() {
            let tag, firstScriptTag

            if (window.YT) {
                ytAPILoadingPromise = Promise.resolve()
            }

            if (ytAPILoadingPromise) {
                return ytAPILoadingPromise
            }

            ytAPILoadingPromise = defer()

            window.onYouTubeIframeAPIReady = function() {
                ytAPILoadingPromise.resolve()

                window.onYouTubeIframeAPIReady = null
            }

            tag = document.createElement('script')
            tag.src = options.apiUrl
            firstScriptTag = document.getElementsByTagName('script')[0]

            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

            return ytAPILoadingPromise
        }

        function initPlayer($mediaPlayer) {
            let player, deferred

            deferred = defer()

            player = new window.YT.Player($mediaPlayer, {
                height: options.height,
                width: options.width,
                videoId: options.videoId,

                playerVars: options.playerVars
            })

            if (options.onPlayerStateChange) {
                player.addEventListener(
                    'onStateChange',
                    options.onPlayerStateChange
                )
            }

            $mediaPlayer.YTPlayer = player

            window.requestAnimationFrame(() => deferred.resolve(player))

            return deferred
        }

        // Init
        return loadYouTubeAPI().then(() => {
            return initPlayer(options.$wrapper)
        })
    }
}

export { YouTubePlayer }
