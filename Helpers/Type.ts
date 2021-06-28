const CLASS_TO_TYPE: { [ key: string ]: string }  = {};
const CORE_TO_STRING = CLASS_TO_TYPE.toString;
const CORE_HAS_OWN   = CLASS_TO_TYPE.hasOwnProperty;


/**
 * Check the type of an object
 *
 * @param obj
 * @param type
 *
 * @example
 * boolean = isType( obj, 'String' )
 *
 * @returns true if the object is in the asked type
 */
export function isType( obj: any, type: string ): boolean {
    return Object.prototype.toString.call( obj ).indexOf( type ) > -1;
}


/**
 * Return true if the objec is an Array
 *
 * @param obj
 *
 * @example
 * boolean = isArray( obj )
 */
export function isArray( obj: any ): boolean {
    return isType(obj, 'Array');
}


/**
 * Return true if the object is a Function
 *
 * @param obj
 *
 * @example
 * boolean = isFunction( obj )
 */
export function isFunction( obj: any ): boolean {
    return isType(obj, 'Function');
}


/**
 * Return true if the object is a String
 *
 * @param obj
 *
 * @example
 * boolean = isString( obj )
 */
export function isString( obj: any ): boolean {
    return isType( obj, 'String' );
}


/**
 * Return true if the object is a Number
 *
 * @param obj
 *
 * @example
 * boolean = isNumber( obj )
 */
export function isNumber( obj: any ): boolean {
    return isType( obj, 'Number' );
}



'Boolean Number String Function Array Date RegExp Object Error'
    .split( ' ' )
    .forEach( function( name ) {
        CLASS_TO_TYPE[ `[object ${ name }]` ] = name.toLowerCase();
    } );




/**
 * Return true if obj is {} or an object created with "new Object"
 *
 * @param obj
 */
export function isPlainObject( obj: any ): boolean {
    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if ( !obj || CORE_TO_STRING.call( obj ) !== "[object Object]" ) {
        return false;
    }

    const proto = Object.getPrototypeOf( obj );

    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if ( !proto ) {
        return true;
    }

    // Objects with prototype are plain iff they were constructed by a global Object function
    const Ctor = CORE_HAS_OWN.call( proto, "constructor" ) && proto.constructor;

    return typeof Ctor === "function" && CORE_HAS_OWN.toString.call( Ctor ) === CORE_HAS_OWN.toString.call( Object );
}

