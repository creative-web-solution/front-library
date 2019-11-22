import { defer } from 'front-library/Helpers/defer';

/**
 * @typedef {Object} Validator_State
 *
 * @property {HTMLElement} $input
 * @property {String|Number} value
 * @property {Boolean} isValid
 * @property {String} validatorName
 * @property {*} data
 */
/**
 * Create a basic state object that will be return as parameter in promises
 *
 * @function createState
 *
 * @param {HTMLElement} $input
 * @param {String|Number} value
 * @param {Boolean} isValid
 * @param {String} validatorName
 * @param {*} data
 * @param {Boolean} isLiveValidation
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Validator_State}
 */
export function createState( $input, value, isValid, validatorName, data, isLiveValidation ) {
    return {
        $input,
        value,
        isValid,
        "label": validatorName,
        data,
        isLiveValidation
    };
}


/**
 * Helper for basic (synchronous) validation system
 *
 * @function standardValidation
 *
 * @param {HTMLElement} $input
 * @param {String} value
 * @param {Boolean} isValid
 * @param {String} validatorName
 * @param {*} data
 * @param {Boolean} isLiveValidation
 *
 * @see extra/modules/validator.md for details
 *
 * @returns {Promise}
 */
export function standardValidation( $input, value, isValid, validatorName, data, isLiveValidation ) {
    let deferred, state;

    deferred = defer();
    state = createState( $input, value, isValid, validatorName, data, isLiveValidation );

    deferred.resolve( state );

    return deferred;
}
