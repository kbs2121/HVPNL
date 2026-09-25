import { spawn } from 'child_process';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9225',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:3000/digital-twin'
  ]);

  await new Promise(r => setTimeout(r, 4000));

  const listRes = await fetch('http://localhost:9225/json/list').then(r => r.json());
  const target = listRes.find(t => t.url.includes('/digital-twin'));
  if (!target) {
    console.error('Target not found!', listRes);
    proc.kill();
    return;
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  let reqId = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = reqId++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.addEventListener('message', (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('CONSOLE:', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('EXCEPTION:', msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text);
    }
  });

  await send('Runtime.enable');
  await send('Page.enable');

  await new Promise(r => setTimeout(r, 6000));

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const canvas = document.querySelectorAll('canvas');
      const maplibre = document.querySelector('.maplibregl-map');
      const deck = document.querySelector('#deckgl-overlay');
      const loading = document.querySelector('.animate-spin');
      return {
        canvasCount: canvas.length,
        hasMapLibre: !!maplibre,
        hasDeck: !!deck,
        isLoading: !!loading,
        loadingText: document.body.innerText.slice(0, 300)
      };
    })()`,
    returnByValue: true
  });

  console.log('DIGITAL TWIN EVALUATION RESULT:', JSON.stringify(evalRes, null, 2));

  ws.close();
  proc.kill();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
