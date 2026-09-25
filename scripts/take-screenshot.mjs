import { spawn } from 'child_process';
import fs from 'fs';

async function capture(url, outPath) {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9227',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,1000',
    url
  ]);

  await new Promise(r => setTimeout(r, 4000));

  const listRes = await fetch('http://localhost:9227/json/list').then(r => r.json());
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
  await new Promise(r => setTimeout(r, 9000));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot && shot.data) {
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshot to', outPath);
  } else {
    console.error('Failed to capture screenshot');
  }

  ws.close();
  proc.kill();
}

const targetUrl = process.argv[2] || 'http://localhost:3000/dashboard/power-grid';
const outPath = process.argv[3] || 'C:\\Users\\USER\\SMS\\scripts\\screenshot.png';

capture(targetUrl, outPath).catch(console.error);
