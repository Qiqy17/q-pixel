"use strict";

importScripts("./import-engine.js", "./import-processing.js");

self.addEventListener("message", async (event) => {
  const message = event.data || {};
  if (message.type !== "process" || !message.taskId) return;
  try {
    const result = await self.QPixelImportProcessing.processTask(message.input, {
      onProgress(progress) {
        self.postMessage({ type: "progress", taskId: message.taskId, progress });
      }
    });
    const processedData = result.processedData;
    self.postMessage({
      type: "result",
      taskId: message.taskId,
      result: Object.assign({}, result, { processedData: processedData.buffer })
    }, [processedData.buffer]);
  } catch (error) {
    self.postMessage({
      type: "error",
      taskId: message.taskId,
      error: error && error.message ? error.message : "后台导入失败"
    });
  }
});
