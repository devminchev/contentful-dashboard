/**
 * Compute SHA-256 digest and return Base64-encoded string
 * (lower-cases & trims before hashing to match your offline pre-compute)
 * no need for npm package, modern browsers + newer node supports it out of the box!
 */
export const sha256Base64 = async (str) => {
    if (!window.crypto?.subtle) {
        throw new Error('Web Crypto API not available');
    }
    const normalized = str.trim().toLowerCase();
    const data = new TextEncoder().encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const bytes = Array.from(new Uint8Array(hashBuffer));
    const binary = bytes.map((b) => String.fromCharCode(b)).join('');
    return btoa(binary);
}
