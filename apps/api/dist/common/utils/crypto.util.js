"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashInvitationToken = hashInvitationToken;
exports.generateInvitationToken = generateInvitationToken;
exports.encryptSecret = encryptSecret;
exports.decryptSecret = decryptSecret;
const crypto = require("node:crypto");
function getDerivedKey() {
    const secret = process.env.JWT_SECRET || 'doit-default-secret-change-in-production-32b';
    return crypto.createHash('sha256').update(secret).digest();
}
function hashInvitationToken(token) {
    return crypto.createHash('sha256').update(token.trim()).digest('hex');
}
function generateInvitationToken() {
    return crypto.randomBytes(24).toString('hex');
}
function encryptSecret(plainText) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getDerivedKey(), iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
function decryptSecret(encryptedPayload) {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted payload format');
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', getDerivedKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
//# sourceMappingURL=crypto.util.js.map