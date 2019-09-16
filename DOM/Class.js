function updateClass($element, cssClass, add) {
    let functionName = add ? 'add' : 'remove'

    cssClass.split(' ').forEach(cls => {
        $element.classList[functionName](cls)
    })
}

function classToggle($elements, cssClass, add) {
    if ($elements.classList) {
        updateClass($elements, cssClass, add)
    } else if (typeof $elements.length === 'number') {
        $elements.forEach($element => {
            if (!$element.classList) {
                return
            }
            updateClass($element, cssClass, add)
        })
    }

    return $elements
}

/**
 * Check if a class is present on a DOM element
 *
 * @param {HTMLElement} $element - DOM element
 * @param {string} cssClass
 *
 * @example boolean = hClass( $element, cssClass )
 *
 * @return {boolean} - true if a class is present on a DOM element
 */
export function hClass($element, cssClass) {
    if (!$element.classList) {
        return
    }

    return $element.classList.contains(cssClass)
}

/**
 * Add a class on an element or a list of elements
 *
 * @param {(HTMLElement|HTMLElement[])} $elements - DOM element or array of DOM element
 * @param {string} cssClass - Classnames separated by space
 *
 * @example aClass( $elements, cssClass )
 *
 * @returns {HTMLElement|HTMLElement[]}
 */
export function aClass($elements, cssClass) {
    return classToggle($elements, cssClass, true)
}

/**
 * Remove a class on an element or a list of elements
 *
 * @example rClass( $elements, cssClass )
 *
 * @param {(HTMLElement|HTMLElement[])} $elements - DOM element or array of DOM element
 * @param {string} cssClass - Classnames separated by space
 *
 * @returns {HTMLElement|HTMLElement[]}
 */
export function rClass($elements, cssClass) {
    return classToggle($elements, cssClass, false)
}

/**
 * Toggle a class on an element or a list of elements
 *
 * @param {(HTMLElement|HTMLElement[])} $elements - DOM element or array of DOM element
 * @param {string} cssClass - Classnames separated by space
 * @param {?boolean} isActive
 *
 * @example tClass( $elements, cssClass )
 * tClass( $elements, cssClass, isActive )
 *
 * @returns {HTMLElement|HTMLElement[]}
 */
export function tClass($elements, cssClass, isActive) {
    return classToggle(
        $elements,
        cssClass,
        typeof isActive === 'undefined' ? !hClass($elements, cssClass) : isActive
    )
}
