import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'K:/Doit/screenshots/web';
fs.mkdirSync(outDir, { recursive: true });

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('1. Getting auth session for web capture...');
  const loginRes = await fetch('https://doit.samyukt.pro/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice@samyukt.com', password: 'Password123!' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  const refreshToken = loginData.data?.refreshToken;
  const user = loginData.data?.user;

  console.log('Logged in as:', user?.name, 'Token:', !!token);

  const wsRes = await fetch('https://doit.samyukt.pro/api/v1/workspaces', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const wsData = await wsRes.json();
  const workspaceId = wsData.data?.[0]?.id;
  console.log('Workspace ID:', workspaceId);

  console.log('2. Starting headless Edge with CDP...');
  const port = 9333;
  const userDataDir = 'C:/Users/karan/.gemini/antigravity/brain/85f48d90-313b-40d1-b202-6857dc27da6f/edge_profile';
  fs.mkdirSync(userDataDir, { recursive: true });

  const proc = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
    'about:blank',
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
  const pages = await listRes.json();
  const wsUrl = pages[0]?.webSocketDebuggerUrl;
  console.log('CDP WS:', wsUrl);

  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
  };

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  // Navigate to login page first to set domain cookies/localStorage
  console.log('3. Navigating to set storage...');
  await send('Page.navigate', { url: 'https://doit-web.samyukt.pro/login' });
  await new Promise((r) => setTimeout(r, 2500));

  // Set tokens in localStorage
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('doit_access_token', ${JSON.stringify(token)});
      localStorage.setItem('doit_refresh_token', ${JSON.stringify(refreshToken)});
      localStorage.setItem('doit_active_workspace_id', ${JSON.stringify(workspaceId)});
      localStorage.setItem('doit_theme_mode', 'dark');
      localStorage.setItem('doit_theme_accent', 'indigo');
    `,
  });

  const routes = [
    { name: '01_Web_Overview_Dashboard', path: '/' },
    { name: '02_Web_Tasks_List_View', path: '/tasks' },
    { name: '03_Web_Bug_Queue', path: '/bugs' },
    { name: '04_Web_Sticky_Board', path: '/stickies' },
    { name: '05_Web_Projects', path: '/projects' },
    { name: '06_Web_Team_Members', path: '/team' },
    { name: '07_Web_Search', path: '/search' },
    { name: '08_Web_Notifications_Inbox', path: '/notifications' },
    { name: '09_Web_Workspace_Settings', path: '/workspace/settings' },
    { name: '10_Web_Account_Settings', path: '/settings' },
  ];

  for (const r of routes) {
    console.log(`Capturing ${r.name} (${r.path})...`);
    await send('Page.navigate', { url: `https://doit-web.samyukt.pro${r.path}` });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = await send('Page.captureScreenshot', { format: 'png' });
    if (result.result?.data) {
      const buf = Buffer.from(result.result.data, 'base64');
      fs.writeFileSync(path.join(outDir, `${r.name}.png`), buf);
      console.log(`Saved: ${r.name}.png (${buf.length} bytes)`);
    } else {
      console.error('Failed to capture:', r.name, result);
    }
  }

  ws.close();
  proc.kill();
  console.log('All web screenshots captured successfully!');
}

main().catch(console.error);

