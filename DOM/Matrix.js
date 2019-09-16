import { prop } from 'front-library/DOM/Styles';

/**
 * @typedef {object} matrix_Object
 * @property {number} m11
 * @property {number} m21
 * @property {number} m31
 * @property {number} m41
 * @property {number} m12
 * @property {number} m22
 * @property {number} m32
 * @property {number} m42
 * @property {number} m13
 * @property {number} m23
 * @property {number} m33
 * @property {number} m43
 * @property {number} m14
 * @property {number} m24
 * @property {number} m34
 * @property {number} m44
*/
/**
 * @typedef {object} translate_Object
 * @property {number} tx
 * @property {number} ty
 * @property {number} tz
*/
/**
 * @typedef {object} transform_Object
 * @property {number} tx
 * @property {number} ty
 * @property {number} tz
 * @property {number} rx
 * @property {number} ry
 * @property {number} rz
*/

/**
 * Get the matrix of a DOM element
 *
 * @param {HTMLElement} $elem
 *
 * @example { m11, m21, m31, m41, m12, m22, m32, m42, m13, m23, m33, m43, m14, m24, m34, m44 } = getMatrix ( $elem )
 *
 * @returns {matrix_Object} - the matrix object
 */
export function getMatrix($elem) {
    let matrixString, c, matrix

    if (!Modernizr || Modernizr.prefixed) {
        throw 'Missing dependency: Modernizr.prefixed'
    }

    matrixString = prop($elem, Modernizr.prefixed('transform'))
    c = matrixString.split(/\s*[(),]\s*/).slice(1, -1)

    if (c.length === 6) {
        // 'matrix()' (3x2)
        matrix = {
            m11: +c[0],
            m21: +c[2],
            m31: 0,
            m41: +c[4],
            m12: +c[1],
            m22: +c[3],
            m32: 0,
            m42: +c[5],
            m13: 0,
            m23: 0,
            m33: 1,
            m43: 0,
            m14: 0,
            m24: 0,
            m34: 0,
            m44: 1
        }
    } else if (c.length === 16) {
        // matrix3d() (4x4)
        matrix = {
            m11: +c[0],
            m21: +c[4],
            m31: +c[8],
            m41: +c[12],
            m12: +c[1],
            m22: +c[5],
            m32: +c[9],
            m42: +c[13],
            m13: +c[2],
            m23: +c[6],
            m33: +c[10],
            m43: +c[14],
            m14: +c[3],
            m24: +c[7],
            m34: +c[11],
            m44: +c[15]
        }
    } else {
        // handle 'none' or invalid values.
        matrix = {
            m11: 1,
            m21: 0,
            m31: 0,
            m41: 0,
            m12: 0,
            m22: 1,
            m32: 0,
            m42: 0,
            m13: 0,
            m23: 0,
            m33: 1,
            m43: 0,
            m14: 0,
            m24: 0,
            m34: 0,
            m44: 1
        }
    }

    return matrix
}


/**
 * Get the translation values of a DOM element
 *
 * @param {HTMLElement} $elem
 *
 * @example { tx, ty, tz } = getTranslate ( $elem )
 *
 * @returns {translate_Object} - the translate properties
 */
export function getTranslate($elem) {
    let matrix

    matrix = getMatrix($elem)

    return {
        tx: matrix.m41,
        ty: matrix.m42,
        tz: matrix.m43
    }
}

/**
 * Get the transform values of a DOM element
 *
 * @param {HTMLElement} $elem
 *
 * @example { tx, ty, tz, rx, ry, rz } = getTransform ( $elem )
 *
 * @returns {transform_Object} - the transform properties
 */
export function getTransform($elem) {
    let matrix, rotateY, rotateX, rotateZ

    matrix = getMatrix($elem)
    rotateY = Math.asin(-matrix.m13)

    if (Math.cos(rotateY) !== 0) {
        rotateX = Math.atan2(matrix.m23, matrix.m33)
        rotateZ = Math.atan2(matrix.m12, matrix.m11)
    } else {
        rotateX = Math.atan2(-matrix.m31, matrix.m22)
        rotateZ = 0
    }

    return {
        rx: rotateX,
        ry: rotateY,
        rz: rotateZ,
        tx: matrix.m41,
        ty: matrix.m42,
        tz: matrix.m43
    }
}
