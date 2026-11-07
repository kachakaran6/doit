"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertAiKeyConfigured = assertAiKeyConfigured;
exports.aiKeyVersion = aiKeyVersion;
exports.encryptAiSecret = encryptAiSecret;
exports.decryptAiSecret = decryptAiSecret;
exports.keyHint = keyHint;
const node_crypto_1 = require("node:crypto");
const KEY_VERSION = 1;
function assertAiKeyConfigured() {
    const dedicated = process.env.AI_CREDENTIALS_KEY?.trim();
    if (!dedicated || dedicated.length < 16) {
        throw new Error('AI_CREDENTIALS_KEY is not configured');
    }
}
function material() {
    assertAiKeyConfigured();
    return `ai-v1:${process.env.AI_CREDENTIALS_KEY.trim()}`;
}
function aiKeyVersion() {
    assertAiKeyConfigured();
    return KEY_VERSION;
}
function key() {
    return (0, node_crypto_1.createHash)('sha256').update(material()).digest();
}
function encryptAiSecret(plain) {
    const iv = (0, node_crypto_1.randomBytes)(12);
    const cipher = (0, node_crypto_1.createCipheriv)('aes-256-gcm', key(), iv);
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}
function decryptAiSecret(payload) {
    const [ivHex, tagHex, dataHex] = payload.split(':');
    if (!ivHex || !tagHex || !dataHex)
        throw new Error('Invalid credential payload');
    const decipher = (0, node_crypto_1.createDecipheriv)('aes-256-gcm', key(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const plain = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
    return plain.toString('utf8');
}
function keyHint(secret) {
    const trimmed = secret.trim();
    return trimmed.slice(-4);
}
//# sourceMappingURL=ai-crypto.js.map