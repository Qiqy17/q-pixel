(() => {
  'use strict';
  const el = id => document.getElementById(id);
  let projects = [];
  const date = value => { const d = new Date(value); return value && !Number.isNaN(d.getTime()) ? d.toLocaleString('zh-CN') : '—'; };
  function row(body, values) {
    const tr = document.createElement('tr');
    for (const value of values) { const td = document.createElement('td'); if (value instanceof Node) td.appendChild(value); else td.textContent = String(value); tr.appendChild(td); }
    body.appendChild(tr);
  }
  function renderProjects() {
    const query = el('search').value.trim().toLocaleLowerCase();
    const filtered = projects.filter(p => `${p.title || p.name || ''} ${p.id || ''}`.toLocaleLowerCase().includes(query));
    el('projects').replaceChildren();
    for (const p of filtered) row(el('projects'), [p.title || p.name || p.id || '未命名', `${p.width || '—'} × ${p.height || '—'}`, p.deleted ? '已删除记录' : '电脑已保存', date(p.updatedAt || p.savedAt)]);
    el('projectCount').textContent = `共 ${projects.length} 条记录（含已删除），当前显示 ${filtered.length} 条。`;
  }
  async function localSummary() {
    if (!('indexedDB' in window)) return '此浏览器无法读取本机保存区。';
    return new Promise(resolve => {
      const request = indexedDB.open('q-pixel-projects');
      let missing = false;
      request.onupgradeneeded = () => { missing = true; request.transaction.abort(); };
      request.onerror = () => resolve(missing ? '此浏览器尚无本机作品库；其他入口的作品不在这里。' : '本机保存区无法读取，请在创作入口检查。');
      request.onblocked = () => resolve('本机保存区正被其他页面占用；请稍后刷新。');
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('projectIndex') || !db.objectStoreNames.contains('outbox')) { db.close(); resolve('本机作品库结构无法识别，请在原入口检查。'); return; }
        const tx = db.transaction(['projectIndex','outbox'], 'readonly');
        let pending = 0, conflicts = 0;
        tx.objectStore('outbox').count().onsuccess = e => { pending = e.target.result; };
        tx.objectStore('projectIndex').getAll().onsuccess = e => { conflicts = e.target.result.filter(p => p.conflictOf).length; };
        tx.oncomplete = () => { db.close(); resolve(`待同步 ${pending} 条；冲突副本 ${conflicts} 条。未保存画布与其他窗口失败状态请在创作入口检查。`); };
        tx.onerror = tx.onabort = () => { db.close(); resolve('本机状态读取失败；未修改任何作品。'); };
      };
    });
  }
  async function refresh() {
    el('refresh').disabled = true; el('status').textContent = '正在核查…';
    try {
      const response = await fetch('./api/admin/dashboard', {cache:'no-store'});
      if (!response.ok) throw new Error(response.status === 403 ? '管理台仅限电脑本机入口，请在电脑上打开。' : '电脑管理服务暂不可用，请稍后重试。');
      const data = await response.json(), r = data.release || {};
      el('version').textContent = r.build ? `Q像素 ${r.version || ''} · build ${r.build}` : '开发源码服务（无安装包元数据）';
      el('revision').textContent = `界面：${r.interfaceRevision || '未知'}${r.gitCommit ? ` · 源码：${r.gitCommit.slice(0,12)}` : ''}`;
      el('computer').textContent = data.computer.label; el('tablet').textContent = data.tablet.label;
      projects = data.projects; renderProjects();
      el('backups').replaceChildren();
      for (const b of data.backups) {
        const link = document.createElement('a'); link.textContent = '下载 JSON'; link.href = `./api/admin/backups/${encodeURIComponent(b.name)}`; link.download = b.name;
        row(el('backups'), [b.name, `${(b.size/1024).toFixed(1)} KB`, date(b.updatedAt), link]);
      }
      el('backupCount').textContent = data.backups.length ? `可导出 ${data.backups.length} 份历史备份。` : '未发现可导出的服务历史备份；这不代表作品不存在。';
      el('diagnostics').replaceChildren();
      for (const d of data.diagnostics) { const p = document.createElement('p'); p.textContent = `${d.label}${Number.isFinite(d.errorMarkers) ? `：${d.errorMarkers} 个错误标记` : ''}${d.scope ? ` · ${d.scope}` : ''}`; el('diagnostics').appendChild(p); }
      el('localState').textContent = await localSummary();
      el('status').textContent = `已刷新：${date(data.checkedAt)}。本次为只读检查。`;
    } catch (error) { el('status').textContent = error.message || '管理服务读取失败。'; }
    finally { el('refresh').disabled = false; }
  }
  el('refresh').addEventListener('click', refresh);
  el('search').addEventListener('input', renderProjects);
  refresh();
})();
