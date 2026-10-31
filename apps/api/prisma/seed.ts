import { PrismaClient, Role, TaskStatus, Priority, AccentName, TaskType, Severity, TaskSource } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // eslint-disable-next-line no-console
  console.log('Seeding DoIt database with clean neutral demo data...');

  // Standard test password hash: "Password123!"
  const passwordHash =
    '$argon2id$v=19$m=65536,p=4,t=3$3IQC7G7iFpyPpMnbR8zO0g$NHrHTQR1PJvmth3AlssewO/DPeNdCBo0Yn5naWluzp8';

  // 1. Users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@doit.local' },
    update: { passwordHash },
    create: {
      email: 'alice@doit.local',
      passwordHash,
      name: 'Alice Sharma',
      locale: 'en-IN',
      prefs: { theme: 'DARK', accent: 'INDIGO' },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@doit.local' },
    update: { passwordHash },
    create: {
      email: 'bob@doit.local',
      passwordHash,
      name: 'Bob Verma',
      locale: 'en-IN',
      prefs: { theme: 'LIGHT', accent: 'TEAL' },
    },
  });

  // Backward compatible credentials for quick-tap demo buttons
  await prisma.user.upsert({
    where: { email: 'alice@samyukt.com' },
    update: { passwordHash },
    create: {
      email: 'alice@samyukt.com',
      passwordHash,
      name: 'Alice Sharma',
      locale: 'en-IN',
      prefs: { theme: 'DARK', accent: 'INDIGO' },
    },
  });

  await prisma.user.upsert({
    where: { email: 'bob@samyukt.com' },
    update: { passwordHash },
    create: {
      email: 'bob@samyukt.com',
      passwordHash,
      name: 'Bob Verma',
      locale: 'en-IN',
      prefs: { theme: 'LIGHT', accent: 'TEAL' },
    },
  });

  // 2. Demo Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo' },
    update: { name: 'Demo Workspace' },
    create: {
      name: 'Demo Workspace',
      slug: 'demo',
      ownerId: alice.id,
    },
  });

  // Memberships
  await prisma.membership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: alice.id,
      },
    },
    update: { role: Role.OWNER },
    create: {
      workspaceId: workspace.id,
      userId: alice.id,
      role: Role.OWNER,
    },
  });

  await prisma.membership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: bob.id,
      },
    },
    update: { role: Role.TESTER },
    create: {
      workspaceId: workspace.id,
      userId: bob.id,
      role: Role.TESTER,
    },
  });

  // 3. Primary Project: "Getting Started" (GS)
  const gsProject = await prisma.project.upsert({
    where: {
      workspaceId_key: {
        workspaceId: workspace.id,
        key: 'GS',
      },
    },
    update: { name: 'Getting Started' },
    create: {
      workspaceId: workspace.id,
      name: 'Getting Started',
      key: 'GS',
      color: AccentName.INDIGO,
    },
  });

  // 4. Default Project Labels
  const labels = [
    { name: 'Bug', color: AccentName.ROSE },
    { name: 'Feature', color: AccentName.INDIGO },
    { name: 'P0', color: AccentName.AMBER },
    { name: 'P1', color: AccentName.TEAL },
    { name: 'UI', color: AccentName.VIOLET },
  ];

  for (const l of labels) {
    await prisma.label.upsert({
      where: {
        workspaceId_name: {
          workspaceId: workspace.id,
          name: l.name,
        },
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        name: l.name,
        color: l.color,
      },
    });
  }

  // 5. Sample Tasks
  const sampleTasks = [
    {
      num: 1,
      title: 'Welcome to DoIt! Review getting started guide',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      type: TaskType.TASK,
      desc: 'Explore the floating navbar, Quick Capture sheet, and workspace switcher.',
    },
    {
      num: 2,
      title: 'Fix keyboard accessory bar positioning above software keyboard',
      status: TaskStatus.DONE,
      priority: Priority.URGENT,
      type: TaskType.TASK,
      desc: 'Verify accessory bar remains pinned directly above the virtual keyboard without clipping.',
    },
    {
      num: 3,
      title: 'App crash on network timeout during background sync',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      type: TaskType.BUG,
      desc: 'Steps to reproduce: disable wifi while saving a task, observe retry queue behavior.',
    },
    {
      num: 4,
      title: 'Set up dark mode appearance and select brand accent',
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      type: TaskType.TASK,
      desc: 'Check appearance settings: Indigo, Teal, Amber, Rose, or Violet.',
    },
  ];

  for (const t of sampleTasks) {
    const task = await prisma.task.upsert({
      where: {
        projectId_number: {
          projectId: gsProject.id,
          number: t.num,
        },
      },
      update: {},
      create: {
        projectId: gsProject.id,
        number: t.num,
        title: t.title,
        description: t.desc,
        status: t.status,
        priority: t.priority,
        type: t.type,
        source: TaskSource.MANUAL,
        createdById: alice.id,
        assigneeId: bob.id,
        order: t.num * 1000,
      },
    });

    if (t.type === TaskType.BUG) {
      await prisma.bugReport.upsert({
        where: { taskId: task.id },
        update: {},
        create: {
          taskId: task.id,
          severity: Severity.CRITICAL,
          steps: ['Open app under test', 'Disconnect network', 'Submit task or bug'],
          expected: 'Should queue in outbox and show syncing indicator',
          actual: 'Observed timeout exception in previous build',
          frequency: 'often',
          deviceModel: 'Android Device',
          osVersion: 'Android 14',
        },
      });
    }
  }

  // 6. Sample Stickies
  const stickyNotes = [
    { body: 'Welcome to DoIt stickies. Tap to pin or convert into an action item.', color: AccentName.AMBER },
    { body: 'Quick shortcut: Long-press the + button to capture voice or bug reports.', color: AccentName.INDIGO },
  ];

  for (let i = 0; i < stickyNotes.length; i++) {
    const s = stickyNotes[i]!;
    const existing = await prisma.sticky.findFirst({
      where: {
        projectId: gsProject.id,
        body: s.body,
      },
    });
    if (!existing) {
      await prisma.sticky.create({
        data: {
          projectId: gsProject.id,
          authorId: alice.id,
          body: s.body,
          color: s.color,
          order: (i + 1) * 1000,
        },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log('✔ DoIt neutral demo seed completed successfully!');
}

main()
  .catch((e: unknown) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
