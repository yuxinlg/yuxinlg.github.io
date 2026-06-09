(function () {
  'use strict';

  function initCarousel(carousel) {
    var track         = carousel.querySelector('.carousel-track');
    var slides        = carousel.querySelectorAll('.carousel-slide');
    var prevBtn       = carousel.querySelector('.carousel-btn-prev');
    var nextBtn       = carousel.querySelector('.carousel-btn-next');
    var dotsContainer = carousel.querySelector('.carousel-dots');

    if (!track || slides.length === 0) return;

    var current = 0;
    var total   = slides.length;
    var dots    = [];

    for (var i = 0; i < total; i++) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dotsContainer.appendChild(dot);
      dots.push(dot);
    }

    function goTo(index) {
      if (index < 0)      index = total - 1;
      if (index >= total) index = 0;
      current = index;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });

    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });

    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    var startX = null;
    carousel.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
      startX = null;
    }, { passive: true });

    goTo(0);
  }

  document.querySelectorAll('.carousel').forEach(initCarousel);
})();
