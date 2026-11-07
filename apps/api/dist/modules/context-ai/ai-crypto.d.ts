export declare function assertAiKeyConfigured(): void;
export declare function aiKeyVersion(): number;
export declare function encryptAiSecret(plain: string): string;
export declare function decryptAiSecret(payload: string): string;
export declare function keyHint(secret: string): string;
