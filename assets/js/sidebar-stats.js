(function () {
  'use strict';

  var sidebar = document.querySelector('.sidebar.sticky');
  if (!sidebar) return;

  // Fresh namespace — change suffix to reset counters again in the future
  var BASE = 'ddhw-blog-v2';
  var ENDPOINT = 'https://visitor-badge.laobi.icu/badge';

  var today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  var todayId = BASE + '.day.' + today;
  var totalId = BASE + '.total';

  function makeBadge(pageId, leftText) {
    var params = new URLSearchParams({
      page_id: pageId,
      left_text: leftText,
      left_color: '#111827',
      right_color: '#6366F1'
    });
    // Cache-bust per page load so both badges always re-fetch and increment.
    params.append('_', Date.now());

    var img = document.createElement('img');
    img.className = 'sidebar-stats__badge';
    img.alt = leftText;
    img.loading = 'eager';
    img.src = ENDPOINT + '?' + params.toString();
    return img;
  }

  var label = document.createElement('p');
  label.className = 'sidebar-stats__label';
  label.textContent = '방문자';

  var row = document.createElement('div');
  row.className = 'sidebar-stats__row';
  row.appendChild(makeBadge(todayId, 'today'));
  row.appendChild(makeBadge(totalId, 'visitors'));

  var wrap = document.createElement('div');
  wrap.className = 'sidebar-stats';
  wrap.appendChild(label);
  wrap.appendChild(row);

  sidebar.appendChild(wrap);
})();
