/**
 * Debounce
 *
 * @example
 * debouncedFunction = debounce( myFunction, 200 )
 */
export function debounce(
                    callback: ( ...args: any[] ) => void,
                    threshold = 100,
                    immediate = false
                ): ( ...args: any[] ) => void {
    let timeout: any;

    return function<Type>( this: Type, ...args: any[] ) {

        const later = () => {
            timeout = undefined;

            if ( !immediate ) {
                callback.apply( this, args );
            }
        };

        const callNow: boolean = immediate && !timeout;

        clearTimeout( timeout );

        timeout = setTimeout( later, threshold );

        if ( callNow ) {
            callback.apply( this, args );
        }
    };
}
