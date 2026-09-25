import { spawn } from 'child_process';
import fs from 'fs';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9229',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,1000',
    'http://localhost:3000/digital-twin'
  ]);
  await new Promise(r => setTimeout(r, 4000));
  const listRes = await fetch('http://localhost:9229/json/list').then(r => r.json());
  const target = listRes.find(t => t.url.includes('/digital-twin'));
  if (!target) {
    proc.kill();
    return;
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(res => ws.addEventListener('open', res));
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
  await new Promise(r => setTimeout(r, 8000));

  // Click Details button
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const detailsBtn = btns.find(b => b.textContent.includes('Details'));
        if (detailsBtn) detailsBtn.click();
      })()
    `
  });

  await new Promise(r => setTimeout(r, 1000));
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot && shot.data) {
    fs.writeFileSync('C:\\Users\\USER\\SMS\\scripts\\digital-twin-details-open.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved details open screenshot');
  }
  ws.close();
  proc.kill();
}

main().catch(console.error);
