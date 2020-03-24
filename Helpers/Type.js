const CLASS_TO_TYPE  = {};
const CORE_TO_STRING = CLASS_TO_TYPE.toString;
const CORE_HAS_OWN   = CLASS_TO_TYPE.hasOwnProperty;


/**
 * Check the type of an object
 *
 * @param {*} obj
 * @param {String} type
 *
 * @example boolean = isType( obj, 'String' )
 *
 * @returns {Boolean} - true if the object is in the asked type
 */
export function isType( obj, type ) {
    return Object.prototype.toString.call( obj ).indexOf( type ) > -1;
}


/**
 * Return true if the objec is an Array
 *
 * @param {*} obj
 *
 * @example boolean = isArray( obj )
 *
 * @returns {Boolean}
 */
export function isArray( obj ) {
    return isType(obj, 'Array');
}


/**
 * Return true if the object is a Function
 *
 * @param {*} obj
 *
 * @example boolean = isFunction( obj )
 *
 * @returns {Boolean}
 */
export function isFunction( obj ) {
    return isType(obj, 'Function');
}


/**
 * Return true if the object is a String
 *
 * @param {*} obj
 *
 * @example boolean = isString( obj )
 *
 * @returns {Boolean}
 */
export function isString( obj ) {
    return isType( obj, 'String' );
}


/**
 * Return true if the object is a Number
 *
 * @param {*} obj
 *
 * @example boolean = isNumber( obj )
 *
 * @returns {Boolean}
 */
export function isNumber( obj ) {
    return isType( obj, 'Number' );
}



'Boolean Number String Function Array Date RegExp Object Error'
    .split( ' ' )
    .forEach( function( name ) {
        CLASS_TO_TYPE[ `[object ${ name }]` ] = name.toLowerCase();
    } );




/**
 * Return true if obj is {} or an object created with "new Object"
 * @function
 *
 * @param {*} obj
 *
 * @return {Boolean}
 */
export function isPlainObject( obj ) {
    let proto, Ctor;

    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if ( !obj || CORE_TO_STRING.call( obj ) !== "[object Object]" ) {
        return false;
    }

    proto = Object.getPrototypeOf( obj );

    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if ( !proto ) {
        return true;
    }

    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = CORE_HAS_OWN.call( proto, "constructor" ) && proto.constructor;

    return typeof Ctor === "function" && CORE_HAS_OWN.toString.call( Ctor ) === CORE_HAS_OWN.toString.call( Object );
}

