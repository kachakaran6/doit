#!/usr/bin/env node

/**
 * Phase R1 Truth Check — End-to-End API Smoke Test
 * Tests against live NestJS API and PostgreSQL database.
 */

import { PrismaClient } from '@prisma/client';

const API_BASE = process.env.API_URL || 'http://localhost:3000/api/v1';
const prisma = new PrismaClient();

const results = [];

function record(step, pass, details = '') {
  results.push({ step, pass, details });
  const icon = pass ? '✔' : '✖';
  const color = pass ? '\x1b[32m' : '\x1b[31m';
  // eslint-disable-next-line no-console
  console.log(`${color}${icon} [${pass ? 'PASS' : 'FAIL'}]\x1b[0m ${step} ${details ? `(${details})` : ''}`);
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  return { status: res.status, ok: res.ok, json };
}

async function runSmokeTests() {
  console.log(`\n========================================`);
  console.log(`  DoIt Production Smoke Test Suite`);
  console.log(`  Target: ${API_BASE}`);
  console.log(`========================================\n`);

  let userA = null;
  let tokenA = null;
  let refreshA = null;
  let workspaceA = null;
  let projectA = null;
  let taskA = null;
  let stickyA = null;
  let convertedTaskA = null;

  // 1. Health check (Liveness + DB check)
  try {
    const res = await request('/health');
    const isOk = res.ok && res.json?.data?.status === 'ok';
    record('1. GET /health (API + DB connected)', isOk, `status: ${res.status}`);
  } catch (e) {
    record('1. GET /health', false, e.message);
  }

  // 2. Register User A
  const emailA = `smoke_alice_${Date.now()}@doit.local`;
  try {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: emailA,
        password: 'Password123!',
        fullName: 'Smoke Alice',
      }),
    });
    const pass = res.status === 201 && Boolean(res.json?.data?.user?.id);
    userA = res.json?.data?.user;
    tokenA = res.json?.data?.accessToken;
    refreshA = res.json?.data?.refreshToken;
    record('2. POST /auth/register', pass, `id: ${userA?.id?.slice(0, 8)}`);
  } catch (e) {
    record('2. POST /auth/register', false, e.message);
  }

  // 3. Login User A
  try {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: emailA,
        password: 'Password123!',
      }),
    });
    const pass = res.ok && Boolean(res.json?.data?.accessToken);
    tokenA = res.json?.data?.accessToken;
    refreshA = res.json?.data?.refreshToken;
    record('3. POST /auth/login', pass, `status: ${res.status}`);
  } catch (e) {
    record('3. POST /auth/login', false, e.message);
  }

  // 4. GET /auth/me
  try {
    const res = await request('/auth/me', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const pass = res.ok && (res.json?.data?.user?.email === emailA || res.json?.data?.email === emailA);
    record('4. GET /auth/me (Current User Profile)', pass, `email: ${res.json?.data?.user?.email || res.json?.data?.email}`);
  } catch (e) {
    record('4. GET /auth/me', false, e.message);
  }

  // 5. Create Workspace
  const wsSlug = `smoke-ws-${Date.now().toString(36)}`;
  try {
    const res = await request('/workspaces', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        name: 'Smoke Test Workspace',
        slug: wsSlug,
      }),
    });
    const pass = res.status === 201 && Boolean(res.json?.data?.id);
    workspaceA = res.json?.data;
    record('5. POST /workspaces (Create Workspace)', pass, `id: ${workspaceA?.id?.slice(0, 8)}`);
  } catch (e) {
    record('5. POST /workspaces', false, e.message);
  }

  // 6. List Workspaces
  try {
    const res = await request('/workspaces', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const pass = res.ok && Array.isArray(res.json?.data) && res.json.data.some((w) => w.id === workspaceA?.id);
    record('6. GET /workspaces (List Workspaces)', pass, `count: ${res.json?.data?.length}`);
  } catch (e) {
    record('6. GET /workspaces', false, e.message);
  }

  // 7. Create Project in Workspace
  try {
    const res = await request(`/workspaces/${workspaceA.id}/projects`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        name: 'Smoke Core Project',
        key: 'SMK',
        color: 'INDIGO',
      }),
    });
    const pass = res.status === 201 && Boolean(res.json?.data?.id);
    projectA = res.json?.data;
    record('7. POST /workspaces/:id/projects (Create Project)', pass, `key: ${projectA?.key}`);
  } catch (e) {
    record('7. POST /workspaces/:id/projects', false, e.message);
  }

  // 8. Create Task in Project
  try {
    const res = await request(`/projects/${projectA.id}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        projectId: projectA.id,
        title: 'Verify task creation with complete schema fields',
        description: 'Comprehensive markdown description for task',
        priority: 'HIGH',
        type: 'TASK',
        dueHasTime: false,
        labelIds: [],
      }),
    });
    taskA = res.json?.data?.task || res.json?.data;
    const pass = (res.status === 201 || res.status === 200) && Boolean(taskA?.id);
    record('8. POST /projects/:id/tasks (Create Task)', pass, `humanId: ${taskA?.humanId || taskA?.number}`);
  } catch (e) {
    record('8. POST /projects/:id/tasks', false, e.message);
  }

  // 9. Update Task State
  try {
    const res = await request(`/tasks/${taskA.id}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        status: 'IN_PROGRESS',
      }),
    });
    const updatedTask = res.json?.data?.task || res.json?.data;
    const pass = res.ok && updatedTask?.status === 'IN_PROGRESS';
    record('9. POST /tasks/:id/status (Transition to IN_PROGRESS)', pass, `status: ${updatedTask?.status}`);
  } catch (e) {
    record('9. POST /tasks/:id/status', false, e.message);
  }

  // 10. Create Bug Report in Project
  try {
    const res = await request(`/projects/${projectA.id}/bugs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        projectId: projectA.id,
        title: 'Network timeout on slow connection',
        description: 'Observed timeout after 30 seconds',
        severity: 'CRITICAL',
      }),
    });
    const bugItem = res.json?.data?.task || res.json?.data;
    const pass = (res.status === 201 || res.status === 200) && Boolean(bugItem?.id);
    record('10. POST /projects/:id/bugs (Create Bug)', pass, `id: ${bugItem?.id?.slice(0, 8)}`);
  } catch (e) {
    record('10. POST /projects/:id/bugs', false, e.message);
  }

  // 11. Create Sticky in Project
  try {
    const res = await request(`/projects/${projectA.id}/stickies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        body: 'Smoke test sticky note content',
        color: 'AMBER',
      }),
    });
    const pass = (res.status === 201 || res.status === 200) && Boolean(res.json?.data?.id);
    stickyA = res.json?.data;
    record('11. POST /projects/:id/stickies (Create Sticky)', pass, `id: ${stickyA?.id?.slice(0, 8)}`);
  } catch (e) {
    record('11. POST /projects/:id/stickies', false, e.message);
  }

  // 12. Convert Sticky to Task
  try {
    const res = await request(`/stickies/${stickyA.id}/convert`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        title: 'Action item converted from sticky note',
      }),
    });
    convertedTaskA = res.json?.data?.task || res.json?.data;
    const pass = res.ok && Boolean(convertedTaskA?.id);
    record('12. POST /stickies/:id/convert (Convert Sticky to Task)', pass, `taskId: ${convertedTaskA?.id?.slice(0, 8)}`);
  } catch (e) {
    record('12. POST /stickies/:id/convert', false, e.message);
  }

  // 13. Resumable Upload Init & Storage Write
  let uploadId = null;
  try {
    const res = await request('/uploads/init', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        fileName: 'screenshot.jpg',
        contentType: 'image/jpeg',
        sizeBytes: 1024,
        kind: 'SCREENSHOT',
      }),
    });
    uploadId = res.json?.data?.uploadId;
    const pass = (res.status === 201 || res.status === 200) && Boolean(uploadId);
    record('13. POST /uploads/init (Resumable Upload Initialization)', pass, `uploadId: ${uploadId?.slice(0, 8)}`);
  } catch (e) {
    record('13. POST /uploads/init', false, e.message);
  }

  // 14. List & Search Tasks
  try {
    const res = await request(`/projects/${projectA.id}/tasks?q=Verify`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const pass = res.ok && (Array.isArray(res.json?.data?.items) || Array.isArray(res.json?.data));
    record('14. GET /projects/:id/tasks?q=... (Full-text search)', pass, `status: ${res.status}`);
  } catch (e) {
    record('14. GET /projects/:id/tasks?q=...', false, e.message);
  }

  // 15. Refresh Token Rotation
  let newAccessToken = null;
  let newRefreshToken = null;
  try {
    const res = await request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: refreshA,
      }),
    });
    const pass = res.ok && Boolean(res.json?.data?.accessToken);
    newAccessToken = res.json?.data?.accessToken;
    newRefreshToken = res.json?.data?.refreshToken;
    record('15. POST /auth/refresh (Token Rotation)', pass, `new tokens granted`);
  } catch (e) {
    record('15. POST /auth/refresh', false, e.message);
  }

  // 16. Logout Current Device Session
  try {
    const res = await request('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    const pass = res.ok;
    record('16. POST /auth/logout (Revoke Session)', pass, `status: ${res.status}`);
  } catch (e) {
    record('16. POST /auth/logout', false, e.message);
  }

  // 17. Refresh Token Reuse / Revoked Session Rejected
  try {
    const res = await request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: refreshA, // Reusing old token
      }),
    });
    const pass = res.status === 401;
    record('17. POST /auth/refresh (Reuse Detection & Rejection)', pass, `expected 401, got ${res.status}`);
  } catch (e) {
    record('17. POST /auth/refresh (Reuse)', false, e.message);
  }

  // 18. Revoked Access Token Rejected
  try {
    const res = await request('/auth/me', {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    const pass = res.status === 401;
    record('18. GET /auth/me with Revoked Token (Access Denied)', pass, `expected 401, got ${res.status}`);
  } catch (e) {
    record('18. Revoked token rejected', false, e.message);
  }

  // 19. Register User B & Test Cross-Workspace Isolation
  const emailB = `smoke_bob_${Date.now()}@doit.local`;
  let tokenB = null;
  try {
    const resReg = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: emailB,
        password: 'Password123!',
        fullName: 'Smoke Bob',
      }),
    });
    tokenB = resReg.json?.data?.accessToken;

    // User B attempts to access User A's workspace
    const resAccess = await request(`/workspaces/${workspaceA.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const pass = resAccess.status === 403 || resAccess.status === 404;
    record('19. Cross-Workspace Access Control (IDOR Protection)', pass, `expected 403/404, got ${resAccess.status}`);
  } catch (e) {
    record('19. Cross-Workspace Access', false, e.message);
  }

  // 20. Direct PostgreSQL Verification Query
  console.log(`\n--- Direct PostgreSQL Row Verification ---`);
  try {
    const [userCount, wsCount, projCount, taskCount, stickyCount] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.sticky.count(),
    ]);

    console.log(`PostgreSQL Row Counts:`);
    console.log(`  Users:      ${userCount}`);
    console.log(`  Workspaces: ${wsCount}`);
    console.log(`  Projects:   ${projCount}`);
    console.log(`  Tasks:      ${taskCount}`);
    console.log(`  Stickies:   ${stickyCount}`);

    const hasRows = userCount > 0 && wsCount > 0 && projCount > 0 && taskCount > 0;
    record('20. Direct PostgreSQL Database Verification', hasRows, `All tables populated with real rows`);
  } catch (e) {
    record('20. PostgreSQL Verification', false, e.message);
  } finally {
    await prisma.$disconnect();
  }

  // Final Evaluation
  const allPassed = results.every((r) => r.pass);
  console.log(`\n========================================`);
  console.log(`  Smoke Test Summary: ${results.filter((r) => r.pass).length}/${results.length} PASSED`);
  console.log(`  Verdict: ${allPassed ? '\x1b[32m100% GREEN (PHASE R1 GATE PASSED)\x1b[0m' : '\x1b[31mFAILURES DETECTED\x1b[0m'}`);
  console.log(`========================================\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

runSmokeTests();
