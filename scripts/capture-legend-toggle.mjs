import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\36f9d174-99a3-4b48-a4c1-40e055440dbe';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const url = 'http://localhost:3000/dashboard/power-grid';

  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9232',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,1000',
    url
  ]);

  await new Promise(r => setTimeout(r, 4500));
  const listRes = await fetch('http://localhost:9232/json/list').then(r => r.json());
  const pathPart = new URL(url).pathname;
  const target = listRes.find(t => t.url.includes(pathPart));
  if (!target) { proc.kill(); return; }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });

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
  await new Promise(r => setTimeout(r, 4500));

  // Click Network Legend button to collapse it
  console.log('Clicking Network Legend to collapse...');
  await send('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const legendBtn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('network legend'));
      if (legendBtn) legendBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot && shot.data) {
    fs.writeFileSync(path.join(outDir, 'gis-aesthetics-legend-collapsed.png'), Buffer.from(shot.data, 'base64'));
    console.log('Saved gis-aesthetics-legend-collapsed.png');
  }

  // Also test collapsing Layer Controls
  console.log('Collapsing Layer Controls...');
  await send('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const layerBtn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('layer controls'));
      if (layerBtn) layerBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot2 && shot2.data) {
    fs.writeFileSync(path.join(outDir, 'gis-aesthetics-panels-collapsed.png'), Buffer.from(shot2.data, 'base64'));
    console.log('Saved gis-aesthetics-panels-collapsed.png');
  }

  ws.close();
  proc.kill();
}

run().catch(console.error);
