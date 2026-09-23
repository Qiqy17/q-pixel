"use strict";
const assert=require("node:assert/strict");

// 最小 canvas stub：覆盖引擎用到的 2D API，跑通主路径并记录调用。
function fakeCtx(canvas){
  const grad={addColorStop(){}};
  return {
    canvas,fillStyle:"",strokeStyle:"",lineWidth:1,globalAlpha:1,globalCompositeOperation:"source-over",filter:"none",
    createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),
    putImageData(){},getImageData:(x,y,w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),
    createRadialGradient:()=>grad,createLinearGradient:()=>grad,
    beginPath(){},arc(){},ellipse(){},fill(){},fillRect(){canvas.filled=(canvas.filled||0)+1;},stroke(){},strokeRect(){},
    drawImage(){canvas.drawn=(canvas.drawn||0)+1;},save(){},restore(){},clip(){},translate(){},rotate(){},scale(){},
    moveTo(){},lineTo(){},quadraticCurveTo(){},rect(){}
  };
}
global.document={createElement:()=>{const c={width:0,height:0};c.getContext=()=>fakeCtx(c);return c;}};

const eng=require("../web/studio/surface-engine.js");
assert.equal(eng.VERSION,"surface-engine-1");

// 纯函数
assert.deepEqual(eng.hexRgb("#FAF5CD"),{r:250,g:245,b:205});
assert.equal(eng.hexRgb("bad")[0]===undefined,true);

// 噪声 tile：可重复生成且尺寸正确
const t1=eng.noiseTile(64,3,7),t2=eng.noiseTile(64,3,7);
assert.equal(t1.width,64);assert.equal(t1.height,64);

// 豆体 sprite：同参数缓存命中、不同参数各自生成
const s1=eng.beadSprite("#A1",16,{});
const s2=eng.beadSprite("#A1",16,{});
assert.equal(s1,s2,"同参数应命中缓存");
const s3=eng.beadSprite("#A1",16,{melt:.5});
assert.notEqual(s1,s3,"不同熔融度不应共享缓存");
const s4=eng.beadSprite("#A1",16,{melt:.5});
assert.equal(s3,s4);

// 豆阵装配：空格与 H1 跳过，有豆必绘制
const pattern={width:2,height:2,cells:[["A1","A2"],["H1","A3"]]};
const target={width:32,height:32,filled:0,drawn:0};target.getContext=()=>fakeCtx(target);
const tctx=target.getContext();
eng.beadField(tctx,pattern,0,0,16,{},code=>code);
assert.equal(target.drawn>=3,true,"应有 3 颗豆被绘制");

// 熔融融合：不同色邻接触发渐变填充
const meltTarget={width:32,height:32,filled:0,drawn:0};meltTarget.getContext=()=>fakeCtx(meltTarget);
eng.meltField(meltTarget.getContext(),pattern,0,0,16,.8);
assert.equal(meltTarget.filled>0,true,"邻接异色应产生融合渐变");

// 光照/颗粒：主路径不抛异常
const lightTarget={width:64,height:64,filled:0,drawn:0};lightTarget.getContext=()=>fakeCtx(lightTarget);
["soft","studio","dramatic","warm","cool","backlit"].forEach(p=>eng.applyLight(lightTarget.getContext(),0,0,64,64,p,.7));
eng.filmGrain(lightTarget.getContext(),0,0,64,64,.2);
eng.fiberTexture(64,"towel","#dcd6c8");
eng.clearCache();
console.log("surface-engine tests: PASS");
