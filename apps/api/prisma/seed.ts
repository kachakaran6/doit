import { PrismaClient, Role, TaskStatus, Priority, AccentName, TaskType, Severity, TaskSource, Task } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // eslint-disable-next-line no-console
  console.log('Seeding Samyukt database...');

  // 1. Users (2 users)
  const alice = await prisma.user.upsert({
    where: { email: 'alice@samyukt.com' },
    update: {
      passwordHash: '$argon2id$v=19$m=65536,p=4,t=3$3IQC7G7iFpyPpMnbR8zO0g$NHrHTQR1PJvmth3AlssewO/DPeNdCBo0Yn5naWluzp8',
    },
    create: {
      email: 'alice@samyukt.com',
      passwordHash: '$argon2id$v=19$m=65536,p=4,t=3$3IQC7G7iFpyPpMnbR8zO0g$NHrHTQR1PJvmth3AlssewO/DPeNdCBo0Yn5naWluzp8',
      name: 'Alice Sharma',
      locale: 'en-IN',
      prefs: { theme: 'DARK', accent: 'INDIGO' },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@samyukt.com' },
    update: {
      passwordHash: '$argon2id$v=19$m=65536,p=4,t=3$3IQC7G7iFpyPpMnbR8zO0g$NHrHTQR1PJvmth3AlssewO/DPeNdCBo0Yn5naWluzp8',
    },
    create: {
      email: 'bob@samyukt.com',
      passwordHash: '$argon2id$v=19$m=65536,p=4,t=3$3IQC7G7iFpyPpMnbR8zO0g$NHrHTQR1PJvmth3AlssewO/DPeNdCBo0Yn5naWluzp8',
      name: 'Bob Verma',
      locale: 'en-IN',
      prefs: { theme: 'LIGHT', accent: 'TEAL' },
    },
  });

  // 2. Workspace (1 workspace)
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      name: 'Acme Technologies',
      slug: 'acme',
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
    update: {},
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
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: bob.id,
      role: Role.TESTER,
    },
  });

  // 3. Projects (2 projects)
  const mobileProj = await prisma.project.upsert({
    where: {
      workspaceId_key: {
        workspaceId: workspace.id,
        key: 'MOB',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Mobile Client',
      key: 'MOB',
      color: AccentName.INDIGO,
    },
  });

  const webProj = await prisma.project.upsert({
    where: {
      workspaceId_key: {
        workspaceId: workspace.id,
        key: 'WEB',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Web Dashboard',
      key: 'WEB',
      color: AccentName.TEAL,
    },
  });

  // 4. Labels (6 labels)
  const labelNames = [
    { name: 'Bug', color: AccentName.ROSE },
    { name: 'Feature', color: AccentName.INDIGO },
    { name: 'P0', color: AccentName.AMBER },
    { name: 'P1', color: AccentName.TEAL },
    { name: 'UI', color: AccentName.VIOLET },
    { name: 'Backend', color: AccentName.INDIGO },
  ];

  for (const l of labelNames) {
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

  // 5. Tasks (8 tasks: 4 in MOB, 4 in WEB)
  const taskData = [
    { proj: mobileProj, num: 1, title: 'Implement Quick Capture Overlay', status: TaskStatus.IN_PROGRESS, prio: Priority.URGENT, type: TaskType.TASK },
    { proj: mobileProj, num: 2, title: 'Fix Shake Detection on Pixel 6a', status: TaskStatus.TODO, prio: Priority.HIGH, type: TaskType.BUG },
    { proj: mobileProj, num: 3, title: 'Crash when saving voice note in airplane mode', status: TaskStatus.TODO, prio: Priority.HIGH, type: TaskType.BUG },
    { proj: mobileProj, num: 4, title: 'Design System Token audit for Dark Mode', status: TaskStatus.DONE, prio: Priority.MEDIUM, type: TaskType.TASK },
    { proj: webProj, num: 1, title: 'NestJS Auth and JWT Session rotation', status: TaskStatus.DONE, prio: Priority.HIGH, type: TaskType.TASK },
    { proj: webProj, num: 2, title: 'PostgreSQL tsvector full text search', status: TaskStatus.IN_PROGRESS, prio: Priority.MEDIUM, type: TaskType.TASK },
    { proj: webProj, num: 3, title: 'Attachment presigned URL generation fails on large file', status: TaskStatus.TODO, prio: Priority.URGENT, type: TaskType.BUG },
    { proj: webProj, num: 4, title: 'Workspace member invite link expiration', status: TaskStatus.TODO, prio: Priority.LOW, type: TaskType.TASK },
  ];

  const createdTasks: Task[] = [];
  for (const t of taskData) {
    const task = await prisma.task.upsert({
      where: {
        projectId_number: {
          projectId: t.proj.id,
          number: t.num,
        },
      },
      update: {},
      create: {
        projectId: t.proj.id,
        number: t.num,
        title: t.title,
        status: t.status,
        priority: t.prio,
        type: t.type,
        source: TaskSource.MANUAL,
        createdById: alice.id,
        assigneeId: bob.id,
        order: t.num * 1000,
      },
    });
    createdTasks.push(task);
  }

  // 6. Bugs (3 bugs attached to tasks)
  const bugTasks = createdTasks.filter((t) => t.type === TaskType.BUG);
  for (const bt of bugTasks) {
    await prisma.bugReport.upsert({
      where: { taskId: bt.id },
      update: {},
      create: {
        taskId: bt.id,
        severity: Severity.CRITICAL,
        steps: ['Open app under test', 'Shake device', 'Submit bug report'],
        expected: 'Bug report should be created with screenshot attached',
        actual: 'Screen flickered and timeout occurred',
        frequency: 'often',
        deviceModel: 'Pixel 6a',
        osVersion: 'Android 14',
      },
    });
  }

  // 7. Stickies (4 stickies)
  const stickyData = [
    { body: 'Remember to verify audio permission on Android 13+', color: AccentName.AMBER },
    { body: 'Ask team about Saarika vs Whisper server latency', color: AccentName.INDIGO },
    { body: 'Check contrast ratio on violet button containers', color: AccentName.VIOLET },
    { body: 'Release candidate build targeted for end of week', color: AccentName.ROSE },
  ];

  for (let i = 0; i < stickyData.length; i++) {
    const s = stickyData[i]!;
    const existing = await prisma.sticky.findFirst({
      where: {
        projectId: mobileProj.id,
        body: s.body,
      },
    });
    if (!existing) {
      await prisma.sticky.create({
        data: {
          projectId: mobileProj.id,
          authorId: alice.id,
          body: s.body,
          color: s.color,
          order: (i + 1) * 1000,
        },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seeding completed successfully!');
}

main()
  .catch((e: unknown) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
