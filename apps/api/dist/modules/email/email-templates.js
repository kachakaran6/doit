"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePasswordResetEmailHtml = generatePasswordResetEmailHtml;
exports.generatePasswordResetEmailText = generatePasswordResetEmailText;
exports.generateInvitationEmailHtml = generateInvitationEmailHtml;
exports.generateInvitationEmailText = generateInvitationEmailText;
function generatePasswordResetEmailHtml(data) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your DoIt password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0b0e;
      color: #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      padding: 32px;
      background-color: #121217;
      border-radius: 12px;
      border: 1px solid #1f2028;
    }
    .header {
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      display: inline-block;
      width: 36px;
      height: 36px;
      line-height: 36px;
      text-align: center;
      background: #4f46e5;
      color: #ffffff;
      font-weight: 700;
      font-size: 18px;
      border-radius: 10px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 700;
      color: #f9fafb;
      letter-spacing: -0.02em;
    }
    .content-box {
      background-color: #181920;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border: 1px solid #23242e;
    }
    .btn {
      display: block;
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      background-color: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      margin: 28px 0 20px 0;
    }
    .fallback-url {
      word-break: break-all;
      color: #818cf8;
      font-size: 13px;
      line-height: 1.5;
    }
    .security-notice {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #1f2028;
      font-size: 12px;
      line-height: 1.5;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="logo-badge">D</span>
      <span class="brand-title">DoIt</span>
    </div>

    <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #f9fafb; font-weight: 600;">
      Reset your password
    </h2>
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      Hello ${escapeHtml(data.userName || 'there')}, we received a request to reset the password for your DoIt account.
    </p>

    <div class="content-box">
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e5e7eb;">
        Click the button below to securely choose a new password. This link will expire in <strong>${data.expiresInMinutes} minutes</strong>.
      </p>
    </div>

    <a href="${data.resetUrl}" class="btn">
      Reset My Password
    </a>

    <p style="font-size: 13px; color: #9ca3af; margin: 16px 0 6px 0;">
      Button not working? Copy and paste this link into your browser:
    </p>
    <a href="${data.resetUrl}" class="fallback-url">${data.resetUrl}</a>

    <div class="security-notice">
      Security Notice: If you did not request this password reset, please ignore this email or contact support. Your password remains safe and unchanged until you create a new one.
    </div>
  </div>
</body>
</html>`;
}
function generatePasswordResetEmailText(data) {
    return `Reset your DoIt password

Hello ${data.userName || 'there'},

We received a request to reset the password for your DoIt account.

To reset your password, visit the link below:
${data.resetUrl}

This link is valid for ${data.expiresInMinutes} minutes.

Security Notice:
If you did not request this password reset, please ignore this email. Your password will remain unchanged.

--
DoIt by Samyukt
`;
}
function generateInvitationEmailHtml(data) {
    const formattedExpiry = data.expiresAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${escapeHtml(data.workspaceName)} on DoIt</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0b0e;
      color: #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      padding: 32px;
      background-color: #121217;
      border-radius: 12px;
      border: 1px solid #1f2028;
    }
    .header {
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      display: inline-block;
      width: 32px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      background: #6366f1;
      color: #ffffff;
      font-weight: 700;
      font-size: 16px;
      border-radius: 8px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 700;
      color: #f9fafb;
      letter-spacing: -0.02em;
    }
    .content-box {
      background-color: #181920;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #23242e;
      font-size: 14px;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #9ca3af;
    }
    .detail-value {
      font-weight: 600;
      color: #f3f4f6;
    }
    .btn {
      display: block;
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      background-color: #6366f1;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      margin: 28px 0 20px 0;
    }
    .fallback-url {
      word-break: break-all;
      color: #818cf8;
      font-size: 13px;
      line-height: 1.5;
    }
    .security-notice {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #1f2028;
      font-size: 12px;
      line-height: 1.5;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="logo-badge">D</span>
      <span class="brand-title">DoIt</span>
    </div>

    <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #f9fafb; font-weight: 600;">
      You're invited to collaborate
    </h2>
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      <strong>${escapeHtml(data.inviterName)}</strong> has invited you to join the <strong>${escapeHtml(data.workspaceName)}</strong> workspace on DoIt.
    </p>

    <div class="content-box">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #9ca3af;">Workspace</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #f3f4f6;">${escapeHtml(data.workspaceName)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #9ca3af;">Assigned Role</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #a5b4fc;">${escapeHtml(data.role)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #9ca3af;">Expires On</td>
          <td style="padding: 6px 0; text-align: right; color: #f3f4f6;">${formattedExpiry}</td>
        </tr>
      </table>
    </div>

    <a href="${data.inviteUrl}" class="btn">
      Accept Invitation
    </a>

    <p style="font-size: 13px; color: #9ca3af; margin: 16px 0 6px 0;">
      Button not working? Copy and paste this URL into your browser:
    </p>
    <a href="${data.inviteUrl}" class="fallback-url">${data.inviteUrl}</a>

    <div class="security-notice">
      Security Notice: This invitation was intended for your email address. If you did not expect this invitation, you can safely ignore this email. No action is required.
    </div>
  </div>
</body>
</html>`;
}
function generateInvitationEmailText(data) {
    const formattedExpiry = data.expiresAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    return `You're invited to join ${data.workspaceName} on DoIt

${data.inviterName} has invited you to collaborate in the "${data.workspaceName}" workspace with the role of ${data.role}.

Accept your invitation here:
${data.inviteUrl}

Invitation Details:
- Workspace: ${data.workspaceName}
- Role: ${data.role}
- Invited By: ${data.inviterName}
- Expiration: ${formattedExpiry}

Security Notice:
If you were not expecting this invitation, you can safely ignore this message.

--
DoIt by Samyukt
`;
}
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
//# sourceMappingURL=email-templates.js.map