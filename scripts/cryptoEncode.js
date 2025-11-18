// in Node REPL or browser console
export const sha256Base64 = async (str) => {
    const buf = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(str.trim().toLowerCase())
    );
    // convert to byte array …
    const bytes = Array.from(new Uint8Array(buf));
    // … then to a binary string …
    const bin = bytes.map(b => String.fromCharCode(b)).join('');
    // … then to Base64
    return btoa(bin);
}

(async () => {
    console.log(
        await sha256Base64('string_to_encode_here')
    );
})();
