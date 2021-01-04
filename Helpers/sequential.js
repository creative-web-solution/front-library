import { isArray } from '@creative-web-solution/front-library/Helpers/Type';

/**
 * Create a sequential list of promises (which resolves one after another)
 *
 * @param {Promise[]} promisesArray
 *
 * @example prom = sequence( arrayOfPromise )
 *
 * @returns {Promise}
 */
export function sequence( promisesArray ) {
    if ( !promisesArray || !isArray( promisesArray ) ) {
        throw new Error( 'First argument need to be an array of Promises' );
    }

    return promisesArray.reduce( ( seqProm, item ) => {
        return seqProm.then( item );
    }, Promise.resolve() );
}
