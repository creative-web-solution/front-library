import { on, off }                          from '../../Events/EventsManager';
import KeyboardHandler                      from '../../Events/KeyboardHandler';
import { extend }                           from '../../Helpers/Extend';
import { strToDOM }                         from '../../DOM/StrToDOM';
import { append }                           from '../../DOM/Manipulation';
import { windowSize }                       from '../../DOM/WindowSize';
import template                             from '../Template';
import PopinBackground                      from './PopinBackground';
import PopinAccessibility                   from './PopinAccessibility';
import { defaultOptions, CLICK_EVENT_NAME } from './Tools';


/**
 * Create a simple popin
 * @class Popin
 *
 * @see extra/modules/popin.md for details.
 *
 * @example let popin = new Popin( popinOptions );
 * popin.load( 'my-url.html', {method: 'post'} );
 */
export default class Popin {

    #loadingPromise:    Promise<void> | null = null;
    #loaderOpened:      boolean = false;
    #popinOpened:       boolean = false;
    #$loader!:          HTMLElement;
    #templates:         PopinTemplatesOptionsType;
    #selectors:         PopinSelectorsOptionsType;
    #animations:        PopinAnimationsOptionsType;
    #errorTpl;
    #$popinContent:     HTMLElement;
    #$initialFocus;
    #isInlinePopin:     boolean;
    #focusControl:      PopinAccessibility;
    #keyboardControls;
    #options:           PopinOptionsType;
    #controllerOptions: PopinControllerOptionsType | undefined;
    #backgroundLayer:   PopinBackground;
    #tick;
    #$popin:            HTMLElement;


    constructor ( userOptions: PopinOptionsType = {}, $popin?: HTMLElement, _controllerOptions?: PopinControllerOptionsType ) {

        if ( !( "AbortController" in window ) ) {
            throw 'This plugin uses fecth and AbortController. You may need to add a polyfill for this browser.';
        }

        this.#isInlinePopin     = !!$popin;
        this.#controllerOptions = _controllerOptions;

        if ( _controllerOptions ) {
            this.#options         = userOptions;
            this.#backgroundLayer = _controllerOptions.background!;
        }
        else {
            this.#options         = extend( defaultOptions, userOptions );
            this.#backgroundLayer = new PopinBackground( this, this.#options );
        }


        this.#templates =  this.#options.templates!;
        this.#selectors =  this.#options.selectors!;
        this.#animations = this.#options.animations!;

        if ( $popin ) {
            this.#$popin = $popin;
        }
        else {
            const popinHtml = this.#templates.popin!;
            this.#errorTpl  = template( this.#templates.errorMessage! );

            // Add popin template
            this.#$popin = strToDOM( popinHtml ) as HTMLElement;
            append( this.#$popin, document.body );

            // Add loader in the popin
            this.#$loader = strToDOM( this.#templates.popinLoader! ) as HTMLElement;

            append( this.#$loader, this.#$popin) ;
        }

        // Init the element that will receive the content
        this.#$popinContent = this.#$popin.querySelector( this.#selectors.popinContent! ) || this.#$popin;

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


    private addAccessibility() {
        this.#focusControl.refresh();
        this.#focusControl.toggleTabIndexNavigation( true );
        this.#focusControl.focusFirstElement();
    }


    // ------------------------------ LOADER


    private openLoader() {
        if ( this.#loaderOpened ) {
            return Promise.resolve();
        }

        return this.#animations.openLoader!( this.#$loader ).then( () => {
            this.#loaderOpened = true;
        } );
    }


    private closeLoader() {
        if ( !this.#loaderOpened ) {
            return Promise.resolve();
        }

        return this.#animations.closeLoader!( this.#$loader ).then( () => {
            this.#loaderOpened = false;
        } );
    }


    // ------------------------------ POPIN SHOW/HIDE


    private showBackgroundLayer() {
        return this.#backgroundLayer ? this.#backgroundLayer.open() : Promise.resolve();
    }


    private hideBackgroundLayer() {
        return this.#backgroundLayer ? this.#backgroundLayer.close() : Promise.resolve();
    }


    private openPopin() {
        if ( this.#popinOpened ) {
            return Promise.resolve();
        }

        this.#$initialFocus = document.activeElement;
        this.resize();

        if ( this.#options.autoResize ) {
            on( window, {
                "eventsName": "resize",
                "callback":   this.#resizeHandler
            } );
        }

        return this.showBackgroundLayer()
            .then( () => {
                if ( this.#isInlinePopin ) {
                    this.addAccessibility();
                }
                return this.#animations.initOpenPopin!( this.#$popin );
            } )
            .then( () => {
                if ( this.#options.onOpen ) {
                    return this.#options.onOpen.call( this, this.#$popin );
                }
            } )
            .then( () => {
                return this.#animations.openPopin!( this.#$popin );
            } )
            .then( () => {
                this.#popinOpened = true;
            } );
    }


    private closePopin() {
        if ( !this.#popinOpened ) {
            return Promise.resolve();
        }

        off( window, {
            "eventsName": "resize",
            "callback":   this.#resizeHandler
        } );

        return this.#animations
            .closePopin!( this.#$popin )
            .then( this.hideBackgroundLayer.bind( this ) )
            .then( () => {
                if ( this.#options.onClose ) {
                    return this.#options.onClose.call( this, this.#$popin );
                }
            } )
            .then( () => {
                this.#popinOpened = false;

                if ( !this.#isInlinePopin ) {
                    this.clearPopin();
                }
                this.#$initialFocus.focus();
            });
    }


    // ------------------------------ POPIN CONTENT


    private resizeRAF() {
        window.requestAnimationFrame( this.resize.bind( this ) );
    }


    private setPopin( resp: string ) {
        this.#$popinContent.innerHTML = resp;

        return this.#options.onLoad!( this.#$popin ).then( this.resizeRAF.bind( this ) );
    }


    private clearPopin() {
        this.#$popinContent.innerHTML = '';
        this.resizeRAF();
        this.#focusControl.toggleTabIndexNavigation( false );
    }


    private setPopinError( message: string ) {
        this.#$popinContent.innerHTML = this.#errorTpl({ "message": message });
        this.resizeRAF();
    }


    // ------------------------------ POPIN LOADING


    private _load( url: string, type: PopinResponseType, userRequestOptions?: RequestInit ): Promise<void> {
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

            this.openPopin()
                .then( () => this.openLoader() )
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
                                let error = new Error( response.statusText );
                                /** @ts-expect-error */
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
                                let [ body, response ] = data;
                                let isHttpError = response.status < 200 || response.status >= 300;
                                let normResponse = this.#options.normalize!( body, response, isHttpError );

                                if ( normResponse.success ) {
                                    this.setPopin( normResponse.data ).then( () => {
                                        this.addAccessibility();
                                        resolve();
                                    } );
                                }
                                else {
                                    this.setPopinError( this.#options.errorMessage! );
                                    this.addAccessibility();
                                    reject();
                                }
                            },
                            err => {
                                this.setPopinError( this.#options.errorMessage! );
                                this.addAccessibility();
                                reject( err );
                            }
                        )
                        .finally( () => {
                            this.#loadingPromise = null;
                            this.closeLoader();
                        } );
                })
                .catch( err => reject( err ) );

        } );

        return this.#loadingPromise;
    }


    private _loadLink( $link: HTMLAnchorElement ) {
        return this._load(
            $link.href,
            this.#options.setLinkResponseType!( $link.href, $link ),
        );
    }


    private _loadForm( $form: HTMLFormElement ) {
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
                        return this._load(
                            $form.action,
                            this.#options.setFormResponseType!( $form ),
                            {
                                "body": new FormData( $form ),
                                "method": $form.method || 'POST'
                            } );
                    } );
    }


    #openPopinHandler = ( e ) => {
        e.preventDefault();

        if ( this.#loadingPromise ) {
            return;
        }

        const $target = e.target;

        if ( $target.nodeName === 'FORM' ) {
            this._loadForm( $target );
            return;
        }

        const url = $target.getAttribute( 'href' );

        if ( url && url.indexOf( '#' ) === 0 ) {
            return;
        }

        this._loadLink( $target );
    }


    #closePopinHandler = ( e ) => {
        e.preventDefault();

        if ( this.#controllerOptions ) {
            return this.#controllerOptions.controller.close();
        }

        this.closePopin();
    }


    private resize() {
        if ( !this.#options.autoResize ) {
            return;
        }

        const viewportSize = windowSize();

        const maxHeight = viewportSize.height - this.#options.marginHeight! * 2;

        this.#$popinContent.style.maxHeight = `${ maxHeight }px`;

        this.#tick = false;
    }


    #resizeHandler = () => {
        if ( this.#tick ) {
            return;
        }

        this.#tick = true;

        window.requestAnimationFrame( this.resize.bind( this ) );
    }


    /**
     * Load a page from a link and display the result it in the popin
     *
     * @param $link
     */
    loadLink( $link: HTMLAnchorElement ): Promise<void> {
        if ( this.#loadingPromise ) {
            return this.#loadingPromise;
        }

        return this._loadLink( $link );
    };


    /**
     * Send a form and display the result it in the popin
     *
     * @param $form
     */
    loadForm( $form: HTMLFormElement ): Promise<void>  {
        if ( this.#loadingPromise ) {
            return this.#loadingPromise;
        }

        return this._loadForm( $form );
    };


    /**
     * Load a file and display it in the popin
     *
     * @param url
     * @param data - All parameters available for window.fetch
     * @param [type=text]
     */
    load( url: string, data?: RequestInit, type: PopinResponseType = 'text' ): Promise<void> {
        if ( this.#loadingPromise ) {
            return this.#loadingPromise;
        }

        return this._load(
            url,
            type,
            data
        );
    };


    /**
     * Insert some html in the popin and open it
     *
     * @param html
     * @param openFirst - Open the popin THEN insert the html
     */
    set( html: string, openFirst?: boolean ): Promise<void> {
        if ( openFirst ) {
            return this.openPopin().then( () => this.setPopin( html ) );
        }
        return this.setPopin( html ).then( () => this.openPopin() );
    };


    /**
     * Remove the content of the popin
     */
    clear() {
        return this.clearPopin();
    };


    /**
     * Close the popin
     */
    close(): Promise<void> {
        return this.closePopin();
    };


    /**
     * Open the popin
     */
    open(): Promise<void> {
        return this.openPopin();
    };


    /**
     * Open the popin loading
     */
    openLoading(): Promise<void> {
        return this.openLoader()
    };


    /**
     * Close the popin loading
     */
    closeLoading(): Promise<void> {
        return this.closeLoader()
    };


    /**
     * Remove all events, css class or inline styles
     */
    destroy() {
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
    };
}
