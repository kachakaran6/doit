"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sniffMimeType = sniffMimeType;
exports.validateMagicBytes = validateMagicBytes;
function sniffMimeType(buffer) {
    if (!buffer || buffer.length < 4) {
        return null;
    }
    if (buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a) {
        return 'image/png';
    }
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
    }
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
        return 'application/pdf';
    }
    if (buffer.length >= 12 &&
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP') {
        return 'image/webp';
    }
    if (buffer.length >= 12 &&
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WAVE') {
        return 'audio/wav';
    }
    if (buffer.length >= 8 && buffer.toString('ascii', 4, 8) === 'ftyp') {
        const brand = buffer.toString('ascii', 8, 12).toLowerCase();
        if (brand.includes('m4a') || brand.includes('mp42') || brand.includes('isom') || brand.includes('mp41')) {
            return 'audio/m4a';
        }
        return 'video/mp4';
    }
    return null;
}
function validateMagicBytes(declaredMime, buffer) {
    const detected = sniffMimeType(buffer);
    if (!detected) {
        return true;
    }
    if (declaredMime === detected) {
        return true;
    }
    if ((declaredMime === 'image/jpeg' || declaredMime === 'image/jpg') && detected === 'image/jpeg') {
        return true;
    }
    if ((declaredMime === 'audio/m4a' || declaredMime === 'audio/mp4') && (detected === 'audio/m4a' || detected === 'video/mp4')) {
        return true;
    }
    return false;
}
//# sourceMappingURL=magic-bytes.js.map