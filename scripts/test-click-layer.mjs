import { spawn } from 'child_process';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const url = 'http://localhost:3000/dashboard/power-grid';
  const proc = spawn(edgePath, ['--headless', '--remote-debugging-port=9234', '--no-sandbox', '--disable-gpu', url]);
  await new Promise(r => setTimeout(r, 4500));
  const listRes = await fetch('http://localhost:9234/json/list').then(r => r.json());
  const target = listRes.find(t => t.url.includes('/dashboard/power-grid'));
  if (!target) { proc.kill(); return; }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(res => ws.addEventListener('open', res));
  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const curId = id++;
    const h = (evt) => { const msg = JSON.parse(evt.data); if (msg.id === curId) { ws.removeEventListener('message', h); res(msg.result); } };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 3000));

  const clickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const layerBtn = btns.find(b => b.innerText.includes('Layer Controls'));
        if (!layerBtn) return 'btn not found';
        layerBtn.click();
        return 'clicked: ' + layerBtn.innerText;
      })()
    `,
    returnByValue: true
  });
  console.log('Result:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 1000));

  const check = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const jurisdiction = document.querySelector('button')?.innerText;
        const btns = Array.from(document.querySelectorAll('button')).map(b => b.innerText.replace(/\\n/g, ' '));
        return btns;
      })()
    `,
    returnByValue: true
  });
  console.log('Buttons after click:', check.result.value);

  ws.close();
  proc.kill();
}

run().catch(console.error);
