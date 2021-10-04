/**
 * Handle device orientation change
 *
 * @example
 * ```ts
 * let ori = new DeviceOrientation({
 *     onOrientationChange: orientationName = {
 *         console.log(orientationName)
 *     }
 * })
 *
 * // Get current orientation
 * let orientationName = ori.getOrientation()
 *
 * // Remove event binding
 * ori.off()
 * ```
 */
export default class DeviceOrientation {

    #orientationName: FLib.Events.DeviceOrientation.Type = '';

    #ORIENTATION_CONVERTION_TABLE: Record<string, FLib.Events.DeviceOrientation.Type> = {
        "landscape-primary":   "landscape-primary",
        "landscapePrimary":    "landscape-primary",
        "portrait-primary":    "portrait-primary",
        "portraitPrimary":     "portrait-primary",
        "landscape-secondary": "landscape-secondary",
        "landscapeSecondary":  "landscape-secondary",
        "portrait-secondary":  "portrait-secondary",
        "portraitSecondary":   "portrait-secondary"
    };

    #PREFIX =
        'orientation' in window.screen
            ? ''
            : 'mozOrientation' in window.screen
                ? 'moz'
                : 'msOrientation' in window.screen ? 'ms' : null;

    #options: FLib.Events.DeviceOrientation.Options;

    get orientation(): FLib.Events.DeviceOrientation.Type {
        return this.#orientationName
    }


    constructor( options: FLib.Events.DeviceOrientation.Options ) {
        this.#options = options;

        if ( !this.#PREFIX ) {
            window.addEventListener( 'orientationchange', this.#checkWindowOrientation );
            this.#checkWindowOrientation();
            return;
        }


        if (
            'orientation' in window.screen &&
            'angle' in window.screen.orientation
        ) {
            window.screen.orientation.addEventListener(
                'change',
                this.#checkScreenOrientation
            );
            this.#checkScreenOrientation();
        }
        else {
            // @ts-expect-error
            window.screen.addEventListener(
                `${ this.#PREFIX }orientationchange`,
                this.#checkScreenOrientation
            );
            this.#checkScreenOrientation();
        }
    }


    #getOrientationProperty = (): string => {
        return this.#PREFIX + ( this.#PREFIX === '' ? 'o' : 'O' ) + 'rientation'
    }


    #processOrientation = ( type: FLib.Events.DeviceOrientation.Type ): void => {
        this.#orientationName = type;

        if ( type && this.#options.onOrientationChange ) {
            this.#options.onOrientationChange( type );
        }
    }


    #checkWindowOrientation = (): void => {
        let type: FLib.Events.DeviceOrientation.Type = '';

        const orientation: number | string = window.orientation;

        if ( orientation === -90 ) {
            type = "landscape-secondary";
        }
        else if ( orientation === 90 ) {
            type = "landscape-primary";
        }
        else if ( orientation === 0 ) {
            type = "portrait-primary";
        }
        else if ( orientation === 180 ) {
            type = "portrait-secondary";
        }

        this.#processOrientation( type );
    }


    #checkScreenOrientation = (): void => {
        let type: FLib.Events.DeviceOrientation.Type;

        const orientation = window.screen[ this.#getOrientationProperty() ];

        if ( typeof orientation === 'undefined' ) {
            return;
        }

        if ( typeof orientation.type !== 'undefined' ) {
            type = this.#ORIENTATION_CONVERTION_TABLE[ orientation.type ];
        }
        else {
            type = this.#ORIENTATION_CONVERTION_TABLE[ orientation ];
        }

        this.#processOrientation( type );
    }


    /**
     * Return the current normalized orientation
     */
    getOrientation(): FLib.Events.DeviceOrientation.Type {
        return this.#orientationName;
    }


    /**
     * Remove all binding
     */
    off(): this {
        if ( !this.#PREFIX ) {
            window.removeEventListener(
                'orientationchange',
                this.#checkWindowOrientation
            );
            return this;
        }

        if (
            'orientation' in window.screen &&
            'angle' in window.screen.orientation
        ) {
            window.screen.orientation.removeEventListener(
                'change',
                this.#checkScreenOrientation
            );
        }
        else {
            // @ts-expect-error
            window.screen.removeEventListener(
                `${ this.#PREFIX }orientationchange`,
                this.#checkScreenOrientation
            );
        }

        return this;
    }
}
