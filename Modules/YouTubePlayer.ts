import { extend } from '../Helpers/Extend';


let ytAPILoadingPromise;


const defaultOptions = {
    "apiUrl": "//www.youtube.com/iframe_api",
    "playerVars": {
        "autoplay": 0,
        "controls": 2,
        "autohide": 1,
        "modestbranding": 1,
        "showinfo": 0
    }
};


/**
 * Youtube Player loader
 *
 * @see extra/modules/youtube.md
 *
 * @example
 * let YouTubePlayer = new YouTubePlayer( {
 *         "height": 1920,
 *         "width": 1080,
 *         "videoId": "youtube-video-id-here",
 *         "$wrapper": $wrapper,
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
 *             // ... All available youtube player options
 *         }
 *     }
 * );
 *
 * YouTubePlayer.load().then( ytPlayerInstance => {} );
*/
export default class YouTubePlayer {

    #options: YouTubePlayerOptionsType;


    constructor( userOptions: YouTubePlayerOptionsType ) {
        this.#options = extend( defaultOptions, userOptions );

        if ( !this.#options.$wrapper ) {
            throw 'YTPlayer: wrapper is missing';
        }
    }


    private loadYouTubeAPI() {
        let tag, firstScriptTag, _resolve;

        if ( ytAPILoadingPromise ) {
            return ytAPILoadingPromise;
        }

        if ( window.YT ) {
            return ytAPILoadingPromise = Promise.resolve();
        }

        ytAPILoadingPromise = new Promise( function( resolve ) {
            _resolve = resolve;
        } );

        (window as YouTubePlayerWindowType).onYouTubeIframeAPIReady = function() {
            _resolve();

            (window as YouTubePlayerWindowType).onYouTubeIframeAPIReady = null;
        }

        tag            = document.createElement( 'script' );
        tag.src        = this.#options.apiUrl;
        firstScriptTag = document.getElementsByTagName( 'script' )[ 0 ];

        firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );

        return ytAPILoadingPromise;
    }


    private initPlayer( $wrapper: YouTubePlayerWrapper ) {
        let _resolve;

        const promise = new Promise( function( resolve ) {
            _resolve = resolve;
        } ) as Promise<YT.Player>;

        const player: YT.Player = new window.YT.Player( $wrapper, {
            "height":     this.#options.height,
            "width":      this.#options.width,
            "videoId":    this.#options.videoId,

            "playerVars": this.#options.playerVars
        } );

        if ( this.#options.onPlayerStateChange ) {
            player.addEventListener(
                'onStateChange',
                this.#options.onPlayerStateChange
            );
        }

        $wrapper.YTPlayer = player;

        window.requestAnimationFrame( () => _resolve( player ) );

        return promise;
    }


    /**
     *
     * @returns
     */
    load(): Promise<YT.Player> {
        return this.loadYouTubeAPI().then( () => {
            return this.initPlayer( this.#options.$wrapper as YouTubePlayerWrapper );
        } );
    }
}
