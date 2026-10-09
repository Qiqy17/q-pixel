(async () => {
 const t=QPixelTest, results=[],check=(v,label)=>{if(!v)throw new Error(label);results.push(label);};
 await t.activateSyntheticBeadPattern(12,12);t.markUnsavedChangesForTest();check(await t.saveCurrentProject(),'prepare editable canvas');
 // Separate persistent store exercises concurrency and queue identity without user databases.
 const api=QPixelOfflineProjects, store=api.createStore({indexedDB,dbName:`qa-library-${crypto.randomUUID()}`,payloadFingerprint:QPixelProjectModel.payloadFingerprint});
 const record={id:'one',title:'one',payload:{version:2,id:'one',pattern:{width:1,height:1,cells:[['H2']]}}};
 await store.save(record); const queued=await store.pending();
 check(queued[0].mutationId === (await store.pending())[0].mutationId,'mutation identity survives repeated queue reads');
 const snap=await store.snapshot();
 await store.save({...record,payload:{...record.payload,pattern:{width:1,height:1,cells:[['H7']]}}});
 try{await store.importBatch([{...record,id:'new',payload:{...record.payload,id:'new'}}],{},JSON.stringify(snap.projects));throw new Error('expected stale snapshot');}catch(e){check(e.message.includes('发生变化'),'stale import preview is rejected');}
 check(!(await store.get('new')),'stale import creates no partial record');
 // Browser UI roundtrip: actual download button followed by file-input import.
 let savedBlob=null,savedName='',oldCreate=URL.createObjectURL,oldClick=HTMLAnchorElement.prototype.click;
 URL.createObjectURL=(blob)=>{savedBlob=blob;return oldCreate(blob);};
 HTMLAnchorElement.prototype.click=function(){savedName=this.download;};
 try{
 document.getElementById('libraryBackupButton').click();
 for(let i=0;i<80&&!document.getElementById('projectLibraryDialog').open;i++)await new Promise(r=>setTimeout(r,25));
 document.querySelector('#projectLibraryDialog [data-role="library-submit"]').click();
 for(let i=0;i<160&&!savedBlob;i++)await new Promise(r=>setTimeout(r,25));
 check(savedName.endsWith('.qpxlib')&&savedBlob,'UI exports one editable library file');
 check((await QPixelProjectLibrary.inspect(await savedBlob.text())).invalid.length===0,'UI backup checksums valid');
 const transfer=new DataTransfer();transfer.items.add(new File([await savedBlob.text()],'roundtrip.qpxlib',{type:'application/json'}));
 const input=document.getElementById('libraryFileInput');input.files=transfer.files;input.dispatchEvent(new Event('change'));
 for(let i=0;i<160&&!document.getElementById('projectLibraryDialog').open;i++)await new Promise(r=>setTimeout(r,25));
 check(document.getElementById('libraryDialogTitle').textContent==='检查作品库导入','actual file input opens migration preview');
 document.querySelector('#projectLibraryDialog [data-role="library-close"]').click();
 }finally{URL.createObjectURL=oldCreate;HTMLAnchorElement.prototype.click=oldClick;}
 // Native bridge callback is request-specific and cannot turn exports into project saves.
 const descriptor=Object.getOwnPropertyDescriptor(window,'webkit');let request;
 Object.defineProperty(window,'webkit',{configurable:true,value:{messageHandlers:{exportFile:{postMessage:(event)=>{request=event;}}}}});
 try{
 t.markUnsavedChangesForTest();document.getElementById('migrationBackupButton').click();
 for(let i=0;i<40&&!request;i++)await new Promise(r=>setTimeout(r,25));
 check(Boolean(request?.requestId),'native export carries unique request identity');
 QPixelNativeExportResult({requestId:request.requestId,status:'cancelled'});
 check(t.getUnsavedChangesForTest(),'cancelled native export preserves dirty state');
 QPixelNativeExportResult({requestId:request.requestId,status:'saved'});
 check(t.getUnsavedChangesForTest(),'duplicate late callback cannot mark project saved');
 }finally{if(descriptor)Object.defineProperty(window,'webkit',descriptor);else delete window.webkit;}
 // Save while edits arrive must only commit the sent revision.
 const originalSave=t.getOfflineStoreForTest().save; // store is frozen: delay through a separate IDB write transaction.
 const open=indexedDB.open('q-pixel-projects',1);const db=await new Promise((resolve,reject)=>{open.onsuccess=()=>resolve(open.result);open.onerror=()=>reject(open.error);});
 const block=db.transaction(['projects'],'readwrite');let running=true;
 const spin=()=>{const request=block.objectStore('projects').get('__qa_delay__');request.onsuccess=()=>{if(running)spin();};};spin();
 const saving=t.saveCurrentProject();
 await new Promise(r=>setTimeout(r,40));t.markUnsavedChangesForTest();running=false;
 check(await saving,'older save can finish');
 check(t.getUnsavedChangesForTest()&&document.getElementById('saveStatus').textContent==='未保存','edit during save stays visibly unsaved');
 check(await t.saveCurrentProject(),'newer edit saves separately');db.close();
 // 120x120 and 500x500, two layers, offline reopen from a separate connection.
 const base=t.makeProjectPayload();
 for(const size of [120,500]){
  const cells=Array.from({length:size},()=>Array(size).fill(null));cells[0][0]='H2';cells[size-1][size-1]='E11';
  const p={...base,id:`qa-large-${size}-${crypto.randomUUID()}`,title:`${size} 双图层`,pattern:{width:size,height:size,cells},layers:[{id:'l1',name:'主层',visible:true,cells},{id:'l2',name:'第二层',visible:true,cells:cells.map(row=>row.slice())}],activeLayerId:'l2'};
  check(t.applyProjectPayload(p),`${size}x${size} opens two layers`);t.markUnsavedChangesForTest();
  const originalFetch=window.fetch;let posted=0;window.fetch=(...args)=>{if(['POST','DELETE'].includes(args[1]?.method)&&String(args[0]).includes('/api/projects'))posted++;return originalFetch(...args);};
  try{check(await t.saveCurrentProject(),`${size}x${size} saves offline`);check(posted===0,`${size}x${size} offline save never uploads`);}finally{window.fetch=originalFetch;}
  const other=api.createStore({indexedDB,payloadFingerprint:QPixelProjectModel.payloadFingerprint}),saved=await other.get(p.id);
  check(saved.payload.layers.length===2&&saved.payload.pattern.cells[size-1][size-1]==='E11',`${size}x${size} persistent reopen exact`);
 }
 const id=t.makeProjectPayload().id;
 return {passed:results.length,results,reloadId:id};
})()
