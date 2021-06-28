export default function isBufferSource( val ): boolean {
    return val.byteLength !== undefined;
}
