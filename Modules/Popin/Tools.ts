
export const FOCUSABLE_ELEMENTS_SELECTOR = 'a,button,input,select,textarea';

export function toggleTabIndex( $elements, $popin, activate ) {
    let tabIndex;
    $elements = $elements || $popin.querySelectorAll( FOCUSABLE_ELEMENTS_SELECTOR );
    tabIndex = activate ? '0' : '-1';
    $elements.forEach( e => e.setAttribute( 'tabindex', tabIndex ) );
    $popin.setAttribute( 'tabindex', tabIndex );
    $popin.setAttribute( 'aria-hidden', !activate );
}

export const CLICK_EVENT_NAME = window.matchMedia( '(hover: none)' ).matches ? 'touchend' : 'click';

export const defaultOptions = {
    "modal": false,
    "errorMessage": 'Error while loading...',
    "marginHeight": 20,
    "autoResize": false,
    "enableKeyboard": true,
    "onLoad": () => {
        return Promise.resolve();
    },
    "setLinkResponseType": () => {
        return 'text';
    },
    "setFormResponseType": () => {
        return 'text';
    },
    "checkValidity": () => {
        return true;
    },
    "normalize": body => {
        return {
            "success": true,
            "data": body
        };
    },
    "autoHandleAjaxError": true,
    "templates": {
        "popinLoader": "<div class=\"popin-loader\"></div>",
        "popin": "<div class=\"popin\"><div class=\"popin-content\"></div></div>",
        "bgLayer": "<div class=\"bg-popin\"></div>",
        "errorMessage": "<div class=\"error\"><%= message %></div>"
    },
    "selectors": {
        "popin": ".popin",
        "popinContent": ".popin-content",
        "links": "a[data-popin]",
        "forms": "form[data-popin]",
        "btClosePopin": "button[data-close-popin]",
        "openOnLoadAttribute": "data-onload-popin"
    },
    "animations": {
        "openBg": $bg => {
            $bg.style.display = 'block';
            return Promise.resolve();
        },
        "closeBg": $bg => {
            $bg.style.display = 'none';
            return Promise.resolve();
        },
        "initOpenPopin": $popin => {
            $popin.style.display = 'block';
            $popin.style.opacity = 0;
            return Promise.resolve();
        },
        "openPopin": $popin => {
            $popin.style.opacity = 1;
            return Promise.resolve();
        },
        "closePopin": $popin => {
            $popin.style.display = 'none';
            return Promise.resolve();
        },
        "openLoader": $loader => {
            $loader.style.display = 'block';
            return Promise.resolve();
        },
        "closeLoader": $loader => {
            $loader.style.display = 'none';
            return Promise.resolve();
        }
    }
}
