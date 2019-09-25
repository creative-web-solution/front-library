
let _ = {}

// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
let templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
}

// When customizing `templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
let noMatch = /(.)^/

// Certain characters need to be escaped so that they can be put into a
// string literal.
let escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
}

let escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g

// List of HTML entities for escaping.
let entityMap = {
    escape: {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
    }
}

function objectKeys(obj) {
    if (obj !== Object(obj)) {
        return []
    }
    return Object.keys(obj)
}

// Invert the keys and values of an object. The values must be serializable.
function invert(obj) {
    let result = {},
        keys = objectKeys(obj)

    for (let i = 0, length = keys.length; i < length; i++) {
        result[obj[keys[i]]] = keys[i]
    }

    return result
}

entityMap.unescape = invert(entityMap.escape)

// "Regexes" containing the keys and values listed immediately above.
let entityRegexes = {
    escape: new RegExp(
        '[' + objectKeys(entityMap.escape).join('') + ']',
        'g'
    ),
    unescape: new RegExp(
        '(' + objectKeys(entityMap.unescape).join('|') + ')',
        'g'
    )
}

// Functions for escaping and unescaping strings to/from HTML interpolation.
;['escape', 'unescape'].forEach(method => {
    _[method] = function(string) {
        if (string == null) {
            return ''
        }

        return ('' + string).replace(entityRegexes[method], match => {
            return entityMap[method][match]
        })
    }
})

// Fill in a given object with default properties.
function defaults(obj) {
    Array.prototype.slice.call(arguments, 1).forEach(source => {
        if (source) {
            for (var prop in source) {
                if (obj[prop] === void 0) {
                    obj[prop] = source[prop]
                }
            }
        }
    })

    return obj
}

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
/**
 * Micro templating from Underscore
 *
 * @function
 * @param {String} text
 * @param {Object} data
 * @param {Object} [settings]
 * @param {RegExp} [settings.evaluate=/<%([\s\S]+?)%>/g]
 * @param {RegExp} [settings.interpolate=/<%=([\s\S]+?)%>/g]
 * @param {RegExp} [settings.escape=/<%-([\s\S]+?)%>/g]
 *
 * @see extra/modules/template.md
 *
 * @example let tplFunction = template( html );
 * let html = tplFunction( { "text": "hey!!" } );
 *
 * // or
 *
 * let html = template( html, { "text": "hey!!" } );
 */
export function template(text, data, settings) {
    let render, index, source, tpl

    settings = defaults({}, templateSettings, settings)

    // Combine delimiters into one regular expression via alternation.
    let matcher = new RegExp(
        [
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$',
        'g'
    )

    // Compile the template source, escaping string literals appropriately.
    index = 0
    source = "__p+='"

    text.replace(
        matcher,
        (match, escape, interpolate, evaluate, offset) => {
            source += text.slice(index, offset).replace(escaper, match => {
                return '\\' + escapes[match]
            })

            if (escape) {
                source +=
                    "'+\n((__t=(" +
                    escape +
                    "))==null?'':_.escape(__t))+\n'"
            }

            if (interpolate) {
                source +=
                    "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'"
            }

            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='"
            }

            index = offset + match.length

            return match
        }
    )

    source += "';\n"

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) {
        source = 'with(obj||{}){\n' + source + '}\n'
    }

    source =
        "var __t,__p='',__j=Array.prototype.join," +
        "print=function(){__p+=__j.call(arguments,'');};\n" +
        source +
        'return __p;\n'

    try {
        render = new Function(settings.variable || 'obj', '_', source)
    } catch (e) {
        e.source = source
        throw e
    }

    if (data) {
        return render(data, _)
    }

    tpl = function(data) {
        return render.call(this, data, _)
    }

    // Provide the compiled function source as a convenience for precompilation.
    tpl.source =
        'function(' + (settings.variable || 'obj') + '){\n' + source + '}'

    return tpl
}

