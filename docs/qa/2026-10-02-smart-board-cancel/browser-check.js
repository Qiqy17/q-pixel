(async () => {
  const results = [];
  const check = (condition, label) => { if (!condition) throw new Error(label); results.push(label); };
  const originalPackage = window.QPixelSmartBoardPackage, originalPng = originalPackage.png;
  const originalBridge = window.webkit;
  const host = document.createElement('details'); host.open = true; document.body.appendChild(host);
  const messages = [];
  window.webkit = { messageHandlers: { smartBoard: { postMessage(message) { messages.push(message); } } } };
  const el = name => host.querySelector(`[data-board="${name}"]`);
  const reply = (action, extra = {}) => { const request = messages.slice().reverse().find(m => m.action === action); window.QPixelSmartBoardNative({ id: request.id, ...extra }); };
  const tick = () => new Promise(resolve => setTimeout(resolve, 0));
  let release;
  window.QPixelSmartBoardPackage = { ...originalPackage, png: (...args) => new Promise((resolve, reject) => { release = () => originalPng(...args).then(resolve, reject); }) };
  try {
    window.QPixelSmartBoardUI.create({ host, getPattern: () => ({ width: 1, height: 1, cells: [['H2']] }), palette: [{ code: 'H2', hex: '#eeeeee', rgb: { r: 238, g: 238, b: 238 } }] });
    for (const size of [32, 52]) {
      el('size').value = String(size); el('size').dispatchEvent(new Event('change'));
      el('devices').add(new Option('QA virtual board', 'qa'));
      el('connect').click(); reply('connect', { size }); await tick();
      const start = messages.filter(m => m.action === 'send').length;
      el('send').click(); check(el('send').disabled, `${size}: preparing locks send`);
      el('cancel').click(); reply('cancel'); release();
      while (el('send').disabled) await tick();
      check(messages.filter(m => m.action === 'send').length === start, `${size}: cancelled PNG never reaches bridge`);
      check(/取消/.test(el('status').textContent), `${size}: cancelled state shown`);
    }
    el('send').click(); release();
    while (!messages.some(m => m.action === 'send')) await tick();
    el('cancel').click(); reply('cancel'); reply('send'); await tick();
    check(!/确认接收完整/.test(el('status').textContent), 'late success cannot report completion');
    const status = el('status').textContent;
    window.QPixelSmartBoardNative({ type: 'progress', done: 1, total: 8 });
    check(el('status').textContent === status, 'late progress cannot overwrite status');
    el('send').click(); release();
    while (messages.filter(m => m.action === 'send').length < 2) await tick();
    reply('send'); await tick();
    check(/确认接收完整/.test(el('status').textContent), 'retry completes after final bridge response');
    return JSON.stringify({ passed: results.length, results, bridge: 'simulated', PNG: 'actual canvas PNG' });
  } finally { host.remove(); window.QPixelSmartBoardPackage = originalPackage; window.webkit = originalBridge; }
})()
