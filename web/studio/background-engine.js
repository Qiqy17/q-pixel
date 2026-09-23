(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelBackgroundEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function dimensions(cells) {
    const height = Array.isArray(cells) ? cells.length : 0;
    const width = height && Array.isArray(cells[0]) ? cells[0].length : 0;
    if (!width || cells.some((row) => !Array.isArray(row) || row.length !== width)) throw new Error("图纸网格不完整");
    return { width, height };
  }

  function detect(cells) {
    const { width, height } = dimensions(cells);
    const edgeCounts = new Map();
    const add = (code) => { if (code) edgeCounts.set(code, (edgeCounts.get(code) || 0) + 1); };
    for (let col = 0; col < width; col += 1) { add(cells[0][col]); if (height > 1) add(cells[height - 1][col]); }
    for (let row = 1; row < height - 1; row += 1) { add(cells[row][0]); if (width > 1) add(cells[row][width - 1]); }
    const code = [...edgeCounts].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const mask = new Uint8Array(width * height);
    if (!code) return { width, height, code, mask, count: 0 };
    const queue = new Int32Array(width * height);
    let head = 0, tail = 0;
    const enqueue = (row, col) => {
      const index = row * width + col;
      if (!mask[index] && cells[row][col] === code) { mask[index] = 1; queue[tail++] = index; }
    };
    for (let col = 0; col < width; col += 1) { enqueue(0, col); enqueue(height - 1, col); }
    for (let row = 1; row < height - 1; row += 1) { enqueue(row, 0); enqueue(row, width - 1); }
    while (head < tail) {
      const index = queue[head++], row = Math.floor(index / width), col = index % width;
      if (row > 0) enqueue(row - 1, col);
      if (row + 1 < height) enqueue(row + 1, col);
      if (col > 0) enqueue(row, col - 1);
      if (col + 1 < width) enqueue(row, col + 1);
    }
    return { width, height, code, mask, count: tail };
  }

  function paint(mask, width, height, points, radius, selected) {
    const value = selected ? 1 : 0;
    const r = Math.max(0, Math.floor(radius || 0));
    for (const point of points || []) {
      const x = Math.floor(point.x), y = Math.floor(point.y);
      for (let row = Math.max(0, y - r); row <= Math.min(height - 1, y + r); row += 1) {
        for (let col = Math.max(0, x - r); col <= Math.min(width - 1, x + r); col += 1) {
          if ((col - x) ** 2 + (row - y) ** 2 <= r ** 2 || r === 0) mask[row * width + col] = value;
        }
      }
    }
    return mask;
  }

  function rectangle(mask, width, height, start, end, selected) {
    const minX = Math.max(0, Math.min(Math.floor(start.x), Math.floor(end.x)));
    const maxX = Math.min(width - 1, Math.max(Math.floor(start.x), Math.floor(end.x)));
    const minY = Math.max(0, Math.min(Math.floor(start.y), Math.floor(end.y)));
    const maxY = Math.min(height - 1, Math.max(Math.floor(start.y), Math.floor(end.y)));
    for (let row = minY; row <= maxY; row += 1) for (let col = minX; col <= maxX; col += 1) mask[row * width + col] = selected ? 1 : 0;
    return mask;
  }

  function polygon(mask, width, height, points, selected) {
    if (!Array.isArray(points) || points.length < 3) return mask;
    for (let row = 0; row < height; row += 1) for (let col = 0; col < width; col += 1) {
      let inside = false;
      for (let index = 0, previous = points.length - 1; index < points.length; previous = index++) {
        const a = points[index], b = points[previous];
        if ((a.y > row + .5) !== (b.y > row + .5) && col + .5 < (b.x - a.x) * (row + .5 - a.y) / (b.y - a.y) + a.x) inside = !inside;
      }
      if (inside) mask[row * width + col] = selected ? 1 : 0;
    }
    return mask;
  }

  function count(mask) { let total = 0; for (let i = 0; i < mask.length; i += 1) total += mask[i] ? 1 : 0; return total; }
  return Object.freeze({ detect, paint, rectangle, polygon, count, dimensions });
});
