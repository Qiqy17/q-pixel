(async () => {
  const originalSupport=window.QPixelWebGLSupport, originalViewer=window.QPixel3D;
  const checks=[], created=[], loads=[], exports=[];
  const check=(value,name)=>{if(!value)throw Error(name);checks.push(name);};
  const wait=async(predicate)=>{for(let i=0;i<200&&!predicate();i++)await new Promise(r=>setTimeout(r,10));if(!predicate())throw Error('race readiness timeout');};
  let pattern={width:2,height:2,cells:[['H2',null],[null,'H2']]},downloaded=0;
  window.QPixelWebGLSupport={detectWebGL2:()=>({supported:true,tier:'full',message:''})};
  window.QPixel3D={create:options=>{
    created.push(options.pattern.cells[0][0]);options.onStatus('viewer '+options.pattern.cells[0][0]);
    return new Proxy({exportPng:args=>new Promise((resolve,reject)=>exports.push({resolve,reject,args}))},{get:(target,key)=>key in target?target[key]:()=>{}});
  }};
  const workbench=QPixelFinishWorkbench.create({document,core:QPixelFinishCore,getPattern:()=>pattern,colorOf:()=> '#123456',loadViewer:()=>new Promise((resolve,reject)=>loads.push({resolve,reject})),onExport:()=>{downloaded++;}});
  const dialog=[...document.querySelectorAll('.finish-workbench')].at(-1);
  try{
    const first=workbench.open();await wait(()=>loads.length===1);workbench.close();
    pattern={width:2,height:2,cells:[['H7',null],[null,'H7']]};
    const second=workbench.open();await wait(()=>loads.length===2);loads[1].resolve();await second;
    loads[0].resolve();await first;
    check(created.join(',')==='H7','late viewer load cannot replace reopened pattern');
    dialog.querySelector('[data-action="export"]').click();await wait(()=>exports.length===1);
    workbench.close();const third=workbench.open();await wait(()=>loads.length===3);loads[2].resolve();await third;
    const status=dialog.querySelector('[data-role="status"]'),before=status.textContent;
    exports[0].args.onProgress(100);exports[0].resolve(new Blob());await new Promise(r=>setTimeout(r,30));
    check(status.textContent===before && downloaded===0,'closed export suppresses late progress and file delivery');
    dialog.querySelector('[data-action="export"]').click();await wait(()=>exports.length===2);
    dialog.querySelector('[data-action="cancel-export"]').click();const cancelled=status.textContent;
    exports[1].args.onProgress(100);exports[1].resolve(new Blob());await new Promise(r=>setTimeout(r,30));
    check(status.textContent===cancelled && downloaded===0,'cancelled export cannot report success or deliver file');
    check(!dialog.querySelector('[data-action="export"]').disabled,'cancelled export allows retry');
    workbench.close();const failed=workbench.open();await wait(()=>loads.length===4);workbench.close();
    const latest=workbench.open();await wait(()=>loads.length===5);loads[4].resolve();await latest;const latestText=status.textContent;
    loads[3].reject(Error('old load rejected'));await failed;
    check(status.textContent===latestText && !dialog.querySelector('[data-action="tab-3d"]').disabled,'late loader failure cannot degrade current viewer');
    return checks;
  }finally{workbench.close();dialog.remove();window.QPixelWebGLSupport=originalSupport;window.QPixel3D=originalViewer;}
})();
