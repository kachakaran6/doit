export interface InvitationEmailData {
    inviterName: string;
    workspaceName: string;
    role: string;
    inviteUrl: string;
    expiresAt: Date;
}
export interface PasswordResetEmailData {
    userName: string;
    resetUrl: string;
    expiresInMinutes: number;
}
export declare function generatePasswordResetEmailHtml(data: PasswordResetEmailData): string;
export declare function generatePasswordResetEmailText(data: PasswordResetEmailData): string;
export declare function generateInvitationEmailHtml(data: InvitationEmailData): string;
export declare function generateInvitationEmailText(data: InvitationEmailData): string;
