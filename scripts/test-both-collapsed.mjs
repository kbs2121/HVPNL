import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\36f9d174-99a3-4b48-a4c1-40e055440dbe';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const url = 'http://localhost:3000/dashboard/power-grid';

  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9236',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,1000',
    url
  ]);

  await new Promise(r => setTimeout(r, 4500));
  const listRes = await fetch('http://localhost:9236/json/list').then(r => r.json());
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

  // Collapse Layer Controls AND Network Legend
  const res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const layerBtn = btns.find(b => b.innerText.toLowerCase().includes('layer controls'));
        const legendBtn = btns.find(b => b.innerText.toLowerCase().includes('network legend'));
        if (layerBtn) layerBtn.click();
        if (legendBtn) legendBtn.click();
        return { layerFound: !!layerBtn, legendFound: !!legendBtn };
      })()
    `,
    returnByValue: true
  });
  console.log('Click result:', res.result.value);
  await new Promise(r => setTimeout(r, 800));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot && shot.data) {
    fs.writeFileSync(path.join(outDir, 'gis-aesthetics-both-collapsed.png'), Buffer.from(shot.data, 'base64'));
    console.log('Saved gis-aesthetics-both-collapsed.png');
  }

  ws.close();
  proc.kill();
}

run().catch(console.error);
