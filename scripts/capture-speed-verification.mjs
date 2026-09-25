import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\36f9d174-99a3-4b48-a4c1-40e055440dbe';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const url = 'http://localhost:3000/dashboard/power-grid';

  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9245',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,1000',
    url
  ]);

  await new Promise(r => setTimeout(r, 4500));
  const listRes = await fetch('http://localhost:9245/json/list').then(r => r.json());
  const target = listRes.find(t => t.url.includes('/dashboard/power-grid'));
  if (!target) { proc.kill(); return; }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res) => { ws.addEventListener('open', res); });

  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const curId = id++;
    const h = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === curId) { ws.removeEventListener('message', h); res(msg.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  async function takeScreenshot(fileName) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync(path.join(outDir, fileName), Buffer.from(shot.data, 'base64'));
      console.log('Saved:', fileName);
    }
  }

  // 1. Initial wait
  console.log('Waiting for map to initialize...');
  await new Promise(r => setTimeout(r, 4000));
  await takeScreenshot('gis-fast-dark-mode.png');

  // 2. Toggle towers on instantly
  console.log('Toggling Transmission Towers...');
  await send('Runtime.evaluate', {
    expression: `
      const towersBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Towers / Pylons'));
      if (towersBtn) towersBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1200));
  await takeScreenshot('gis-fast-towers-active.png');

  // 3. Switch to Light mode
  console.log('Switching to Light mode...');
  await send('Runtime.evaluate', {
    expression: `
      const lightBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Light');
      if (lightBtn) lightBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 2000));
  await takeScreenshot('gis-fast-light-mode.png');

  ws.close();
  proc.kill();
  console.log('Done capturing screenshots!');
}

run().catch(console.error);
