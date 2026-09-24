"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const files = fs.readdirSync(__dirname).filter((file) => file.endsWith(".test.js")).sort();
if (!files.length) throw new Error("没有找到测试文件");
for (const file of files) {
  const result = spawnSync(process.execPath, [path.join(__dirname, file)], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`${files.length} 个测试文件通过`);
