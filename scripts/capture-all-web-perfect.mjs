import { spawn } from 'child_process';
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
  const wsRes = await fetch('https://doit.samyukt.pro/api/v1/workspaces', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const wsData = await wsRes.json();
  const workspaceId = wsData.data?.[0]?.id;

  const port = 9556;
  const userDataDir = 'C:/Users/karan/.gemini/antigravity/brain/85f48d90-313b-40d1-b202-6857dc27da6f/edge_clean_profile_web_full';
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
  const [page] = await listRes.json();
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let curId = 1;
  const callbacks = new Map();

  function call(method, params = {}) {
    return new Promise((resolve) => {
      const id = curId++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    } catch {}
  };

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  async function takeScreenshot(filename) {
    const shot = await call('Page.captureScreenshot', { format: 'png' });
    if (shot.result?.data) {
      const buf = Buffer.from(shot.result.data, 'base64');
      fs.writeFileSync(path.join(outDir, `${filename}.png`), buf);
      console.log(`✓ Saved ${filename}.png (${buf.length} bytes)`);
    } else {
      console.error('Failed to capture:', filename);
    }
  }

  // 1. Auth Login Screen (unauthenticated)
  console.log('Capturing Login screen...');
  await call('Page.navigate', { url: 'https://doit-web.samyukt.pro/login' });
  await new Promise((r) => setTimeout(r, 2000));
  await takeScreenshot('00_Web_Auth_Login_Screen');

  // Set auth in localStorage
  await call('Runtime.evaluate', {
    expression: `
      localStorage.setItem('doit_access_token', ${JSON.stringify(token)});
      localStorage.setItem('doit_refresh_token', ${JSON.stringify(refreshToken)});
      localStorage.setItem('doit_active_workspace_id', ${JSON.stringify(workspaceId)});
      localStorage.setItem('doit_theme_mode', 'dark');
      localStorage.setItem('doit_theme_accent', 'indigo');
    `,
  });

  const baseRoutes = [
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

  for (const r of baseRoutes) {
    console.log(`Navigating to ${r.name} (${r.path})...`);
    await call('Page.navigate', { url: `https://doit-web.samyukt.pro${r.path}` });
    await new Promise((res) => setTimeout(res, 2200));
    await takeScreenshot(r.name);
  }

  // 11. Tasks Board (Kanban) View
  console.log('Navigating to Tasks Board View...');
  await call('Page.navigate', { url: 'https://doit-web.samyukt.pro/tasks' });
  await new Promise((r) => setTimeout(r, 2000));
  await call('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const boardBtn = btns.find(b => b.textContent && b.textContent.includes('Board'));
      if (boardBtn) boardBtn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 1200));
  await takeScreenshot('11_Web_Tasks_Board_Kanban_View');

  // 12. Tasks Table View
  console.log('Navigating to Tasks Table View...');
  await call('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const tableBtn = btns.find(b => b.textContent && b.textContent.includes('Table'));
      if (tableBtn) tableBtn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 1200));
  await takeScreenshot('12_Web_Tasks_Table_View');

  // 13. Create New Task Modal
  console.log('Opening Create Modal...');
  await call('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const newBtn = btns.find(b => b.textContent && b.textContent.includes('New task'));
      if (newBtn) newBtn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 1200));
  await takeScreenshot('13_Web_Create_Task_Modal');

  // Close modal
  await call('Runtime.evaluate', {
    expression: `
      const esc = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true });
      document.dispatchEvent(esc);
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  // 14. Workspace Switcher Dropdown Open
  console.log('Opening Workspace Switcher dropdown...');
  await call('Runtime.evaluate', {
    expression: `
      const btn = document.querySelector('header button');
      if (btn) btn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));
  await takeScreenshot('14_Web_Workspace_Switcher_Dropdown');

  // 15. User Profile Menu Dropdown Open
  console.log('Opening User Profile dropdown...');
  await call('Runtime.evaluate', {
    expression: `
      const headers = document.querySelectorAll('header button');
      const userBtn = headers[headers.length - 1];
      if (userBtn) userBtn.click();
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));
  await takeScreenshot('15_Web_User_Profile_Menu_Dropdown');

  ws.close();
  proc.kill();
  console.log('All full web screenshots captured!');
}

main().catch(console.error);
