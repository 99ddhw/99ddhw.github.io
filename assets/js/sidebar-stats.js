(function () {
  'use strict';

  var sidebar = document.querySelector('.sidebar.sticky');
  if (!sidebar) return;

  var SITE_ID = '99ddhw.github.io';
  var ENDPOINT = 'https://visitor-badge.laobi.icu/badge';

  var today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  var todayId = SITE_ID + '.day.' + today;
  var totalId = SITE_ID;

  function makeBadge(pageId, leftText) {
    var params = new URLSearchParams({
      page_id: pageId,
      left_text: leftText,
      left_color: '#111827',
      right_color: '#6366F1'
    });
    var img = document.createElement('img');
    img.className = 'sidebar-stats__badge';
    img.alt = leftText;
    img.loading = 'lazy';
    img.src = ENDPOINT + '?' + params.toString();
    return img;
  }

  var label = document.createElement('p');
  label.className = 'sidebar-stats__label';
  label.textContent = '방문자';

  var row = document.createElement('div');
  row.className = 'sidebar-stats__row';
  row.appendChild(makeBadge(todayId, '오늘'));
  row.appendChild(makeBadge(totalId, '누적'));

  var wrap = document.createElement('div');
  wrap.className = 'sidebar-stats';
  wrap.appendChild(label);
  wrap.appendChild(row);

  sidebar.appendChild(wrap);
})();
