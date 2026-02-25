// StayCozy Dashboard — inject structure
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('sc-dashboard').innerHTML = `<!-- SIDEBAR -->
<aside class="sidebar">
  <div class="logo">
    <div class="logo-mark">StayCozy</div>
    <div class="logo-sub">sync dashboard v6.0</div>
  </div>

  <nav class="nav">
    <div class="nav-section">
      <div class="nav-label">Main</div>
      <button class="nav-item active" onclick="switchTab('overview', this)">
        <span class="nav-dot"></span> Overview
      </button>
      <button class="nav-item" onclick="switchTab('sync', this)">
        <span class="nav-dot"></span> Sync
      </button>
      <button class="nav-item" onclick="switchTab('inspect', this)">
        <span class="nav-dot"></span> Inspect
      </button>
    </div>
    <div class="nav-section">
      <div class="nav-label">Data</div>
      <button class="nav-item" onclick="switchTab('properties', this)">
        <span class="nav-dot"></span> Properties
      </button>
      <button class="nav-item" onclick="switchTab('collections', this)">
        <span class="nav-dot"></span> Collections
      </button>
    </div>
    <div class="nav-section">
      <div class="nav-label">System</div>
      <button class="nav-item" onclick="switchTab('settings', this)">
        <span class="nav-dot"></span> Settings
      </button>
    </div>
  </nav>

  <div class="sidebar-footer">
    <div class="worker-url" id="sidebar-url">not configured</div>
  </div>
</aside>

<!-- MAIN -->
<main class="main">
  <div class="topbar">
    <div class="page-title" id="page-title">Overview</div>
    <div style="display:flex;gap:10px;align-items:center;">
      <div class="status-pill">
        <span class="pulse"></span>
        <span id="last-sync-label">checking...</span>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="loadOverview()">↻ Refresh</button>
    </div>
  </div>

  <div class="content">

    <!-- WORKER CONFIG BAR (always visible) -->
    <div class="config-bar">
      <label>WORKER URL</label>
      <input type="text" id="worker-url" placeholder="https://your-worker.workers.dev" style="max-width:300px;">
      <label>SECRET KEY</label>
      <input type="password" id="dashboard-key" placeholder="Dashboard key" style="max-width:180px;">
      <button class="btn btn-primary btn-sm" onclick="saveConfig()">Connect</button>
      <span id="config-status" style="font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);"></span>
    </div>

    <!-- ─── OVERVIEW ─── -->
    <div id="tab-overview" class="tab-content active">
      <div class="grid-4">
        <div class="card">
          <div class="card-label">Tagged in Guesty</div>
          <div class="card-value accent" id="stat-tagged">—</div>
          <div class="card-sub">website tag</div>
        </div>
        <div class="card">
          <div class="card-label">In Webflow</div>
          <div class="card-value green" id="stat-webflow">—</div>
          <div class="card-sub">published units</div>
        </div>
        <div class="card">
          <div class="card-label">MTL Units</div>
          <div class="card-value" id="stat-mtl">—</div>
          <div class="card-sub">multi-unit listings</div>
        </div>
        <div class="card">
          <div class="card-label">Singles</div>
          <div class="card-value" id="stat-singles">—</div>
          <div class="card-sub">single listings</div>
        </div>
      </div>

      <div class="grid-3">
        <div class="card">
          <div class="card-label">Last Smart Sync</div>
          <div class="card-value accent" id="stat-last-smart" style="font-size:15px;margin-bottom:4px;">—</div>
          <div class="card-sub" id="stat-last-smart-ago"></div>
        </div>
        <div class="card">
          <div class="card-label">Last Full Sync</div>
          <div class="card-value accent" id="stat-last-full" style="font-size:15px;margin-bottom:4px;">—</div>
          <div class="card-sub" id="stat-last-full-ago"></div>
        </div>
        <div class="card">
          <div class="card-label">Last Price Sync</div>
          <div class="card-value accent" id="stat-last-price" style="font-size:15px;margin-bottom:4px;">—</div>
          <div class="card-sub" id="stat-last-price-ago"></div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">Quick Actions</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="runSync('smart', this)">▶ Smart Sync</button>
          <button class="btn btn-ghost" onclick="runSync('prices', this)">▶ Price Sync</button>
          <button class="btn btn-ghost" onclick="runSync('reviews', this)">▶ Reviews Sync</button>
          <button class="btn btn-ghost" onclick="runSync('counts', this)">↻ Recalculate Counts</button>
        </div>
        <div id="overview-response" class="response-panel"></div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">Health</div>
        </div>
        <div id="health-output" class="table-wrap">
          <div class="empty">Click refresh to load health status</div>
        </div>
      </div>
    </div>

    <!-- ─── SYNC ─── -->
    <div id="tab-sync" class="tab-content">

      <!-- FULL SYNC -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">Full Sync</div>
        </div>
        <div class="card">
          <p style="font-size:12px;color:var(--muted);margin-bottom:16px;font-family:'DM Mono',monospace;line-height:1.6;">
            Runs all steps in sequence: Cities → Buildings → Amenities → Tags → Units → Reviews → Counts. Use for initial setup or full recovery.
          </p>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="runFullSync()">▶ Run Full Sync</button>
            <span style="font-size:11px;font-family:'DM Mono',monospace;color:var(--muted);">Batch size: 10 per step</span>
          </div>
          <div style="margin-top:20px;" id="full-sync-steps">
            <div class="sync-steps">
              <div class="sync-step" id="step-cities"><span class="step-icon pending">1</span><span class="step-name">Cities</span><span class="step-result" id="step-cities-result">—</span></div>
              <div class="sync-step" id="step-buildings"><span class="step-icon pending">2</span><span class="step-name">Buildings</span><span class="step-result" id="step-buildings-result">—</span></div>
              <div class="sync-step" id="step-amenities"><span class="step-icon pending">3</span><span class="step-name">Amenities</span><span class="step-result" id="step-amenities-result">—</span></div>
              <div class="sync-step" id="step-tags"><span class="step-icon pending">4</span><span class="step-name">Tags</span><span class="step-result" id="step-tags-result">—</span></div>
              <div class="sync-step" id="step-units"><span class="step-icon pending">5</span><span class="step-name">Units</span><span class="step-result" id="step-units-result">—</span></div>
              <div class="sync-step" id="step-reviews"><span class="step-icon pending">6</span><span class="step-name">Reviews</span><span class="step-result" id="step-reviews-result">—</span></div>
              <div class="sync-step" id="step-counts"><span class="step-icon pending">7</span><span class="step-name">Property Counts</span><span class="step-result" id="step-counts-result">—</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- INDIVIDUAL SYNCS -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">Individual Syncs</div>
        </div>
        <div class="card">
          <div class="form-row">
            <div class="form-group" style="max-width:180px;">
              <label>Collection</label>
              <select id="ind-collection">
                <option value="cities">Cities</option>
                <option value="buildings">Buildings</option>
                <option value="amenities">Amenities</option>
                <option value="tags">Tags</option>
                <option value="units">All Units</option>
                <option value="mtl">MTL Only</option>
                <option value="singles">Singles Only</option>
                <option value="reviews">Reviews</option>
                <option value="prices">Prices</option>
                <option value="counts">Counts</option>
              </select>
            </div>
            <div class="form-group" style="max-width:100px;">
              <label>Offset</label>
              <input type="number" id="ind-offset" value="0" min="0">
            </div>
            <div class="form-group" style="max-width:100px;">
              <label>Batch Size</label>
              <input type="number" id="ind-batchsize" value="10" min="1" max="50">
            </div>
            <button class="btn btn-primary" onclick="runIndividualSync()">▶ Run</button>
          </div>
          <div id="ind-response" class="response-panel"></div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- FIELD SYNC -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">Field-Level Sync</div>
        </div>
        <div class="card">
          <div class="form-row">
            <div class="form-group" style="max-width:180px;">
              <label>Field</label>
              <select id="field-name">
                <option value="price">Price</option>
                <option value="descriptions">Descriptions</option>
                <option value="images">Images</option>
                <option value="amenities">Amenities</option>
                <option value="specs">Specs</option>
                <option value="checkinout">Check-in/out</option>
                <option value="location">Location</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div class="form-group">
              <label>Guesty ID (leave blank for all)</label>
              <input type="text" id="field-listing-id" placeholder="e.g. 6861483c1e2fda0013d20e43">
            </div>
            <button class="btn btn-primary" onclick="runFieldSync()">▶ Sync Field</button>
          </div>
          <div id="field-response" class="response-panel"></div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- SINGLE PROPERTY -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">Single Property Sync</div>
        </div>
        <div class="card">
          <div class="form-row">
            <div class="form-group">
              <label>Guesty Listing ID</label>
              <input type="text" id="single-listing-id" placeholder="e.g. 6861483c1e2fda0013d20e43">
            </div>
            <button class="btn btn-primary" onclick="runSingleSync()">▶ Sync Property</button>
            <button class="btn btn-ghost" onclick="runSingleReviews()">▶ Sync Reviews</button>
          </div>
          <div id="single-response" class="response-panel"></div>
        </div>
      </div>
    </div>

    <!-- ─── INSPECT ─── -->
    <div id="tab-inspect" class="tab-content">

      <!-- DIAGNOSTICS -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">Diagnostics</div>
          <button class="btn btn-ghost btn-sm" onclick="loadDiagnostics()">↻ Load All</button>
        </div>
        <div class="inspect-grid" id="diagnostics-grid">
          <div class="inspect-card" onclick="runInspect('diff', 'inspect-response')">
            <div class="inspect-card-title">Diff</div>
            <div class="inspect-card-desc">Guesty tagged vs Webflow — missing + stale</div>
            <div class="inspect-card-count" id="diag-diff">—</div>
          </div>
          <div class="inspect-card" onclick="runInspect('orphans', 'inspect-response')">
            <div class="inspect-card-title">Orphans</div>
            <div class="inspect-card-desc">Webflow items with no matching Guesty listing</div>
            <div class="inspect-card-count" id="diag-orphans">—</div>
          </div>
          <div class="inspect-card" onclick="runInspect('missing-images', 'inspect-response')">
            <div class="inspect-card-title">Missing Images</div>
            <div class="inspect-card-desc">Units with no main image set</div>
            <div class="inspect-card-count" id="diag-images">—</div>
          </div>
          <div class="inspect-card" onclick="runInspect('missing-prices', 'inspect-response')">
            <div class="inspect-card-title">Missing Prices</div>
            <div class="inspect-card-desc">Units with null or zero price</div>
            <div class="inspect-card-count" id="diag-prices">—</div>
          </div>
          <div class="inspect-card" onclick="runInspect('missing-descriptions', 'inspect-response')">
            <div class="inspect-card-title">Missing Descriptions</div>
            <div class="inspect-card-desc">Units with empty description-summary</div>
            <div class="inspect-card-count" id="diag-desc">—</div>
          </div>
          <div class="inspect-card" onclick="runInspect('missing-icons', 'inspect-response')">
            <div class="inspect-card-title">Missing Icons</div>
            <div class="inspect-card-desc">Amenities with no icon-class set</div>
            <div class="inspect-card-count" id="diag-icons">—</div>
          </div>
          <div class="inspect-card" onclick="runInspect('broken-refs', 'inspect-response')">
            <div class="inspect-card-title">Broken Refs</div>
            <div class="inspect-card-desc">Units with missing city or building reference</div>
            <div class="inspect-card-count" id="diag-refs">—</div>
          </div>
          <div class="inspect-card" onclick="runInspect('orphans', 'inspect-response')">
            <div class="inspect-card-title">Webflow Overview</div>
            <div class="inspect-card-desc">Counts across all collections</div>
            <div class="inspect-card-count" id="diag-wf">—</div>
          </div>
        </div>
        <div id="inspect-response" class="response-panel"></div>
      </div>

      <div class="divider"></div>

      <!-- LISTING LOOKUP -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">Listing Lookup</div>
        </div>
        <div class="card">
          <div class="form-row">
            <div class="form-group">
              <label>Guesty Listing ID</label>
              <input type="text" id="lookup-id" placeholder="e.g. 6861483c1e2fda0013d20e43">
            </div>
            <div class="form-group" style="max-width:160px;">
              <label>View</label>
              <select id="lookup-view">
                <option value="">Raw Data</option>
                <option value="/map">Map Output</option>
                <option value="/calendar">Calendar</option>
                <option value="/price">Price</option>
                <option value="/reviews">Reviews</option>
                <option value="/amenities">Amenities</option>
                <option value="/children">Children</option>
              </select>
            </div>
            <button class="btn btn-primary" onclick="runListingLookup()">Inspect</button>
          </div>
          <div id="lookup-response" class="response-panel"></div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- COLLECTION BROWSE -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">Browse Collections</div>
        </div>
        <div class="card">
          <div class="form-row">
            <div class="form-group" style="max-width:200px;">
              <label>Collection</label>
              <select id="browse-collection">
                <option value="overview">Overview</option>
                <option value="mtl">MTL Listings</option>
                <option value="singles">Single Listings</option>
                <option value="complexes">Complexes</option>
                <option value="untagged">Untagged</option>
                <option value="cities">Cities (Webflow)</option>
                <option value="buildings">Buildings (Guesty)</option>
                <option value="amenity-groups">Amenity Groups</option>
              </select>
            </div>
            <button class="btn btn-primary" onclick="runBrowse()">Browse</button>
          </div>
          <div id="browse-response" class="response-panel"></div>
        </div>
      </div>
    </div>

    <!-- ─── PROPERTIES ─── -->
    <div id="tab-properties" class="tab-content">
      <div class="section">
        <div class="section-header">
          <div class="section-title">Webflow Units</div>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-ghost btn-sm" onclick="loadProperties()">↻ Load</button>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
          <select id="prop-filter-city" style="max-width:160px;">
            <option value="">All Cities</option>
            <option value="Miami">Miami</option>
            <option value="Philadelphia">Philadelphia</option>
            <option value="London">London</option>
          </select>
          <select id="prop-filter-type" style="max-width:160px;">
            <option value="">All Types</option>
            <option value="MTL">MTL</option>
            <option value="SINGLE">Single</option>
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>City</th>
                <th>Status</th>
                <th>Last Synced</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="properties-tbody">
              <tr><td colspan="6" class="empty">Click Load to fetch properties</td></tr>
            </tbody>
          </table>
        </div>
        <div id="prop-response" class="response-panel"></div>
      </div>
    </div>

    <!-- ─── COLLECTIONS ─── -->
    <div id="tab-collections" class="tab-content">
      <div class="section">
        <div class="section-header">
          <div class="section-title">Webflow Collection Counts</div>
          <button class="btn btn-ghost btn-sm" onclick="loadCounts()">↻ Load</button>
        </div>
        <div class="grid-3" id="collection-counts">
          <div class="card"><div class="card-label">Multi Units</div><div class="card-value" id="cnt-mtl">—</div></div>
          <div class="card"><div class="card-label">Single Units</div><div class="card-value" id="cnt-singles">—</div></div>
          <div class="card"><div class="card-label">Reviews</div><div class="card-value" id="cnt-reviews">—</div></div>
          <div class="card"><div class="card-label">Amenities</div><div class="card-value" id="cnt-amenities">—</div></div>
          <div class="card"><div class="card-label">Tags</div><div class="card-value" id="cnt-tags">—</div></div>
          <div class="card"><div class="card-label">Cities</div><div class="card-value" id="cnt-cities">—</div></div>
          <div class="card"><div class="card-label">Buildings</div><div class="card-value" id="cnt-buildings">—</div></div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- WEBFLOW ITEM ACTIONS -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">Item Actions</div>
        </div>
        <div class="card">
          <div class="form-row">
            <div class="form-group">
              <label>Guesty ID</label>
              <input type="text" id="item-guesty-id" placeholder="Guesty listing ID">
            </div>
            <button class="btn btn-ghost" onclick="runItemAction('get')">View</button>
            <button class="btn btn-green" onclick="runItemAction('publish')">Publish</button>
            <button class="btn btn-danger" onclick="runItemAction('unpublish')">Unpublish</button>
          </div>
          <div id="item-response" class="response-panel"></div>
        </div>
      </div>
    </div>

    <!-- ─── SETTINGS ─── -->
    <div id="tab-settings" class="tab-content">

      <div class="section">
        <div class="section-header">
          <div class="section-title">Sync Timestamps</div>
          <button class="btn btn-ghost btn-sm" onclick="loadSyncStatus()">↻ Load</button>
        </div>
        <div class="card">
          <div id="kv-timestamps">
            <div class="empty">Click Load to fetch</div>
          </div>
          <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn btn-ghost" onclick="initTimestamp()">Initialize Timestamp (Now)</button>
          </div>
          <div id="settings-response" class="response-panel" style="margin-top:14px;"></div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">Cache</div>
        </div>
        <div class="card">
          <div class="form-row">
            <button class="btn btn-danger" onclick="clearCache()">Clear Token Cache</button>
            <button class="btn btn-ghost" onclick="runInspect2('cache/status', 'cache-response')">View Cache Status</button>
          </div>
          <div id="cache-response" class="response-panel"></div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">Worker Config</div>
        </div>
        <div class="card">
          <div class="form-row" style="margin-bottom:16px;">
            <div class="form-group">
              <label>Worker URL</label>
              <input type="text" id="settings-worker-url" placeholder="https://your-worker.workers.dev">
            </div>
            <div class="form-group" style="max-width:240px;">
              <label>Secret Key</label>
              <input type="password" id="settings-dashboard-key" placeholder="Dashboard key">
            </div>
            <button class="btn btn-primary" onclick="saveConfig()">Save</button>
          </div>
          <p style="font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;line-height:1.6;">
            The worker URL is stored in your browser's localStorage. It is never sent anywhere except directly to your worker.
          </p>
        </div>
      </div>
    </div>

  </div><!-- /content -->
</main>

<script>
  // ─── STATE ────────────────────────────────────────────────
  let WORKER_URL = localStorage.getItem('sc_worker_url') || '';

  // Init
  document.getElementById('worker-url').value = WORKER_URL;
  document.getElementById('settings-worker-url').value = WORKER_URL;
  document.getElementById('dashboard-key').value = DASHBOARD_KEY;
  document.getElementById('settings-dashboard-key').value = DASHBOARD_KEY;
  document.getElementById('sidebar-url').textContent = WORKER_URL || 'not configured';

  function saveConfig() {
    const url = (document.getElementById('worker-url').value || document.getElementById('settings-worker-url').value).trim().replace(/\\/\$/, '');
    const key = (document.getElementById('dashboard-key').value || document.getElementById('settings-dashboard-key').value || '').trim();
    WORKER_URL = url;
    DASHBOARD_KEY = key;
    localStorage.setItem('sc_worker_url', url);
    localStorage.setItem('sc_dashboard_key', key);
    document.getElementById('worker-url').value = url;
    document.getElementById('settings-worker-url').value = url;
    document.getElementById('dashboard-key').value = key;
    document.getElementById('settings-dashboard-key').value = key;
    document.getElementById('sidebar-url').textContent = url || 'not configured';
    document.getElementById('config-status').textContent = '✓ saved';
    setTimeout(() => document.getElementById('config-status').textContent = '', 2000);
    loadOverview();
  }

  // ─── NAV ──────────────────────────────────────────────────
  const TITLES = { overview: 'Overview', sync: 'Sync', inspect: 'Inspect', properties: 'Properties', collections: 'Collections', settings: 'Settings' };

  function switchTab(tab, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    el.classList.add('active');
    document.getElementById('page-title').textContent = TITLES[tab];
    if (tab === 'overview') loadOverview();
    if (tab === 'collections') loadCounts();
  }

  // ─── API CALL ─────────────────────────────────────────────
  let DASHBOARD_KEY = localStorage.getItem('sc_dashboard_key') || '';

  async function api(path, method = 'GET') {
    if (!WORKER_URL) return { error: 'Worker URL not configured. Set it in the config bar above.' };
    try {
      const separator = path.includes('?') ? '&' : '?';
      const r = await fetch(WORKER_URL + path + separator + 'key=' + encodeURIComponent(DASHBOARD_KEY), { method });
      const text = await r.text();
      try { return JSON.parse(text); } catch { return { raw: text }; }
    } catch(e) {
      return { error: e.message };
    }
  }

  function showResponse(panelId, data, status = 'ok') {
    const panel = document.getElementById(panelId);
    panel.classList.add('visible');
    panel.innerHTML = \`
      <div class="response-header">
        <span class="response-label">Response</span>
        <span class="response-status \${status}">\${status === 'loading' ? '● loading' : status === 'err' ? '✕ error' : '✓ ok'}</span>
      </div>
      <div class="response-body">\${JSON.stringify(data, null, 2)}</div>
    \`;
  }

  function setLoading(panelId) {
    const panel = document.getElementById(panelId);
    panel.classList.add('visible');
    panel.innerHTML = \`
      <div class="response-header">
        <span class="response-label">Response</span>
        <span class="response-status loading">● loading</span>
      </div>
      <div class="response-body" style="color:var(--muted);">Waiting for worker...</div>
    \`;
  }

  // ─── OVERVIEW ─────────────────────────────────────────────
  async function loadOverview() {
    if (!WORKER_URL) return;

    // Health
    const health = await api('/health');
    if (health && !health.error) {
      document.getElementById('stat-tagged').textContent = health.guestyTagged ?? '—';
      document.getElementById('stat-mtl').textContent = health.webflow?.multiUnits ?? '—';
      document.getElementById('stat-singles').textContent = health.webflow?.singleUnits ?? '—';
      const total = (health.webflow?.multiUnits || 0) + (health.webflow?.singleUnits || 0);
      document.getElementById('stat-webflow').textContent = total || '—';

      const renderTime = (ts) => {
        if (!ts) return '—';
        const d = new Date(ts);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      };
      const ago = (ts) => {
        if (!ts) return '';
        const diff = Date.now() - new Date(ts);
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        if (h > 24) return \`\${Math.floor(h/24)}d ago\`;
        if (h > 0) return \`\${h}h \${m}m ago\`;
        return \`\${m}m ago\`;
      };

      document.getElementById('stat-last-smart').textContent = renderTime(health.lastSync?.smart);
      document.getElementById('stat-last-smart-ago').textContent = ago(health.lastSync?.smart);
      document.getElementById('stat-last-full').textContent = renderTime(health.lastSync?.full);
      document.getElementById('stat-last-full-ago').textContent = ago(health.lastSync?.full);
      document.getElementById('stat-last-price').textContent = renderTime(health.lastSync?.price);
      document.getElementById('stat-last-price-ago').textContent = ago(health.lastSync?.price);

      document.getElementById('last-sync-label').textContent = ago(health.lastSync?.smart) || 'never synced';

      // Health table
      const kvs = [
        ['Guesty Token', health.guestyToken ? '✓ active' : '✕ missing'],
        ['Webflow Token', health.webflowToken ? '✓ active' : '✕ missing'],
        ['Tagged Listings', health.guestyTagged],
        ['Multi Units (WF)', health.webflow?.multiUnits],
        ['Single Units (WF)', health.webflow?.singleUnits],
        ['Reviews (WF)', health.webflow?.reviews],
        ['Amenities (WF)', health.webflow?.amenities],
      ];
      document.getElementById('health-output').innerHTML = kvs.map(([k, v]) => \`
        <div class="kv-row"><span class="kv-key">\${k}</span><span class="kv-val">\${v ?? '—'}</span></div>
      \`).join('');
    }
  }

  // ─── QUICK SYNC ───────────────────────────────────────────
  async function runSync(type, btn) {
    setLoading('overview-response');
    btn.disabled = true;
    const data = await api('/sync/' + type, 'POST');
    btn.disabled = false;
    showResponse('overview-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── FULL SYNC STEPS ──────────────────────────────────────
  const STEPS = ['cities', 'buildings', 'amenities', 'tags', 'units', 'reviews', 'counts'];

  function setStep(name, state, result = '') {
    const icon = document.querySelector(\`#step-\${name} .step-icon\`);
    if (icon) {
      icon.className = \`step-icon \${state}\`;
      icon.textContent = state === 'done' ? '✓' : state === 'error' ? '✕' : state === 'running' ? '◌' : icon.textContent;
    }
    const res = document.getElementById(\`step-\${name}-result\`);
    if (res && result) res.textContent = result;
  }

  async function runFullSync() {
    STEPS.forEach(s => setStep(s, 'pending', '—'));

    for (const step of STEPS) {
      setStep(step, 'running');
      const data = await api('/sync/' + step, 'POST');
      if (data?.error) {
        setStep(step, 'error', data.error.substring(0, 60));
      } else {
        const result = data?.processed !== undefined
          ? \`\${data.processed} processed, \${data.errors || 0} errors\`
          : data?.synced !== undefined ? \`\${data.synced} synced\`
          : '✓';
        setStep(step, 'done', result);
      }
    }
  }

  // ─── INDIVIDUAL SYNC ──────────────────────────────────────
  async function runIndividualSync() {
    const col = document.getElementById('ind-collection').value;
    const offset = document.getElementById('ind-offset').value;
    const batch = document.getElementById('ind-batchsize').value;
    setLoading('ind-response');
    const data = await api(\`/sync/\${col}?offset=\${offset}&batchSize=\${batch}\`, 'POST');
    showResponse('ind-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── FIELD SYNC ───────────────────────────────────────────
  async function runFieldSync() {
    const field = document.getElementById('field-name').value;
    const id = document.getElementById('field-listing-id').value.trim();
    const path = id ? \`/sync/field/\${field}/\${id}\` : \`/sync/field/\${field}/all\`;
    setLoading('field-response');
    const data = await api(path, 'POST');
    showResponse('field-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── SINGLE SYNC ──────────────────────────────────────────
  async function runSingleSync() {
    const id = document.getElementById('single-listing-id').value.trim();
    if (!id) { alert('Enter a Guesty listing ID'); return; }
    setLoading('single-response');
    const data = await api(\`/sync/listing/\${id}\`, 'POST');
    showResponse('single-response', data, data?.error ? 'err' : 'ok');
  }

  async function runSingleReviews() {
    const id = document.getElementById('single-listing-id').value.trim();
    if (!id) { alert('Enter a Guesty listing ID'); return; }
    setLoading('single-response');
    const data = await api(\`/sync/reviews/\${id}\`, 'POST');
    showResponse('single-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── INSPECT ──────────────────────────────────────────────
  async function runInspect(endpoint, panelId) {
    setLoading(panelId);
    const data = await api(\`/inspect/\${endpoint}\`);
    showResponse(panelId, data, data?.error ? 'err' : 'ok');
  }

  async function runInspect2(endpoint, panelId) {
    setLoading(panelId);
    const data = await api(\`/\${endpoint}\`);
    showResponse(panelId, data, data?.error ? 'err' : 'ok');
  }

  async function runListingLookup() {
    const id = document.getElementById('lookup-id').value.trim();
    const view = document.getElementById('lookup-view').value;
    if (!id) { alert('Enter a Guesty listing ID'); return; }
    setLoading('lookup-response');
    const data = await api(\`/inspect/listing/\${id}\${view}\`);
    showResponse('lookup-response', data, data?.error ? 'err' : 'ok');
  }

  async function runBrowse() {
    const col = document.getElementById('browse-collection').value;
    setLoading('browse-response');
    const data = await api(\`/inspect/\${col}\`);
    showResponse('browse-response', data, data?.error ? 'err' : 'ok');
  }

  async function loadDiagnostics() {
    const endpoints = [
      ['diff', 'diag-diff'],
      ['orphans', 'diag-orphans'],
      ['missing-images', 'diag-images'],
      ['missing-prices', 'diag-prices'],
      ['missing-descriptions', 'diag-desc'],
      ['missing-icons', 'diag-icons'],
      ['broken-refs', 'diag-refs'],
    ];
    for (const [ep, el] of endpoints) {
      const data = await api(\`/inspect/\${ep}\`);
      const el2 = document.getElementById(el);
      if (el2) {
        const count = data?.count ?? data?.total ?? data?.missing?.length ?? (Array.isArray(data) ? data.length : '—');
        el2.textContent = count;
        el2.style.color = count > 0 ? 'var(--yellow)' : 'var(--green)';
      }
    }
  }

  // ─── PROPERTIES ───────────────────────────────────────────
  async function loadProperties() {
    const data = await api('/webflow/units');
    if (!data || data.error) return;

    const units = [...(data.multiUnits?.items || []), ...(data.singleUnits?.items || [])];
    const tbody = document.getElementById('properties-tbody');

    if (!units.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty">No units found</td></tr>';
      return;
    }

    const cityFilter = document.getElementById('prop-filter-city').value;
    const typeFilter = document.getElementById('prop-filter-type').value;

    const filtered = units.filter(u => {
      if (cityFilter && u.city !== cityFilter) return false;
      if (typeFilter && u.type !== typeFilter) return false;
      return true;
    });

    tbody.innerHTML = filtered.map(u => \`
      <tr>
        <td>\${u.name || '—'}</td>
        <td><span class="badge \${u.type === 'MTL' ? 'badge-blue' : 'badge-muted'}">\${u.type || '—'}</span></td>
        <td>\${u.city || '—'}</td>
        <td><span class="badge \${u.isActive ? 'badge-green' : 'badge-red'}">\${u.isActive ? 'active' : 'inactive'}</span></td>
        <td>\${u.lastSynced ? new Date(u.lastSynced).toLocaleDateString('en-GB') : '—'}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="syncOne('\${u.guestyId}')">Sync</button>
        </td>
      </tr>
    \`).join('');
  }

  async function syncOne(id) {
    setLoading('prop-response');
    const data = await api(\`/sync/listing/\${id}\`, 'POST');
    showResponse('prop-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── COLLECTIONS ──────────────────────────────────────────
  async function loadCounts() {
    const data = await api('/webflow/counts');
    if (!data || data.error) return;
    const map = {
      'multi-units': 'cnt-mtl',
      'single-units': 'cnt-singles',
      'reviews': 'cnt-reviews',
      'amenities': 'cnt-amenities',
      'tags': 'cnt-tags',
      'cities': 'cnt-cities',
      'buildings': 'cnt-buildings',
    };
    for (const [key, elId] of Object.entries(map)) {
      const el = document.getElementById(elId);
      if (el) el.textContent = data[key] ?? data.counts?.[key] ?? '—';
    }
  }

  async function runItemAction(action) {
    const id = document.getElementById('item-guesty-id').value.trim();
    if (!id) { alert('Enter a Guesty ID'); return; }
    setLoading('item-response');
    let data;
    if (action === 'get') data = await api(\`/webflow/item/guesty-id/\${id}\`);
    else if (action === 'publish') data = await api(\`/webflow/publish/\${id}\`, 'POST');
    else if (action === 'unpublish') data = await api(\`/webflow/unpublish/\${id}\`, 'POST');
    showResponse('item-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── SETTINGS ─────────────────────────────────────────────
  async function loadSyncStatus() {
    const data = await api('/sync/status');
    if (!data || data.error) return;
    const keys = Object.entries(data).filter(([k]) => !k.startsWith('_'));
    document.getElementById('kv-timestamps').innerHTML = keys.map(([k, v]) => \`
      <div class="kv-row"><span class="kv-key">\${k}</span><span class="kv-val">\${v || '—'}</span></div>
    \`).join('');
  }

  async function initTimestamp() {
    setLoading('settings-response');
    const data = await api('/sync/init-timestamp', 'POST');
    showResponse('settings-response', data, data?.error ? 'err' : 'ok');
  }

  async function clearCache() {
    setLoading('cache-response');
    const data = await api('/cache/clear-tokens', 'POST');
    showResponse('cache-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── INIT ─────────────────────────────────────────────────
  if (WORKER_URL) loadOverview();
</script>`;
  initDashboard();
});

function initDashboard() {
// ─── STATE ────────────────────────────────────────────────
  let WORKER_URL = localStorage.getItem('sc_worker_url') || '';

  // Init
  document.getElementById('worker-url').value = WORKER_URL;
  document.getElementById('settings-worker-url').value = WORKER_URL;
  document.getElementById('dashboard-key').value = DASHBOARD_KEY;
  document.getElementById('settings-dashboard-key').value = DASHBOARD_KEY;
  document.getElementById('sidebar-url').textContent = WORKER_URL || 'not configured';

  function saveConfig() {
    const url = (document.getElementById('worker-url').value || document.getElementById('settings-worker-url').value).trim().replace(/\/$/, '');
    const key = (document.getElementById('dashboard-key').value || document.getElementById('settings-dashboard-key').value || '').trim();
    WORKER_URL = url;
    DASHBOARD_KEY = key;
    localStorage.setItem('sc_worker_url', url);
    localStorage.setItem('sc_dashboard_key', key);
    document.getElementById('worker-url').value = url;
    document.getElementById('settings-worker-url').value = url;
    document.getElementById('dashboard-key').value = key;
    document.getElementById('settings-dashboard-key').value = key;
    document.getElementById('sidebar-url').textContent = url || 'not configured';
    document.getElementById('config-status').textContent = '✓ saved';
    setTimeout(() => document.getElementById('config-status').textContent = '', 2000);
    loadOverview();
  }

  // ─── NAV ──────────────────────────────────────────────────
  const TITLES = { overview: 'Overview', sync: 'Sync', inspect: 'Inspect', properties: 'Properties', collections: 'Collections', settings: 'Settings' };

  function switchTab(tab, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    el.classList.add('active');
    document.getElementById('page-title').textContent = TITLES[tab];
    if (tab === 'overview') loadOverview();
    if (tab === 'collections') loadCounts();
  }

  // ─── API CALL ─────────────────────────────────────────────
  let DASHBOARD_KEY = localStorage.getItem('sc_dashboard_key') || '';

  async function api(path, method = 'GET') {
    if (!WORKER_URL) return { error: 'Worker URL not configured. Set it in the config bar above.' };
    try {
      const separator = path.includes('?') ? '&' : '?';
      const r = await fetch(WORKER_URL + path + separator + 'key=' + encodeURIComponent(DASHBOARD_KEY), { method });
      const text = await r.text();
      try { return JSON.parse(text); } catch { return { raw: text }; }
    } catch(e) {
      return { error: e.message };
    }
  }

  function showResponse(panelId, data, status = 'ok') {
    const panel = document.getElementById(panelId);
    panel.classList.add('visible');
    panel.innerHTML = `
      <div class="response-header">
        <span class="response-label">Response</span>
        <span class="response-status ${status}">${status === 'loading' ? '● loading' : status === 'err' ? '✕ error' : '✓ ok'}</span>
      </div>
      <div class="response-body">${JSON.stringify(data, null, 2)}</div>
    `;
  }

  function setLoading(panelId) {
    const panel = document.getElementById(panelId);
    panel.classList.add('visible');
    panel.innerHTML = `
      <div class="response-header">
        <span class="response-label">Response</span>
        <span class="response-status loading">● loading</span>
      </div>
      <div class="response-body" style="color:var(--muted);">Waiting for worker...</div>
    `;
  }

  // ─── OVERVIEW ─────────────────────────────────────────────
  async function loadOverview() {
    if (!WORKER_URL) return;

    // Health
    const health = await api('/health');
    if (health && !health.error) {
      document.getElementById('stat-tagged').textContent = health.guestyTagged ?? '—';
      document.getElementById('stat-mtl').textContent = health.webflow?.multiUnits ?? '—';
      document.getElementById('stat-singles').textContent = health.webflow?.singleUnits ?? '—';
      const total = (health.webflow?.multiUnits || 0) + (health.webflow?.singleUnits || 0);
      document.getElementById('stat-webflow').textContent = total || '—';

      const renderTime = (ts) => {
        if (!ts) return '—';
        const d = new Date(ts);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      };
      const ago = (ts) => {
        if (!ts) return '';
        const diff = Date.now() - new Date(ts);
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        if (h > 24) return `${Math.floor(h/24)}d ago`;
        if (h > 0) return `${h}h ${m}m ago`;
        return `${m}m ago`;
      };

      document.getElementById('stat-last-smart').textContent = renderTime(health.lastSync?.smart);
      document.getElementById('stat-last-smart-ago').textContent = ago(health.lastSync?.smart);
      document.getElementById('stat-last-full').textContent = renderTime(health.lastSync?.full);
      document.getElementById('stat-last-full-ago').textContent = ago(health.lastSync?.full);
      document.getElementById('stat-last-price').textContent = renderTime(health.lastSync?.price);
      document.getElementById('stat-last-price-ago').textContent = ago(health.lastSync?.price);

      document.getElementById('last-sync-label').textContent = ago(health.lastSync?.smart) || 'never synced';

      // Health table
      const kvs = [
        ['Guesty Token', health.guestyToken ? '✓ active' : '✕ missing'],
        ['Webflow Token', health.webflowToken ? '✓ active' : '✕ missing'],
        ['Tagged Listings', health.guestyTagged],
        ['Multi Units (WF)', health.webflow?.multiUnits],
        ['Single Units (WF)', health.webflow?.singleUnits],
        ['Reviews (WF)', health.webflow?.reviews],
        ['Amenities (WF)', health.webflow?.amenities],
      ];
      document.getElementById('health-output').innerHTML = kvs.map(([k, v]) => `
        <div class="kv-row"><span class="kv-key">${k}</span><span class="kv-val">${v ?? '—'}</span></div>
      `).join('');
    }
  }

  // ─── QUICK SYNC ───────────────────────────────────────────
  async function runSync(type, btn) {
    setLoading('overview-response');
    btn.disabled = true;
    const data = await api('/sync/' + type, 'POST');
    btn.disabled = false;
    showResponse('overview-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── FULL SYNC STEPS ──────────────────────────────────────
  const STEPS = ['cities', 'buildings', 'amenities', 'tags', 'units', 'reviews', 'counts'];

  function setStep(name, state, result = '') {
    const icon = document.querySelector(`#step-${name} .step-icon`);
    if (icon) {
      icon.className = `step-icon ${state}`;
      icon.textContent = state === 'done' ? '✓' : state === 'error' ? '✕' : state === 'running' ? '◌' : icon.textContent;
    }
    const res = document.getElementById(`step-${name}-result`);
    if (res && result) res.textContent = result;
  }

  async function runFullSync() {
    STEPS.forEach(s => setStep(s, 'pending', '—'));

    for (const step of STEPS) {
      setStep(step, 'running');
      const data = await api('/sync/' + step, 'POST');
      if (data?.error) {
        setStep(step, 'error', data.error.substring(0, 60));
      } else {
        const result = data?.processed !== undefined
          ? `${data.processed} processed, ${data.errors || 0} errors`
          : data?.synced !== undefined ? `${data.synced} synced`
          : '✓';
        setStep(step, 'done', result);
      }
    }
  }

  // ─── INDIVIDUAL SYNC ──────────────────────────────────────
  async function runIndividualSync() {
    const col = document.getElementById('ind-collection').value;
    const offset = document.getElementById('ind-offset').value;
    const batch = document.getElementById('ind-batchsize').value;
    setLoading('ind-response');
    const data = await api(`/sync/${col}?offset=${offset}&batchSize=${batch}`, 'POST');
    showResponse('ind-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── FIELD SYNC ───────────────────────────────────────────
  async function runFieldSync() {
    const field = document.getElementById('field-name').value;
    const id = document.getElementById('field-listing-id').value.trim();
    const path = id ? `/sync/field/${field}/${id}` : `/sync/field/${field}/all`;
    setLoading('field-response');
    const data = await api(path, 'POST');
    showResponse('field-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── SINGLE SYNC ──────────────────────────────────────────
  async function runSingleSync() {
    const id = document.getElementById('single-listing-id').value.trim();
    if (!id) { alert('Enter a Guesty listing ID'); return; }
    setLoading('single-response');
    const data = await api(`/sync/listing/${id}`, 'POST');
    showResponse('single-response', data, data?.error ? 'err' : 'ok');
  }

  async function runSingleReviews() {
    const id = document.getElementById('single-listing-id').value.trim();
    if (!id) { alert('Enter a Guesty listing ID'); return; }
    setLoading('single-response');
    const data = await api(`/sync/reviews/${id}`, 'POST');
    showResponse('single-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── INSPECT ──────────────────────────────────────────────
  async function runInspect(endpoint, panelId) {
    setLoading(panelId);
    const data = await api(`/inspect/${endpoint}`);
    showResponse(panelId, data, data?.error ? 'err' : 'ok');
  }

  async function runInspect2(endpoint, panelId) {
    setLoading(panelId);
    const data = await api(`/${endpoint}`);
    showResponse(panelId, data, data?.error ? 'err' : 'ok');
  }

  async function runListingLookup() {
    const id = document.getElementById('lookup-id').value.trim();
    const view = document.getElementById('lookup-view').value;
    if (!id) { alert('Enter a Guesty listing ID'); return; }
    setLoading('lookup-response');
    const data = await api(`/inspect/listing/${id}${view}`);
    showResponse('lookup-response', data, data?.error ? 'err' : 'ok');
  }

  async function runBrowse() {
    const col = document.getElementById('browse-collection').value;
    setLoading('browse-response');
    const data = await api(`/inspect/${col}`);
    showResponse('browse-response', data, data?.error ? 'err' : 'ok');
  }

  async function loadDiagnostics() {
    const endpoints = [
      ['diff', 'diag-diff'],
      ['orphans', 'diag-orphans'],
      ['missing-images', 'diag-images'],
      ['missing-prices', 'diag-prices'],
      ['missing-descriptions', 'diag-desc'],
      ['missing-icons', 'diag-icons'],
      ['broken-refs', 'diag-refs'],
    ];
    for (const [ep, el] of endpoints) {
      const data = await api(`/inspect/${ep}`);
      const el2 = document.getElementById(el);
      if (el2) {
        const count = data?.count ?? data?.total ?? data?.missing?.length ?? (Array.isArray(data) ? data.length : '—');
        el2.textContent = count;
        el2.style.color = count > 0 ? 'var(--yellow)' : 'var(--green)';
      }
    }
  }

  // ─── PROPERTIES ───────────────────────────────────────────
  async function loadProperties() {
    const data = await api('/webflow/units');
    if (!data || data.error) return;

    const units = [...(data.multiUnits?.items || []), ...(data.singleUnits?.items || [])];
    const tbody = document.getElementById('properties-tbody');

    if (!units.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty">No units found</td></tr>';
      return;
    }

    const cityFilter = document.getElementById('prop-filter-city').value;
    const typeFilter = document.getElementById('prop-filter-type').value;

    const filtered = units.filter(u => {
      if (cityFilter && u.city !== cityFilter) return false;
      if (typeFilter && u.type !== typeFilter) return false;
      return true;
    });

    tbody.innerHTML = filtered.map(u => `
      <tr>
        <td>${u.name || '—'}</td>
        <td><span class="badge ${u.type === 'MTL' ? 'badge-blue' : 'badge-muted'}">${u.type || '—'}</span></td>
        <td>${u.city || '—'}</td>
        <td><span class="badge ${u.isActive ? 'badge-green' : 'badge-red'}">${u.isActive ? 'active' : 'inactive'}</span></td>
        <td>${u.lastSynced ? new Date(u.lastSynced).toLocaleDateString('en-GB') : '—'}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="syncOne('${u.guestyId}')">Sync</button>
        </td>
      </tr>
    `).join('');
  }

  async function syncOne(id) {
    setLoading('prop-response');
    const data = await api(`/sync/listing/${id}`, 'POST');
    showResponse('prop-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── COLLECTIONS ──────────────────────────────────────────
  async function loadCounts() {
    const data = await api('/webflow/counts');
    if (!data || data.error) return;
    const map = {
      'multi-units': 'cnt-mtl',
      'single-units': 'cnt-singles',
      'reviews': 'cnt-reviews',
      'amenities': 'cnt-amenities',
      'tags': 'cnt-tags',
      'cities': 'cnt-cities',
      'buildings': 'cnt-buildings',
    };
    for (const [key, elId] of Object.entries(map)) {
      const el = document.getElementById(elId);
      if (el) el.textContent = data[key] ?? data.counts?.[key] ?? '—';
    }
  }

  async function runItemAction(action) {
    const id = document.getElementById('item-guesty-id').value.trim();
    if (!id) { alert('Enter a Guesty ID'); return; }
    setLoading('item-response');
    let data;
    if (action === 'get') data = await api(`/webflow/item/guesty-id/${id}`);
    else if (action === 'publish') data = await api(`/webflow/publish/${id}`, 'POST');
    else if (action === 'unpublish') data = await api(`/webflow/unpublish/${id}`, 'POST');
    showResponse('item-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── SETTINGS ─────────────────────────────────────────────
  async function loadSyncStatus() {
    const data = await api('/sync/status');
    if (!data || data.error) return;
    const keys = Object.entries(data).filter(([k]) => !k.startsWith('_'));
    document.getElementById('kv-timestamps').innerHTML = keys.map(([k, v]) => `
      <div class="kv-row"><span class="kv-key">${k}</span><span class="kv-val">${v || '—'}</span></div>
    `).join('');
  }

  async function initTimestamp() {
    setLoading('settings-response');
    const data = await api('/sync/init-timestamp', 'POST');
    showResponse('settings-response', data, data?.error ? 'err' : 'ok');
  }

  async function clearCache() {
    setLoading('cache-response');
    const data = await api('/cache/clear-tokens', 'POST');
    showResponse('cache-response', data, data?.error ? 'err' : 'ok');
  }

  // ─── INIT ─────────────────────────────────────────────────
  if (WORKER_URL) loadOverview();
  // Init
  if (WORKER_URL) loadOverview();
}
