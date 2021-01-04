import { isFunction, isArray, isPlainObject } from '@creative-web-solution/front-library/Helpers/Type';


/**
 * Extend function from jQuery 3
 */
function _extend() {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[ 0 ] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if ( typeof target === 'boolean' ) {
        deep = target;

        // Skip the boolean and the target
        target = arguments[ i ] || {};
        i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== 'object' && !isFunction( target ) ) {
        target = {};
    }


    for ( ; i < length; i++ ) {

        // Only deal with non-null/undefined values
        if ( ( options = arguments[ i ] ) != null ) {

            // Extend the base object
            for ( name in options ) {
                copy = options[ name ];

                // Prevent Object.prototype pollution
                // Prevent never-ending loop
                if ( name === "__proto__" || target === copy ) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if ( deep && copy && ( isPlainObject( copy ) ||
                    ( copyIsArray = isArray( copy ) ) ) ) {
                    src = target[ name ];

                    // Ensure proper type for the source value
                    if ( copyIsArray && !isArray( src ) ) {
                        clone = [];
                    } else if ( !copyIsArray && !isPlainObject( src ) ) {
                        clone = {};
                    } else {
                        clone = src;
                    }
                    copyIsArray = false;

                    // Never move original objects, clone them
                    target[ name ] = _extend( deep, clone, copy );

                // Don't bring in undefined values
                } else if ( copy !== undefined ) {
                    target[ name ] = copy;
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

