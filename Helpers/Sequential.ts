import { isArray } from './Type';


/**
 * Create a sequential list of promises (which resolves one after another)
 *
 * @example
 * prom = sequence( arrayOfPromise )
 */
export function sequence( promisesArray: Promise<any>[] ): Promise<any> {
    if ( !promisesArray || !isArray( promisesArray ) ) {
        throw new Error( 'First argument need to be an array of Promises' );
    }

    return promisesArray.reduce( ( seqProm, item: any ) => {
        return seqProm.then( item );
    }, Promise.resolve() );
}
