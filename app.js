/* Okakari Cliffs — site behaviour
   Kept in an external file (not inline) so the Content-Security-Policy
   can forbid inline scripts, which is the single biggest XSS protection
   for a static site. Edit freely; no inline handlers are used in the HTML. */
(function () {
  'use strict';

  function showPage(page) {
    var target = document.getElementById('page-' + page);
    if (!target) return;
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    target.classList.add('active');
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.classList.toggle('active', a.dataset.page === page);
    });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function filterGallery(cat, btn) {
    document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.masonry-item').forEach(function (item) {
      item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
    });
  }

  function activate(el) {
    if (el.dataset.page) { showPage(el.dataset.page); return true; }
    if (el.dataset.filter !== undefined && el.dataset.filter !== null && el.hasAttribute('data-filter')) {
      filterGallery(el.dataset.filter, el); return true;
    }
    return false;
  }

  // Click handling via delegation (no inline onclick needed)
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-page], [data-filter]');
    if (el) { e.preventDefault(); activate(el); }
  });

  // Keyboard support for non-<button>/<a href> controls
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    var el = e.target.closest('[data-page], [data-filter]');
    if (el && el.getAttribute('role') === 'button') { e.preventDefault(); activate(el); }
  });

  // Make JS-driven controls focusable/announced correctly
  document.querySelectorAll('[data-page], [data-filter]').forEach(function (el) {
    if (el.tagName === 'BUTTON' || el.hasAttribute('href')) return;
    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
  });

  // Logo image fallback: if the file is missing, reveal the text wordmark
  document.querySelectorAll('img.site-logo, img.footer-logo').forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.display = 'none';
      var fb = img.parentElement && img.parentElement.querySelector('.logo-text-fallback');
      if (fb) fb.hidden = false;
    });
  });

  // Enquiry form -> Netlify Forms (AJAX submit, no page reload)
  var form = document.getElementById('enquiry-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = document.getElementById('submit-btn');
      var original = btn ? btn.textContent : '';
      if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error('Submission failed');
        if (btn) { btn.textContent = 'Sent \u2713'; btn.style.background = '#2e7d4f'; }
        form.reset();
        setTimeout(function () {
          if (btn) { btn.textContent = original; btn.style.background = ''; btn.disabled = false; }
        }, 4000);
      }).catch(function () {
        if (btn) {
          btn.textContent = 'Error — please email us directly';
          btn.style.background = '#b23b3b';
          btn.style.fontSize = '10px';
          setTimeout(function () {
            btn.textContent = original; btn.style.background = '';
            btn.style.fontSize = ''; btn.disabled = false;
          }, 5000);
        }
      });
    });
  }

  // Subtle nav shadow on scroll
  var nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 20 ? '0 2px 20px rgba(28,51,68,0.08)' : 'none';
    }, { passive: true });
  }
})();
