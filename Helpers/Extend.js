import { isFunction, isArray } from 'front-library/Helpers/Type';

function _extend() {
    var options,
        name,
        src,
        copy,
        copyIsArray,
        clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = true,
        class2type = {},
        core_toString = class2type.toString,
        core_hasOwn = class2type.hasOwnProperty;

    'Boolean Number String Function Array Date RegExp Object Error'
        .split(' ')
        .forEach(function(name) {
            class2type['[object ' + name + ']'] = name.toLowerCase();
        });

    function type(obj) {
        if (obj == null) {
            return String(obj);
        }
        // Support: Safari <= 5.1 (functionish RegExp)
        return typeof obj === 'object' || typeof obj === 'function'
            ? class2type[core_toString.call(obj)] || 'object'
            : typeof obj;
    }

    function isPlainObject(obj) {
        // Not plain objects:
        // - Any object or value whose internal [[Class]] property is not "[object Object]"
        // - DOM nodes
        // - window
        if (type(obj) !== 'object' || obj.nodeType || obj === window) {
            return false;
        }

        // Support: Firefox <20
        // The try/catch suppresses exceptions thrown when attempting to access
        // the "constructor" property of certain host objects, ie. |window.location|
        // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
        try {
            if (
                obj.constructor &&
                !core_hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')
            ) {
                return false;
            }
        } catch (e) {
            return false;
        }

        // If the function hasn't returned already, we're confident that
        // |obj| is a plain object, created by {} or constructed with new Object
        return true;
    }

    // Handle a deep copy situation
    if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== 'object' && !isFunction(target)) {
        target = {};
    }

    // extend jQuery itself if only one argument is passed
    if (length === i) {
        target = this;
        --i;
    }

    for (; i < length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {
            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }
                // Recurse if we're merging plain objects or arrays
                if (
                    deep &&
                    copy &&
                    (isPlainObject(copy) || (copyIsArray = isArray(copy)))
                ) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && isArray(src) ? src : [];
                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = _extend(deep, clone, copy);

                    // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
}


/**
 * Clone the properties of an object and its children (deep copy)
 *
 * @function copy
 *
 * @param {Object} target - Object to copy
 *
 * @example clonedObject = copy(target)
 *
 * @returns {Object}
 */
export function copy( target ) {
    return _extend( true, {}, target );
}


/**
 * Merge the properties of an object and its children (deep merge) with others objects.
 * It doesn't modify the target object.
 *
 * @function extend
 *
 * @param {Object} target - Object to merge
 * @param {...Object} sources - All other arguments are objects
 *
 * @example extendedObject = extend(target, obj1, obj2)
 *
 * @returns {Object}
 */
export function extend( ...args ) {
    return _extend( true, {}, ...args );
}

