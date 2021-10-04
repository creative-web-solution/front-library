import { on, off }                          from '../../Events/EventsManager';
import KeyboardHandler                      from '../../Events/KeyboardHandler';
import { extend }                           from '../../Helpers/Extend';
import { strToDOM }                         from '../../DOM/StrToDOM';
import { append }                           from '../../DOM/Manipulation';
import { windowSize }                       from '../../DOM/WindowSize';
import PopinBackground                      from './PopinBackground';
import PopinAccessibility                   from './PopinAccessibility';
import { defaultOptions, CLICK_EVENT_NAME } from './Tools';
import quickTemplate                        from '../QuickTemplate';


/**
 * Create a simple popin
 *
 * @see extra/modules/popin.md for details.
 *
 * @example
 * ```ts
 * let popin = new Popin( popinOptions );
 * popin.load( 'my-url.html', {method: 'post'} );
 * ```
 */
export default class Popin {

    #loadingPromise:    Promise<void> | null = null;
    #loaderOpened       = false;
    #popinOpened        = false;
    #$loader:           HTMLElement;
    #templates:         FLib.Popin.TemplatesOptions;
    #selectors:         FLib.Popin.SelectorsOptions;
    #animations:        FLib.Popin.AnimationsOptions;
    #$popinContent:     HTMLElement;
    #$initialFocus;
    #isInlinePopin:     boolean;
    #focusControl:      PopinAccessibility;
    #keyboardControls;
    #options:           FLib.Popin.Options;
    #controllerOptions: FLib.Popin.ControllerOptions | undefined;
    #backgroundLayer:   PopinBackground;
    #tick;
    #$popin:            HTMLElement;


    constructor ( userOptions: FLib.Popin.OptionsInit = {}, $popin?: HTMLElement, _controllerOptions?: FLib.Popin.ControllerOptions ) {

        if ( !( "AbortController" in window ) ) {
            throw 'This plugin uses fecth and AbortController. You may need to add a polyfill for this browser.';
        }

        this.#isInlinePopin     = !!$popin;
        this.#controllerOptions = _controllerOptions;

        if ( _controllerOptions ) {
            this.#options         = userOptions as FLib.Popin.Options;
            this.#backgroundLayer = _controllerOptions.background;
        }
        else {
            this.#options         = extend( defaultOptions, userOptions );
            this.#backgroundLayer = new PopinBackground( this, this.#options );
        }


        this.#templates =  this.#options.templates;
        this.#selectors =  this.#options.selectors;
        this.#animations = this.#options.animations;
        // Add loader in the popin
        this.#$loader = strToDOM( this.#templates.popinLoader ) as HTMLElement;

        if ( $popin ) {
            this.#$popin = $popin;
        }
        else {
            const popinHtml = this.#templates.popin;

            // Add popin template
            this.#$popin = strToDOM( popinHtml ) as HTMLElement;
            append( this.#$popin, document.body );

            append( this.#$loader, this.#$popin) ;
        }

        // Init the element that will receive the content
        this.#$popinContent = this.#$popin.querySelector( this.#selectors.popinContent ) || this.#$popin;

        // Keyboard TAB focus control
        this.#focusControl = new PopinAccessibility( this.#$popin );


        // ------------------- BINDING


        on(
            this.#$popin,
            {
                "eventsName": CLICK_EVENT_NAME,
                "selector":   this.#selectors.links,
                "callback":   this.#openPopinHandler
            }
        );

        on( this.#$popin,
            {
                "eventsName": "submit",
                "selector":   this.#selectors.forms,
                "callback":   this.#openPopinHandler
            });

        on(
            this.#$popin,
            {
                "eventsName": CLICK_EVENT_NAME,
                "selector":  this.#selectors.btClosePopin,
                "callback":  this.#closePopinHandler
            }
        );


        if ( this.#options.enableKeyboard ) {
            this.#keyboardControls = new KeyboardHandler( this.#$popin, {
                "preventDefault": false,
                "onEscape": e => {
                    this.#closePopinHandler( e );
                },
                "onTabReverse": e => {
                    this.#focusControl.handleBackwardTab( e );
                },
                "onTab": e => {
                    this.#focusControl.handleForwardTab( e );
                }
            });
        }
    }


    #addAccessibility = (): void => {
        this.#focusControl.refresh();
        this.#focusControl.toggleTabIndexNavigation( true );
        this.#focusControl.focusFirstElement();
    }


    // ------------------------------ LOADER


    #openLoader = (): Promise<any> => {
        if ( this.#loaderOpened ) {
            return Promise.resolve();
        }

        return this.#animations.openLoader( this.#$loader ).then( () => {
            this.#loaderOpened = true;
        } );
    }


    #closeLoader = (): Promise<void> => {
        if ( !this.#loaderOpened ) {
            return Promise.resolve();
        }

        return this.#animations.closeLoader( this.#$loader ).then( () => {
            this.#loaderOpened = false;
        } );
    }


    // ------------------------------ POPIN SHOW/HIDE


    #showBackgroundLayer = (): Promise<void> => {
        return this.#backgroundLayer ? this.#backgroundLayer.open() : Promise.resolve();
    }


    #hideBackgroundLayer = (): Promise<void> => {
        return this.#backgroundLayer ? this.#backgroundLayer.close() : Promise.resolve();
    }


    #openPopin = (): Promise<void> => {
        if ( this.#popinOpened ) {
            return Promise.resolve();
        }

        this.#$initialFocus = document.activeElement;
        this.#resize();

        if ( this.#options.autoResize ) {
            on( window, {
                "eventsName": "resize",
                "callback":   this.#resizeHandler
            } );
        }

        return this.#showBackgroundLayer()
            .then( () => {
                if ( this.#isInlinePopin ) {
                    this.#addAccessibility();
                }
                return this.#animations.initOpenPopin( this.#$popin );
            } )
            .then( () => {
                if ( this.#options.onOpen ) {
                    return this.#options.onOpen.call( this, this.#$popin );
                }
            } )
            .then( () => {
                return this.#animations.openPopin( this.#$popin );
            } )
            .then( () => {
                this.#popinOpened = true;
            } );
    }


    #closePopin = (): Promise<void> => {
        if ( !this.#popinOpened ) {
            return Promise.resolve();
        }

        off( window, {
            "eventsName": "resize",
            "callback":   this.#resizeHandler
        } );

        return this.#animations
            .closePopin( this.#$popin )
            .then( this.#hideBackgroundLayer.bind( this ) )
            .then( () => {
                if ( this.#options.onClose ) {
                    return this.#options.onClose.call( this, this.#$popin );
                }
            } )
            .then( () => {
                this.#popinOpened = false;

                if ( !this.#isInlinePopin ) {
                    this.#clearPopin();
                }
                this.#$initialFocus.focus();
            });
    }


    // ------------------------------ POPIN CONTENT


    #resizeRAF = (): void => {
        window.requestAnimationFrame( this.#resize.bind( this ) );
    }


    #setPopin = ( resp: string ): Promise<void> => {
        this.#$popinContent.innerHTML = resp;

        return this.#options.onLoad( this.#$popin ).then( this.#resizeRAF.bind( this ) );
    }


    #clearPopin = (): void => {
        this.#$popinContent.innerHTML = '';
        this.#resizeRAF();
        this.#focusControl.toggleTabIndexNavigation( false );
    }


    #setPopinError = ( message: string ): void => {
        this.#$popinContent.innerHTML = quickTemplate( this.#templates.errorMessage, { "message": message } );
        this.#resizeRAF();
    }


    // ------------------------------ POPIN LOADING


    #_load = ( url: string, type: FLib.Popin.ResponseType, userRequestOptions?: RequestInit ): Promise<void> => {
        let requestOptions: RequestInit ;

        this.#loadingPromise = new Promise( ( resolve, reject ) => {
            const myHeaders = new Headers();
            myHeaders.append( 'X-Requested-With', 'XMLHttpRequest' );
            requestOptions = {
                "headers": myHeaders
            };

            if ( userRequestOptions ) {
                requestOptions = extend( {}, requestOptions, userRequestOptions );
            }

            this.#openPopin()
                .then( () => this.#openLoader() )
                .then( () => {
                    fetch(
                        url,
                        requestOptions
                    )
                        .then( response => {
                            if ( !this.#options.autoHandleAjaxError || response.status >= 200 && response.status < 300 ) {
                                return response;
                            }
                            else {
                                const error: Error & { response? } = new Error( response.statusText );
                                error.response = response;
                                throw error;
                            }
                        })
                        .then( response => {
                            let prom;

                            if ( type === 'arrayBuffer' ) {
                                prom = response.arrayBuffer();
                            }
                            else if ( type === 'blob' ) {
                                prom = response.blob();
                            }
                            else if ( type === 'json' ) {
                                prom = response.json();
                            }
                            else if ( type === 'formData' ) {
                                prom = response.formData();
                            }
                            else {
                                prom = response.text();
                            }

                            return prom.then( ct => {
                                return [ ct, response ];
                            } );
                        } )
                        .then(
                            data => {
                                const [ body, response ] = data;
                                const isHttpError = response.status < 200 || response.status >= 300;
                                const normResponse = this.#options.normalize( body, response, isHttpError );

                                if ( normResponse.success ) {
                                    this.#setPopin( normResponse.data ).then( () => {
                                        this.#addAccessibility();
                                        resolve();
                                    } );
                                }
                                else {
                                    this.#setPopinError( this.#options.errorMessage );
                                    this.#addAccessibility();
                                    reject();
                                }
                            },
                            err => {
                                this.#setPopinError( this.#options.errorMessage );
                                this.#addAccessibility();
                                reject( err );
                            }
                        )
                        .finally( () => {
                            this.#loadingPromise = null;
                            this.#closeLoader();
                        } );
                })
                .catch( err => reject( err ) );

        } );

        return this.#loadingPromise;
    }


    #_loadLink = ( $link: HTMLAnchorElement ): Promise<void> => {
        return this.#_load(
            $link.href,
            this.#options.setLinkResponseType( $link.href, $link ),
        );
    }


    #_loadForm = ( $form: HTMLFormElement ): Promise<void> => {
        let validationResult;

        if ( this.#options.checkValidity ) {
            validationResult = this.#options.checkValidity( $form );
            if ( validationResult === false ) {
                return Promise.reject();
            }
        }

        const validationProm = ( !validationResult || validationResult === true ) ? Promise.resolve() : validationResult;


        return validationProm
                    .then( () => {
                        return this.#_load(
                            $form.action,
                            this.#options.setFormResponseType( $form ),
                            {
                                "body": new FormData( $form ),
                                "method": $form.method || 'POST'
                            } );
                    } );
    }


    #openPopinHandler = ( e: Event ): void => {
        e.preventDefault();

        if ( this.#loadingPromise ) {
            return;
        }

        const $target = e.target as HTMLElement;

        if ( $target.nodeName === 'FORM' ) {
            this.#_loadForm( $target as HTMLFormElement );
            return;
        }

        const url = $target.getAttribute( 'href' );

        if ( url && url.indexOf( '#' ) === 0 ) {
            return;
        }

        this.#_loadLink( $target as HTMLAnchorElement );
    }


    #closePopinHandler = ( e: Event ): void => {
        e.preventDefault();

        if ( this.#controllerOptions ) {
            return this.#controllerOptions.controller.close();
        }

        this.#closePopin();
    }


    #resize = (): void => {
        if ( !this.#options.autoResize ) {
            return;
        }

        const viewportSize = windowSize();

        const maxHeight = viewportSize.height - this.#options.marginHeight * 2;

        this.#$popinContent.style.maxHeight = `${ maxHeight }px`;

        this.#tick = false;
    }


    #resizeHandler = (): void => {
        if ( this.#tick ) {
            return;
        }

        this.#tick = true;

        window.requestAnimationFrame( this.#resize.bind( this ) );
    }


    /**
     * Load a page from a link and display the result it in the popin
     */
    loadLink( $link: HTMLAnchorElement ): Promise<void> {
        if ( this.#loadingPromise ) {
            return this.#loadingPromise;
        }

        return this.#_loadLink( $link );
    }


    /**
     * Send a form and display the result it in the popin
     */
    loadForm( $form: HTMLFormElement ): Promise<void>  {
        if ( this.#loadingPromise ) {
            return this.#loadingPromise;
        }

        return this.#_loadForm( $form );
    }


    /**
     * Load a file and display it in the popin
     *
     * @param data - All parameters available for window.fetch
     */
    load( url: string, data?: RequestInit, type: FLib.Popin.ResponseType = 'text' ): Promise<void> {
        if ( this.#loadingPromise ) {
            return this.#loadingPromise;
        }

        return this.#_load(
            url,
            type,
            data
        );
    }

    /**
     * Insert some html in the popin and open it
     *
     * @param openFirst - Open the popin THEN insert the html
     */
    set( html: string, openFirst?: boolean ): Promise<void> {
        if ( openFirst ) {
            return this.#openPopin().then( () => this.#setPopin( html ) );
        }
        return this.#setPopin( html ).then( () => this.#openPopin() );
    }


    /**
     * Remove the content of the popin
     */
    clear(): void {
        return this.#clearPopin();
    }


    /**
     * Close the popin
     */
    close(): Promise<void> {
        return this.#closePopin();
    }


    /**
     * Open the popin
     */
    open(): Promise<void> {
        return this.#openPopin();
    }


    /**
     * Open the popin loading
     */
    openLoading(): Promise<void> {
        return this.#openLoader()
    }

    /**
     * Close the popin loading
     */
    closeLoading(): Promise<void> {
        return this.#closeLoader()
    }


    /**
     * Remove all events, css class or inline styles
     */
    destroy(): void {
        off(
            this.#$popin,
            {
                "eventsName": `${ CLICK_EVENT_NAME } submit`,
                "callback": this.#openPopinHandler
            }
        );

        off(
            window,
            {
                "eventsName": "resize",
                "callback": this.#resizeHandler
            }
        );

        off(
            this.#$popin,
            {
                "eventsName": CLICK_EVENT_NAME,
                "callback": this.#closePopinHandler
            }
        );

        if ( this.#keyboardControls ) {
            this.#keyboardControls.off();
        }
    }
}
