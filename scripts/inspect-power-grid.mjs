import { spawn } from 'child_process';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9224',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:3000/dashboard/power-grid'
  ]);

  await new Promise(r => setTimeout(r, 4000));

  const listRes = await fetch('http://localhost:9224/json/list').then(r => r.json());
  const target = listRes.find(t => t.url.includes('/dashboard/power-grid'));
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

  // Wait 4 seconds for map tiles and layers to load
  await new Promise(r => setTimeout(r, 4000));

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const mapEl = document.querySelector('.leaflet-container');
      const tiles = document.querySelectorAll('.leaflet-tile');
      const overlayPaths = document.querySelectorAll('.leaflet-overlay-pane svg path');
      const markers = document.querySelectorAll('.leaflet-marker-pane .power-grid-marker');
      const allMarkers = document.querySelectorAll('.leaflet-marker-pane > *');
      const layerCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).map(cb => ({
        label: cb.parentElement?.textContent?.trim(),
        checked: cb.checked
      }));
      return {
        hasMap: !!mapEl,
        mapElSize: mapEl ? { w: mapEl.clientWidth, h: mapEl.clientHeight } : null,
        tilesCount: tiles.length,
        overlayPathsCount: overlayPaths.length,
        powerGridMarkersCount: markers.length,
        allMarkersCount: allMarkers.length,
        layerCheckboxes
      };
    })()`,
    returnByValue: true
  });

  console.log('EVALUATION RESULT:', JSON.stringify(evalRes, null, 2));

  ws.close();
  proc.kill();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
