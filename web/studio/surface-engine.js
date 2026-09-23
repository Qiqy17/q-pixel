(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.QPixelSurfaceEngine=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";
  const VERSION="surface-engine-1";

  // —— 工具 ——
  const hexRgb=h=>{const m=/^#?([0-9a-f]{6})$/i.exec(h||"");return m?{r:parseInt(m[1].slice(0,2),16),g:parseInt(m[1].slice(2,4),16),b:parseInt(m[1].slice(4,6),16)}:{r:170,g:170,b:170};};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mix=(c1,c2,t)=>({r:Math.round(c1.r+(c2.r-c1.r)*t),g:Math.round(c1.g+(c2.g-c1.g)*t),b:Math.round(c1.b+(c2.b-c1.b)*t)});
  const shade=(c,f)=>({r:clamp(Math.round(c.r*f),0,255),g:clamp(Math.round(c.g*f),0,255),b:clamp(Math.round(c.b*f),0,255)});
  const css=c=>`rgb(${c.r},${c.g},${c.b})`;
  const rng=seed=>{let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};};

  // —— 多八度 value-noise 灰度 tile（塑料橘皮 / 布底扰动 / 胶片颗粒共用） ——
  function noiseTile(size,octaves,seed){
    const n=size||256,o=octaves||3,sd=seed||1;
    const c=document.createElement("canvas");c.width=c.height=n;
    const ctx=c.getContext("2d"),img=ctx.createImageData(n,n);
    const r=(x,y)=>{const v=Math.sin(x*127.1+y*311.7+sd*74.7)*43758.5453;return v-Math.floor(v);};
    const sm=t=>t*t*(3-2*t);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      let v=0,amp=1,f=1,tot=0;
      for(let k=0;k<o;k++){
        const gx=x/n*f,gy=y/n*f,x0=Math.floor(gx),y0=Math.floor(gy),tx=sm(gx-x0),ty=sm(gy-y0);
        const a=r(x0,y0),b=r(x0+1,y0),d=r(x0,y0+1),e=r(x0+1,y0+1);
        v+=(a+(b-a)*tx+(d-a)*ty+(a-b-d+e)*tx*ty)*amp;tot+=amp;amp*=.5;f*=2;
      }
      const g=Math.round(v/tot*255),i=(y*n+x)*4;
      img.data[i]=img.data[i+1]=img.data[i+2]=g;img.data[i+3]=255;
    }
    ctx.putImageData(img,0,0);return c;
  }
  const tileCache=new Map();
  const getNoise=(size,octaves,seed)=>{const k=`${size}|${octaves}|${seed}`;if(!tileCache.has(k))tileCache.set(k,noiseTile(size,octaves,seed));return tileCache.get(k);};

  // —— 豆体 sprite：圆豆 + 球面明暗 + 边缘 AO + 塑料高光 + 橘皮微纹（同参数缓存） ——
  // style: {melt:0~1 熨平程度, gloss:0~1 光泽, noise:0~1 表面微纹强度, hlJitter:0~1 高光随机}
  const spriteCache=new Map();
  function beadSprite(hex,cell,style){
    // 显式 undefined 会覆盖 Object.assign 默认值，逐字段兜底。
    const src=style||{};
    const st={melt:src.melt==null?0:src.melt,gloss:src.gloss==null?.55:src.gloss,noise:src.noise==null?.5:src.noise,hlJitter:src.hlJitter==null?0:src.hlJitter,variant:src.variant||0};
    const key=`${hex}|${cell}|${st.melt.toFixed(2)}|${st.gloss.toFixed(2)}|${st.noise.toFixed(2)}|${st.hlJitter.toFixed(2)}|${st.variant}`;
    if(spriteCache.has(key))return spriteCache.get(key);
    const c=document.createElement("canvas");c.width=c.height=cell;
    const ctx=c.getContext("2d"),base=hexRgb(hex);
    const shrink=clamp(1-st.melt*.55,.45,1);            // 熨烫越平豆径越摊开，间隙越小
    const rad=cell*shrink*.5, cx=cell/2, cy=cell/2;
    // 变体种子：同一色号的多颗豆在亮度/色相上有微小差异（塑料批次感）
    const vr=rng(st.variant*2654435761>>>0||9);
    const tintShift=(vr()-.5)*.1, shadeShift=(vr()-.5)*.06;
    const vBase=tintShift>0?mix(base,{r:255,g:255,b:255},tintShift):mix(base,{r:0,g:0,b:0},-tintShift);
    // 主体：球面明暗（光从左上）
    const body=ctx.createRadialGradient(cx-rad*.32,cy-rad*.36,rad*.08,cx,cy,rad*1.02);
    body.addColorStop(0,css(mix(vBase,{r:255,g:255,b:255},.24*st.gloss)));
    body.addColorStop(.52,css(vBase));
    body.addColorStop(.86,css(shade(vBase,.86+shadeShift)));
    body.addColorStop(1,css(shade(vBase,.7+shadeShift)));
    ctx.fillStyle=body;
    ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.fill();
    // 边缘 AO 环
    ctx.save();ctx.globalCompositeOperation="multiply";
    const ao=ctx.createRadialGradient(cx,cy,rad*.72,cx,cy,rad);
    ao.addColorStop(0,"rgba(255,255,255,0)");ao.addColorStop(.75,"rgba(215,215,215,.5)");ao.addColorStop(1,"rgba(150,150,150,.75)");
    ctx.fillStyle=ao;ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.fill();ctx.restore();
    // 高光斑：位置/大小带变体随机（vr 已推进两次），模拟豆面弧度差异
    const hOff=.34+(vr()-.5)*.16*st.hlJitter, vOff=.4+(vr()-.5)*.18*st.hlJitter, hSize=.42*(1+(vr()-.5)*.3*st.hlJitter);
    ctx.save();ctx.globalCompositeOperation="screen";
    ctx.translate(cx-rad*hOff,cy-rad*vOff);ctx.rotate(-.6+(vr()-.5)*.2*st.hlJitter);ctx.scale(1,.62);
    const hl=ctx.createRadialGradient(0,0,0,0,0,rad*hSize);
    hl.addColorStop(0,`rgba(255,255,255,${.5*st.gloss})`);hl.addColorStop(.55,`rgba(255,255,255,${.16*st.gloss})`);hl.addColorStop(1,"rgba(255,255,255,0)");
    ctx.fillStyle=hl;ctx.beginPath();ctx.arc(0,0,rad*hSize,0,Math.PI*2);ctx.fill();ctx.restore();
    // 橘皮微纹（soft-light 噪声）
    if(st.noise>0&&cell>=8){
      ctx.save();ctx.globalCompositeOperation="soft-light";ctx.globalAlpha=.55*st.noise;
      const nz=getNoise(64,3,7+st.variant%13);
      ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.clip();
      for(let y=0;y<cell;y+=64)for(let x=0;x<cell;x+=64)ctx.drawImage(nz,x,y);
      ctx.restore();
    }
    spriteCache.set(key,c);
    if(spriteCache.size>600){const first=spriteCache.keys().next().value;spriteCache.delete(first);}
    return c;
  }

  // —— 程序化纤维纹理（毛巾/毛毡/亚麻：两层弯曲短纤 + 底噪） ——
  function fiberTexture(size,type,tint){
    const cfg={towel:{step:7,len:[9,17],spread:.5,curve:.35,lw:1.4},fine:{step:4.5,len:[6,11],spread:.4,curve:.28,lw:1.1},felt:{step:5.5,len:[7,13],spread:.6,curve:.45,lw:1.2},linen:{step:6,len:[10,18],spread:.12,curve:.08,lw:1}}[type]||{step:6,len:[8,14],spread:.4,curve:.3,lw:1.2};
    const c=document.createElement("canvas");c.width=c.height=size;
    const ctx=c.getContext("2d"),rand=rng(type.length*131+size);
    const t=hexRgb(tint||"#dcd6c8");
    ctx.fillStyle=css(shade(t,.94));ctx.fillRect(0,0,size,size);
    // 底层暗纤（乘性深度）
    for(let pass=0;pass<2;pass++){
      ctx.lineWidth=cfg.lw*(pass?1:.85);
      ctx.strokeStyle=pass?css(mix(t,{r:255,g:255,b:255},.35)):css(shade(t,.72));
      ctx.globalAlpha=pass?.5:.6;
      for(let y=0;y<size+cfg.step;y+=cfg.step)for(let x=0;x<size+cfg.step;x+=cfg.step){
        if(rand()<.3)continue;
        const a=(pass?-.25:.25)+((rand()-.5)*cfg.spread),l=cfg.len[0]+rand()*(cfg.len[1]-cfg.len[0]);
        const x0=x+(rand()-.5)*cfg.step*1.6,y0=y+(rand()-.5)*cfg.step*1.6;
        ctx.beginPath();ctx.moveTo(x0,y0);
        ctx.quadraticCurveTo(x0+Math.cos(a)*l*.5+(rand()-.5)*l*cfg.curve,y0+Math.sin(a)*l*.5+(rand()-.5)*l*cfg.curve,x0+Math.cos(a)*l,y0+Math.sin(a)*l);
        ctx.stroke();
      }
    }
    // 纤维间隙微噪
    ctx.globalAlpha=1;ctx.globalCompositeOperation="soft-light";ctx.globalAlpha=.35;
    ctx.drawImage(getNoise(128,2,11),0,0,size,size);
    ctx.globalCompositeOperation="source-over";
    return c;
  }

  // —— 位图位移：把真实照片材质以覆盖混合贴进区域（木纹/大理石/水泥的立体凹凸感） ——
  function bitmapOverlay(ctx,img,x,y,w,h,strength,blend){
    if(!img||!img.width)return;
    ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
    const s=Math.max(w/img.width,h/img.height)*1.06,ow=img.width*s,oh=img.height*s;
    ctx.globalCompositeOperation=blend||"overlay";ctx.globalAlpha=clamp(strength==null?.22:strength,0,1);
    ctx.drawImage(img,x+(w-ow)/2,y+(h-oh)/2,ow,oh);
    ctx.restore();
  }

  // —— 真实光照：lambert 主光 + 角度高光带 + 边缘光 + 暗角，分层合成 ——
  // preset: soft/studio/dramatic/warm/cool/backlit/left/right/top/bottom/front
  function applyLight(ctx,x,y,w,h,preset,intensity){
    const k=clamp(intensity==null?.7:intensity,0,1);
    const layer=(op,fn)=>{ctx.save();ctx.globalCompositeOperation=op;fn();ctx.restore();};
    // 1) lambert 主光（方向预设旋转渐变轴）
    if(preset!=="backlit"){
      const hi=preset==="dramatic"?.34:.2,lo=preset==="dramatic"?.3:.12;
      let g;
      if(preset==="front"){g=ctx.createRadialGradient(x+w*.5,y+h*.42,1,x+w*.5,y+h*.42,Math.max(w,h)*.66);}
      else{
        const axis={left:[x,y,x+w,y+h],right:[x+w,y,x,y+h],top:[x,y,x,y+h],bottom:[x,y+h,x,y]}[preset]||[x,y,x+w,y+h];
        g=ctx.createLinearGradient(...axis);
      }
      g.addColorStop(0,`rgba(255,253,246,${hi*k})`);
      g.addColorStop(.55,"rgba(255,255,255,0)");
      g.addColorStop(1,`rgba(8,10,18,${lo*k})`);
      layer("overlay",()=>{ctx.fillStyle=g;ctx.fillRect(x,y,w,h);});
    }
    // 2) 高光带（45° 屏幕叠）
    layer("screen",()=>{
      const g=ctx.createLinearGradient(x+w*.62,y,x,y+h*.62);
      g.addColorStop(0,"rgba(255,255,255,0)");g.addColorStop(.5,`rgba(255,255,255,${.1*k})`);g.addColorStop(1,"rgba(255,255,255,0)");
      ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
    });
    // 3) rim 边缘光（背光/戏剧）
    if(preset==="backlit"||preset==="dramatic"){
      layer("screen",()=>{
        ctx.strokeStyle=`rgba(255,248,235,${(preset==="backlit"?.4:.16)*k})`;
        ctx.lineWidth=Math.max(2,Math.min(w,h)*.02);
        ctx.filter=`blur(${Math.max(2,Math.min(w,h)*.012)}px)`;
        ctx.strokeRect(x+1,y+1,w-2,h-2);ctx.filter="none";
      });
    }
    // 4) 色温偏移
    if(preset==="warm"||preset==="cool"){
      const c=preset==="warm"?"255,214,150":"160,206,255";
      layer("soft-light",()=>{
        const g=ctx.createLinearGradient(x,y,x+w,y+h);
        g.addColorStop(0,`rgba(${c},${.3*k})`);g.addColorStop(1,`rgba(${c},0)`);
        ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
      });
    }
    // 5) 暗角
    layer("multiply",()=>{
      const g=ctx.createRadialGradient(x+w/2,y+h/2,Math.min(w,h)*(preset==="dramatic"?.28:.42),x+w/2,y+h/2,Math.max(w,h)*.75);
      g.addColorStop(0,"rgba(255,255,255,1)");
      g.addColorStop(1,preset==="dramatic"?`rgba(178,182,198,${.75+.25*k})`:`rgba(214,217,226,${.5+.3*k})`);
      ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
    });
  }

  // —— 胶片颗粒：全幅亮度噪声（替换旧的 700 点矢量撒点） ——
  function filmGrain(ctx,x,y,w,h,strength){
    const k=clamp(strength==null?.14:strength,0,1);
    if(k<=0)return;
    ctx.save();ctx.globalCompositeOperation="overlay";ctx.globalAlpha=k;
    const t=getNoise(256,2,23);
    for(let yy=y;yy<y+h;yy+=256)for(let xx=x;xx<x+w;xx+=256)ctx.drawImage(t,xx,yy);
    ctx.restore();
  }

  // —— 熨烫融合：相邻豆色互相渗透 + 桥接高光（成品照片的关键特征） ——
  function meltField(ctx,pattern,x,y,cell,strength){
    if(strength<=0)return;
    const s=clamp(strength,0,1);
    ctx.save();ctx.globalCompositeOperation="source-over";
    for(let row=0;row<pattern.height;row++)for(let col=0;col<pattern.width;col++){
      const code=pattern.cells[row]?.[col];
      if(!code)continue;
      const right=pattern.cells[row]?.[col+1],down=pattern.cells[row+1]?.[col];
      const px=x+col*cell,py=y+row*cell;
      if(right&&right!==code){
        const c=mix(hexRgb(code),hexRgb(right),.5);
        const g=ctx.createLinearGradient(px+cell*.8,py,px+cell*1.2,py);
        g.addColorStop(0,`rgba(${c.r},${c.g},${c.b},0)`);g.addColorStop(.5,`rgba(${c.r},${c.g},${c.b},${.85*s})`);g.addColorStop(1,`rgba(${c.r},${c.g},${c.b},0)`);
        ctx.fillStyle=g;ctx.fillRect(px+cell*.7,py+cell*.1,cell*.6,cell*.8);
      }
      if(down&&down!==code){
        const c=mix(hexRgb(code),hexRgb(down),.5);
        const g=ctx.createLinearGradient(px,py+cell*.8,px,py+cell*1.2);
        g.addColorStop(0,`rgba(${c.r},${c.g},${c.b},0)`);g.addColorStop(.5,`rgba(${c.r},${c.g},${c.b},${.85*s})`);g.addColorStop(1,`rgba(${c.r},${c.g},${c.b},0)`);
        ctx.fillStyle=g;ctx.fillRect(px+cell*.1,py+cell*.7,cell*.8,cell*.6);
      }
    }
    // 桥面高光：水平/垂直接缝的细亮线
    ctx.globalCompositeOperation="screen";
    ctx.fillStyle=`rgba(255,255,255,${.16*s})`;
    for(let row=0;row<pattern.height;row++)for(let col=0;col<pattern.width;col++){
      if(!pattern.cells[row]?.[col])continue;
      if(pattern.cells[row]?.[col+1])ctx.fillRect(x+col*cell+cell*.86,y+row*cell+cell*.46,cell*.28,cell*.08);
      if(pattern.cells[row+1]?.[col])ctx.fillRect(x+col*cell+cell*.46,y+row*cell+cell*.86,cell*.08,cell*.28);
    }
    ctx.restore();
  }

  // —— 豆阵装配：sprite 拼贴 + 邻接缝隙阴影 + 手工误差（每豆按格种子微偏/微缩/微色偏） ——
  // style 增加: wobble:0~1 手工误差强度, bleed:0~1 邻色互映强度
  function beadField(ctx,pattern,x,y,cell,style,paletteOf){
    const st=style||{};
    const gap=cell>=8?Math.max(.5,cell*.035):0;
    const wobble=clamp(st.wobble==null?.5:st.wobble,0,1),bleed=clamp(st.bleed==null?.35:st.bleed,0,1);
    for(let row=0;row<pattern.height;row++)for(let col=0;col<pattern.width;col++){
      const code=pattern.cells[row]?.[col];
      if(!code||code==="H1")continue;
      const px=x+col*cell,py=y+row*cell;
      const hex=paletteOf?paletteOf(code):code;
      let jitterX=0,jitterY=0,jScale=1,jHex=hex,variant=0;
      if(wobble>0){
        // 格种子：同格稳定，跨格随机（成品复现一致，误差感自然）
        const r=rng(row*73856093^col*19349663^((st.seed||0)|0));
        jitterX=(r()-.5)*cell*.1*wobble;
        jitterY=(r()-.5)*cell*.08*wobble;
        jScale=1+(r()-.5)*.09*wobble;
        // 微色偏：模拟塑料批次与受热不均
        const t=(r()-.5)*.16*wobble;
        jHex=wobbleHex(hex,t);
        // 变体：sprite 内部明暗/高光的独立随机（避免微色偏与变体重复）
        variant=((r()*0xffffff)|0);
      }
      const sprite=beadSprite(jHex,cell,{melt:st.melt,gloss:st.gloss,noise:st.noise,hlJitter:wobble,variant});
      // 每豆独立投影：左上光源 → 右下投影（豆子"落地"的关键）
      if(gap>0){
        ctx.save();
        ctx.globalCompositeOperation="multiply";
        const shScale=1+jitterX*.5;
        // 投影主椭圆（右下偏移，带 alpha 衰减）
        const sx=px+cell*.16+jitterX*.3, sy=py+cell*.2+jitterY*.3;
        const g=ctx.createRadialGradient(sx+cell*.18,sy+cell*.16,cell*.12,sx+cell*.18,sy+cell*.16,cell*.62*shScale);
        g.addColorStop(0,"rgba(88,86,102,.34)");g.addColorStop(.6,"rgba(88,86,102,.16)");g.addColorStop(1,"rgba(88,86,102,0)");
        ctx.fillStyle=g;
        ctx.beginPath();ctx.ellipse(sx+cell*.2,sy+cell*.18,cell*.58*shScale,cell*.52,0,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
      if(gap>0){
        // 接触阴影：豆子下缘贴地暗边 + 右缘微影（邻豆遮挡的暗面）
        ctx.save();ctx.globalCompositeOperation="multiply";
        ctx.fillStyle="rgba(120,118,132,.42)";
        ctx.fillRect(px+gap,py+cell*.92,cell-gap*2,cell*.08);   // 下缘缝影
        ctx.fillRect(px+cell*.92,py+gap,cell*.08,cell-gap*2);   // 右缘缝影
        ctx.restore();
      }
      const size=cell*jScale;
      ctx.drawImage(sprite,px+jitterX,py+jitterY,size,size);
    }
    // 环境色互映：相邻豆色向彼此边缘轻微渗透（真实塑料的环境光反射）
    if(bleed>0){
      ctx.save();ctx.globalCompositeOperation="soft-light";
      for(let row=0;row<pattern.height;row++)for(let col=0;col<pattern.width;col++){
        const code=pattern.cells[row]?.[col];
        if(!code||code==="H1")continue;
        const right=pattern.cells[row]?.[col+1],down=pattern.cells[row+1]?.[col];
        if(!right&&!down)continue;
        const base=hexRgb(paletteOf?paletteOf(code):code);
        const px=x+col*cell,py=y+row*cell;
        if(right&&right!==code){
          const rc=hexRgb(paletteOf?paletteOf(right):right);
          ctx.fillStyle=`rgba(${rc.r},${rc.g},${rc.b},${.22*bleed})`;
          ctx.fillRect(px+cell*.78,py+cell*.12,cell*.22,cell*.76);
        }
        if(down&&down!==code){
          const dc=hexRgb(paletteOf?paletteOf(down):down);
          ctx.fillStyle=`rgba(${dc.r},${dc.g},${dc.b},${.22*bleed})`;
          ctx.fillRect(px+cell*.12,py+cell*.78,cell*.76,cell*.22);
        }
      }
      ctx.restore();
    }
  }
  const wobbleHex=(hex,t)=>{
    const c=hexRgb(hex),target=t>0?{r:255,g:255,b:255}:{r:0,g:0,b:0};
    const m=mix(c,target,Math.abs(t));
    return `rgb(${m.r},${m.g},${m.b})`;
  };

  function clearCache(){tileCache.clear();spriteCache.clear();}

  return Object.freeze({VERSION,hexRgb,beadSprite,beadField,fiberTexture,bitmapOverlay,applyLight,filmGrain,meltField,noiseTile,clearCache});
});
