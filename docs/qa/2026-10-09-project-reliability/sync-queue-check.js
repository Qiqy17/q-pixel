(async()=>{
const t=QPixelTest;await t.activateSyntheticBeadPattern(12,12);const payload=t.makeProjectPayload();payload.id=`qa-queued-${crypto.randomUUID()}`;t.applyProjectPayload(payload);t.markUnsavedChangesForTest();if(!await t.saveCurrentProject())throw new Error('save failed');
const original=window.fetch;let release,held=false,writes=0;const gate=new Promise(r=>release=r);
window.fetch=async(...args)=>{if(String(args[0]).endsWith('/api/projects/index')&&!held){held=true;await gate;}if(args[1]?.method==='POST'&&String(args[0]).includes('/api/projects'))writes++;return original(...args);};
try{const background=t.refreshRemoteIndexForTest();for(let i=0;i<200&&!held;i++)await new Promise(r=>setTimeout(r,10));if(!held)throw new Error('index not held');const manual=t.syncOfflineForTest();release();await Promise.all([background,manual]);if((await t.getOfflineStoreForTest().pending()).length||!writes)throw new Error(document.getElementById('message').textContent);return{manualClickDuringBackgroundRefresh:true,writes,pending:0};}finally{release();window.fetch=original;}
})()
