"use strict";
const assert = require("node:assert/strict");
const planner = require("../web/make/board-planner.js");
const navigation = require("../web/make/build-navigation.js");

// 底板规格表。
assert.ok(planner.BOARD_SPECS.length >= 3);
const spec29 = planner.getSpec("standard-29");
assert.equal(spec29.columns, 29);
assert.equal(spec29.beadDiameterMm, 5);
assert.equal(planner.getSpec("unknown").id, "standard-29");

// 60×40 图纸按 29×29 分割应为 3×2 = 6 块。
function makePattern(width, height) {
  const cells = [];
  for (let row = 0; row < height; row += 1) {
    const line = [];
    for (let col = 0; col < width; col += 1) line.push((row + col) % 2 ? "A1" : "A2");
    cells.push(line);
  }
  return { width, height, cells };
}
const pattern = makePattern(60, 40);
const boards = planner.splitPattern(pattern, { specId: "standard-29" });
assert.equal(boards.length, 6);
assert.deepEqual(boards.map((board) => [board.columns, board.rows]), [[29, 29], [29, 29], [2, 29], [29, 11], [29, 11], [2, 11]]);
assert.equal(boards[0].columnStart, 0);
assert.equal(boards[1].columnStart, 29);
assert.equal(boards[3].rowStart, 29);
assert.equal(boards[0].cellCount, 29 * 29);

// 汇总一致：各板用量相加等于全图。
const summary = planner.summarizeBoards(boards);
assert.equal(summary.totalCells, 60 * 40);
assert.equal(summary.colors, 2);
assert.deepEqual(summary.usage.map((item) => item.code).sort(), ["A1", "A2"]);

// 板级进度。
const progress = { "0:0": true, "1:1": true, "30:30": true };
const board1Progress = planner.progressOfBoard(boards[0], progress);
assert.equal(board1Progress.total, 29 * 29);
assert.equal(board1Progress.done, 2);
assert.equal(planner.progressOfBoard(boards[4], progress).done, 1);

// 缝线对齐：优先采用附近缝线，但任何分块都不超出真实底板尺寸。
const seamBoards = planner.splitPattern(pattern, { specId: "standard-29", preferSeams: true, seamColumns: [{ line: 20 }], seamRows: [{ line: 20 }] });
assert.equal(seamBoards.length, 6);
assert.equal(seamBoards[0].columns, 20);
assert.equal(seamBoards[0].rows, 20);
assert.equal(seamBoards[1].columnStart, 20);
assert.equal(seamBoards[3].rowStart, 20);
assert.ok(seamBoards.every((board) => board.columns <= 29 && board.rows <= 29));
assert.equal(planner.summarizeBoards(seamBoards).totalCells, 60 * 40);
const emptySeamBoards = planner.splitPattern(pattern, { specId: "standard-29", preferSeams: true, seamColumns: [], seamRows: [] });
assert.equal(emptySeamBoards.length, 6);

// 拼制导航：进度统计。
const navCells = [
  ["A1", "A1", "A2", null],
  ["A1", null, "A2", "A2"],
  [null, null, null, null]
];
const navProgress = { "0:0": true, "1:2": true };
const progressData = navigation.computeProgress(navCells, navProgress);
assert.equal(progressData.total, 6);
assert.equal(progressData.done, 2);
assert.equal(progressData.remaining, 4);
assert.equal(progressData.percent, 33);
const a1Stats = progressData.colors.find((item) => item.code === "A1");
assert.deepEqual([a1Stats.total, a1Stats.done], [3, 1]);

// 按色导航：行优先，可从上次位置继续。
assert.deepEqual(navigation.nextCellByColor(navCells, navProgress, "A1"), { row: 0, col: 1, code: "A1" });
assert.deepEqual(navigation.nextCellByColor(navCells, navProgress, "A1", { afterRow: 0, afterCol: 1 }), { row: 1, col: 0, code: "A1" });
assert.deepEqual(navigation.nextCellByColor(navCells, navProgress, "A2"), { row: 0, col: 2, code: "A2" });

// 按行导航：跳过已拼格与空行。
const rowRun = navigation.planRowRun(navCells, navProgress, { fromRow: 0 });
assert.deepEqual(rowRun, [{ row: 0, col: 1, code: "A1" }, { row: 0, col: 2, code: "A2" }]);
const rowRun2 = navigation.planRowRun(navCells, navProgress, { fromRow: 1 });
assert.deepEqual(rowRun2, [{ row: 1, col: 0, code: "A1" }, { row: 1, col: 3, code: "A2" }]);
const rowRun3 = navigation.planRowRun(navCells, navProgress, { fromRow: 2 });
assert.deepEqual(rowRun3, []);

// 按区域导航。
const regionBoard = { rowStart: 0, columnStart: 0, rows: 2, columns: 2 };
assert.deepEqual(navigation.planRegionRun(navCells, navProgress, regionBoard), [{ row: 0, col: 1, code: "A1" }, { row: 1, col: 0, code: "A1" }]);

// 自动前进：A1 完成后跳到 A2。
const fullA1 = Object.assign({}, navProgress, { "0:1": true, "1:0": true });
assert.equal(navigation.advanceColor(navCells, fullA1, "A1"), "A2");
assert.equal(navigation.advanceColor(navCells, fullA1, "A2"), "A2");

// 单格切换不修改输入。
const toggled = navigation.toggleCell(navProgress, 2, 0);
assert.equal(toggled["2:0"], true);
assert.equal(navProgress["2:0"], undefined);
const untoggled = navigation.toggleCell(toggled, 2, 0);
assert.equal(untoggled["2:0"], undefined);
assert.deepEqual(navigation.NAVIGATION_MODES, ["color", "row", "region"]);
console.log("board-planner tests: PASS");
