(function () {
  'use strict';

  function makeButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', '코드 복사');
    return btn;
  }

  function attach(container) {
    if (container.dataset.copyBound === 'true') return;
    container.dataset.copyBound = 'true';

    var btn = makeButton();
    container.appendChild(btn);

    btn.addEventListener('click', function () {
      var codeEl = container.querySelector('code') || container.querySelector('pre');
      if (!codeEl) return;
      var text = codeEl.innerText;

      var done = function () {
        btn.textContent = 'Copied';
        btn.dataset.copied = 'true';
        setTimeout(function () {
          btn.textContent = 'Copy';
          delete btn.dataset.copied;
        }, 1400);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

  function init() {
    var blocks = document.querySelectorAll('div.highlighter-rouge, figure.highlight, .highlight');
    blocks.forEach(function (el) {
      if (getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
      }
      attach(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
