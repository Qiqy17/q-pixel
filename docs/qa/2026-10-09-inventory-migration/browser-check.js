(async () => {
  const t = QPixelTest, results = [];
  const check = (value, label) => { if (!value) throw new Error(label); results.push(label); };
  await t.activateSyntheticBeadPattern(18, 18);
  const payload = t.makeProjectPayload();
  const cells = Array.from({length: 18}, (_, r) => Array.from({length: 18}, (_, c) => `A${(r*18+c)%9+1}`));
  payload.pattern.cells = cells; payload.layers[0].cells = cells;
  check(t.applyProjectPayload(payload, false), 'fixture imported');
  t.setInventoryForTest({}); t.renderInventoryPanelForTest();
  check(document.querySelectorAll('#inventoryShortageRows tr').length === 9, 'all nine shortages rendered');
  check(document.getElementById('inventoryReportNote').textContent.includes('零库存'), 'zero stock explicitly estimated');
  const stock = {A1: 4, A2: 3}; t.setInventoryForTest(stock); t.renderInventoryPanelForTest();
  const before = JSON.stringify(t.makeProjectPayload()), beforeStock = JSON.stringify(t.getInventoryForTest());
  const report = t.getShortageReportForTest();
  check(report.rows.length === 9 && report.totalShortage === 317, 'exact shortage quantities');
  let savedBlob, savedName;
  const oldCreate = URL.createObjectURL, oldClick = HTMLAnchorElement.prototype.click;
  URL.createObjectURL = blob => { savedBlob = blob; return oldCreate.call(URL, blob); };
  HTMLAnchorElement.prototype.click = function () { savedName = this.download; };
  try {
    document.getElementById('inventoryExportShortageButton').click();
    check(savedName.endsWith('缺货清单.csv'), 'CSV action produces correct file');
    check((await savedBlob.text()).includes('"A9",36,0,36'), 'download contains final shortage code');
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: async () => {throw new Error('denied');}}});
    try {
      document.getElementById('inventoryCopyShortageButton').click();
      await new Promise(resolve => setTimeout(resolve, 0));
      check(!document.getElementById('inventoryCopyFallback').hidden && document.getElementById('inventoryCopyFallback').value === report.text, 'clipboard denial offers complete selectable text');
    } finally { if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard); else delete navigator.clipboard; }
    check(JSON.stringify(t.getInventoryForTest()) === beforeStock, 'exports do not decrement inventory');
    const after = t.makeProjectPayload(); const beforePayload = JSON.parse(before);
    check(JSON.stringify(after.pattern) === JSON.stringify(beforePayload.pattern) && JSON.stringify(after.layers) === JSON.stringify(beforePayload.layers), 'exports do not edit pattern or layers');
    t.markUnsavedChangesForTest();
    document.getElementById('migrationBackupButton').click();
    check(savedName.endsWith('.qpx'), 'migration backup outputs editable qpx');
    const backedUp = JSON.parse(await savedBlob.text());
    check(t.getUnsavedChangesForTest(), 'backup does not falsely mark saved');
    check(t.applyProjectPayload(backedUp, false), 'backup reimports');
    check(JSON.stringify(t.makeProjectPayload().layers) === JSON.stringify(backedUp.layers), 'backup roundtrip preserves layers');
  } finally { URL.createObjectURL = oldCreate; HTMLAnchorElement.prototype.click = oldClick; }
  t.setInventoryForTest(Object.fromEntries(Array.from({length:9}, (_,i)=>[`A${i+1}`,36]))); t.renderInventoryPanelForTest();
  check(document.querySelectorAll('#inventoryShortageRows tr').length === 0 && document.getElementById('inventoryExportShortageButton').disabled, 'covered pattern has no shopping export');
  check(document.getElementById('currentEntryAddress').textContent.includes(location.origin), 'current address shown');
  check(document.getElementById('entryMigrationGuide').textContent.includes('不会自动上传'), 'migration explains manual sync');
  t.markUnsavedChangesForTest();
  const priorPattern = JSON.stringify(t.makeProjectPayload().pattern), oldConfirm = window.confirm;
  window.confirm = () => false;
  try {
    const input = document.getElementById('projectFileInput'), transfer = new DataTransfer();
    transfer.items.add(new File([JSON.stringify(t.makeProjectPayload())], 'guard.qpx', {type:'application/json'}));
    input.files = transfer.files; input.dispatchEvent(new Event('change'));
    check(t.getUnsavedChangesForTest() && JSON.stringify(t.makeProjectPayload().pattern) === priorPattern, 'cancelled import protects unsaved canvas');
  } finally { window.confirm = oldConfirm; }
  let projectPosts = 0;
  const originalFetch = window.fetch;
  window.fetch = (...args) => { if (/api\/projects/.test(String(args[0])) && args[1]?.method === 'POST') projectPosts++; return originalFetch(...args); };
  try {
    check(await t.saveCurrentProject(), 'local save succeeds');
    await t.flushOfflineWritesForTest();
    check(projectPosts === 0, 'local save makes no project upload');
    await t.syncOfflineForTest();
    check(projectPosts > 0, 'explicit sync uploads through actual isolated service');
  } finally { window.fetch = originalFetch; }

  window.fetch = async () => new Response(JSON.stringify({interfaceRevision:'newer-qa'}), {headers:{'Content-Type':'application/json'}});
  try { await t.checkInterfaceReleaseForTest(); check(document.getElementById('releaseStatus').textContent.includes('请先保存'), 'stale page warns without forced reload'); }
  finally { window.fetch = originalFetch; }
  await t.checkInterfaceReleaseForTest();
  return {passed:results.length,results};
})()
