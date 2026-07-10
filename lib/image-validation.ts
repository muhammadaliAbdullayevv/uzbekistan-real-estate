export type SniffedImageType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

function matchesBytes(buffer: Buffer, offset: number, bytes: number[]) {
  if (buffer.length < offset + bytes.length) {
    return false;
  }
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

/** Detects image type from magic bytes, ignoring any client-supplied MIME type. */
export function sniffImageType(buffer: Buffer): SniffedImageType | null {
  if (matchesBytes(buffer, 0, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }

  if (matchesBytes(buffer, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }

  if (
    matchesBytes(buffer, 0, [0x47, 0x49, 0x46, 0x38]) &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return "image/gif";
  }

  if (
    matchesBytes(buffer, 0, [0x52, 0x49, 0x46, 0x46]) &&
    matchesBytes(buffer, 8, [0x57, 0x45, 0x42, 0x50])
  ) {
    return "image/webp";
  }

  return null;
}
