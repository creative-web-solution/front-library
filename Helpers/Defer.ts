export type DeferredPromise<T> = Promise<T | undefined> & { resolve: ( a?: T | PromiseLike<T> ) => void; reject:  ( a?: T | PromiseLike<T> ) => void; }

/**
 * Deferred promise
 *
 * @example
 * let prom = defer()
 *
 * // To resolve:
 * prom.resolve()
 *
 * // To reject:
 * prom.reject()
 *
 * @returns - a promise with a resolve and reject function
 */
export function defer<T>(): DeferredPromise<T> {
    let res: (a?: T | PromiseLike<T> ) => void,
        rej: (a?: T | PromiseLike<T> ) => void;

    const promise = new Promise<T | undefined>( ( resolve, reject ) => {
        res = resolve;
        rej = reject;
    } ) as DeferredPromise<T>;

    promise.resolve = ( a?: T | PromiseLike<T> ) => {
        res( a );
        return promise;
    };

    promise.reject = ( a?: T | PromiseLike<T> )=> {
        rej( a );
        return promise;
    };

    return promise;
}
