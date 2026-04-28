(function () {
  'use strict';

  var sidebar = document.querySelector('.sidebar.sticky');
  if (!sidebar) return;

  var pageUrl = location.origin + location.pathname;
  var params = new URLSearchParams({
    url: pageUrl,
    title: '오늘 / 누적',
    count_bg: '#6366F1',
    title_bg: '#111827',
    edge_flat: 'false'
  });

  var badge = document.createElement('img');
  badge.className = 'sidebar-stats__badge';
  badge.alt = '방문자 — 오늘 / 누적';
  badge.loading = 'lazy';
  badge.src = 'https://hits.seeyoufarm.com/api/count/incr/badge.svg?' + params.toString();

  var label = document.createElement('p');
  label.className = 'sidebar-stats__label';
  label.textContent = '방문자';

  var wrap = document.createElement('div');
  wrap.className = 'sidebar-stats';
  wrap.appendChild(label);
  wrap.appendChild(badge);

  sidebar.appendChild(wrap);
})();
