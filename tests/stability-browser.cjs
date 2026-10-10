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
    const context=await browser.newContext(),page=await context.newPage();
    page.on('pageerror',error=>errors.push(String(error)));
    await page.goto(origin);await page.waitForFunction(()=>window.QPixelTest?.getOfflineStoreForTest());
    await page.evaluate(async()=>{const c=await caches.open('unrelated-qa-cache');await c.put('/other-app',new Response('preserve'));});
    await page.waitForFunction(async()=>Boolean(navigator.serviceWorker.controller)&&(await caches.keys()).includes('q-pixel-v20261010-stability-65'),{},{timeout:60000});
    check(await page.evaluate(()=>caches.has('unrelated-qa-cache')),'offline activation preserves unrelated cache');
    await page.evaluate(async()=>{const t=QPixelTest;await t.activateSyntheticBeadPattern(18,18);t.markUnsavedChangesForTest();await t.saveCurrentProject();localStorage.setItem('stability-qa-id',t.makeProjectPayload().id);});
    await context.setOffline(true);await page.reload();await page.waitForFunction(()=>window.QPixelTest?.getOfflineStoreForTest());
    check(await page.evaluate(async()=>{await QPixelTest.loadProject(localStorage.getItem('stability-qa-id'));return QPixelTest.makeProjectPayload().pattern.width===18;}),'real browser offline reload reopens saved project');
    await context.setOffline(false);
    check(uploads===0,'network recovery and local save never upload projects');
    for(const size of [120,500]){
      const measurements=await page.evaluate(async size=>{
        const t=QPixelTest,out={size},time=async(name,fn)=>{const start=performance.now();await fn();out[name]=performance.now()-start;};
        let payload;
        await time('openMs',async()=>{await t.activateSyntheticBeadPattern(size,size);payload=t.makeProjectPayload();payload.id='perf-'+size;payload.layers.push({...JSON.parse(JSON.stringify(payload.layers[0])),id:'second'});t.applyProjectPayload(payload);});
        await time('editMs',async()=>{t.pushHistoryForTest();t.setPatternCell(0,0,'H7');t.markUnsavedChangesForTest();});
        await time('undoMs',async()=>{t.undoEdit();});
        await time('saveMs',async()=>{if(!await t.saveCurrentProject())throw Error('save failed');});
        await time('reopenMs',async()=>{await t.loadProject('perf-'+size);});
        out.layers=t.makeProjectPayload().layers.length;return out;
      },size);
      check(measurements.layers===2,`${size}x${size} two-layer save and reopen`);timings.push(measurements);
    }
    check(errors.length===0,'no page JavaScript errors');
    await context.close();
    const directory=path.resolve(process.argv[2]||'docs/qa/2026-10-10-stability');await fs.mkdir(directory,{recursive:true});
    await fs.writeFile(path.join(directory,'browser-stability-results.json'),JSON.stringify({scope:'isolated desktop Chromium; not physical iPad or calibrated 3D',results,timings,errors},null,2)+'\n');
    console.log(JSON.stringify({results,timings},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
