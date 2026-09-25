import { spawn } from 'child_process';
import fs from 'fs';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9232',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1600,1050',
    'http://localhost:3000/dashboard/analytics'
  ]);
  await new Promise(r => setTimeout(r, 4000));
  const listRes = await fetch('http://localhost:9232/json/list').then(r => r.json());
  const target = listRes.find(t => t.url.includes('/dashboard/analytics'));
  if (!target) {
    console.error('Target not found', listRes);
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
  await new Promise(r => setTimeout(r, 3000));

  // 1. Ensure Dark Mode
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        localStorage.setItem('sms-analytics-theme', 'dark');
        location.reload();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 4000));

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot?.data) {
    fs.writeFileSync('C:\\Users\\USER\\SMS\\scripts\\analytics-new-dark.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved analytics-new-dark.png');
  }

  // 2. Click Jurisdiction Benchmark Tab
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const jTab = btns.find(b => b.textContent.includes('Jurisdiction Benchmark'));
        if (jTab) jTab.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot?.data) {
    fs.writeFileSync('C:\\Users\\USER\\SMS\\scripts\\analytics-jurisdiction-dark.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved analytics-jurisdiction-dark.png');
  }

  // 3. Switch to Light Mode
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const themeBtn = document.querySelector('button[title*="theme"], button[aria-label*="theme"]');
        if (themeBtn) themeBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // Switch back to Executive Insights Tab in Light Mode
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const iTab = btns.find(b => b.textContent.includes('Executive Insights'));
        if (iTab) iTab.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot?.data) {
    fs.writeFileSync('C:\\Users\\USER\\SMS\\scripts\\analytics-new-light.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved analytics-new-light.png');
  }

  // 4. Switch to Priority Risk Queue Tab in Light Mode
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const qTab = btns.find(b => b.textContent.includes('Priority Risk Queue'));
        if (qTab) qTab.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot?.data) {
    fs.writeFileSync('C:\\Users\\USER\\SMS\\scripts\\analytics-queue-light.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved analytics-queue-light.png');
  }

  ws.close();
  proc.kill();
}

main().catch(console.error);
