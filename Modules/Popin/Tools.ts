
export const FOCUSABLE_ELEMENTS_SELECTOR = 'a,button,input,select,textarea';

export function toggleTabIndex( $elements: NodeListOf<HTMLElement> | undefined | null, $popin: HTMLElement, activate: boolean ): void {
    $elements = $elements || $popin.querySelectorAll( FOCUSABLE_ELEMENTS_SELECTOR );
    const tabIndex = activate ? '0' : '-1';
    $elements.forEach( e => e.setAttribute( 'tabindex', tabIndex ) );
    $popin.setAttribute( 'tabindex', tabIndex );
    $popin.setAttribute( 'aria-hidden', activate ? 'false' : 'true' );
}

export const CLICK_EVENT_NAME = window.matchMedia( '(hover: none)' ).matches ? 'touchend' : 'click';

export const defaultOptions = {
    "modal": false,
    "errorMessage": 'Error while loading...',
    "marginHeight": 20,
    "autoResize": false,
    "enableKeyboard": true,
    "onLoad": (): Promise<any> => {
        return Promise.resolve();
    },
    "setLinkResponseType": (): string => {
        return 'text';
    },
    "setFormResponseType": (): string => {
        return 'text';
    },
    "checkValidity": (): boolean => {
        return true;
    },
    "normalize": <V>( body: V ): { success: boolean, data: V } => {
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
        "errorMessage": "<div class=\"error\">{{ message }}</div>"
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
        "openBg": ( $bg: HTMLElement ): Promise<any> => {
            $bg.style.display = 'block';
            return Promise.resolve();
        },
        "closeBg": ( $bg: HTMLElement ): Promise<any> => {
            $bg.style.display = 'none';
            return Promise.resolve();
        },
        "initOpenPopin": ( $popin: HTMLElement ): Promise<any> => {
            $popin.style.display = 'block';
            $popin.style.opacity = '0';
            return Promise.resolve();
        },
        "openPopin": ( $popin: HTMLElement ): Promise<any> => {
            $popin.style.opacity = '1';
            return Promise.resolve();
        },
        "closePopin": ( $popin: HTMLElement ): Promise<any> => {
            $popin.style.display = 'none';
            return Promise.resolve();
        },
        "openLoader": ( $loader: HTMLElement ): Promise<any> => {
            $loader.style.display = 'block';
            return Promise.resolve();
        },
        "closeLoader": ( $loader : HTMLElement): Promise<any> => {
            $loader.style.display = 'none';
            return Promise.resolve();
        }
    }
}
