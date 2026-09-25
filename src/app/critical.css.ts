export const criticalCss = `
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    background: #0a0f1a;
    color: #f1f5f9;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  *, *::before, *::after { box-sizing: border-box; }
  a { color: #22d3ee; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .dashboard-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: #0a0f1a;
  }
  .glass-panel {
    background: rgba(15, 23, 41, 0.85);
    border: 1px solid rgba(148, 163, 184, 0.12);
    backdrop-filter: blur(12px);
  }
`;
