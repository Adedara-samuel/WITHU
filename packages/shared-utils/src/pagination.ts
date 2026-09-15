// Plain-JS base64url codec (RFC 4648, no padding) — deliberately avoids Node's
// `Buffer` global so this file stays safe to import from web and React Native,
// not just the API. Cursors are always MongoDB ObjectId hex strings (ASCII),
// so byte-per-char-code is sufficient; no UTF-8 multi-byte handling needed.
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export function encodeCursor(value: string): string {
  let output = "";
  for (let i = 0; i < value.length; i += 3) {
    const b0 = value.charCodeAt(i) & 0xff;
    const hasB1 = i + 1 < value.length;
    const hasB2 = i + 2 < value.length;
    const b1 = hasB1 ? value.charCodeAt(i + 1) & 0xff : 0;
    const b2 = hasB2 ? value.charCodeAt(i + 2) & 0xff : 0;

    output += ALPHABET[b0 >> 2];
    output += ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)];
    output += hasB1 ? ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)] : "";
    output += hasB2 ? ALPHABET[b2 & 0x3f] : "";
  }
  return output;
}

export function decodeCursor(cursor: string | undefined | null): string | null {
  if (!cursor) return null;
  try {
    const lookup = new Map(ALPHABET.split("").map((ch, i) => [ch, i]));
    let output = "";
    let buffer = 0;
    let bitsCollected = 0;

    for (const ch of cursor) {
      const value = lookup.get(ch);
      if (value === undefined) return null;
      buffer = (buffer << 6) | value;
      bitsCollected += 6;
      if (bitsCollected >= 8) {
        bitsCollected -= 8;
        output += String.fromCharCode((buffer >> bitsCollected) & 0xff);
      }
    }
    return output;
  } catch {
    return null;
  }
}
