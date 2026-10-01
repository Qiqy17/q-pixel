(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelSmartBoardPackage = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  function abort(signal) { if (signal?.aborted) throw new Error("已取消导出。"); }
  function canvas(plan, board, onlyCode, scale = 1) {
    const source = document.createElement("canvas"); source.width = board.columns; source.height = board.rows;
    source.getContext("2d").putImageData(new ImageData(window.QPixelSmartBoardExport.rgba(plan, board, onlyCode), board.columns, board.rows), 0, 0);
    if (scale === 1) return source;
    const enlarged = document.createElement("canvas"); enlarged.width = board.columns * scale; enlarged.height = board.rows * scale;
    const ctx = enlarged.getContext("2d"); ctx.imageSmoothingEnabled = false; ctx.drawImage(source, 0, 0, enlarged.width, enlarged.height);
    source.width = source.height = 0; return enlarged;
  }
  async function png(plan, board, onlyCode, scale = 1) {
    const image = canvas(plan, board, onlyCode, scale);
    try {
      const blob = await new Promise((resolve) => image.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("PNG生成失败。");
      return new Uint8Array(await blob.arrayBuffer());
    } finally { image.width = image.height = 0; }
  }
  async function build(plan, options) {
    const files = [], records = [], encoder = new TextEncoder(); let size = 0;
    // Limit ZIP entries as well as bytes; classic ZIP cannot represent >65535 files.
    const expected = 3 + plan.boards.reduce((n, b) => n + 2 + (options.perColor ? b.usage.length : 0), 0);
    if (expected > 60000) throw new Error("分板文件过多，请增大板尺寸或关闭逐色图。");
    const add = (name, bytes) => {
      size += bytes.length + encoder.encode(name).length * 2 + 76;
      if (size > 100 * 1024 * 1024) throw new Error("导出包超过100MiB，请关闭逐色图或减少分板。");
      files.push({ name, bytes });
    };
    for (const board of plan.boards) {
      abort(options.signal);
      const folder = `board-${String(board.index).padStart(4, "0")}`, names = [];
      const image = async (suffix, code, scale) => {
        abort(options.signal); const name = `${folder}/${suffix}.png`;
        add(name, await png(plan, board, code, scale)); names.push(name);
      };
      await image("pixels", undefined, 1); await image("preview", undefined, 8);
      if (options.perColor) for (let i = 0; i < board.usage.length; i++) await image(`color-${String(i + 1).padStart(3, "0")}`, board.usage[i].code, 1);
      records.push({ ...board, files: names, colorFiles: options.perColor ? board.usage.map((c, i) => ({ code: c.code, file: names[i + 2] })) : [],
        cells: Array.from({ length: board.rows }, (_, y) => Array.from({ length: board.columns }, (_, x) => window.QPixelSmartBoardExport.codeAt(plan, board, x, y))) });
      options.onProgress?.(board.index, plan.boards.length);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    abort(options.signal);
    add("colors.csv", encoder.encode(window.QPixelSmartBoardExport.csv(plan)));
    add("README.txt", encoder.encode("Q像素智能板通用导出 v1\n一格一像素，无水印。PNG空格透明；manifest的null是空格，H1等透明豆保留色号。preview为8倍最近邻放大。RGB为色板参考值，非实体豆/LED校准值。坐标从0开始，镜像先于顺时针旋转，再切分。逐色图与色号对应关系见manifest.colorFiles。\n请核对厂家APP导入格数及方向。本包不代表蓝牙兼容认证。\n"));
    const manifest = { format: "qpixel-smart-board-v1", source: plan.source, width: plan.width, height: plan.height,
      columns: plan.columns, rows: plan.rows, rotation: plan.rotation, mirror: plan.mirror, usage: plan.usage,
      palette: plan.usage.map(({ code }) => ({ code, rgb: window.QPixelSmartBoardExport.rgb(plan.colors.get(code)) })), boards: records,
      files: [...files.map((f) => f.name), "manifest.json"] };
    add("manifest.json", encoder.encode(JSON.stringify(manifest)));
    abort(options.signal); return options.makeZip(files);
  }
  return Object.freeze({ canvas, png, build });
});
