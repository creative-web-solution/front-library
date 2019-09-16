/**
 * @callback DeviceOrientation_Callback
 * @memberof DeviceOrientation
 * @description Called when the orientation of the device change
 * @param {string} type - Name of the orientation: landscape-primary | portrait-primary | landscape-secondary | portrait-secondary
*/
/**
 * Handle device orientation change
 * @class
 *
 * @example let ori = new DeviceOrientation({
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
 *
 * @param {Object} options
 * @param {DeviceOrientation_Callback} options.onOrientationChange
 */
export function DeviceOrientation(options) {
    let orientationName

    const ORIENTATION_CONVERTION_TABLE = {
        "landscape-primary": "landscape-primary",
        "landscapePrimary": "landscape-primary",
        "portrait-primary": "portrait-primary",
        "portraitPrimary": "portrait-primary",
        "landscape-secondary": "landscape-secondary",
        "landscapeSecondary": "landscape-secondary",
        "portrait-secondary": "portrait-secondary",
        "portraitSecondary": "portrait-secondary"
    }

    const PREFIX =
        'orientation' in window.screen
            ? ''
            : 'mozOrientation' in window.screen
                ? 'moz'
                : 'msOrientation' in window.screen ? 'ms' : null

    function getOrientationProperty() {
        return PREFIX + (PREFIX === '' ? 'o' : 'O') + 'rientation'
    }

    /**
     * Return the current normalized orientation
     *
     * @return {string} landscape-primary, portrait-primary, landscape-secondary, portrait-secondary
     */
    this.getOrientation = () => {
        return orientationName
    }

    /**
     * Remove all binding
     */
    this.off = () => {
        if (!PREFIX) {
            window.removeEventListener(
                'orientationchange',
                checkWindowOrientation
            )
            return
        }

        if (
            'orientation' in window.screen &&
            'angle' in window.screen.orientation
        ) {
            window.screen.orientation.removeEventListener(
                'change',
                checkScreenOrientation
            )
        } else {
            window.screen.removeEventListener(
                PREFIX + 'orientationchange',
                checkScreenOrientation
            )
        }
    }

    function processOrientation(type) {
        orientationName = type

        if (type && options.onOrientationChange) {
            options.onOrientationChange(type)
        }
    }

    function checkWindowOrientation() {
        let type,
            orientation = window.orientation

        if (orientation === -90) {
            type = 'landscape-secondary'
        } else if (orientation === 90) {
            type = 'landscape-primary'
        } else if (orientation === 0) {
            type = 'portrait-primary'
        } else if (orientation === 180) {
            type = 'portrait-secondary'
        }

        processOrientation(type)
    }

    function checkScreenOrientation() {
        let type,
            orientation = window.screen[getOrientationProperty()]

        if (typeof orientation.type !== 'undefined') {
            type = ORIENTATION_CONVERTION_TABLE[orientation.type]
        } else if (typeof orientation !== 'undefined') {
            type = ORIENTATION_CONVERTION_TABLE[orientation]
        }

        processOrientation(type)
    }

    if (!PREFIX) {
        window.addEventListener('orientationchange', checkWindowOrientation)
        checkWindowOrientation()
        return
    }

    if (
        'orientation' in window.screen &&
        'angle' in window.screen.orientation
    ) {
        window.screen.orientation.addEventListener(
            'change',
            checkScreenOrientation
        )
        checkScreenOrientation()
    } else {
        window.screen.addEventListener(
            PREFIX + 'orientationchange',
            checkScreenOrientation
        )
        checkScreenOrientation()
    }
}
