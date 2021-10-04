/**
 * Deferred promise
 *
 * @example
 * let dfd = defer()
 *
 * // To resolve:
 * dfd.resolve()
 *
 * // To reject:
 * dfd.reject()
 *
 * @returns - a promise with a resolve and reject function
 */
export function defer(): Promise<any> & { resolve: ( a?: any ) => void; reject:  ( a?: any ) => void; } {
    let res: (a: any ) => void,
        rej: (a: any ) => void;

    const promise = new Promise( ( resolve, reject ) => {
        res = resolve;
        rej = reject;
    } ) as Promise<any> & { resolve: ( a?: any ) => void; reject:  ( a?: any ) => void; } ;

    promise.resolve = ( a: any ) => {
        res( a );
        return promise;
    };

    promise.reject = ( a : any )=> {
        rej( a );
        return promise;
    };

    return promise;
}
