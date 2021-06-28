type YouTubePlayerOptionsType = {
    height:               number;
    width:                number;
    videoId:              string;
    $wrapper:             HTMLElement;
    /**
     * @default //www.youtube.com/iframe_api
     */
    apiUrl?:              string;
    onPlayerStateChange?: ( e: YT.PlayerEvent ) => void;
    /**
     * @default { "autoplay": 0, "controls": 2, "autohide": 1, "modestbranding": 1, "showinfo": 0 }
     */
    playerVars?:          YT.PlayerVars;
}

type YouTubePlayerWindowType = Window & typeof globalThis & {
    onYouTubeIframeAPIReady: (() => void) | null;
}

type YouTubePlayerWrapper = HTMLElement & {
    YTPlayer: YT.Player;
}
