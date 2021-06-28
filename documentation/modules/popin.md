## Popin light plugin

### Popin options

Same options are available on Popin and PopinController.

```js
{
    "modal":                            false,
    "marginHeight":                     20,
    "autoResize":                       false,
    "errorMessage":                     "Error while loading...",
    "enableKeyboard":                   true,
    "onOpen": $popin =>
    {
        console.log( 'Open popin: ', $popin );
    },
    "onClose": $popin =>
    {
        console.log( 'Close popin: ', $popin );
    },
    "onLoad": $popin =>
    {
        return Promise.resolve();
    },
    "setLinkResponseType": ( url, $link ) =>
    {
        return 'html';
    },
    "setFormResponseType": $form =>
    {
        return 'html';
    },
    "checkValidity": $form =>
    {
        return true;
    },
    "normalize": ( body, response, isHttpError ) =>
    {
        return {
            "success":    true,
            "data":       body
        };
    },
    "autoHandleAjaxError": true,
    "templates": {
        "popinLoader":                  "<div class=\"popin-loader\"></div>",
        "popin":                        "<div class=\"popin\"><div class=\"popin-content\"></div></div>",
        "bgLayer":                      "<div class=\"bg-popin\"></div>",
        "errorMessage":                 "<div class=\"error\"><%= message %></div>"
    },
    "selectors": {
        "popin":                        ".popin",
        "popinContent":                 ".popin-content",
        "links":                        "a[data-popin]",
        "forms":                        "form[data-popin]",
        "btClosePopin":                 "button[data-close-popin]",
        "openOnLoadAttribute":          "data-onload-popin"
    },
    "animations": {
        "openBg": $bg =>
        {
            $bg.style.display = 'block';
            return Promise.resolve();
        },
        "closeBg": $bg =>
        {
            $bg.style.display = 'none';
            return Promise.resolve();
        },
        "initOpenPopin": $popin =>
        {
            $popin.style.display = 'block';
            $popin.style.opacity = 0;
            return Promise.resolve();
        },
        "openPopin": $popin =>
        {
            $popin.style.opacity = 1;
            return Promise.resolve();
        },
        "closePopin": $popin =>
        {
            $popin.style.display = 'none';
            return Promise.resolve();
        },
        "openLoader": $loader =>
        {
            $loader.style.display = 'block';
            return Promise.resolve();
        },
        "closeLoader": $loader =>
        {
            $loader.style.display = 'none';
            return Promise.resolve();
        }
    }
}
```


### Popin API

Same API is available on Popin and PopinController.

```js
popin.load( 'my-url.html', data = {} ); // data is optional. It can contain { method, type, data } used for ajax call.
popin.loadForm( $form );
popin.loadLink( $link );
popin.set( '<div>...</div>', openFirst = true ); // openFirst => if true, open the popin THEN set the content.
popin.clear();
popin.open();
popin.close();
popin.destroy();
```

### Simple popin

Handle one popin only with the API.

```js
import Popin from '@creative-web-solution/front-library/Modules/Popin/Popin'

popin = new Popin( popinOptions );

popin.load( 'my-url.html' );
```

### Popin with controller

Allow you to handle all links that can open an ajax popin.

If the `selector.links` option is set to `a[data-popin]`, all <a> tag with a [data-popin] attribute will open the popin and start loading the content from the url of the link.


```js
import PopinController from '@creative-web-solution/front-library/Modules/Popin/PopinController'

popin = new PopinController( popinOptions );
```


### Inline popin

Handle popin that are already in the page (not loaded in ajax).
The popin **must have** un id attribute.

All links with an href pointing to the popin (href="#my-popin") will be handled, and will open the popin on click.

**You must create a new controller for each inline popin.**

**Don't try to mix inline and ajax popin in the same controller. It's not working.**


```js
import PopinController from '@creative-web-solution/front-library/Modules/PopinController'

let $inlinePopin = document.getelementbyId( 'my-popin );

popin = new PopinController( popinOptions, $inlinePopin );
```


### Preload image before removing loader

In the on load callback, in the configuration:

```js
{
    ...
    "onLoad": $popin =>
    {
        return preloadAllImages($popin);
    },
    ...
}
```

`preloadAllImages` is a custom function (not includes) that return a promise, which will be resolved when all images will be loaded


### Display a popin at page load

You can add anywhere in the page on any tag, an attribute configured in `selectors.openOnLoadAttribute` with an url as value.

It will automatically open a popin when the page will load.

You can only add one attribute in the whole page. The others will be ignored.


### HTTP error handling

To manually handle HTTP error, set the `autoHandleAjaxError` to false and customize the `normalize` function.

For example, if we consider that the server return a JSON with a `message` property and a `200` http code if it's ok, and an `error` key with an HTTP error code:

```js
...,
normalize: (body, response) => {
    if ( response.status < 200 || response.status >= 300 ) {
        return {
            success: true,
            data: body.error
        }
    }

    return {
        success: true,
        data: body.html
    }
},
...
```

or

```js
...,
normalize: (body, response, isHttpError) => {
    if ( isHttpError ) {
        return {
            success: true,
            data: body.error
        }
    }

    return {
        success: true,
        data: body.html
    }
},
...
```
