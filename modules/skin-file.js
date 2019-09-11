import { extend } from 'front-library/helpers/extend';
import { strToDOM } from 'front-library/dom/str-to-dom';
import { insertAfter, append } from 'front-library/dom/manipulation';

/**
 * Skin an input file DOM element
 *
 * @function
 * @param {HTMLElement} $input
 * @param {Object} options
 * @param {string} [options.wrap=<span class="cb-skin"></span>]
 * @param {string} [options.fileInfo=<div class="file-info"></div>]
 *
 * @example // Call with default options:
 * skinInputFile( $input, {
 *   "wrap": "<div class=\"file-skin\"></div>",
 *   "fileInfo": "<div class=\"file-info\"></div>"
 * } );
 */
let skinInputFile;


/**
 * Skin all input file DOM element in a wrapper
 *
 * @function
 * @param {HTMLElement} $wrapper
 * @param {Object} options
 * @param {string} [options.wrap=<span class="cb-skin"></span>]
 * @param {string} [options.fileInfo=<div class="file-info"></div>]
 *
 * @example // Call with default options:
 * skinInputFileAll( $wrapper, {
 *   "wrap": "<div class=\"file-skin\"></div>",
 *   "fileInfo": "<div class=\"file-info\"></div>"
 * } );
 */
let skinInputFileAll;

{
    const defaultOptions = {
        wrap: '<div class="file-skin"></div>',
        fileInfo: '<div class="file-info"></div>'
    }

    function SkinFile($input, userOptions = {}) {
        let $fileInfo, $wrap, fileInfoId, originalFileInfoText, options

        options = extend(defaultOptions, userOptions)

        originalFileInfoText = ''

        function changeState() {
            let aValue

            if (!$input.value) {
                $fileInfo.innerHTML = originalFileInfoText

                if (!originalFileInfoText) {
                    $fileInfo.style.display = 'none'
                }

                return
            }

            aValue = $input.value.split(/(\\|\/)/)

            $fileInfo.innerHTML = aValue[aValue.length - 1]
            $fileInfo.style.display = ''
        }

        function changeHandler() {
            changeState()
        }

        $wrap = strToDOM(options.wrap)

        insertAfter($wrap, $input)

        append($input, $wrap)

        if ($input.hasAttribute('data-file-info')) {
            fileInfoId = $input.getAttribute('data-file-info')
            $fileInfo = document.getElementById(fileInfoId)
        }

        if ($fileInfo) {
            originalFileInfoText = $fileInfo.innerHTML
            originalFileInfoText = originalFileInfoText.trim()
        } else {
            $fileInfo = strToDOM(options.fileInfo)
            append($fileInfo, $wrap)
        }

        $input.addEventListener('change', changeHandler)

        changeState()
    }

    skinInputFile = function($input, options) {
        return new SkinFile($input, options)
    }

    skinInputFileAll = function($wrapper, options) {
        let $inputs, list

        list = []

        $inputs = $wrapper.querySelectorAll('input[type="file"]')

        $inputs.forEach($input => {
            list.push(new SkinFile($input, options))
        })

        return list
    }
}

export { skinInputFile, skinInputFileAll }
