const RGBA_REGEXP = /^rgba\(([0-9]{1,3}),([0-9]{1,3}),([0-9]{1,3}),([01](\.[0-9]+)?)\)$/i;
const RGB_REGEXP  = /^rgb\(([0-9]{1,3}),([0-9]{1,3}),([0-9]{1,3})\)$/i;
const HEX_REGEXP  = /^#[0-9A-F]{3,8}$/i;

const RGBA_CLEAN_1 = /[ )]/g;
const RGBA_CLEAN_2 = /rgba?\(/;


function mixColor( C1: number, C2: number, P: number ): number {
    return Math.round( ( C2 - C1 ) * P + C1 );
}


function toHexValue( c: number ): string {
    const color: string = c.toString( 16 );

    if ( color.length === 1 ) {
        return `0${ color }`;
    }

    return color;
}


/**
 * Convert a rgba string to a hex string
 *
 * @param rgba
 *
 * @example
 * rgbaToHex( 'rgb(125 ,233, 105)' );
 *
 * @example
 * rgbaToHex( 'rgba(125 ,233, 105, 0.25)' );
*/
export function rgbaToHex( rgba: string ): string {
    return formatHexColor( splitRGBA( rgba ) );
}


/**
 * Convert a hex string to a rgba string
 *
 * @param hex
 *
 * @example
 * hexToRgba( '#F5C' );
 *
 * @example
 * hexToRgba( '#F5B3D8' );
*/
export function hexToRgba( hex: string ): string {
    return formatRGBAColor( splitHexColor( hex ) );
}


/**
 * Return true if the string is an rgb or rgba color
 *
 * @param rgba
 *
 * @example
 * isRGBA( 'rgb(125 ,233, 105)' );
 *
 * @example
 * isRGBA( 'rgba(125 ,233, 105, 0.25)' );
*/
export function isRGBA( rgba: string ): boolean {
    rgba = rgba.replace( / /g, '' );
    return RGBA_REGEXP.test( rgba ) || RGB_REGEXP.test( rgba );
}


/**
 * Return true if the string is an hexadecimal color
 *
 * @param hexColor
 *
 * @example
 * isHexColor( '#FFF' );
 *
 * @example
 * isHexColor( '#55CC66' );
 *
 * @example
 * isHexColor( '#55CC66FF' );
*/
export function isHexColor( hexColor: string ): boolean {
    return HEX_REGEXP.test( hexColor ) && [3, 4, 6, 8].includes( hexColor.length - 1 );
}


/**
 * Split an rgb or rgba color
 *
 * @param rgba
 *
 * @example
 * splitRGBA( 'rgb(125 ,233, 105)' );
 *
 * @example
 * splitRGBA( 'rgba(125 ,233, 105, 0.75)' );
*/
export function splitRGBA( rgba: string ): ColorType {

    const parts: number[] = rgba
                    .replace( RGBA_CLEAN_1, '' )
                    .replace( RGBA_CLEAN_2, '' )
                    .split( ',' )
                    .map( c => Number( c.trim() ) );

    const color = {
        "r": parts[ 0 ],
        "g": parts[ 1 ],
        "b": parts[ 2 ],
        "a": 1
    };

    if ( parts.length > 3 ) {
        color.a = Number( parts[ 3 ].toFixed( 2 ) );
    }

    return {
        ...color,
        "hr": toHexValue( color.r ),
        "hg": toHexValue( color.g ),
        "hb": toHexValue( color.b ),
        "ha": toHexValue( Math.round( color.a * 255 ) )
    }
}


/**
 * Split an hexadecimal color
 *
 * @param hexColor
 *
 * @example
 * splitHexColor( '#F5A' );
 *
 * @example
 * splitHexColor( '#FA58AC' );
 *
 * @example
 * // With alpha
 * splitHexColor( '#FA58ACCC' );
*/
export function splitHexColor( hexColor: string ): ColorType {
    let alpha;

    hexColor = hexColor.slice( 1 );

    // Convert shorthand color to full color (#F5A => #FF55AA)
    if ( hexColor.length < 5 ) {
        hexColor = hexColor
                        .split( '' )
                        .map( c => c + c )
                        .join( '' );
    }

    alpha = 1;
    const color = {
        "hr": hexColor.slice( 0, 2 ),
        "hg": hexColor.slice( 2, 4 ),
        "hb": hexColor.slice( 4, 6 ),
        "ha": "FF"
    }

    // Hex color also contains alpha (#FF55AAFF)
    if ( hexColor.length > 6 ) {
        color.ha = hexColor.slice( 6, 8 );
        alpha = +( parseInt( color.ha, 16 ) / 255 ).toFixed( 2 );
    }

    return {
        ...color,
        "r": parseInt( hexColor.slice( 0, 2 ), 16 ),
        "g": parseInt( hexColor.slice( 2, 4 ), 16 ),
        "b": parseInt( hexColor.slice( 4, 6 ), 16 ),
        "a": alpha
    }
}


/**
 * Format an object color to an hex color
 *
 * @param color
 *
 * @example
 * formatHexColor( color );
*/
export function formatHexColor( color: ColorType ): string {
    return `#${ color.hr }${ color.hg }${ color.hb }${ color.a !== 1 ? color.ha : '' }`;
}


/**
 * Format an object color to an rgba color
 *
 * @param color
 *
 * @example
 * formatRGBAColor( color );
 *
*/
export function formatRGBAColor( color: ColorType ): string {
    if ( color.a !== 1 ) {
        return `rgba(${ color.r },${ color.g },${ color.b },${ color.a })`;
    }
    return `rgb(${ color.r },${ color.g },${ color.b })`;
}


/**
 * Darken, lighten one color or blend 2 colors together
 *
 * @param color1 - rgb or hex string
 * @param color2 - rgb or hex string
 * @param percent - Percent (between -1 and 1)
 * @param render - render type: obj, hex or rgba
 *
 * @example
 * let color1 = "#FF343B";
 * let color2 = "#343BFF";
 * let color3 = "rgb(234,47,120)";
 * let color4 = "rgb(120,99,248)";
 *
 * @example
 * // Lighten color
 * let shadedcolor1 = shadeBlend( color1, null, 0.75 );
 *
 * @example
 * // Darken color
 * let shadedcolor3 = shadeBlend( color3, null, -0.5 );
 *
 * @example
 * // Blend 2 colors
 * let blendedcolor1 = shadeBlend( color1, color2, 0.333 );
 * let blendedcolor34 = shadeBlend( color3, color4, -0.8 );
 */
export function shadeBlend( color1: string, color2: string | null, percent: number, render: ColorRenderType = 'obj' ): ColorType | string {
    let color;

    const coef = Math.abs( percent );
    color2      = color2 ? color2 : percent < 0 ? 'rgb(0,0,0)' : 'rgb(255,255,255)';

    const objColor1 = isRGBA( color1 ) ? splitRGBA( color1 ) : splitHexColor( color1 );
    const objColor2 = isRGBA( color2 ) ? splitRGBA( color2 ) : splitHexColor( color2 );

    color = {
        "r": mixColor( objColor1.r, objColor2.r, coef ),
        "g": mixColor( objColor1.g, objColor2.g, coef ),
        "b": mixColor( objColor1.b, objColor2.b, coef ),
        "a": 1
    }

    color = {
        ...color,
        "hr": toHexValue( color.r ),
        "hg": toHexValue( color.g ),
        "hb": toHexValue( color.b ),
        "ha": "FF"
    };

    if ( render === 'obj' ) {
        return color;
    }
    else if ( render === 'hex' ) {
        return formatHexColor( color );
    }
    else {
        return formatRGBAColor( color );
    }
}


/**
 * Lighten a color
 *
 * @param color - rgb or hex string
 * @param percent - Percent (between 0 and 1)
 * @param render - render type: obj, hex or rgba
*/
export function lighten( color: string, percent: number, render: ColorRenderType = 'obj' ): ColorType | string {
    return shadeBlend( color, null, Math.abs( percent ), render );
}


/**
 * Darken a color
 *
 * @param color - rgb or hex string
 * @param percent - Percent (between 0 and 1)
 * @param render - render type: obj, hex or rgba
*/
export function darken( color: string, percent: number, render: ColorRenderType = 'obj' ): ColorType | string {
    return shadeBlend( color, null, percent > 0 ? percent * -1 : percent, render );
}
