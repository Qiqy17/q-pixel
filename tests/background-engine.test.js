"use strict";
const assert=require("node:assert/strict");
const engine=require("../web/studio/background-engine.js");
const cells=[
  ["H1","H1","H1","H1","H1"],
  ["H1","A1","A1","A1","H1"],
  ["H1","A1","H1","A1","H1"],
  ["H1","A1","A1","A1","H1"],
  ["H1","H1","H1","H1","H1"]
];
const result=engine.detect(cells);
assert.equal(result.code,"H1");
assert.equal(result.count,16);
assert.equal(result.mask[2*5+2],0,"封闭内部同色不应被误删");
engine.rectangle(result.mask,5,5,{x:1,y:1},{x:2,y:2},true);
assert.equal(engine.count(result.mask),20);
engine.paint(result.mask,5,5,[{x:0,y:0}],0,false);
assert.equal(engine.count(result.mask),19);
engine.polygon(result.mask,5,5,[{x:2,y:2},{x:4,y:2},{x:4,y:4},{x:2,y:4}],false);
assert.equal(result.mask[3*5+3],0);
assert.equal(engine.connectedColor(result.mask,cells,{x:2,y:2},true),1,"只选中封闭的同色块");
assert.equal(result.mask[0],0,"对角和不同色号不得连通");
assert.equal(engine.connectedColor(result.mask,cells,{x:1,y:1},true),5,"连通的主体色号应整体选中");
assert.equal(engine.connectedColor(result.mask,cells,{x:1,y:1},false),8,"已选主体色号可整体移出选区");
assert.deepEqual(cells[0],["H1","H1","H1","H1","H1"],"选择算法不应修改原图");
console.log("background-engine tests: PASS");
