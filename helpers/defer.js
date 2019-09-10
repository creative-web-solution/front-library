/**
 * Deferred promise
 *
 * @example let dfd = defer()
 *
 * // To resolve:
 * dfd.resolve()
 *
 * // To reject:
 * dfd.reject()
 *
 * @returns {Promise} - a promise with a resolve and reject function
 */
export function defer() {
    let res, rej

    let promise = new Promise((resolve, reject) => {
        res = resolve
        rej = reject
    })

    promise.resolve = a => {
        res(a)
        return promise
    }

    promise.reject = a => {
        rej(a)
        return promise
    }

    return promise
}
