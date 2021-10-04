/**
 * Simple template function based on string substitution
 *
 * @example
 * ```ts
 * let HTML = quickTemplate( 'My name is {{ lastname }}. {{ firstname }} {{ lastname }}.', { "firstname": "James", "lastname": "Bond" } );
 * ```
 */
export default function quickTemplate( template: string, data: { [ key: string ]: string } ): string {
    Object.keys( data ).forEach( key => {
        template = template.replace( new RegExp( `{{\\s*${ key }\\s*}}`, 'g' ), data[ key ] );
    } );

    return template;
}
