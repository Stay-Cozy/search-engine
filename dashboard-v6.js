/* ─────────────────────────────────────────────────────────
   StayCozy Sync Dashboard — dashboard.js
   ───────────────────────────────────────────────────────── */

// ── STATE ──────────────────────────────────────────────────
var WORKER_URL    = localStorage.getItem('sc_worker_url')    || '';
var DASHBOARD_KEY = localStorage.getItem('sc_dashboard_key') || '';

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

  // Restore saved config
  setInputVal('worker-url',     WORKER_URL);
  setInputVal('dashboard-key',  DASHBOARD_KEY);
  setInputVal('s-worker-url',   WORKER_URL);
  setInputVal('s-dashboard-key',DASHBOARD_KEY);

  updateConnectionStatus();

  // Navigation
  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(btn.dataset.tab);
    });
  });

  // Config / connect
  on('connect-btn',   saveConfig);
  on('s-save',        saveConfig);

  // Overview
  on('refresh-health', loadOverview);
  document.querySelectorAll('[data-sync]').forEach(function (btn) {
    btn.addEventListener('click', function () { runQuickSync(btn.dataset.sync, btn); });
  });

  // Sync tab
  on('run-full-sync',    runFullSync);
  on('run-ind-sync',     runIndividualSync);
  on('run-field-sync',   runFieldSync);
  on('run-single-sync',  function () { runSingleSync('listing'); });
  on('run-single-reviews', function () { runSingleSync('reviews'); });

  // Inspect tab
  on('run-all-diagnostics', runAllDiagnostics);
  on('run-lookup',  runLookup);
  on('run-browse',  runBrowse);
  document.querySelectorAll('.diag-card').forEach(function (card) {
    card.addEventListener('click', function () { runDiagnostic(card.dataset.diag); });
  });

  // Properties tab
  on('load-properties', loadProperties);

  // Collections tab
  on('load-counts',   loadCounts);
  on('item-view',     function () { runItemAction('get'); });
  on('item-publish',  function () { runItemAction('publish'); });
  on('item-unpublish',function () { runItemAction('unpublish'); });

  // Settings tab
  on('load-timestamps', loadTimestamps);
  on('init-timestamp',  initTimestamp);
  on('clear-cache',     clearCache);
  on('view-cache',      viewCache);

  // Auto-load overview if configured
  if (WORKER_URL) loadOverview();
});

// ── HELPERS ────────────────────────────────────────────────
function on(id, fn) {
  var el = document.getElementById(id);
  if (el) el.addEventListener('click', fn);
}

function setInputVal(id, val) {
  var el = document.getElementById(id);
  if (el) el.value = val;
}

function getInputVal(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
  document.querySelectorAll('.nav-btn').forEach(function (b) { b.classList.remove('active'); });

  var tabEl = document.getElementById('tab-' + tab);
  if (tabEl) tabEl.classList.add('active');

  var navBtn = document.querySelector('[data-tab="' + tab + '"]');
  if (navBtn) navBtn.classList.add('active');

  var titles = { overview: 'Overview', sync: 'Sync', inspect: 'Inspect', properties: 'Properties', collections: 'Collections', settings: 'Settings' };
  setTextContent('topbar-title', titles[tab] || tab);

  if (tab === 'overview')    loadOverview();
  if (tab === 'collections') loadCounts();
}

// ── CONFIG ─────────────────────────────────────────────────
function saveConfig() {
  var url = getInputVal('worker-url') || getInputVal('s-worker-url');
  var key = getInputVal('dashboard-key') || getInputVal('s-dashboard-key');
  url = url.replace(/\/$/, '');

  WORKER_URL    = url;
  DASHBOARD_KEY = key;

  localStorage.setItem('sc_worker_url',    url);
  localStorage.setItem('sc_dashboard_key', key);

  setInputVal('worker-url',      url);
  setInputVal('dashboard-key',   key);
  setInputVal('s-worker-url',    url);
  setInputVal('s-dashboard-key', key);

  updateConnectionStatus();
  loadOverview();
}

function updateConnectionStatus() {
  var dot  = document.getElementById('status-dot');
  var text = document.getElementById('status-text');
  if (!dot || !text) return;

  if (!WORKER_URL) {
    dot.className = 'status-dot';
    text.textContent = 'Not connected';
  } else {
    dot.className = 'status-dot connected';
    var short = WORKER_URL.replace('https://', '').split('/')[0];
    text.textContent = short;
  }
}

// ── API ────────────────────────────────────────────────────
async function api(path, method) {
  method = method || 'GET';
  if (!WORKER_URL) return { error: 'Worker URL not configured — enter it in the config bar above.' };
  try {
    var sep = path.includes('?') ? '&' : '?';
    var url = WORKER_URL + path + sep + 'key=' + encodeURIComponent(DASHBOARD_KEY);
    var r = await fetch(url, { method: method });
    var text = await r.text();
    try { return JSON.parse(text); } catch (e) { return { raw: text }; }
  } catch (e) {
    return { error: e.message };
  }
}

// ── RESULT RENDERING ───────────────────────────────────────

function showLoading(areaId, label) {
  label = label || 'Loading';
  var area = document.getElementById(areaId);
  if (!area) return;
  area.className = 'result-area visible';
  area.innerHTML =
    '<div class="result-header">' +
      '<span class="result-label">' + label + '</span>' +
      '<span class="result-badge result-badge--loading">● loading</span>' +
    '</div>' +
    '<div class="result-body">' +
      '<div class="result-loading"><div class="spinner"></div>Waiting for worker...</div>' +
    '</div>';
}

function showError(areaId, message) {
  var area = document.getElementById(areaId);
  if (!area) return;
  area.className = 'result-area visible';
  area.innerHTML =
    '<div class="result-header">' +
      '<span class="result-label">Error</span>' +
      '<span class="result-badge result-badge--err">✕ error</span>' +
    '</div>' +
    '<div class="result-body">' +
      '<div class="result-message result-message--red">' + escHtml(message) + '</div>' +
    '</div>';
}

function showSuccess(areaId, message) {
  var area = document.getElementById(areaId);
  if (!area) return;
  area.className = 'result-area visible';
  area.innerHTML =
    '<div class="result-header">' +
      '<span class="result-label">Result</span>' +
      '<span class="result-badge result-badge--ok">✓ ok</span>' +
    '</div>' +
    '<div class="result-body">' +
      '<div class="result-message result-message--green">' + escHtml(message) + '</div>' +
    '</div>';
}

function showSyncResult(areaId, data, label) {
  if (data.error) return showError(areaId, data.error);

  var processed = data.processed !== undefined ? data.processed : data.synced !== undefined ? data.synced : '—';
  var errors    = data.errors    !== undefined ? data.errors    : data.failed !== undefined ? data.failed : 0;
  var created   = data.created   !== undefined ? data.created   : '—';
  var updated   = data.updated   !== undefined ? data.updated   : '—';
  var removed   = data.removed   !== undefined ? data.removed   : '—';
  var skipped   = data.skipped   !== undefined ? data.skipped   : '—';

  var metrics = '';

  if (data.processed !== undefined) {
    metrics += metric('Processed', processed, '');
  }
  if (data.created !== undefined) {
    metrics += metric('Created',  created,  'green');
    metrics += metric('Updated',  updated,  '');
    metrics += metric('Removed',  removed,  '');
    metrics += metric('Skipped',  skipped,  '');
  }
  if (data.synced !== undefined) {
    metrics += metric('Synced', data.synced, 'green');
  }
  if (data.reviewsSynced !== undefined) {
    metrics += metric('Reviews Synced', data.reviewsSynced, 'green');
  }
  if (errors && errors !== '—' && errors > 0) {
    metrics += metric('Errors', errors, 'red');
  }

  if (!metrics) {
    metrics = metric('Status', 'OK', 'green');
  }

  var area = document.getElementById(areaId);
  if (!area) return;
  area.className = 'result-area visible';
  area.innerHTML =
    '<div class="result-header">' +
      '<span class="result-label">' + (label || 'Sync Result') + '</span>' +
      '<span class="result-badge result-badge--ok">✓ ok</span>' +
    '</div>' +
    '<div class="result-body">' +
      '<div class="sync-summary">' + metrics + '</div>' +
    '</div>';
}

function metric(label, value, color) {
  var cls = color ? ' sync-metric-value--' + color : '';
  return '<div class="sync-metric">' +
    '<span class="sync-metric-label">' + label + '</span>' +
    '<span class="sync-metric-value' + cls + '">' + value + '</span>' +
  '</div>';
}

function showTable(areaId, columns, rows, label, badge) {
  badge = badge || 'ok';
  var area = document.getElementById(areaId);
  if (!area) return;

  var thead = '<tr>' + columns.map(function(c) { return '<th>' + escHtml(c) + '</th>'; }).join('') + '</tr>';
  var tbody = rows.length === 0
    ? '<tr><td colspan="' + columns.length + '" class="empty-state">No results</td></tr>'
    : rows.map(function(row) {
        return '<tr>' + row.map(function(cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>';
      }).join('');

  area.className = 'result-area visible';
  area.innerHTML =
    '<div class="result-header">' +
      '<span class="result-label">' + (label || 'Results') + '</span>' +
      '<span class="result-badge result-badge--' + badge + '">' + rows.length + ' items</span>' +
    '</div>' +
    '<div class="result-body" style="overflow-x:auto;">' +
      '<table class="result-table"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>' +
    '</div>';
}

function showKV(areaId, pairs, label) {
  var area = document.getElementById(areaId);
  if (!area) return;

  var rows = pairs.map(function(pair) {
    return '<div class="kv-row"><span class="kv-key">' + escHtml(pair[0]) + '</span><span class="kv-val">' + pair[1] + '</span></div>';
  }).join('');

  area.className = 'result-area visible';
  area.innerHTML =
    '<div class="result-header">' +
      '<span class="result-label">' + (label || 'Details') + '</span>' +
      '<span class="result-badge result-badge--ok">✓ ok</span>' +
    '</div>' +
    '<div class="result-body"><div class="kv-list">' + rows + '</div></div>';
}

function badge(text, color) {
  return '<span class="badge badge--' + (color || 'gray') + '">' + escHtml(String(text)) + '</span>';
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setTextContent(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ── OVERVIEW ───────────────────────────────────────────────
async function loadOverview() {
  if (!WORKER_URL) return;

  var health = await api('/health');
  if (!health || health.error) return;

  setTextContent('s-tagged',  health.guestyTagged ?? '—');
  setTextContent('s-mtl',     health.webflow?.multiUnits ?? '—');
  setTextContent('s-singles', health.webflow?.singleUnits ?? '—');
  setTextContent('s-webflow', ((health.webflow?.multiUnits || 0) + (health.webflow?.singleUnits || 0)) || '—');

  setTextContent('t-smart',     formatTime(health.lastSync?.smart));
  setTextContent('t-smart-ago', timeAgo(health.lastSync?.smart));
  setTextContent('t-full',      formatTime(health.lastSync?.full));
  setTextContent('t-full-ago',  timeAgo(health.lastSync?.full));
  setTextContent('t-price',     formatTime(health.lastSync?.price));
  setTextContent('t-price-ago', timeAgo(health.lastSync?.price));

  // Health panel
  var panel = document.getElementById('health-panel');
  if (!panel) return;

  var items = [
    ['Guesty Token',       health.guestyToken  ? badge('active','green') : badge('missing','red')],
    ['Webflow Token',      health.webflowToken ? badge('active','green') : badge('missing','red')],
    ['Tagged Listings',    escHtml(health.guestyTagged ?? '—')],
    ['Multi Units (WF)',   escHtml(health.webflow?.multiUnits ?? '—')],
    ['Single Units (WF)',  escHtml(health.webflow?.singleUnits ?? '—')],
    ['Reviews (WF)',       escHtml(health.webflow?.reviews ?? '—')],
    ['Amenities (WF)',     escHtml(health.webflow?.amenities ?? '—')],
    ['Tags (WF)',          escHtml(health.webflow?.tags ?? '—')],
    ['Cities (WF)',        escHtml(health.webflow?.cities ?? '—')],
    ['Buildings (WF)',     escHtml(health.webflow?.buildings ?? '—')],
  ];

  panel.innerHTML = '<div class="health-grid">' +
    items.map(function(item) {
      return '<div class="health-item">' +
        '<span class="health-item-label">' + escHtml(item[0]) + '</span>' +
        '<span class="health-item-value">' + item[1] + '</span>' +
      '</div>';
    }).join('') +
  '</div>';
}

async function runQuickSync(type, btn) {
  btn.disabled = true;
  showLoading('overview-result', type + ' sync');
  var data = await api('/sync/' + type, 'POST');
  btn.disabled = false;
  showSyncResult('overview-result', data, type + ' sync');
}

// ── FULL SYNC ──────────────────────────────────────────────
var STEPS = ['cities', 'buildings', 'amenities', 'tags', 'units', 'reviews', 'counts'];

async function runFullSync() {
  var btn = document.getElementById('run-full-sync');
  if (btn) btn.disabled = true;

  STEPS.forEach(function(s) { setStepState(s, 'waiting', 'waiting'); });

  for (var i = 0; i < STEPS.length; i++) {
    var step = STEPS[i];
    setStepState(step, 'running', 'running...');
    var data = await api('/sync/' + step, 'POST');
    if (data.error) {
      setStepState(step, 'error', data.error.substring(0, 80));
    } else {
      var result = buildStepResult(data);
      setStepState(step, 'done', result);
    }
  }

  if (btn) btn.disabled = false;
}

function buildStepResult(data) {
  var parts = [];
  if (data.created  !== undefined) parts.push(data.created  + ' created');
  if (data.updated  !== undefined) parts.push(data.updated  + ' updated');
  if (data.removed  !== undefined) parts.push(data.removed  + ' removed');
  if (data.processed !== undefined && !parts.length) parts.push(data.processed + ' processed');
  if (data.synced   !== undefined && !parts.length) parts.push(data.synced + ' synced');
  if (data.errors   > 0) parts.push(data.errors + ' errors');
  return parts.length ? parts.join(', ') : '✓ done';
}

function setStepState(name, state, statusText) {
  var stepEl = document.getElementById('step-' + name);
  var statusEl = document.getElementById('sr-' + name);
  if (!stepEl) return;
  stepEl.className = 'step ' + state;
  if (statusEl) statusEl.textContent = statusText;
  if (state === 'running') {
    var num = stepEl.querySelector('.step-num');
    if (num) num.textContent = '◌';
  } else if (state === 'done') {
    var num = stepEl.querySelector('.step-num');
    if (num) num.textContent = '✓';
  } else if (state === 'error') {
    var num = stepEl.querySelector('.step-num');
    if (num) num.textContent = '✕';
  }
}

// ── INDIVIDUAL SYNC ────────────────────────────────────────
async function runIndividualSync() {
  var col    = getInputVal('ind-col');
  var offset = getInputVal('ind-offset') || 0;
  var batch  = getInputVal('ind-batch')  || 10;
  showLoading('ind-result', col + ' sync');
  var data = await api('/sync/' + col + '?offset=' + offset + '&batchSize=' + batch, 'POST');
  showSyncResult('ind-result', data, col + ' sync');
}

// ── FIELD SYNC ─────────────────────────────────────────────
async function runFieldSync() {
  var field = getInputVal('field-name');
  var id    = getInputVal('field-id');
  var path  = id ? '/sync/field/' + field + '/' + id : '/sync/field/' + field + '/all';
  showLoading('field-result', field + ' field sync');
  var data = await api(path, 'POST');
  showSyncResult('field-result', data, field + ' field sync');
}

// ── SINGLE SYNC ────────────────────────────────────────────
async function runSingleSync(type) {
  var id = getInputVal('single-id');
  if (!id) { alert('Enter a Guesty listing ID'); return; }
  showLoading('single-result', type + ' sync');
  var path = type === 'reviews' ? '/sync/reviews/' + id : '/sync/listing/' + id;
  var data = await api(path, 'POST');
  showSyncResult('single-result', data, type + ' sync — ' + id);
}

// ── DIAGNOSTICS ────────────────────────────────────────────
async function runDiagnostic(endpoint) {
  var countElId = {
    'diff':                 'd-diff',
    'orphans':              'd-orphans',
    'missing-images':       'd-images',
    'missing-prices':       'd-prices',
    'missing-descriptions':'d-desc',
    'missing-icons':        'd-icons',
    'broken-refs':          'd-refs',
  }[endpoint];

  showLoading('diag-result', endpoint);
  var data = await api('/inspect/' + endpoint);

  if (data.error) {
    showError('diag-result', data.error);
    return;
  }

  // Update count card
  if (countElId) {
    var count = data.count ?? data.total ?? data.missing?.length ?? data.broken?.length ?? data.orphans?.length ?? '—';
    var el = document.getElementById(countElId);
    if (el) {
      el.textContent = count;
      el.style.color = (count > 0) ? 'var(--yellow)' : 'var(--green)';
    }
  }

  renderDiagnosticResult(endpoint, data);
}

async function runAllDiagnostics() {
  var endpoints = ['diff','orphans','missing-images','missing-prices','missing-descriptions','missing-icons','broken-refs'];
  for (var i = 0; i < endpoints.length; i++) {
    await runDiagnostic(endpoints[i]);
  }
}

function renderDiagnosticResult(endpoint, data) {
  if (endpoint === 'diff') {
    renderDiff(data);
  } else if (endpoint === 'orphans') {
    var rows = (data.orphans || []).map(function(o) {
      return [escHtml(o.name || '—'), escHtml(o.guestyId), escHtml(o.collection), escHtml(o.webflowId)];
    });
    if (rows.length === 0) {
      showSuccess('diag-result', 'No orphans found — all Webflow items have matching Guesty listings.');
    } else {
      showTable('diag-result', ['Name','Guesty ID','Collection','Webflow ID'], rows, 'Orphaned Items');
    }
  } else {
    var items = data.missing || data.broken || [];
    if (items.length === 0) {
      showSuccess('diag-result', 'All clear — no issues found.');
      return;
    }
    var rows = items.map(function(item) {
      return [
        escHtml(item.title || item.name || item.id || '—'),
        escHtml(item.id || item.guestyId || '—'),
        escHtml(item.type || item.collection || '—'),
        escHtml(item.city || item.issue || '—'),
      ];
    });
    showTable('diag-result', ['Name','ID','Type','Detail'], rows, endpoint + ' issues');
  }
}

function renderDiff(data) {
  var area = document.getElementById('diag-result');
  if (!area) return;

  var summary = data.summary || {};
  var missing = data.missing || [];
  var present = data.present || [];

  var missingRows = missing.map(function(m) {
    return '<tr>' +
      '<td>' + escHtml(m.title || '—') + '</td>' +
      '<td>' + escHtml(m.id) + '</td>' +
      '<td>' + badge(m.type || 'SINGLE', m.type === 'MTL' ? 'blue' : 'gray') + '</td>' +
      '<td>' + escHtml(m.city || '—') + '</td>' +
    '</tr>';
  }).join('');

  area.className = 'result-area visible';
  area.innerHTML =
    '<div class="result-header">' +
      '<span class="result-label">Diff — Guesty vs Webflow</span>' +
      '<span class="result-badge result-badge--' + (missing.length > 0 ? 'err' : 'ok') + '">' +
        missing.length + ' missing' +
      '</span>' +
    '</div>' +
    '<div class="result-body">' +
      '<div class="sync-summary">' +
        metric('Tagged in Guesty', summary.guestyTagged || 0, '') +
        metric('In Webflow',       summary.inWebflow    || 0, 'green') +
        metric('Missing',          summary.missing      || 0, missing.length > 0 ? 'red' : 'green') +
      '</div>' +
      (missing.length > 0
        ? '<table class="result-table">' +
            '<thead><tr><th>Name</th><th>Guesty ID</th><th>Type</th><th>City</th></tr></thead>' +
            '<tbody>' + missingRows + '</tbody>' +
          '</table>'
        : '<div class="result-message result-message--green">All tagged listings are in Webflow ✓</div>'
      ) +
    '</div>';
}

// ── INSPECT ────────────────────────────────────────────────
async function runLookup() {
  var id   = getInputVal('lookup-id');
  var view = getInputVal('lookup-view');
  if (!id) { alert('Enter a Guesty listing ID'); return; }

  showLoading('lookup-result', 'Lookup');
  var data = await api('/inspect/listing/' + id + view);

  if (data.error) return showError('lookup-result', data.error);

  if (view === '') {
    // Raw listing
    renderListing(data);
  } else if (view === '/map') {
    renderMap(data);
  } else if (view === '/amenities') {
    renderAmenities(data, 'lookup-result');
  } else if (view === '/reviews') {
    renderReviews(data, 'lookup-result');
  } else if (view === '/price') {
    renderPrice(data, 'lookup-result');
  } else if (view === '/calendar') {
    renderCalendar(data, 'lookup-result');
  } else {
    renderGenericKV('lookup-result', data, 'Listing Data');
  }
}

function renderListing(data) {
  var l = data.listing || {};
  var pairs = [
    ['Type',          badge(data.type || l.type || '—', data.type === 'MTL' ? 'blue' : 'gray')],
    ['Tagged Website',badge(data.taggedWebsite ? 'Yes' : 'No', data.taggedWebsite ? 'green' : 'red')],
    ['Title',         escHtml(l.title || '—')],
    ['Nickname',      escHtml(l.nickname || '—')],
    ['Guesty ID',     escHtml(l._id || '—')],
    ['Complex ID',    escHtml(l.complexId || '—')],
    ['Bedrooms',      escHtml(l.bedrooms ?? '—')],
    ['Bathrooms',     escHtml(l.bathrooms ?? '—')],
    ['Accommodates',  escHtml(l.accommodates ?? '—')],
    ['Base Price',    l.prices?.basePrice ? '$' + l.prices.basePrice : '—'],
    ['Cleaning Fee',  l.prices?.cleaningFee ? '$' + l.prices.cleaningFee : '—'],
    ['City',          escHtml(l.address?.city || '—')],
    ['Address',       escHtml(l.address?.full || '—')],
    ['Tags',          escHtml((l.tags || []).join(', ') || '—')],
    ['Amenities',     escHtml((l.amenities || []).length + ' amenities')],
    ['Active',        badge(l.active ? 'Yes' : 'No', l.active ? 'green' : 'red')],
    ['Listed',        badge(l.isListed ? 'Yes' : 'No', l.isListed ? 'green' : 'red')],
    ['Last Updated',  escHtml(l.lastUpdatedAt ? new Date(l.lastUpdatedAt).toLocaleString() : '—')],
  ];
  showKV('lookup-result', pairs, 'Listing — ' + (l.nickname || l._id));
}

function renderMap(data) {
  var mapped = data.mappedOutput || {};
  var pairs = Object.entries(mapped).map(function(entry) {
    var val = entry[1];
    if (typeof val === 'boolean') val = badge(val ? 'Yes' : 'No', val ? 'green' : 'red');
    else if (Array.isArray(val)) val = escHtml(JSON.stringify(val).substring(0, 100));
    else if (typeof val === 'string' && val.length > 120) val = escHtml(val.substring(0, 120) + '...');
    else val = escHtml(String(val ?? '—'));
    return [entry[0], val];
  });
  showKV('lookup-result', pairs, 'Map Output — ' + (data.type || ''));
}

function renderAmenities(data, areaId) {
  var amenities = data.amenities || [];
  var rows = amenities.map(function(a) {
    return [escHtml(a)];
  });
  showTable(areaId, ['Amenity'], rows, 'Amenities (' + amenities.length + ')');
}

function renderReviews(data, areaId) {
  var reviews = data.reviews || [];
  if (!reviews.length) return showSuccess(areaId, 'No reviews found for this listing.');
  var rows = reviews.map(function(r) {
    return [
      escHtml(r.reviewerName || r.reviewer?.name || '—'),
      badge(r.rating || '—', r.rating >= 4 ? 'green' : r.rating >= 3 ? 'yellow' : 'red'),
      escHtml(r.publicReview?.body?.substring(0, 80) + '...' || '—'),
      escHtml(r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'),
    ];
  });
  showTable(areaId, ['Reviewer','Rating','Review','Date'], rows, 'Reviews (' + reviews.length + ')');
}

function renderPrice(data, areaId) {
  var pairs = [
    ['Base Price',     data.basePrice   ? '$' + data.basePrice   : '—'],
    ['Weekly Factor',  data.weeklyFactor  ? 'x' + data.weeklyFactor  : '—'],
    ['Monthly Factor', data.monthlyFactor ? 'x' + data.monthlyFactor : '—'],
    ['Cleaning Fee',   data.cleaningFee ? '$' + data.cleaningFee : '—'],
    ['Currency',       escHtml(data.currency || '—')],
  ];
  showKV(areaId, pairs, 'Pricing');
}

function renderCalendar(data, areaId) {
  var days = data.days || data.data || [];
  if (!days.length) return showSuccess(areaId, 'No calendar data returned.');
  var rows = days.slice(0, 30).map(function(d) {
    var avail = d.status === 'available' || d.available === true;
    return [
      escHtml(d.date || '—'),
      badge(d.status || (avail ? 'available' : 'blocked'), avail ? 'green' : 'red'),
      escHtml(d.price ? '$' + d.price : '—'),
    ];
  });
  showTable(areaId, ['Date','Status','Price'], rows, 'Calendar (next 30 days)');
}

function renderGenericKV(areaId, data, label) {
  var flat = flattenObj(data, '');
  var pairs = Object.entries(flat).slice(0, 40).map(function(e) {
    return [e[0], escHtml(String(e[1] ?? '—').substring(0, 150))];
  });
  showKV(areaId, pairs, label);
}

function flattenObj(obj, prefix) {
  var result = {};
  Object.keys(obj || {}).forEach(function(key) {
    var val = obj[key];
    var k = prefix ? prefix + '.' + key : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObj(val, k));
    } else {
      result[k] = Array.isArray(val) ? '[' + val.length + ' items]' : val;
    }
  });
  return result;
}

// ── BROWSE ─────────────────────────────────────────────────
async function runBrowse() {
  var col = getInputVal('browse-col');
  showLoading('browse-result', col);
  var data = await api('/inspect/' + col);
  if (data.error) return showError('browse-result', data.error);

  if (col === 'overview') {
    renderOverviewBrowse(data);
  } else if (col === 'cities') {
    var cities = data.cities || {};
    var rows = Object.entries(cities).map(function(e) { return [escHtml(e[0]), escHtml(e[1])]; });
    showTable('browse-result', ['City','Property Count'], rows, 'Cities');
  } else if (col === 'mtl' || col === 'singles' || col === 'complexes' || col === 'untagged') {
    var listings = data.mtl || data.singles || data.complexes || data.listings || [];
    var rows = listings.map(function(l) {
      return [
        escHtml(l.title || l.nickname || '—'),
        escHtml(l._id || '—'),
        escHtml(l.address?.city || '—'),
        badge(l.type || '—', l.type === 'MTL' ? 'blue' : 'gray'),
      ];
    });
    showTable('browse-result', ['Title','ID','City','Type'], rows, col + ' (' + listings.length + ')');
  } else if (col === 'buildings') {
    var buildings = data.buildings || [];
    var rows = buildings.map(function(b) {
      return [
        escHtml(b.name || b.buildingName || '—'),
        escHtml(b.complexId || '—'),
        escHtml(b.city || '—'),
        escHtml(b.listingCount || b.count || '—'),
      ];
    });
    showTable('browse-result', ['Building','Complex ID','City','Listings'], rows, 'Buildings');
  } else {
    renderGenericKV('browse-result', data, col);
  }
}

function renderOverviewBrowse(data) {
  var all = data.allListings || {};
  var tagged = data.taggedWebsiteOnly || {};
  var pairs = [];

  Object.entries(all).forEach(function(e) {
    pairs.push(['All — ' + e[0], escHtml(String(e[1]))]);
  });
  Object.entries(tagged).forEach(function(e) {
    pairs.push(['Website Tagged — ' + e[0], escHtml(String(e[1]))]);
  });

  showKV('browse-result', pairs, 'Overview');
}

// ── PROPERTIES ─────────────────────────────────────────────
async function loadProperties() {
  var panel = document.getElementById('properties-table');
  if (panel) panel.innerHTML = '<div class="empty-state">Loading...</div>';

  var data = await api('/webflow/units');
  if (data.error) {
    if (panel) panel.innerHTML = '<div class="empty-state">' + escHtml(data.error) + '</div>';
    return;
  }

  var cityFilter = getInputVal('prop-city');
  var typeFilter = getInputVal('prop-type');

  var units = [].concat(
    (data.multiUnits?.items || []).map(function(u) { return Object.assign({}, u.fieldData, { _type: 'MTL' }); }),
    (data.singleUnits?.items || []).map(function(u) { return Object.assign({}, u.fieldData, { _type: 'SINGLE' }); })
  );

  units = units.filter(function(u) {
    if (cityFilter && u.city !== cityFilter) return false;
    if (typeFilter && u._type !== typeFilter) return false;
    return true;
  });

  if (!units.length) {
    if (panel) panel.innerHTML = '<div class="empty-state">No units found</div>';
    return;
  }

  var rows = units.map(function(u) {
    var active = u['is-active'];
    return '<tr>' +
      '<td>' + escHtml(u.name || '—') + '</td>' +
      '<td>' + badge(u._type, u._type === 'MTL' ? 'blue' : 'gray') + '</td>' +
      '<td>' + escHtml(u.city || '—') + '</td>' +
      '<td>' + badge(active ? 'Active' : 'Inactive', active ? 'green' : 'red') + '</td>' +
      '<td>' + (u['guesty-id'] ? '<button class="btn btn--ghost btn--sm" onclick="syncOneProperty(\'' + escHtml(u['guesty-id']) + '\')">Sync</button>' : '—') + '</td>' +
    '</tr>';
  }).join('');

  if (panel) {
    panel.innerHTML =
      '<div class="result-body" style="overflow-x:auto;">' +
        '<table class="result-table">' +
          '<thead><tr><th>Name</th><th>Type</th><th>City</th><th>Status</th><th>Action</th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>';
  }
}

async function syncOneProperty(id) {
  showLoading('prop-result', 'Syncing ' + id);
  var data = await api('/sync/listing/' + id, 'POST');
  showSyncResult('prop-result', data, 'Property sync');
}

// ── COLLECTIONS ────────────────────────────────────────────
async function loadCounts() {
  var data = await api('/webflow/counts');
  if (data.error) return;

  var map = {
    'multi-units':  'c-mtl',
    'single-units': 'c-singles',
    'reviews':      'c-reviews',
    'amenities':    'c-amenities',
    'tags':         'c-tags',
    'cities':       'c-cities',
    'buildings':    'c-buildings',
  };

  var counts = data.counts || data;
  Object.entries(map).forEach(function(entry) {
    setTextContent(entry[1], counts[entry[0]] ?? '—');
  });
}

async function runItemAction(action) {
  var id = getInputVal('item-id');
  if (!id) { alert('Enter a Guesty listing ID'); return; }

  showLoading('item-result', action);
  var data;
  if (action === 'get')       data = await api('/webflow/item/guesty-id/' + id);
  else if (action === 'publish')   data = await api('/webflow/publish/'  + id, 'POST');
  else if (action === 'unpublish') data = await api('/webflow/unpublish/'+ id, 'POST');

  if (data.error) return showError('item-result', data.error);

  if (action === 'get') {
    renderGenericKV('item-result', data.item || data, 'Webflow Item');
  } else {
    showSuccess('item-result', action === 'publish' ? 'Item published successfully.' : 'Item unpublished (set to inactive).');
  }
}

// ── SETTINGS ───────────────────────────────────────────────
async function loadTimestamps() {
  var panel = document.getElementById('timestamps-panel');
  if (panel) panel.innerHTML = '';

  var data = await api('/sync/status');
  if (data.error) return showError('timestamp-result', data.error);

  var pairs = Object.entries(data)
    .filter(function(e) { return !e[0].startsWith('_'); })
    .map(function(e) { return [e[0], escHtml(String(e[1] || '—'))]; });

  if (!panel) return;
  panel.innerHTML = '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;">' +
    '<div class="kv-list">' +
    pairs.map(function(p) {
      return '<div class="kv-row"><span class="kv-key">' + escHtml(p[0]) + '</span><span class="kv-val">' + p[1] + '</span></div>';
    }).join('') +
    '</div></div>';
}

async function initTimestamp() {
  showLoading('timestamp-result', 'Initializing');
  var data = await api('/sync/init-timestamp', 'POST');
  if (data.error) showError('timestamp-result', data.error);
  else showSuccess('timestamp-result', 'Timestamp initialized to now. Next smart sync will process all listings.');
}

async function clearCache() {
  showLoading('cache-result', 'Clearing cache');
  var data = await api('/cache/clear-tokens', 'POST');
  if (data.error) showError('cache-result', data.error);
  else showSuccess('cache-result', 'Token cache cleared successfully.');
}

async function viewCache() {
  showLoading('cache-result', 'Cache status');
  var data = await api('/cache/status');
  if (data.error) return showError('cache-result', data.error);
  renderGenericKV('cache-result', data, 'Cache Status');
}

// ── TIME HELPERS ───────────────────────────────────────────
function formatTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}

function timeAgo(ts) {
  if (!ts) return '';
  var diff = Date.now() - new Date(ts).getTime();
  var h = Math.floor(diff / 3600000);
  var m = Math.floor((diff % 3600000) / 60000);
  if (h > 48) return Math.floor(h/24) + 'd ago';
  if (h > 0)  return h + 'h ' + m + 'm ago';
  return m + 'm ago';
}
