// Распознавание текста в браузере (tesseract.js) для веб-версии Квитка.
// Все файлы - свои, рядом со страницей: модель, ядро и worker не грузятся
// из интернета. Фото не покидает браузер.
(function () {
  var workerPromise = null;

  function abs(p) {
    return new URL(p, document.baseURI).href;
  }

  function getWorker() {
    if (!workerPromise) {
      workerPromise = Tesseract.createWorker('rus', 1, {
        workerPath: abs('tess/worker.min.js'),
        corePath: abs('tess/'),
        langPath: abs('assets/assets/tessdata'),
        gzip: false,
        cacheMethod: 'none',
        logger: function () {},
      });
    }
    return workerPromise;
  }

  // Вызывается из flutter_tesseract_ocr (web.dart): _extractText(путь, {language, args}).
  window._extractText = async function (imagePath, data) {
    var worker = await getWorker();
    var a = (data && data.args) || {};
    var params = { preserve_interword_spaces: a.preserve_interword_spaces || '0' };
    if (a.psm) params.tessedit_pageseg_mode = String(a.psm);
    await worker.setParameters(params);
    var result = await worker.recognize(imagePath);
    return result.data.text;
  };
})();
