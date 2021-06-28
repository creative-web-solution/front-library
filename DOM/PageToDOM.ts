/*
 *  Convert HTML string to DOM object
 *
 */

let $document: Document;

// Use only one document.implementation else it will fail in Firefox after few convertion
if ( document.implementation && document.implementation.createHTMLDocument ) {
    $document = document.implementation.createHTMLDocument( '' );
}

/* String html  A string representing HTML code
    String      A new string, fully stripped of external resources.
    All "external" attributes (href, src) are prefixed by data-
*/
function sanitiseHTML( html: string ) {
    const prefix = '<!--"\'-->';
    const att = '[^-a-z0-9:._]';
    const tag = '<[a-z]';
    const any = '(?:[^<>"\']*(?:"[^"]*"|\'[^\']*\'))*?[^<>]*';
    const etag = '(?:>|(?=<))';

    const entityEnd = '(?:;|(?!\\d))';
    const ents: { [ keys:string ]: string } = {
        ' ': '(?:\\s|&nbsp;?|&#0*32' + entityEnd + '|&#x0*20' + entityEnd + ')',
        '(': '(?:\\(|&#0*40' + entityEnd + '|&#x0*28' + entityEnd + ')',
        ')': '(?:\\)|&#0*41' + entityEnd + '|&#x0*29' + entityEnd + ')',
        '.': '(?:\\.|&#0*46' + entityEnd + '|&#x0*2e' + entityEnd + ')'
    };

    const charMap: { [ keys:string ]: string } = {};
    const s = ents[ ' ' ] + '*';

    function ae( string: string ) {
        const all_chars_lowercase = string.toLowerCase();
        if ( ents[ string ] ) {
            return ents[ string ];
        }
        const all_chars_uppercase = string.toUpperCase();
        let RE_res = '';
        for ( let i = 0; i < string.length; i++ ) {
            const char_lowercase = all_chars_lowercase.charAt( i );
            if ( charMap[ char_lowercase ] ) {
                RE_res += charMap[ char_lowercase ];
                continue;
            }
            const char_uppercase = all_chars_uppercase.charAt( i );
            const RE_sub = [ char_lowercase ];
            RE_sub.push( '&#0*' + char_lowercase.charCodeAt(0) + entityEnd );
            RE_sub.push(
                '&#x0*' + char_lowercase.charCodeAt( 0 ).toString( 16 ) + entityEnd
            );
            if ( char_lowercase !== char_uppercase ) {
                RE_sub.push( '&#0*' + char_uppercase.charCodeAt( 0 ) + entityEnd );
                RE_sub.push(
                    '&#x0*' +
                        char_uppercase.charCodeAt( 0 ).toString( 16 ) +
                        entityEnd
                );
            }
            RE_res += charMap[char_lowercase] = '(?:' + RE_sub.join('|') + ')';
        }

        return ( ents[ string ] = RE_res );
    }

    function by( match: string, group1: string, group2: string ) {
        return group1 + 'data-' + group2;
    }

    function cr( selector: string | RegExp, attribute: string, marker?: string, delimiter?: string, end?: string ) {
        if ( typeof selector === 'string' ) {
            selector = new RegExp( selector, 'gi' );
        }
        marker = typeof marker === 'string' ? marker : '\\s*=';
        delimiter = typeof delimiter === 'string' ? delimiter : '';
        end = typeof end === 'string' ? end : '';
        const is_end = end && '?';
        const re1 = new RegExp(
            '(' +
                att +
                ')(' +
                attribute +
                marker +
                '(?:\\s*"[^"' +
                delimiter +
                "]*\"|\\s*'[^'" +
                delimiter +
                "]*'|[^\\s" +
                delimiter +
                ']+' +
                is_end +
                ')' +
                end +
                ')',
            'gi'
        );

        html = html.replace(selector, function( match ) {
            return prefix + match.replace( re1, by );
        } );
    }

    function cri( selector: string | RegExp, attribute: string, front: string, flags: string | number, delimiter: string, end: string ) {
        if ( typeof selector === 'string' ) {
            selector = new RegExp( selector, 'gi' );
        }
        flags = typeof flags === 'string' ? flags : 'gi';
        const re1 = new RegExp(
            '(' +
                att +
                attribute +
                '\\s*=)((?:\\s*"[^"]*"|\\s*\'[^\']*\'|[^\\s>]+))',
            'gi'
        );

        end = typeof end === 'string' ? end + ')' : ')';
        const at1 = new RegExp( '(")(' + front + '[^"]+")', flags );
        const at2 = new RegExp( "(')(" + front + "[^']+')", flags );
        const at3 = new RegExp(
            '()(' +
                front +
                '(?:"[^"]+"|\'[^\']+\'|(?:(?!' +
                delimiter +
                ').)+)' +
                end,
            flags
        );

        const handleAttr = function( match: string, g1: string, g2: string ) {
            if ( g2.charAt( 0 ) === '"' ) {
                return g1 + g2.replace( at1, by );
            }
            if ( g2.charAt( 0 ) === "'" ) {
                return g1 + g2.replace( at2, by );
            }
            return g1 + g2.replace( at3, by);
        };

        html = html.replace( selector, function( match ) {
            return prefix + match.replace( re1, handleAttr );
        } );
    }

    html = html.replace(
        new RegExp(
            '<script' +
                any +
                '>\\s*//\\s*<\\[CDATA\\[[\\S\\s]*?]]>\\s*</script[^>]*>',
            'gi'
        ),
        '<!--CDATA script-->'
    );

    html = html.replace(
        /<script[\S\s]+?<\/script\s*>/gi,
        '<!--Non-CDATA script-->'
    );

    cr(
        tag + any + att + 'on[-a-z0-9:_.]+=' + any + etag,
        'on[-a-z0-9:_.]+'
    ) /* Event listeners */

    cr(
        /<style[^>]*>(?:[^"']*(?:"[^"]*"|'[^']*'))*?[^'"]*(?:<\/style|$)/gi,
        'url',
        '\\s*\\(\\s*',
        '',
        '\\s*\\)'
    );

    cri(
        tag + any + att + 'style\\s*=' + any + etag,
        'style',
        ae('url') + s + ae('(') + s,
        0,
        s + ae(')'),
        ae(')')
    );

    cr(
        /<style[^>]*>(?:[^"']*(?:"[^"]*"|'[^']*'))*?[^'"]*(?:<\/style|$)/gi,
        'expression',
        '\\s*\\(\\s*',
        '',
        '\\s*\\)'
    );

    cri(
        tag + any + att + 'style\\s*=' + any + etag,
        'style',
        ae('expression') + s + ae('(') + s,
        0,
        s + ae(')'),
        ae(')')
    );

    return html.replace( new RegExp( '(?:' + prefix + ')+', 'g' ), prefix )
}


function string2dom( html: string, callback: ( document: Document, destroy: () => void ) => void ): { doc: Document, destroy: () => void } | void {
    html = sanitiseHTML( html );

    const iframe = document.createElement( 'iframe' );
    iframe.style.display = 'none';
    document.body.appendChild( iframe );

    const doc = iframe.contentDocument || (iframe.contentWindow as Window).document;
    doc.open();
    doc.write( html );
    doc.close();

    function destroy() {
        iframe.parentNode?.removeChild( iframe );
    }

    if ( callback ) {
        callback( doc, destroy );
    }
    else {
        return {
            "doc": doc,
            "destroy": destroy
        };
    }
}


/**
 * Convert a whole HTML page string in a document
 *
 * @param html
 *
 * @example
 * pageToDOM( html ).then( $document => {} )
 *
 * @returns a Promise with the converted document in parameter
 */
export function pageToDOM( html: string ): Promise<Document> | Promise<Node> {
    return new Promise( resolve => {
        if ( $document ) {
            try {
                $document.documentElement.innerHTML = html;

                // Fix for Firefox
                window.requestAnimationFrame( () =>
                    resolve( $document.cloneNode( true ) )
                );
            } catch (e1) {
                string2dom( html, ( convertedDoc: Document /*, destroy */ ) => {
                    window.requestAnimationFrame( () => {
                        resolve( convertedDoc )
                        // Eviter d'utiliser destroy, crée une erreur Permission denied sur IE9
                        // destroy();
                    } );
                } );
            }
        }
        else {
            string2dom( html, (convertedDoc: Document /*, destroy */ ) => {
                window.requestAnimationFrame( () => {
                    resolve( convertedDoc )
                    // Eviter d'utiliser destroy, crée une erreur Permission denied sur IE9
                    // destroy();
                } );
            } );
        }
    } );
}
