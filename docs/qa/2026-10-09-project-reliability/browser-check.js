(async () => {
  const t = QPixelTest, results = [], check = (v, label) => { if (!v) throw new Error(label); results.push(label); };
  await t.activateSyntheticBeadPattern(18, 18);
  let payload = t.makeProjectPayload(); payload.title = '可靠性 QA'; payload.id = `qa-${crypto.randomUUID()}`;
  payload.pattern.cells[0][0] = 'H2'; payload.layers[0].cells[0][0] = 'H2';
  payload.buildProgress = {'0:0': true};
  check(t.applyProjectPayload(payload), 'load multi-field pattern'); t.markUnsavedChangesForTest();
  let writes = 0, fetchOriginal = window.fetch;
  window.fetch = (...args) => { if (/api\/projects/.test(String(args[0])) && ['POST','DELETE'].includes(args[1]?.method)) writes++; return fetchOriginal(...args); };
  try {
    check(await t.saveCurrentProject(), 'local save succeeds');
    check(writes === 0, 'save never uploads');
    check(document.getElementById('saveStatus').textContent === '已保存到本机', 'local status names destination');
    check(document.getElementById('projectSyncStatus').textContent === '待同步', 'pending status independent');
    const firstId = t.makeProjectPayload().id;
    await t.syncOfflineForTest();
    check(writes > 0, 'explicit sync uses conditional server');
    check((await t.getOfflineStoreForTest().pending()).length === 0, 'confirmed queue cleared');
    check(document.getElementById('projectSyncStatus').textContent === '已同步', 'sync status confirmed');
    const remote = await (await fetch(`/api/projects/${firstId}`)).json();
    check(Boolean(remote.serverRevision), 'remote has server revision');
    // A remote edit between read and upload must turn into a conflict copy.
    const changed = t.makeProjectPayload(); changed.pattern.cells[0][1] = 'H4'; changed.layers[0].cells[0][1] = 'H4';
    t.applyProjectPayload(changed); t.markUnsavedChangesForTest(); check(await t.saveCurrentProject(), 'save local change');
    let raced = false;
    window.fetch = async (...args) => {
      if (!raced && String(args[0]).endsWith(`/api/projects/${firstId}`) && args[1]?.method === 'POST') {
        raced = true;
        const latest = await (await fetchOriginal(`/api/projects/${firstId}`)).json();
        latest.payload.pattern.cells[0][2] = 'H7'; latest.payload.layers[0].cells[0][2] = 'H7';
        const response = await fetchOriginal(`/api/projects/${firstId}`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project:latest,expectedRevision:latest.serverRevision,mutationId:'qa-race'})});
        check(response.ok, 'injected competing remote update accepted');
      }
      return fetchOriginal(...args);
    };
    await t.syncOfflineForTest();
    window.fetch = fetchOriginal;
    const kept = await (await fetch(`/api/projects/${firstId}`)).json();
    check(kept.payload.pattern.cells[0][2] === 'H7', 'atomic race preserves remote edit');
    const snapshot = await t.librarySnapshotForTest();
    const copy = snapshot.projects.find((r) => r.conflictOf === firstId);
    check(copy?.payload.pattern.cells[0][1] === 'H4', 'atomic race preserves local edit in copy');
    check((await t.getOfflineStoreForTest().pending()).length === 0, 'race settled without queue loss');
    t.markUnsavedChangesForTest();
    const beforeCanvas = JSON.stringify(t.makeProjectPayload().pattern), queueBefore = JSON.stringify(await t.getOfflineStoreForTest().pending());
    const backup = await t.buildLibraryBackupForTest();
    const parsed = await QPixelProjectLibrary.inspect(backup.text);
    check(parsed.invalid.length === 0 && parsed.draft, 'library includes valid unsaved draft');
    check(t.getUnsavedChangesForTest(), 'backup never marks canvas saved');
    check(JSON.stringify(await t.getOfflineStoreForTest().pending()) === queueBefore, 'backup preserves queue');
    const fresh = JSON.parse(backup.text);
    // Create an independently generated library containing conflicting content and trash.
    const conflictRecord = JSON.parse(JSON.stringify(copy)); conflictRecord.payload.pattern.cells[0][3] = 'E11'; conflictRecord.payload.layers[0].cells[0][3] = 'E11';
    const trash = JSON.parse(JSON.stringify(conflictRecord)); trash.id = `qa-trash-${crypto.randomUUID()}`; trash.payload.id = trash.id; trash.deleted = true;
    const incoming = await QPixelProjectLibrary.create({records:[conflictRecord,trash],draft:parsed.draft});
    const preview = await t.previewLibraryTextForTest(incoming.text);
    check(preview.report.copies.length === 1, 'import preview detects conflict');
    t.setOfflineWriteFailureForTest(true);
    const oldSnapshot = JSON.stringify((await t.librarySnapshotForTest()).projects);
    try { await t.commitLibraryImportForTest(preview.inspection.valid.map((r)=>r.id), true); throw new Error('expected transaction failure'); }
    catch(error) { check(error.message.includes('事务失败'), 'injected import failure reports transaction failure'); }
    check(JSON.stringify((await t.librarySnapshotForTest()).projects) === oldSnapshot, 'failed import leaves entire old library intact');
    t.setOfflineWriteFailureForTest(false);
    const report = await t.commitLibraryImportForTest(preview.inspection.valid.map((r)=>r.id), true);
    check(report.copies.length === 1 && report.trash.length === 1 && report.drafts.length === 1, 'import preserves conflict trash and draft');
    check(JSON.stringify(t.makeProjectPayload().pattern) === beforeCanvas && t.getUnsavedChangesForTest(), 'import preserves current unsaved canvas');
    check(!(await t.getOfflineStoreForTest().pending()).some((r)=>r.id === trash.id), 'imported trash creates no executable deletion');
    document.getElementById('homeTrashButton').click();
    check(document.getElementById('trashList').textContent.includes(trash.title), 'imported trash visible in real recovery UI');
    document.getElementById('trashCloseButton').click();
    const afterImport = await t.librarySnapshotForTest();
    check(afterImport.projects.find((r)=>r.id === report.copies[0].id).payload.buildProgress['0:0'], 'migration preserves build progress');
    // Save failure cannot become a success; latest edits remain dirty.
    t.setOfflineWriteFailureForTest(true);
    check(await t.saveCurrentProject() === false && t.getUnsavedChangesForTest(), 'failed local save stays dirty');
    check(document.getElementById('saveStatus').textContent.includes('保存失败'), 'save failure visible independently');
    t.setOfflineWriteFailureForTest(false);
    check(await t.saveCurrentProject(), 'save retry succeeds');
    // Actual UI backup action and native callback identities.
    document.getElementById('libraryBackupButton').click();
    for(let i=0;i<40 && !document.getElementById('projectLibraryDialog').open;i++) await new Promise(r=>setTimeout(r,25));
    check(document.getElementById('projectLibraryDialog').open, 'actual library backup dialog opens');
    check(document.querySelectorAll('#projectLibraryDialog input').length > 1, 'actual subset selection available');
    document.querySelector('#projectLibraryDialog [data-role="library-close"]').click();
    // Schema and checksum corruption reject before normal-library mutation.
    const corrupt = JSON.parse(incoming.text); corrupt.items[0].record.payload.pattern.cells[0][0] = 'H1';
    const bad = await QPixelProjectLibrary.inspect(JSON.stringify(corrupt));
    check(bad.invalid.length > 0 && bad.valid.length === 1, 'corrupt entry isolated and manifest marked damaged');
    const retainedId = t.makeProjectPayload().id;
    window.__reliabilityReloadId = retainedId;
    return {passed:results.length,results,retainedId,libraryCount:(await t.librarySnapshotForTest()).projects.length};
  } finally { window.fetch = fetchOriginal; t.setOfflineWriteFailureForTest(false); }
})()
