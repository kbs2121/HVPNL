import { spawn } from 'child_process';
import fs from 'fs';

async function testInteractions() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9228',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,1000',
    'http://localhost:3000/dashboard/power-grid'
  ]);

  await new Promise(r => setTimeout(r, 4000));

  const listRes = await fetch('http://localhost:9228/json/list').then(r => r.json());
  const target = listRes.find(t => t.url.includes('/dashboard/power-grid'));
  if (!target) {
    console.error('Target not found', listRes);
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
  await new Promise(r => setTimeout(r, 4000));

  // 1. Click Show Circles & Show Divisions in Layer Control
  await send('Runtime.evaluate', {
    expression: `
      const labels = Array.from(document.querySelectorAll('label'));
      const circleLabel = labels.find(l => l.textContent.includes('Show Circles'));
      if (circleLabel) circleLabel.click();
      const divLabel = labels.find(l => l.textContent.includes('Show Divisions'));
      if (divLabel) divLabel.click();
    `
  });

  await new Promise(r => setTimeout(r, 2000));
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot1 && shot1.data) {
    fs.writeFileSync('C:\\Users\\USER\\SMS\\scripts\\power-grid-circles-divisions.png', Buffer.from(shot1.data, 'base64'));
    console.log('Saved power-grid-circles-divisions.png');
  }

  // 2. Click Satellite theme
  await send('Runtime.evaluate', {
    expression: `
      const btns = Array.from(document.querySelectorAll('button'));
      const satBtn = btns.find(b => b.textContent.includes('Satellite'));
      if (satBtn) satBtn.click();
    `
  });

  await new Promise(r => setTimeout(r, 3000));
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  if (shot2 && shot2.data) {
    fs.writeFileSync('C:\\Users\\USER\\SMS\\scripts\\power-grid-satellite.png', Buffer.from(shot2.data, 'base64'));
    console.log('Saved power-grid-satellite.png');
  }

  ws.close();
  proc.kill();
}

testInteractions().catch(console.error);
