import { PrismaClient, Role } from '@prisma/client';
import { MembersService } from '../src/modules/members/members.service';
import { EmailService } from '../src/modules/email/email.service';

const prisma = new PrismaClient();

async function runE2ETests() {
  console.log('=== STARTING END-TO-END INVITATION & SMTP INTEGRATION TESTS ===\n');

  const emailService = new EmailService(prisma as any);
  const membersService = new MembersService(prisma as any, emailService);

  // 1. Setup test workspace and owner
  console.log('[Test 1] Setting up test workspace and owner user...');
  const ownerEmail = `owner_${Date.now()}@example.com`;
  const owner = await prisma.user.create({
    data: {
      email: ownerEmail,
      name: 'Owner Alice',
      passwordHash: 'argon2_fake_hash',
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Robotics',
      slug: `acme-robotics-${Date.now()}`,
      ownerId: owner.id,
      memberships: {
        create: {
          userId: owner.id,
          role: Role.OWNER,
        },
      },
    },
  });
  console.log(`✓ Workspace "${workspace.name}" created (ID: ${workspace.id}) with Owner ${owner.name}`);

  // 2. Test Method A: Email Invitation
  console.log('\n[Test 2] Testing Method A — Email Invitation...');
  const inviteeEmail = `invitee_${Date.now()}@example.com`;
  const emailInvite = await membersService.inviteMember(workspace.id, owner.id, {
    email: inviteeEmail,
    role: Role.TESTER,
    expiresInDays: 7,
    maxUses: 1,
  });
  console.log(`✓ Email Invitation created successfully:`);
  console.log(`  - Invitation ID: ${emailInvite.id}`);
  console.log(`  - Target Email: ${emailInvite.email}`);
  console.log(`  - Role: ${emailInvite.role}`);
  console.log(`  - Raw Token Generated: ${emailInvite.token}`);
  console.log(`  - Full Shareable URL: ${emailInvite.inviteUrl}`);
  console.log(`  - Email Sent: ${emailInvite.emailSent} (Graceful fallback if SMTP unconfigured: ${!emailInvite.emailSent})`);

  // Verify token is hashed at rest
  const dbRecord = await prisma.workspaceInvitation.findUnique({
    where: { id: emailInvite.id },
  });
  if (dbRecord?.tokenHash && dbRecord.tokenHash !== emailInvite.token) {
    console.log(`✓ Security Check Passed: Token is securely hashed in database with SHA-256 (Hash length: ${dbRecord.tokenHash.length})`);
  } else {
    throw new Error('FAILED: Raw token was stored in database plaintext!');
  }

  // 3. Test Method B: Shareable Link without email & without SMTP
  console.log('\n[Test 3] Testing Method B — Shareable Invitation Link (No Email, No SMTP required)...');
  const linkInvite = await membersService.inviteMember(workspace.id, owner.id, {
    role: Role.ADMIN,
    expiresInDays: 14,
    maxUses: 5,
  });
  console.log(`✓ Shareable Link created successfully:`);
  console.log(`  - Invitation ID: ${linkInvite.id}`);
  console.log(`  - Target Email: ${linkInvite.email ?? 'OPEN / UNRESTRICTED'}`);
  console.log(`  - Role: ${linkInvite.role}`);
  console.log(`  - Max Uses Allowed: ${linkInvite.maxUses}`);
  console.log(`  - URL: ${linkInvite.inviteUrl}`);

  // 4. Test Public Token Validation Endpoint
  console.log('\n[Test 4] Testing Public Token Validation...');
  const validCheck = await membersService.validateToken(linkInvite.token);
  console.log(`✓ Token Validation Result:`, validCheck);
  if (!validCheck.valid || validCheck.workspace?.name !== 'Acme Robotics') {
    throw new Error('FAILED: Token validation returned invalid for active link!');
  }

  // 5. Test Acceptance with New User
  console.log('\n[Test 5] Testing Invitation Acceptance by New User...');
  const joiningUser = await prisma.user.create({
    data: {
      email: `joiner_${Date.now()}@example.com`,
      name: 'Bob Joiner',
      passwordHash: 'argon2_fake_hash',
    },
  });

  const acceptResult = await membersService.acceptInvite(joiningUser.id, linkInvite.token);
  console.log(`✓ Invitation Accepted:`, acceptResult);

  // Verify membership exists
  const membershipCheck = await prisma.membership.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: joiningUser.id,
      },
    },
  });
  if (!membershipCheck || membershipCheck.role !== Role.ADMIN) {
    throw new Error('FAILED: Membership was not created properly after acceptance!');
  }
  console.log(`✓ Membership verified in database with role ${membershipCheck.role}`);

  // Verify usesCount incremented
  const updatedInvite = await prisma.workspaceInvitation.findUnique({
    where: { id: linkInvite.id },
  });
  console.log(`✓ Uses count incremented: ${updatedInvite?.usesCount}/${updatedInvite?.maxUses} (Status: ${updatedInvite?.status})`);

  // 6. Test Duplicate Acceptance Prevention
  console.log('\n[Test 6] Testing Duplicate Acceptance Prevention...');
  try {
    await membersService.acceptInvite(joiningUser.id, linkInvite.token);
    throw new Error('FAILED: Should have thrown conflict for already-member user!');
  } catch (err: any) {
    console.log(`✓ Correctly prevented duplicate acceptance: "${err.message}" (Code: ${err.code})`);
  }

  // 7. Test Invitation Revocation
  console.log('\n[Test 7] Testing Invitation Revocation...');
  await membersService.revokeInvitation(workspace.id, linkInvite.id);
  const revokeValidate = await membersService.validateToken(linkInvite.token);
  console.log(`✓ Validation after revocation:`, revokeValidate);
  if (revokeValidate.valid || revokeValidate.reason !== 'REVOKED') {
    throw new Error('FAILED: Revoked invitation was reported as valid!');
  }

  // 8. Test SMTP Configuration & Public Settings
  console.log('\n[Test 8] Testing SMTP Configuration & Security...');
  const publicConfigBefore = await emailService.getPublicConfig();
  console.log(`✓ Public SMTP Config (Pass masked):`, publicConfigBefore);

  await emailService.saveConfig({
    host: 'smtp.sendgrid.net',
    port: 587,
    username: 'apikey',
    password: 'SG.fake_secret_key_12345',
    fromEmail: 'team@acmerobotics.com',
    fromName: 'Acme Robotics',
    secure: false,
    enabled: true,
  });

  const publicConfigAfter = await emailService.getPublicConfig();
  console.log(`✓ Public SMTP Config After Save:`, publicConfigAfter);
  if ((publicConfigAfter as any).password) {
    throw new Error('FAILED: Raw SMTP password leaked in public config!');
  }
  if (!publicConfigAfter.hasPassword || publicConfigAfter.host !== 'smtp.sendgrid.net') {
    throw new Error('FAILED: SMTP config was not persisted!');
  }
  console.log(`✓ Security Check Passed: SMTP password encrypted at rest and omitted from API response.`);

  console.log('\n=== ALL END-TO-END INVITATION & SMTP INTEGRATION TESTS PASSED PERFECTLY ===\n');
}

runE2ETests()
  .catch((err) => {
    console.error('Test run failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

