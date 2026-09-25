import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\36f9d174-99a3-4b48-a4c1-40e055440dbe';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const url = 'http://localhost:3000/dashboard/power-grid';

  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9230',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,1000',
    url
  ]);

  await new Promise(r => setTimeout(r, 4500));

  const listRes = await fetch('http://localhost:9230/json/list').then(r => r.json());
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

  // 1. Initial wait for map, tiles, and animations to settle
  console.log('Waiting for map and layers to render...');
  await new Promise(r => setTimeout(r, 5000));

  // 2. Capture primary enhanced view (superconductor core filaments, radar pulse rings, pylon strobes, glass panels)
  console.log('Capturing enhanced GIS main view...');
  await takeScreenshot('gis-aesthetics-main.png');

  // 3. Hover on a substation marker to trigger the hover card
  console.log('Triggering substation hover card...');
  await evaluate(`
    const marker = document.querySelector('.leaflet-marker-icon');
    if (marker) {
      marker.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    }
  `);
  await new Promise(r => setTimeout(r, 1200));
  await takeScreenshot('gis-aesthetics-hover.png');

  // 4. Toggle the Legend collapsed
  console.log('Collapsing legend card...');
  await evaluate(`
    const legendBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Grid Legend'));
    if (legendBtn) legendBtn.click();
  `);
  await new Promise(r => setTimeout(r, 800));
  await takeScreenshot('gis-aesthetics-legend-collapsed.png');

  // 5. Switch to White Theme using ThemeSwitcher
  console.log('Switching to White Theme...');
  await evaluate(`
    const whiteBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('White'));
    if (whiteBtn) whiteBtn.click();
  `);
  await new Promise(r => setTimeout(r, 2000));
  await takeScreenshot('gis-aesthetics-white-theme.png');

  ws.close();
  proc.kill();
  console.log('All enhanced GIS aesthetic captures completed.');
}

run().catch(console.error);
