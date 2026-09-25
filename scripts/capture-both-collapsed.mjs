import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\36f9d174-99a3-4b48-a4c1-40e055440dbe';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const url = 'http://localhost:3000/dashboard/power-grid';

  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9235',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,1000',
    url
  ]);

  await new Promise(r => setTimeout(r, 4500));
  const listRes = await fetch('http://localhost:9235/json/list').then(r => r.json());
  const target = listRes.find(t => t.url.includes('/dashboard/power-grid'));
  if (!target) { proc.kill(); return; }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(res => ws.addEventListener('open', res));

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
  await new Promise(r => setTimeout(r, 4000));

  // 1. Collapse Layer Controls
  console.log('Collapsing Layer Controls panel...');
  await send('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const layerBtn = btns.find(b => b.innerText.includes('Layer Controls'));
      if (layerBtn) layerBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 700));

  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot1 && shot1.data) {
    fs.writeFileSync(path.join(outDir, 'gis-aesthetics-layer-collapsed.png'), Buffer.from(shot1.data, 'base64'));
    console.log('Saved gis-aesthetics-layer-collapsed.png');
  }

  // 2. Collapse Network Legend as well (both collapsed)
  console.log('Collapsing Legend as well...');
  await send('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const legendBtn = btns.find(b => b.innerText.includes('NETWORK LEGEND'));
      if (legendBtn) legendBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 700));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot2 && shot2.data) {
    fs.writeFileSync(path.join(outDir, 'gis-aesthetics-both-collapsed.png'), Buffer.from(shot2.data, 'base64'));
    console.log('Saved gis-aesthetics-both-collapsed.png');
  }

  // 3. Re-expand Layer Controls and test toggling a switch (e.g. Towers / Pylons)
  console.log('Re-expanding Layer Controls and toggling Towers / Pylons...');
  await send('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const layerBtn = btns.find(b => b.innerText.includes('Layer Controls'));
      if (layerBtn) layerBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 600));

  await send('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const towerBtn = btns.find(b => b.innerText.includes('Towers / Pylons'));
      if (towerBtn) towerBtn.click();
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot3 && shot3.data) {
    fs.writeFileSync(path.join(outDir, 'gis-aesthetics-towers-active.png'), Buffer.from(shot3.data, 'base64'));
    console.log('Saved gis-aesthetics-towers-active.png');
  }

  ws.close();
  proc.kill();
  console.log('All capture steps completed!');
}

run().catch(console.error);
