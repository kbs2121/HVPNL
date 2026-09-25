import { spawn } from 'child_process';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const url = 'http://localhost:3000/dashboard/power-grid';
  const proc = spawn(edgePath, ['--headless', '--remote-debugging-port=9242', '--no-sandbox', '--disable-gpu', url]);
  await new Promise(r => setTimeout(r, 4500));
  const listRes = await fetch('http://localhost:9242/json/list').then(r => r.json());
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

  // Benchmark toggling all layers one after another
  const results = await send('Runtime.evaluate', {
    expression: `(async () => {
      const log = [];
      const btns = Array.from(document.querySelectorAll('button'));

      const toggles = [
        'Transmission Lines',
        'Live Flow Pulses (Gen → Tx)',
        'Generation Sources (11)',
        'Substations (97)',
        'Master Boundary Layer',
      ];

      for (const name of toggles) {
        const btn = btns.find(b => b.innerText.includes(name));
        if (btn) {
          const t0 = performance.now();
          btn.click();
          const tSync = performance.now();
          await new Promise(r => requestAnimationFrame(r));
          const tFrame = performance.now();
          log.push({ name, jsSyncMs: (tSync - t0).toFixed(2), totalFrameMs: (tFrame - t0).toFixed(2) });
        }
      }

      // Test theme switch time
      const lightBtn = btns.find(b => b.innerText.trim() === 'Light');
      if (lightBtn) {
        const t0 = performance.now();
        lightBtn.click();
        const tSync = performance.now();
        await new Promise(r => requestAnimationFrame(r));
        const tFrame = performance.now();
        log.push({ name: 'Switch to Light', jsSyncMs: (tSync - t0).toFixed(2), totalFrameMs: (tFrame - t0).toFixed(2) });
      }

      return log;
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Benchmark results:', results.result.value);
  ws.close();
  proc.kill();
}

run().catch(console.error);
