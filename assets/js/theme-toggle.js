(function () {
  'use strict';

  var STORAGE_KEY = 'theme';

  var SUN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  var MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    paintIcon();
  }

  function paintIcon() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.innerHTML = currentTheme() === 'dark' ? SUN : MOON;
  }

  function toggle() {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  }

  function injectButton() {
    if (document.getElementById('theme-toggle')) return;

    var btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', '테마 전환');
    btn.title = '테마 전환';
    btn.addEventListener('click', toggle);

    var nav = document.querySelector('.greedy-nav .visible-links');
    if (nav) {
      nav.appendChild(btn);
      paintIcon();
      return;
    }

    var masthead = document.querySelector('.masthead__inner-wrap');
    if (masthead) {
      masthead.appendChild(btn);
      paintIcon();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }

  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var handler = function (e) {
      try { if (localStorage.getItem(STORAGE_KEY)) return; } catch (err) {}
      applyTheme(e.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }
})();
