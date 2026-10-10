"use strict";
// Run with NODE_PATH pointing at a runtime containing Playwright. No user profile is opened.
const {chromium} = require("playwright");
const fs=require("node:fs/promises"),path=require("node:path"),http=require("node:http"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"../web"),results=[],timings=[],errors=[];
const mime={".js":"text/javascript",".html":"text/html",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".webmanifest":"application/manifest+json"};
let uploads=0;
const server=http.createServer(async(req,res)=>{
  if(req.method!=="GET"){uploads++;res.writeHead(405);res.end();return;}
  const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname),file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  try{const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);}
  catch{res.writeHead(404);res.end();}
});
const check=(value,name)=>{assert(value,name);results.push(name);};
(async()=>{
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.QPIXEL_CHROME||"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",headless:true});
  try{
    const directory=path.resolve(process.argv[2]||'docs/qa/2026-10-10-stability');await fs.mkdir(directory,{recursive:true});
    const context=await browser.newContext(),page=await context.newPage();
    page.on('pageerror',error=>errors.push(String(error)));
    await page.goto(origin);await page.waitForFunction(()=>window.QPixelTest?.getOfflineStoreForTest());
    await page.evaluate(async()=>{const c=await caches.open('unrelated-qa-cache');await c.put('/other-app',new Response('preserve'));});
    await page.waitForFunction(async()=>Boolean(navigator.serviceWorker.controller)&&(await caches.keys()).includes('q-pixel-v'+document.querySelector('meta[name="qpixel-revision"]').content),{},{timeout:60000});
    check(await page.evaluate(()=>caches.has('unrelated-qa-cache')),'offline activation preserves unrelated cache');
    await page.evaluate(async()=>{const t=QPixelTest;await t.activateSyntheticBeadPattern(18,18);t.markUnsavedChangesForTest();await t.saveCurrentProject();localStorage.setItem('stability-qa-id',t.makeProjectPayload().id);});
    await context.setOffline(true);await page.reload();await page.waitForFunction(()=>window.QPixelTest?.getOfflineStoreForTest());
    check(await page.evaluate(async()=>{await QPixelTest.loadProject(localStorage.getItem('stability-qa-id'));return QPixelTest.makeProjectPayload().pattern.width===18;}),'real browser offline reload reopens saved project');
    await context.setOffline(false);
    check(uploads===0,'network recovery and local save never upload projects');
    const quality=await page.evaluate(()=>{
      const select=document.getElementById('boardSpecSelect');select.value='standard-15';select.dispatchEvent(new Event('change'));
      const snapshot=QPixelTest.getQualitySnapshotForTest(),checks=QPixelQualityChecks.run(snapshot);
      return {count:snapshot.boardCount,label:snapshot.boardSpecLabel,integrity:checks.find(c=>c.id==='pattern-integrity').status,print:checks.find(c=>c.id==='output').detail};
    });
    check(quality.count===4 && quality.label.includes('15'),'quality panel uses selected physical board specification');
    check(quality.integrity==='pass' && quality.print.includes('不保证 1:1'),'quality snapshot checks actual usage and print scale');
    const pdfDownload=page.waitForEvent('download');
    await page.evaluate(()=>document.getElementById('studioOutputBoardPdfButton').click());
    const pdf=await pdfDownload;await pdf.saveAs(path.join(directory,'qa-board-output.pdf'));
    const pdfText=(await fs.readFile(path.join(directory,'qa-board-output.pdf'))).toString('latin1');
    check(pdfText.startsWith('%PDF-1.4') && (pdfText.match(/\/Type \/Page /g)||[]).length===4,'actual board PDF export contains four pages');
    const races=await page.evaluate(await fs.readFile(path.resolve(__dirname,'finish-workbench-race.browser.js'),'utf8'));
    results.push(...races);
    for(const size of [120,500]){
      const measurements=await page.evaluate(async size=>{
        const t=QPixelTest,out={size},time=async(name,fn)=>{const start=performance.now();await fn();out[name]=performance.now()-start;};
        const payload=t.makeProjectPayload();payload.id='perf-'+size;payload.buildProgress={};
        payload.pattern={...payload.pattern,width:size,height:size,cells:Array.from({length:size},()=>Array(size).fill('H2'))};
        payload.layers=[{...payload.layers[0],id:'first',cells:payload.pattern.cells.map(row=>row.slice())},{...payload.layers[0],id:'second',cells:Array.from({length:size},()=>Array(size).fill(null))}];payload.activeLayerId='first';
        await time('openMs',async()=>{t.applyProjectPayload(payload);});
        await time('editMs',async()=>{t.pushHistoryForTest();t.paintBrushCell({row:0,col:0},'H7',1);t.markUnsavedChangesForTest();});
        out.edited=t.makeProjectPayload().pattern.cells[0][0]==='H7';
        await time('undoMs',async()=>{t.undoEdit();});
        out.undoRestored=t.makeProjectPayload().pattern.cells[0][0]==='H2';
        await time('saveMs',async()=>{if(!await t.saveCurrentProject())throw Error('save failed');});
        await time('reopenMs',async()=>{await t.loadProject('perf-'+size);});
        out.layers=t.makeProjectPayload().layers.length;return out;
      },size);
      check(measurements.layers===2 && measurements.edited && measurements.undoRestored,`${size}x${size} actual brush edit, undo, two-layer save and reopen`);timings.push(measurements);
      const previewStart=Date.now();
      await page.evaluate(()=>document.getElementById('unifiedPreviewButton').click());
      await page.waitForFunction(()=>{
        const dialog=document.querySelector('.finish-workbench[open]');
        return dialog && ((!dialog.querySelector('[data-role="notice"]').hidden) || (!dialog.querySelector('[data-role="status"]').textContent.includes('正在加载') && dialog.querySelector('[data-role="facts"]').textContent.includes('颗')));
      },{},{timeout:60000});
      const preview=await page.evaluate(()=>{
        const dialog=document.querySelector('.finish-workbench[open]');
        const supported=!dialog.querySelector('[data-action="tab-3d"]').disabled,status=dialog.querySelector('[data-role="status"]').textContent;
        dialog.querySelector('[data-action="tab-flat"]').click();const flat=dialog.querySelector('.finish-stage').dataset.view==='flat';
        if(supported)dialog.querySelector('[data-action="tab-3d"]').click();
        const returned=!supported || dialog.querySelector('.finish-stage').dataset.view==='3d';
        dialog.querySelector('[data-action="close"]').click();return {supported,status,flat,returned};
      });
      check(preview.flat && preview.returned,`${size}x${size} preview switches modes or exposes readable GPU fallback`);
      measurements.previewReadyMs=Date.now()-previewStart;measurements.preview=preview;
    }
    check(errors.length===0,'no page JavaScript errors');
    await context.close();
    await fs.writeFile(path.join(directory,'browser-stability-results.json'),JSON.stringify({scope:'isolated desktop Chromium; not physical iPad or calibrated 3D',results,timings,errors},null,2)+'\n');
    console.log(JSON.stringify({results,timings},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
