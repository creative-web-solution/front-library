import { extend } from '../Helpers/Extend';


let ytAPILoadingPromise;


const defaultOptions: Partial<FLib.YouTubePlayer.Options> = {
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
 * ```ts
 * let YouTubePlayer = new YouTubePlayer( {
 *         "height": 1920,
 *         "width": 1080,
 *         "videoId": "youtube-video-id-here",
 *         "$wrapper": $wrapper,
 *         "apiUrl": "//www.youtube.com/iframe_api",
 *         "onPlayerStateChange": ( newState ) =&gt; {
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
 * YouTubePlayer.load().then( ytPlayerInstance =&gt; {} );
 * ```
*/
export default class YouTubePlayer {

    #options: FLib.YouTubePlayer.Options;


    constructor( userOptions: Partial<FLib.YouTubePlayer.Options> ) {
        this.#options = extend( defaultOptions, userOptions );

        if ( !this.#options.$wrapper ) {
            throw 'YTPlayer: wrapper is missing';
        }
    }


    #loadYouTubeAPI = (): Promise<void> => {
        let _resolve;

        if ( ytAPILoadingPromise ) {
            return ytAPILoadingPromise;
        }

        if ( window.YT ) {
            return ytAPILoadingPromise = Promise.resolve();
        }

        ytAPILoadingPromise = new Promise( function( resolve ) {
            _resolve = resolve;
        } );

        (window as FLib.YouTubePlayer.PlayerWindow).onYouTubeIframeAPIReady = function() {
            _resolve();

            (window as FLib.YouTubePlayer.PlayerWindow).onYouTubeIframeAPIReady = null;
        }

        const tag            = document.createElement( 'script' );
        tag.src              = this.#options.apiUrl;
        const firstScriptTag = document.getElementsByTagName( 'script' )[ 0 ] as HTMLScriptElement;

        firstScriptTag.parentNode?.insertBefore( tag, firstScriptTag );

        return ytAPILoadingPromise;
    }


    #initPlayer = ( $wrapper: FLib.YouTubePlayer.PlayerWrapper ): Promise<YT.Player> => {
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
        return this.#loadYouTubeAPI().then( () => {
            return this.#initPlayer( this.#options.$wrapper as FLib.YouTubePlayer.PlayerWrapper );
        } );
    }
}
