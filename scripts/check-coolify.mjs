const TOKEN = '9|3rEHbWJHmMKyLiTzKNlSIz3DdGVbH10EDM9Ud4wI4a70796c';

async function checkDeployment(uuid) {
  const res = await fetch('https://coolify.kachakaran.tech/api/v1/deployments/' + uuid, {
    headers: { Authorization: 'Bearer ' + TOKEN }
  });
  return res.json();
}

async function main() {
  for (let i = 0; i < 8; i++) {
    await new Promise(r => setTimeout(r, 10000));
    const [api, web] = await Promise.all([
      checkDeployment('spfx2rv2fuxa3yxbucgisofv'),
      checkDeployment('eqnjh1kywbfmob6nfu4uhf9i')
    ]);
    console.log(`[${(i+1)*10}s] API: ${api.status} | WEB: ${web.status}`);
    if (api.status === 'finished' && web.status === 'finished') {
      console.log('Both deployments completed successfully!');
      break;
    }
    if (api.status === 'failed' || web.status === 'failed') {
      console.log('Warning - build failure detected:', { api: api.status, web: web.status });
      break;
    }
  }
}
main();

