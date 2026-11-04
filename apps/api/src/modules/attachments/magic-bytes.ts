export function sniffMimeType(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 4) {
    return null;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PDF: %PDF (25 50 44 46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf';
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  // WAV: RIFF....WAVE
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WAVE'
  ) {
    return 'audio/wav';
  }

  // MP4 / M4A: ....ftyp
  if (buffer.length >= 8 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12).toLowerCase();
    if (brand.includes('m4a') || brand.includes('mp42') || brand.includes('isom') || brand.includes('mp41')) {
      return 'audio/m4a';
    }
    return 'video/mp4';
  }

  return null;
}

export function validateMagicBytes(declaredMime: string, buffer: Buffer): boolean {
  const detected = sniffMimeType(buffer);
  if (!detected) {
    // If sniffer has no strict signature (e.g. some HEIC or plain files), don't fail unless it detected an incompatible type
    return true;
  }

  if (declaredMime === detected) {
    return true;
  }

  // Allow JPEG variants
  if ((declaredMime === 'image/jpeg' || declaredMime === 'image/jpg') && detected === 'image/jpeg') {
    return true;
  }

  // Allow audio/m4a or audio/mp4 variants
  if ((declaredMime === 'audio/m4a' || declaredMime === 'audio/mp4') && (detected === 'audio/m4a' || detected === 'video/mp4')) {
    return true;
  }

  // Reject spoofing (e.g., PDF uploaded as PNG or image uploaded as audio)
  return false;
}
