declare namespace FLib {
    namespace YouTubePlayer {
        type Options = {
            height:               number;
            width:                number;
            videoId:              string;
            $wrapper:             HTMLElement;
            /**
             * @defaultValue //www.youtube.com/iframe_api
             */
            apiUrl:              string;
            onPlayerStateChange?: YT.PlayerEventHandler<YT.OnStateChangeEvent>;
            /**
             * @defaultValue `{ "autoplay": 0, "controls": 2, "autohide": 1, "modestbranding": 1, "showinfo": 0 }`
             */
            playerVars:          YT.PlayerVars;
        }

        type PlayerWindow = Window & typeof globalThis & {
            onYouTubeIframeAPIReady: (() => void) | null;
        }

        type PlayerWrapper = HTMLElement & {
            YTPlayer: YT.Player;
        }
    }
}
