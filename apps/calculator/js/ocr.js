/** Tesseract.js + preprocesado + cleanOCR */
window.CalcOCR = {
  processCanvas: null,

  preprocess: function (source) {
    if (!this.processCanvas) {
      this.processCanvas = document.getElementById("ocr-process");
    }
    var c = this.processCanvas;
    var sw = source.naturalWidth || source.width;
    var sh = source.naturalHeight || source.height;
    var scale = Math.min(3, Math.max(2, 1000 / sw));
    var w = Math.round(sw * scale);
    var h = Math.round(sh * scale);
    c.width = w;
    c.height = h;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(source, 0, 0, w, h);
    var img = ctx.getImageData(0, 0, w, h);
    var d = img.data;
    var sum = 0;
    for (var i = 0; i < d.length; i += 4) {
      var g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      g = Math.min(255, Math.max(0, (g - 128) * 1.4 + 128));
      d[i] = d[i + 1] = d[i + 2] = g;
      sum += g;
    }
    var thr = (sum / (d.length / 4)) * 0.92;
    for (var j = 0; j < d.length; j += 4) {
      var v = d[j] > thr ? 255 : 0;
      d[j] = d[j + 1] = d[j + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  },

  recognize: function (source, onProgress) {
    if (typeof Tesseract === "undefined") {
      return Promise.reject(new Error("Tesseract no cargó"));
    }
    var processed = this.preprocess(source);
    return Tesseract.recognize(processed, "eng", {
      logger: function (m) {
        if (onProgress && m.status === "recognizing text") {
          onProgress(Math.round((m.progress || 0) * 100));
        }
      },
      tessedit_char_whitelist: "0123456789+-*/=()xX.^ ",
    }).then(function (res) {
      return CalcUtils.cleanOCR(res.data && res.data.text);
    });
  },
};
