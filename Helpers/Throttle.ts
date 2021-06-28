/**
 * Throttle
 *
 * @param callback
 * @param limit - In millisecond
 *
 * @example
 * throttledFunction = throttle( cbFunction, 200 )
 */
export function throttle(
                    callback: ( ...args: any[] ) => void,
                    limit = 100
                ) : ( ...args: any[] ) => void {
    let wait = false;

    return function<Type>( this: Type, ...args ) {
        if ( !wait ) {
            wait = true;

            callback.apply( this, args );

            setTimeout( () => {
                wait = false;
            }, limit );
        }
    }
}
