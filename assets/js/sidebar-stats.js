(function () {
  'use strict';

  var sidebar = document.querySelector('.sidebar.sticky');
  if (!sidebar) return;

  // Bump the suffix to reset counters again in the future.
  var BASE = 'ddhw-blog-v2';
  var ENDPOINT = 'https://visitor-badge.laobi.icu/badge';

  var today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  var todayId = BASE + '.day.' + today;
  var totalId = BASE + '.total';

  // Per-browser unique-visitor tracking: only hit the badge service the first
  // time per day (today) and the first time ever (total). Repeat visits render
  // a cached SVG so they do not increment the upstream counter.
  var DAY_VISIT_KEY = BASE + '.uv.day';
  var TOTAL_VISIT_KEY = BASE + '.uv.total';
  var DAY_CACHE_KEY = BASE + '.uv.day.svg';
  var TOTAL_CACHE_KEY = BASE + '.uv.total.svg';

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function buildUrl(pageId, leftText) {
    var params = new URLSearchParams({
      page_id: pageId,
      left_text: leftText,
      left_color: '#111827',
      right_color: '#6366F1'
    });
    // Cache-bust the one fetch we DO make so the upstream service returns a
    // fresh SVG with the just-incremented count.
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

  // Already counted + cache hit  → render cached SVG, no network call.
  // Already counted + cache miss → fetch once to seed cache (rare: cache key
  //                                cleared but visit key kept).
  // Not yet counted              → fetch, cache, mark counted.
  // If fetch fails (e.g. CORS blocked) we fall back to a direct <img src>,
  // which still displays the badge but reverts to per-load counting.
  function render(img, pageId, leftText, alreadyCounted, cacheKey, mark) {
    if (alreadyCounted) {
      var cached = safeGet(cacheKey);
      if (cached) { img.src = cached; return; }
    }
    var url = buildUrl(pageId, leftText);
    fetchAsDataUrl(url).then(function (dataUrl) {
      if (dataUrl) {
        img.src = dataUrl;
        safeSet(cacheKey, dataUrl);
      } else {
        img.src = url;
      }
      mark();
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
