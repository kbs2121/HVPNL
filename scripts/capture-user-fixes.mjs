import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\36f9d174-99a3-4b48-a4c1-40e055440dbe';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const url = 'http://localhost:3000/dashboard/power-grid';

  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9240',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,1000',
    url
  ]);

  await new Promise(r => setTimeout(r, 4500));
  const listRes = await fetch('http://localhost:9240/json/list').then(r => r.json());
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

  // 1. Wait for map, layers, and animations
  console.log('Waiting for map to render...');
  await new Promise(r => setTimeout(r, 5000));

  // 2. Dark mode: Thinner filter bar, pure vivid colored flow lines (no white line domination), 3-mode switcher
  console.log('Capturing dark mode with vivid flow lines and slim filter bar...');
  await takeScreenshot('gis-fix-dark-mode.png');

  // 3. Switch to Light mode
  console.log('Switching to Light mode...');
  await send('Runtime.evaluate', {
    expression: `
      const lightBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Light');
      if (lightBtn) lightBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 2500));

  // 4. Capture Light mode with visible lines, high contrast text and layers
  console.log('Capturing light mode with clear layers and text...');
  await takeScreenshot('gis-fix-light-mode.png');

  // 5. Switch to Satellite mode
  console.log('Switching to Satellite mode...');
  await send('Runtime.evaluate', {
    expression: `
      const satBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Satellite');
      if (satBtn) satBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 2500));

  console.log('Capturing satellite mode...');
  await takeScreenshot('gis-fix-satellite-mode.png');

  ws.close();
  proc.kill();
  console.log('All verification captures completed successfully.');
}

run().catch(console.error);
