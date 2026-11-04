export interface InvitationEmailData {
    inviterName: string;
    workspaceName: string;
    role: string;
    inviteUrl: string;
    expiresAt: Date;
}
export declare function generateInvitationEmailHtml(data: InvitationEmailData): string;
export declare function generateInvitationEmailText(data: InvitationEmailData): string;
