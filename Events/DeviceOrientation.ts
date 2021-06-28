export enum DeviceOrientationType {
    LandscapePrimary   = 'landscape-primary',
    PortraitPrimary    = 'portrait-primary',
    LandscapeSecondary = 'landscape-secondary',
    PortraitSecondary  = 'portrait-secondary',
    Unknown            = ''
}

/**
 * Handle device orientation change
 *
 * @param options
 *
 * @example
 * let ori = new DeviceOrientation({
 *     onOrientationChange: orientationName => {
 *         console.log(orientationName)
 *     }
 * })
 *
 * // Get current orientation
 * let orientationName = ori.getOrientation()
 *
 * // Remove event binding
 * ori.off()
 */
export default class DeviceOrientation {

    #orientationName: DeviceOrientationType = DeviceOrientationType.Unknown;

    #ORIENTATION_CONVERTION_TABLE: { [ keys: string ]: DeviceOrientationType } = {
        "landscape-primary":   DeviceOrientationType.LandscapePrimary,
        "landscapePrimary":    DeviceOrientationType.LandscapePrimary,
        "portrait-primary":    DeviceOrientationType.PortraitPrimary,
        "portraitPrimary":     DeviceOrientationType.PortraitPrimary,
        "landscape-secondary": DeviceOrientationType.LandscapeSecondary,
        "landscapeSecondary":  DeviceOrientationType.LandscapeSecondary,
        "portrait-secondary":  DeviceOrientationType.PortraitSecondary,
        "portraitSecondary":   DeviceOrientationType.PortraitSecondary
    };

    #PREFIX =
        'orientation' in window.screen
            ? ''
            : 'mozOrientation' in window.screen
                ? 'moz'
                : 'msOrientation' in window.screen ? 'ms' : null;

    #options: DeviceOrientationOptionsType;

    get orientation(): DeviceOrientationType {
        return this.#orientationName
    }


    constructor( options: DeviceOrientationOptionsType ) {
        this.#options = options;

        if ( !this.#PREFIX ) {
            window.addEventListener( 'orientationchange', this.checkWindowOrientation );
            this.checkWindowOrientation();
            return;
        }


        if (
            'orientation' in window.screen &&
            'angle' in window.screen.orientation
        ) {
            window.screen.orientation.addEventListener(
                'change',
                this.checkScreenOrientation
            );
            this.checkScreenOrientation();
        }
        else {
            // @ts-expect-error
            window.screen.addEventListener(
                `${ this.#PREFIX }orientationchange`,
                this.checkScreenOrientation
            );
            this.checkScreenOrientation();
        }
    }


    private getOrientationProperty(): string {
        return this.#PREFIX + ( this.#PREFIX === '' ? 'o' : 'O' ) + 'rientation'
    }


    private processOrientation( type: DeviceOrientationType ): void {
        this.#orientationName = type;

        if ( type && this.#options.onOrientationChange ) {
            this.#options.onOrientationChange( type );
        }
    }


    private checkWindowOrientation = (): void => {
        let type: DeviceOrientationType = DeviceOrientationType.Unknown;

        const orientation: number | string = window.orientation;

        if ( orientation === -90 ) {
            type = DeviceOrientationType.LandscapeSecondary;
        }
        else if ( orientation === 90 ) {
            type = DeviceOrientationType.LandscapePrimary;
        }
        else if ( orientation === 0 ) {
            type = DeviceOrientationType.PortraitPrimary;
        }
        else if ( orientation === 180 ) {
            type = DeviceOrientationType.PortraitSecondary;
        }

        this.processOrientation( type );
    }


    private checkScreenOrientation(): void {
        let type: DeviceOrientationType;

        const orientation = window.screen[ this.getOrientationProperty() ];

        if ( typeof orientation === 'undefined' ) {
            return;
        }

        if ( typeof orientation.type !== 'undefined' ) {
            type = this.#ORIENTATION_CONVERTION_TABLE[ orientation.type ];
        }
        else {
            type = this.#ORIENTATION_CONVERTION_TABLE[ orientation ];
        }

        this.processOrientation( type );
    }


    /**
     * Return the current normalized orientation
     *
     * @return {String} landscape-primary, portrait-primary, landscape-secondary, portrait-secondary
     */
    getOrientation(): DeviceOrientationType {
        return this.#orientationName;
    }


    /**
     * Remove all binding
     *
     * @returns {DeviceOrientation}
     */
    off(): this {
        if ( !this.#PREFIX ) {
            window.removeEventListener(
                'orientationchange',
                this.checkWindowOrientation
            );
            return this;
        }

        if (
            'orientation' in window.screen &&
            'angle' in window.screen.orientation
        ) {
            window.screen.orientation.removeEventListener(
                'change',
                this.checkScreenOrientation
            );
        }
        else {
            // @ts-expect-error
            window.screen.removeEventListener(
                `${ this.#PREFIX }orientationchange`,
                this.checkScreenOrientation
            );
        }

        return this;
    }
}
