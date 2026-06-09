(function () {
  'use strict';

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  // Lightbox for comparison images
  var lb = document.createElement('div');
  lb.className = 'projects-lightbox';
  var lbImg = document.createElement('img');
  lb.appendChild(lbImg);
  document.body.appendChild(lb);

  document.querySelectorAll('.comparison-placeholder').forEach(function (el) {
    el.addEventListener('click', function () {
      if (el.classList.contains('missing')) return;
      var img = el.querySelector('img');
      if (!img) return;
      lbImg.src = img.src;
      lb.classList.add('open');
    });
  });
  lb.addEventListener('click', function () { lb.classList.remove('open'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') lb.classList.remove('open');
  });

  // TOC + pink border on active project
  var rows     = Array.from(document.querySelectorAll('.project-row'));
  var toc      = document.getElementById('project-toc');
  var header   = document.querySelector('.projects-header');
  var tocItems = [];
  var activeIdx = -1;

  // Build TOC list from project titles
  if (toc && rows.length) {
    var ul = document.createElement('ul');
    rows.forEach(function (row, i) {
      var h2    = row.querySelector('.project-name h2');
      var label = h2 ? h2.textContent.replace(/\s+/g, ' ').trim() : '';
      var li    = document.createElement('li');
      li.innerHTML = '<span class="toc-dot"></span><span class="toc-label">' + label + '</span>';
      li.addEventListener('click', function () {
        row.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      ul.appendChild(li);
      tocItems.push(li);
    });
    toc.appendChild(ul);
  }

  function setActive(idx) {
    activeIdx = idx;
    rows.forEach(function (r, i) {
      var n = r.querySelector('.project-name');
      if (n) n.classList.toggle('active', i === idx);
    });
    tocItems.forEach(function (item, i) {
      item.classList.toggle('active', i === idx);
    });
  }

  // Show/hide TOC when header scrolls out of view
  if (header && toc) {
    var headerObserver = new IntersectionObserver(function (entries) {
      toc.classList.toggle('visible', !entries[0].isIntersecting);
    }, { threshold: 0 });
    headerObserver.observe(header);
  }

  // Track which row is in view
  if (rows.length) {
    var rowObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(rows.indexOf(entry.target));
      });
    }, { threshold: 0.15 });
    rows.forEach(function (row) { rowObserver.observe(row); });
  }

  document.querySelectorAll('.pdf-viewer').forEach(function (viewer) {
    var pdfUrl    = viewer.getAttribute('data-pdf');
    var canvas    = viewer.querySelector('.pdf-canvas');
    var loading   = viewer.querySelector('.pdf-loading');
    var counter   = viewer.querySelector('.pdf-counter');
    var prevBtn   = viewer.querySelector('.pdf-prev');
    var nextBtn   = viewer.querySelector('.pdf-next');
    var ctx       = canvas.getContext('2d');
    var pdfDoc    = null;
    var current   = 1;
    var rendering = false;

    function renderPage(num) {
      if (rendering) return;
      rendering = true;
      pdfDoc.getPage(num).then(function (page) {
        var devicePixelRatio = window.devicePixelRatio || 1;
        var containerWidth   = canvas.parentElement.clientWidth;
        var viewport         = page.getViewport({ scale: 1 });
        var scale            = (containerWidth / viewport.width) * devicePixelRatio;
        var scaledViewport   = page.getViewport({ scale: scale });

        canvas.width  = scaledViewport.width;
        canvas.height = scaledViewport.height;
        canvas.style.width  = containerWidth + 'px';
        canvas.style.height = (scaledViewport.height / devicePixelRatio) + 'px';

        page.render({ canvasContext: ctx, viewport: scaledViewport }).promise.then(function () {
          rendering = false;
          loading.classList.add('hidden');
          counter.textContent = num + ' / ' + pdfDoc.numPages;
          prevBtn.disabled = num <= 1;
          nextBtn.disabled = num >= pdfDoc.numPages;
        });
      });
    }

    pdfjsLib.getDocument(pdfUrl).promise.then(function (pdf) {
      pdfDoc = pdf;
      renderPage(current);
    });

    prevBtn.addEventListener('click', function () {
      if (current > 1) { current--; renderPage(current); }
    });
    nextBtn.addEventListener('click', function () {
      if (current < pdfDoc.numPages) { current++; renderPage(current); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft'  && current > 1)              { current--; renderPage(current); }
      if (e.key === 'ArrowRight' && current < pdfDoc.numPages) { current++; renderPage(current); }
    });
  });
})();
