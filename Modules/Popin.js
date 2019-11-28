import { on, off } from 'front-library/Events/EventsManager';
import { KeyboardHandler } from 'front-library/Events/KeyboardHandler';
import { extend } from 'front-library/Helpers/Extend';
import { defer } from 'front-library/Helpers/defer';
import { strToDOM } from 'front-library/DOM/strToDOM';
import { append } from 'front-library/DOM/Manipulation';
import { windowSize } from 'front-library/DOM/windowSize';
import { template } from 'front-library/Modules/template';

let $body = document.body;

const CLICK_EVENT_NAME =
    window.Modernizr && window.Modernizr.touchdevice ? 'touchend' : 'click';

const FOCUSABLE_ELEMENTS = 'a, button, input, select, textarea';

function toggleTabIndex( $elements, $popin, activate ) {
    let tabIndex;
    $elements = $elements || $popin.querySelectorAll( FOCUSABLE_ELEMENTS );
    tabIndex = activate ? '0' : '-1';
    $elements.forEach( e => e.setAttribute( 'tabindex', tabIndex ) );
    $popin.setAttribute( 'tabindex', tabIndex );
    $popin.setAttribute( 'aria-hidden', !activate );
}


const defaultOptions = {
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

/*global $body, CLICK_EVENT_NAME */

function Background( popin, options ) {
    let $bgLayer;

    const SELF = this;

    $bgLayer = strToDOM( options.templates.bgLayer );
    $body.appendChild( $bgLayer );

    this.isOpened = false;


    this.open = () => {
        if ( this.isOpened ) {
            return Promise.resolve();
        }

        if ( !options.modal ) {
            $bgLayer.addEventListener( CLICK_EVENT_NAME, onBgClick );
        }

        return options.animations.openBg( $bgLayer ).then( () => {
            SELF.isOpened = true;
        } );
    }


    this.close = () => {
        if ( !this.isOpened ) {
            return Promise.resolve();
        }

        if ( !options.modal ) {
            $bgLayer.removeEventListener( CLICK_EVENT_NAME, onBgClick );
        }

        return options.animations.closeBg( $bgLayer ).then( () => {
            SELF.isOpened = false;
        } );
    }


    function onBgClick() {
        popin.close();
    }

    this.destroy = () => {
        $bgLayer.removeEventListener( CLICK_EVENT_NAME, onBgClick );
    };
}

/**
 * Create a simple popin
 * @class Popin
 *
 * @see extra/modules/popin.md for details.
 *
 * @example let popin = new Popin( popinOptions );
 * popin.load( 'my-url.html', {method: 'post'} );
 *
 * @param {Object} userOptions
 *
 * @param {Boolean} [userOptions.modal=false]
 * @param {Number} [userOptions.marginHeight=20]
 * @param {Boolean} [userOptions.autoResize=false]
 * @param {String} [userOptions.errorMessage=Error while loading...]
 * @param {Boolean} [userOptions.enableKeyboard=true]
 * @param {Callback} [userOptions.onOpen=$popin => {}]
 * @param {Callback} [userOptions.onClose=$popin => {}]
 * @param {Callback} [userOptions.onLoad=$popin => Promise.resolve()]
 * @param {Function} [userOptions.setLinkResponseType= ( url, $link ) => 'text'] - Must return one of these values: arrayBuffer | blob | json | text | formData
 * @param {Function} [userOptions.setFormResponseType= $form => 'text'] - Must return one of these values: arrayBuffer | blob | json | text | formData
 * @param {Function} [userOptions.checkValidity= $form => true] - Must return true, false or a promise
 * @param {Function} [userOptions.normalize= (body, response, isHttpError) => { return { success: true, data: body } }]
 * @param {Function} [userOptions.autoHandleAjaxError=true] - If false, ajax http error (404, 500, ...) should be handled in the normalize function
 * @param {Object} [userOptions.templates]
 * @param {String} [userOptions.templates.popinLoader=<div class=\"popin-loader\"></div>]
 * @param {String} [userOptions.templates.popin=<div class=\"popin\"><div class=\"popin-content\"></div></div>]
 * @param {String} [userOptions.templates.bgLayer=<div class=\"bg-popin\"></div>]
 * @param {String} [userOptions.templates.errorMessage=<div class=\"error\"><%= message %></div>]
 * @param {Object} [userOptions.selectors]
 * @param {String} [userOptions.selectors.popin=.popin]
 * @param {String} [userOptions.selectors.popinContent=.popin-content]
 * @param {String} [userOptions.selectors.links=a[data-popin]]
 * @param {String} [userOptions.selectors.forms=form[data-popin]]
 * @param {String} [userOptions.selectors.btClosePopin=button[data-close-popin]]
 * @param {String} [userOptions.selectors.openOnLoadAttribute=data-onload-popin"]
 * @param {Object} [userOptions.animations] - All functions return a promise
 * @param {Function} [userOptions.animations.openBg=$bg => { $bg.style.display = 'block'; return Promise.resolve(); }]
 * @param {Function} [userOptions.animations.closeBg=$bg => { $bg.style.display = 'none'; return Promise.resolve(); }]
 * @param {Function} [userOptions.animations.initOpenPopin=$popin => { $popin.style.display = 'block'; $popin.style.opacity = 0; return Promise.resolve(); }]
 * @param {Function} [userOptions.animations.openPopin=$popin => { $popin.style.opacity = 1; return Promise.resolve(); }]
 * @param {Function} [userOptions.animations.closePopin=$popin => { $popin.style.display = 'none'; return Promise.resolve(); }]
 * @param {Function} [userOptions.animations.openLoader=$loader => { $loader.style.display = 'block'; return Promise.resolve(); }]
 * @param {Function} [userOptions.animations.closeLoader=$loader => { $loader.style.display = 'none'; return Promise.resolve(); }]
 */
export function Popin( userOptions = {}, $popin ) {
    let loading,
        loaderOpened,
        popinOpened,
        $loader,
        templates,
        selectors,
        animations,
        popinHtml,
        errorTpl,
        $popinContent,
        $initialFocus,
        isInlinePopin,
        FocusControl,
        keyboardControls,
        options,
        backgroundLayer,
        tick;

    if ( !( "AbortController" in window ) ) {
        throw 'This plugin uses fecth and AbortController. You may need to add a polyfill for this browser.';
    }

    if ( !userOptions.controller ) {
        options = extend( defaultOptions, userOptions );
        backgroundLayer = new Background( this, options );
    }
    else {
        options = userOptions;
        backgroundLayer = options.background;
    }

    const SELF = this;

    loading = false;
    popinOpened = false;
    loaderOpened = false;
    isInlinePopin = !!$popin;

    templates = options.templates;
    selectors = options.selectors;
    animations = options.animations;

    if ( !$popin ) {
        popinHtml = templates.popin;
        errorTpl = template( templates.errorMessage );

        // Add popin template
        $popin = strToDOM( popinHtml );
        append( $popin, $body );

        // Add loader in the popin
        $loader = strToDOM( templates.popinLoader );

        append( $loader, $popin) ;
    }

    // Init the element that will receive the content
    $popinContent = $popin.querySelector( selectors.popinContent ) || $popin;

    // Keyboard TAB focus control
    FocusControl = new PopinAccessibility( $popin );


    // ------------------------------ LOADER


    function openLoader() {
        if ( loaderOpened ) {
            return Promise.resolve();
        }

        return animations.openLoader( $loader ).then( () => {
            loaderOpened = true;
        } );
    }


    function closeLoader() {
        if ( !loaderOpened ) {
            return Promise.resolve();
        }

        return animations.closeLoader( $loader ).then( () => {
            loaderOpened = false;
        } );
    }


    // ------------------------------ POPIN SHOW/HIDE


    function showBackgroundLayer() {
        return backgroundLayer ? backgroundLayer.open() : Promise.resolve();
    }


    function hideBackgroundLayer() {
        return backgroundLayer ? backgroundLayer.close() : Promise.resolve();
    }


    function openPopin() {
        if ( popinOpened ) {
            return Promise.resolve();
        }

        $initialFocus = document.activeElement;
        resize();

        if ( options.autoResize ) {
            on( window, {
                "eventsName": "resize",
                "callback": resizeHandler
            } );
        }

        return showBackgroundLayer()
            .then( () => {
                if ( isInlinePopin ) {
                    addAccessibility();
                }
                return animations.initOpenPopin( $popin );
            } )
            .then( () => {
                if ( options.onOpen ) {
                    return options.onOpen.call( SELF, $popin );
                }
            } )
            .then( () => {
                return animations.openPopin( $popin, true );
            } )
            .then( () => {
                popinOpened = true;
            } );
    }


    function closePopin() {
        if ( !popinOpened ) {
            return Promise.resolve();
        }

        off( window, {
            "eventsName": "resize",
            "callback": resizeHandler
        } );

        return animations
            .closePopin( $popin )
            .then( hideBackgroundLayer )
            .then( () => {
                if ( options.onClose ) {
                    return options.onClose.call( SELF, $popin );
                }
            } )
            .then( () => {
                popinOpened = false;

                if ( !isInlinePopin ) {
                    clearPopin();
                }
                $initialFocus.focus();
            });
    }


    // ------------------------------ POPIN CONTENT


    function resizeRAF() {
        window.requestAnimationFrame( resize );
    }


    function setPopin( resp ) {
        $popinContent.innerHTML = resp;

        return options.onLoad( $popin ).then( resizeRAF );
    }


    function clearPopin() {
        $popinContent.innerHTML = '';
        resizeRAF();
        FocusControl.toggleTabIndexNavigation( false );
    }


    function setPopinError( message ) {
        $popinContent.innerHTML = errorTpl({ "message": message });
        resizeRAF();
    }


    // ------------------------------ POPIN LOADING


    function load( url, type, userRequestOptions ) {
        let myHeaders, deferred, requestOptions;

        deferred = defer();

        loading = true;

        myHeaders = new Headers();
        myHeaders.append( 'X-Requested-With', 'XMLHttpRequest' );
        requestOptions = {
            "headers": myHeaders
        };
        if ( userRequestOptions ) {
            requestOptions = extend( {}, requestOptions, userRequestOptions );
        }

        openPopin()
            .then( () => openLoader() )
            .then( () => {
                fetch(
                    url,
                    requestOptions
                )
                    .then( response => {
                        if ( !options.autoHandleAjaxError || response.status >= 200 && response.status < 300 ) {
                            return response;
                        }
                        else {
                            let error = new Error( response.statusText );
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
                            let normResponse = options.normalize( body, response, isHttpError );

                            if ( normResponse.success ) {
                                setPopin( normResponse.data ).then( () => {
                                    addAccessibility();
                                    deferred.resolve();
                                } );
                            }
                            else {
                                setPopinError( options.errorMessage );
                                addAccessibility();
                                deferred.reject();
                            }
                        },
                        err => {
                            setPopinError( options.errorMessage );
                            addAccessibility();
                            deferred.reject( err );
                        }
                    )
                    .finally( () => {
                        loading = false;
                        closeLoader();
                    } );
            })
            .catch( err => deferred.reject( err ) );

        return deferred;
    }


    function loadLink( $link ) {
        return load(
            $link.href,
            options.setLinkResponseType( $link.href, $link ),
        );
    }


    function loadForm( $form ) {
        let validationProm, validationResult;

        if ( options.checkValidity ) {
            validationResult = options.checkValidity( $form );
            if ( validationResult === false ) {
                return Promise.reject();
            }
        }

        validationProm = ( !validationResult || validationResult === true ) ? Promise.resolve() : validationResult;


        return validationProm
                    .then( () => {
                        return load(
                            $form.action,
                            options.setFormResponseType( $form ),
                            {

                                "body": new FormData( $form ),
                                "method": $form.method || 'POST'
                            } );
                    } );
    }


    function openPopinHandler( e ) {
        let $target;
        e.preventDefault();

        if ( loading ) {
            return;
        }

        $target = e.target;

        if ( $target.nodeName === 'FORM' ) {
            loadForm( $target );
            return;
        }

        let url = $target.getAttribute( 'href' );

        if ( url && url.indexOf( '#' ) === 0 ) {
            return;
        }

        loadLink( $target );
    }


    function closePopinHandler( e ) {
        e.preventDefault();
        if ( options.controller ) {
            return options.controller.close();
        }

        closePopin();
    }


    function resize() {
        let viewportSize, maxHeight;

        if ( !options.autoResize ) {
            return;
        }

        viewportSize = windowSize();

        maxHeight = viewportSize.height - options.marginHeight * 2;

        $popinContent.style.maxHeight = `${ maxHeight }px`;

        tick = false;
    }


    function resizeHandler() {
        if ( tick ) {
            return;
        }

        tick = true;

        window.requestAnimationFrame( resize );
    }


    /**
     * Load a page from a link and display the result it in the popin
     *
     * @function loadLink
     * @memberof Popin
     * @instance
     * @param {HTMLElement} $link
     *
     * @return {Promise}
     */
    this.loadLink = $link => {
        if ( loading ) {
            return;
        }

        return loadLink( $link );
    };


    /**
     * Send a form and display the result it in the popin
     *
     * @function loadForm
     * @memberof Popin
     * @instance
     * @param {HTMLElement} $form
     *
     * @return {Promise}
     */
    this.loadForm = $form => {
        if ( loading ) {
            return;
        }

        return loadForm( $form );
    };


    /**
     * Load a file and display it in the popin
     *
     * @function load
     * @memberof Popin
     * @instance
     * @param {String} url
     * @param {Object} data - All parameters available for window.fetch
     * @param {String} [type=text]
     *
     * @return {Promise}
     */
    this.load = ( url, data, type = 'text' ) => {
        if ( loading ) {
            return;
        }

        return load(
            url,
            type,
            data
        );
    };


    /**
     * Insert some html in the popin and open it
     *
     * @function set
     * @memberof Popin
     * @instance
     * @param {String} html
     * @param {Boolean} openFirst - Open the popin THEN insert the html
     *
     * @return {Promise}
     */
    this.set = ( html, openFirst ) => {
        if ( openFirst ) {
            return openPopin().then( () => setPopin( html ) );
        }
        return setPopin(html).then( () => openPopin() );
    };


    /**
     * Remove the content of the popin
     *
     * @function clear
     * @memberof Popin
     * @instance
     *
     * @return {Promise}
     */
    this.clear = () => {
        return clearPopin();
    };


    /**
     * Close the popin
     *
     * @function close
     * @memberof Popin
     * @instance
     *
     * @return {Promise}
     */
    this.close = () => {
        return closePopin();
    };


    /**
     * Open the popin
     *
     * @function open
     * @memberof Popin
     * @instance
     *
     * @return {Promise}
     */
    this.open = () => {
        return openPopin();
    };


    /**
     * Open the popin loading
     *
     * @function openLoading
     * @memberof Popin
     * @instance
     *
     * @return {Promise}
     */
    this.openLoading = () => {
        return openLoader()
    };


    /**
     * Close the popin loading
     *
     * @function closeLoading
     * @memberof Popin
     * @instance
     *
     * @return {Promise}
     */
    this.closeLoading = () => {
        return closeLoader()
    };


    /**
     * Remove all events, css class or inline styles
     *
     * @function destroy
     * @memberof Popin
     * @instance
     */
    this.destroy = () => {
        off(
            $popin,
            {
                "eventsName": `${ CLICK_EVENT_NAME } submit`,
                "callback": openPopinHandler
            }
        );

        off( window, {
            "eventsName": "resize",
            "callback": resizeHandler
        });

        off(
            $popin,
            {
                "eventsName": CLICK_EVENT_NAME,
                "callback": closePopinHandler
            }
        );

        if ( keyboardControls ) {
            keyboardControls.off();
        }
    };


    // ------------------- BINDING


    function addAccessibility() {
        FocusControl.refresh();
        FocusControl.toggleTabIndexNavigation( true );
        FocusControl.focusFirstElement();
    }

    on(
        $popin,
        {
            "eventsName": CLICK_EVENT_NAME,
            "selector": selectors.links,
            "callback": openPopinHandler
        }
    );

    on( $popin,
        {
            "eventsName": "submit",
            "selector": selectors.forms,
            "callback": openPopinHandler
        });

    on(
        $popin,
        {
            "eventsName": CLICK_EVENT_NAME,
            "selector": selectors.btClosePopin,
            "callback": closePopinHandler
        }
    );


    if ( options.enableKeyboard ) {
        keyboardControls = new KeyboardHandler( $popin, {
            "preventDefault": false,
            "onEscape": e => {
                closePopinHandler( e );
            },
            "onTabReverse": e => {
                FocusControl.handleBackwardTab( e );
            },
            "onTab": e => {
                FocusControl.handleForwardTab( e );
            }
        });
    }
}

/* global toggleTabIndex, FOCUSABLE_ELEMENTS */
// eslint-disable-next-line no-unused-vars
function PopinAccessibility( $popin ) {
    let $elements, $firstElement, $lastElement;

    this.focusFirstElement = () => {
        if ( !$firstElement ) {
            return;
        }
        $firstElement.focus();
    }


    this.handleBackwardTab = e => {
        if ( $elements.length < 1 || !$firstElement ) {
            e.preventDefault();
            return;
        }
        if ( document.activeElement === $firstElement ) {
            e.preventDefault();
            $lastElement.focus();
        }
    }


    this.handleForwardTab = e => {
        if ( $elements.length < 1 || !$lastElement ) {
            e.preventDefault();
            return;
        }
        if ( document.activeElement === $lastElement ) {
            e.preventDefault();
            $firstElement.focus();
        }
    }


    this.toggleTabIndexNavigation = activate => {
        toggleTabIndex( $elements, $popin, activate );

        if ( activate ) {
            $popin.focus();
        }
    }

    this.refresh = () => {
        $elements = $popin.querySelectorAll( FOCUSABLE_ELEMENTS );
        $firstElement = $elements[ 0 ];
        $lastElement = $elements[ $elements.length - 1 ];
    }
    this.refresh();
    this.toggleTabIndexNavigation( false );
}

/**
 * Create a controller tha manage all popin in the page
 * @class PopinController
 *
 * @see extra/modules/popin.md for details.
 *
 * @example let controller = new PopinController( popinOptions );
 * popin.loadForm( $form );
 *
 * @param {Object} userOptions - Same options like the Popin class
 */
export function PopinController( userOptions = {}, $popin ) {
    let options,
        selectors,
        background,
        popin;

    if ( !( "AbortController" in window ) ) {
        throw 'This plugin uses fecth and AbortController. You may need to add a polyfill for this browser.';
    }

    const SELF = this;

    options = extend( defaultOptions, userOptions );

    selectors = options.selectors;

    // global var, only one background for all popin
    background = new Background( this, options );

    popin = new Popin( {
        ...options,
        "controller": SELF,
        background
    }, $popin );


    function parseElement( $dom, customUrl ) {
        let anchor;

        if ( customUrl ) {
            return popin.load( customUrl );
        }

        if ( $dom.nodeName === 'FORM' ) {
            return popin.loadForm( $dom );
        }

        anchor = $dom.getAttribute( 'href' );

        if ( anchor && anchor.indexOf( '#' ) === 0 ) {
            return popin.open();
        }

        return popin.loadLink( $dom );
    }


    function openPopinHandler( e ) {
        e.preventDefault();

        parseElement( e.target );
    }


    /**
     * Load a file and display it in the popin
     *
     * @function load
     * @memberof PopinController
     * @instance
     * @param {String} url
     * @param {Object} data - All parameters available for window.fetch
     * @param {String} [type=text]
     *
     * @return {Promise}
     */
    this.load = ( url, data, type ) => {
        return popin.load( url, data, type );
    };


    /**
     * Send a form and display the result it in the popin
     *
     * @function loadForm
     * @memberof PopinController
     * @instance
     * @param {HTMLElement} $form
     *
     * @return {Promise}
     */
    this.loadForm = $form => {
        return popin.loadForm( $form );
    };


    /**
     * Load a page from a link and display the result it in the popin
     *
     * @function loadLink
     * @memberof PopinController
     * @instance
     * @param {HTMLElement} $link
     *
     * @return {Promise}
     */
    this.loadLink = $link => {
        return popin.loadLink( $link );
    };


    /**
     * Insert some html in the popin and open it
     *
     * @function set
     * @memberof PopinController
     * @instance
     * @param {String} html
     * @param {Boolean} openFirst - Open the popin THEN insert the html
     *
     * @return {Promise}
     */
    this.set = ( html, openFirst ) => {
        return popin.set( html, openFirst );
    };


    /**
     * Remove the content of the popin
     *
     * @function clear
     * @memberof PopinController
     * @instance
     *
     * @return {Promise}
     */
    this.clear = () => {
        return popin.clear();
    };


    /**
     * Close the popin
     *
     * @function close
     * @memberof PopinController
     * @instance
     *
     * @return {Promise}
     */
    this.close = () => {
        return popin.close();
    };


    /**
     * Open the popin
     *
     * @function open
     * @memberof PopinController
     * @instance
     *
     * @return {Promise}
     */
    this.open = () => {
        return popin.open();
    };


    /**
     * Remove all events, css class or inline styles
     *
     * @function destroy
     * @memberof PopinController
     * @instance
     */
    this.destroy = () => {
        background.destroy();
        popin.destroy();

        off(
            $body,
            {
                "eventsName": `${ CLICK_EVENT_NAME } submit`,
                "callback": openPopinHandler
            }
        );
    };


    // ------------------- BINDING


    if ( $popin ) {
        toggleTabIndex( null, $popin, false )
        on( $body,
            {
                "eventsName": CLICK_EVENT_NAME,
                "selector": `a[href="#${ $popin.id }"]`,
                "callback": openPopinHandler
            });
        return;
    }

    on( $body,
        {
            "eventsName": CLICK_EVENT_NAME,
            "selector": selectors.links,
            "callback": openPopinHandler

        } );
    on( $body,
        {
            "eventsName": "submit",
            "selector": selectors.forms,
            "callback": openPopinHandler

        } );

    let $triggerOnLoadPopin = document.querySelector( `[${ selectors.openOnLoadAttribute }]` );

    if ( $triggerOnLoadPopin ) {
        parseElement(
            $triggerOnLoadPopin,
            $triggerOnLoadPopin.getAttribute( selectors.openOnLoadAttribute )
        );
    }
}
