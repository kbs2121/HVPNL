import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\36f9d174-99a3-4b48-a4c1-40e055440dbe';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const url = 'http://localhost:3000/dashboard/power-grid';

  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9228',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,1000',
    url
  ]);

  await new Promise(r => setTimeout(r, 4500));

  const listRes = await fetch('http://localhost:9228/json/list').then(r => r.json());
  const pathPart = new URL(url).pathname;
  const target = listRes.find(t => t.url.includes(pathPart));
  if (!target) {
    console.error('Target not found for', url, listRes);
    proc.kill();
    return;
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });

  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const curId = id++;
    const h = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', h);
        res(msg.result);
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  async function takeScreenshot(fileName) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      const targetPath = path.join(outDir, fileName);
      fs.writeFileSync(targetPath, Buffer.from(shot.data, 'base64'));
      console.log('Saved:', fileName);
    }
  }

  async function evaluate(code) {
    return send('Runtime.evaluate', { expression: code });
  }

  // Initial wait for Leaflet & tiles
  await new Promise(r => setTimeout(r, 5000));
  await takeScreenshot('gis-theme-dark.png');

  // Switch to Gray
  console.log('Switching to Gray...');
  await evaluate(`document.querySelector('button[title*="Gray basemap"]')?.click()`);
  await new Promise(r => setTimeout(r, 4000));
  await takeScreenshot('gis-theme-gray.png');

  // Switch to White
  console.log('Switching to White...');
  await evaluate(`document.querySelector('button[title*="White basemap"]')?.click()`);
  await new Promise(r => setTimeout(r, 4000));
  await takeScreenshot('gis-theme-white.png');

  // Switch to Satellite
  console.log('Switching to Satellite...');
  await evaluate(`document.querySelector('button[title*="Satellite basemap"]')?.click()`);
  await new Promise(r => setTimeout(r, 4000));
  await takeScreenshot('gis-theme-satellite.png');

  ws.close();
  proc.kill();
  console.log('Completed all captures successfully.');
}

run().catch(console.error);
