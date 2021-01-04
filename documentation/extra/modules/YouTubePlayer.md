## Youtube player

**Init**

```
import { YouTubePlayer } from '@creative-web-solution/front-library/Modules/YouTubePlayer'

ytPlayer = new YouTubePlayer(
    {
        "height":                   1920,
        "width":                    1080,
        "videoId":                  'youtube-video-id-here',
        "wrapper":                  $wrapper,

        "apiUrl":                   "//www.youtube.com/iframe_api",
        "onPlayerStateChange":      null

        "playerVars": {
            "autoplay":           0,
            "controls":           2,
            "autohide":           1,
            "modestbranding":     1,
            "showinfo":           0,
            "html5":              1,
            ... All available youtube player options
        }

    }
)
.then(
    ytPlayerInstance =>
    {
    }
);
```

**Youtube state change constants**

```
YT.PlayerState.ENDED
YT.PlayerState.PLAYING
YT.PlayerState.PAUSED
YT.PlayerState.BUFFERING
YT.PlayerState.CUED
```

**OnStateChange event callback sample:**

```
function onytplayerStateChange( newState )
{
  if ( newState.data === YT.PlayerState.ENDED )
  {
    // Code here for video ended
  }
}
```
