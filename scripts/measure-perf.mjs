import { spawn } from 'child_process';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const url = 'http://localhost:3000/dashboard/power-grid';
  const proc = spawn(edgePath, ['--headless', '--remote-debugging-port=9241', '--no-sandbox', '--disable-gpu', url]);
  await new Promise(r => setTimeout(r, 4500));
  const listRes = await fetch('http://localhost:9241/json/list').then(r => r.json());
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

  const metrics = await send('Runtime.evaluate', {
    expression: `(() => {
      const markers = document.querySelectorAll('.leaflet-marker-icon').length;
      const paths = document.querySelectorAll('.leaflet-overlay-pane path').length;
      const svgs = document.querySelectorAll('svg').length;
      return { markers, paths, svgs };
    })()`,
    returnByValue: true
  });
  console.log('Metrics:', metrics.result.value);

  // Measure time to toggle a layer (e.g. Jurisdiction or Transmission Lines)
  const bench = await send('Runtime.evaluate', {
    expression: `(() => {
      const start = performance.now();
      const btns = Array.from(document.querySelectorAll('button'));
      const lineSwitch = btns.find(b => b.innerText.includes('Transmission Lines'));
      if (lineSwitch) {
        lineSwitch.click();
      }
      const dur = performance.now() - start;
      return { clicked: !!lineSwitch, synchronousDurMs: dur };
    })()`,
    returnByValue: true
  });
  console.log('Toggle benchmark:', bench.result.value);

  ws.close();
  proc.kill();
}

run().catch(console.error);
