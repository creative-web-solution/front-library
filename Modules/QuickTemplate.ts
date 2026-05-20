/**
 * Simple template function based on string substitution
 *
 * @example
 * ```ts
 * let HTML = quickTemplate( 'My name is {{ lastname }}. {{ firstname }} {{ lastname }}.', { "firstname": "James", "lastname": "Bond" } );
 * let HTML2 = quickTemplate( 'My name is < lastname >. < firstname > < lastname >.',
 *                           { "firstname": "James", "lastname": "Bond" },
 *                           {
 *                              "open": "<",
 *                              "close": ">"
 *                           }
 *              );
 * ```
 */
export default function quickTemplate(
    template: string,
    data: { [key: string]: string },
    options?: { open: string; close: string },
): string {
    Object.keys(data).forEach((key) => {
        template = template.replace(
            new RegExp(
                `${options?.open ?? "{{"}\\s*${key}\\s*${options?.close ?? "}}"}`,
                "g",
            ),
            data[key],
        );
    });

    return template;
}
