import { spawn } from 'child_process';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const url = 'http://localhost:3000/dashboard/power-grid';
  const proc = spawn(edgePath, ['--headless', '--remote-debugging-port=9233', '--no-sandbox', '--disable-gpu', url]);
  await new Promise(r => setTimeout(r, 4500));
  const listRes = await fetch('http://localhost:9233/json/list').then(r => r.json());
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
  const res = await send('Runtime.evaluate', {
    expression: "Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim().replace(/\\n/g, ' '))",
    returnByValue: true
  });
  console.log('Buttons:', res.result.value);
  ws.close();
  proc.kill();
}

run().catch(console.error);
