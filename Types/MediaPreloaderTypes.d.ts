type MediaPreloaderProgressCallbackType = ( percent: number ) => void;

type VideoCanPlayType = {
    mp4:  boolean;
    webm: boolean;
    mp3:  boolean;
}

type MediaPreloaderOption = {
    $media:     HTMLVideoElement;
    onProgress: MediaPreloaderProgressCallbackType;
}
