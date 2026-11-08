import fs from 'fs';

const token = fs.readFileSync('K:/Coolify/api.txt', 'utf8').trim();
const deployUuid = 'pv0qn56f8mccc2z5syty4dsj';

async function check() {
  const res = await fetch(`https://coolify.kachakaran.tech/api/v1/deployments/${deployUuid}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(`Status: ${data.status}`);
  if (data.status === 'finished') {
    console.log('Deployment completed successfully!');
    process.exit(0);
  } else if (data.status === 'failed' || data.status === 'error') {
    console.error('Deployment failed:', data);
    process.exit(1);
  }
}

async function loop() {
  for (let i = 0; i < 40; i++) {
    await check();
    await new Promise(r => setTimeout(r, 6000));
  }
  console.log('Timeout waiting for deployment');
}

loop().catch(console.error);

