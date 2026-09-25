import { spawn } from 'child_process';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9228',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:3000/digital-twin'
  ]);

  await new Promise(r => setTimeout(r, 4000));

  const listRes = await fetch('http://localhost:9228/json/list').then(r => r.json());
  const target = listRes.find(t => t.url.includes('/digital-twin'));
  if (!target) {
    console.error('Target not found!', listRes);
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

  ws.addEventListener('message', (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('FULL EXCEPTION:', JSON.stringify(msg.params.exceptionDetails, null, 2));
    }
  });

  await send('Runtime.enable');
  await send('Page.enable');

  await new Promise(r => setTimeout(r, 4000));

  const errorOverlay = await send('Runtime.evaluate', {
    expression: `(() => {
      const portal = document.querySelector('nextjs-portal');
      const root = portal ? portal.shadowRoot : null;
      if (root) {
        return root.innerHTML;
      }
      return 'no shadow root';
    })()`,
    returnByValue: true
  });

  console.log('SHADOW ROOT HTML:', errorOverlay.result?.value?.slice(0, 3000));

  ws.close();
  proc.kill();
}

main().catch(console.error);
