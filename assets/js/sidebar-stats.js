(function () {
  'use strict';

  var sidebar = document.querySelector('.sidebar.sticky');
  if (!sidebar) return;

  // Bumped from v2 — v2 was double-counting (+2 per badge per visit) on browsers
  // where the upstream service's missing CORS headers made `fetch()` fail and
  // the code fell back to a second <img src> request to display the badge.
  var BASE = 'ddhw-blog-v3';
  var ENDPOINT = 'https://visitor-badge.laobi.icu/badge';

  var today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  var todayId = BASE + '.day.' + today;
  var totalId = BASE + '.total';

  // Per-browser tracking. UV mode (true unique-visitor: cache the SVG, no
  // request on repeat visits) only works when the upstream service sends
  // CORS headers — otherwise we cannot read the response body to cache it.
  // visitor-badge.laobi.icu does not, so in practice we run in PV mode below
  // (one <img src> per visit). The UV path stays in case the service ever
  // adds CORS or we switch to one that has it.
  var DAY_VISIT_KEY = BASE + '.uv.day';
  var TOTAL_VISIT_KEY = BASE + '.uv.total';
  var DAY_CACHE_KEY = BASE + '.uv.day.svg';
  var TOTAL_CACHE_KEY = BASE + '.uv.total.svg';
  var CORS_KEY = BASE + '.uv.cors'; // 'ok' | 'blocked' | null

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function buildUrl(pageId, leftText) {
    var params = new URLSearchParams({
      page_id: pageId,
      left_text: leftText,
      left_color: '#111827',
      right_color: '#6366F1'
    });
    params.append('_', Date.now());
    return ENDPOINT + '?' + params.toString();
  }

  function fetchAsDataUrl(url) {
    return fetch(url)
      .then(function (r) { return r.ok ? r.blob() : null; })
      .then(function (blob) {
        if (!blob) return null;
        return new Promise(function (resolve) {
          var reader = new FileReader();
          reader.onload = function () { resolve(reader.result); };
          reader.onerror = function () { resolve(null); };
          reader.readAsDataURL(blob);
        });
      })
      .catch(function () { return null; });
  }

  function makeImg(leftText) {
    var img = document.createElement('img');
    img.className = 'sidebar-stats__badge';
    img.alt = leftText;
    img.loading = 'eager';
    return img;
  }

  // Render strategy — designed so each visit triggers AT MOST ONE request to
  // the upstream service per badge:
  //
  //   CORS_KEY === 'blocked'        → PV mode: single <img src>, +1 per visit.
  //                                   We end up here permanently on browsers
  //                                   where the upstream service won't return
  //                                   CORS headers (i.e. visitor-badge.laobi.icu).
  //   CORS_KEY !== 'blocked'
  //     · alreadyCounted + cache hit   → render cached SVG, NO network call (UV).
  //     · alreadyCounted + cache miss  → re-fetch (rare: cache cleared but the
  //                                      visit key persisted).
  //     · not yet counted              → fetch, cache, mark counted.
  //
  // On a failed fetch we set CORS_KEY = 'blocked' and intentionally do NOT
  // also set <img src> in the same render — that fallback is what caused the
  // earlier +2 bug, since the failed fetch had already incremented the
  // counter once on the server before its response was rejected by the
  // browser. The very first CORS-blocked visit therefore shows no badge;
  // every visit after that takes the PV branch above and renders correctly.
  function render(img, pageId, leftText, alreadyCounted, cacheKey, mark) {
    if (safeGet(CORS_KEY) === 'blocked') {
      img.src = buildUrl(pageId, leftText);
      return;
    }
    if (alreadyCounted) {
      var cached = safeGet(cacheKey);
      if (cached) { img.src = cached; return; }
    }
    var url = buildUrl(pageId, leftText);
    fetchAsDataUrl(url).then(function (dataUrl) {
      if (dataUrl) {
        safeSet(CORS_KEY, 'ok');
        img.src = dataUrl;
        safeSet(cacheKey, dataUrl);
        mark();
      } else {
        safeSet(CORS_KEY, 'blocked');
      }
    });
  }

  var todayImg = makeImg('today');
  var totalImg = makeImg('visitors');

  render(
    todayImg, todayId, 'today',
    safeGet(DAY_VISIT_KEY) === today,
    DAY_CACHE_KEY,
    function () { safeSet(DAY_VISIT_KEY, today); }
  );
  render(
    totalImg, totalId, 'visitors',
    safeGet(TOTAL_VISIT_KEY) === '1',
    TOTAL_CACHE_KEY,
    function () { safeSet(TOTAL_VISIT_KEY, '1'); }
  );

  var label = document.createElement('p');
  label.className = 'sidebar-stats__label';
  label.textContent = '방문자';

  var row = document.createElement('div');
  row.className = 'sidebar-stats__row';
  row.appendChild(todayImg);
  row.appendChild(totalImg);

  var wrap = document.createElement('div');
  wrap.className = 'sidebar-stats';
  wrap.appendChild(label);
  wrap.appendChild(row);

  sidebar.appendChild(wrap);
})();
