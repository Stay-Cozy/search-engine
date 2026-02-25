// StayCozy Dashboard
(function() {
  var el = document.getElementById('sc-dashboard');
  if (!el) return;
  el.innerHTML = "<!-- SIDEBAR -->\n<aside class=\"sidebar\">\n  <div class=\"logo\">\n    <div class=\"logo-mark\">StayCozy</div>\n    <div class=\"logo-sub\">sync dashboard v6.0</div>\n  </div>\n\n  <nav class=\"nav\">\n    <div class=\"nav-section\">\n      <div class=\"nav-label\">Main</div>\n      <button class=\"nav-item active\" onclick=\"switchTab('overview', this)\">\n        <span class=\"nav-dot\"></span> Overview\n      </button>\n      <button class=\"nav-item\" onclick=\"switchTab('sync', this)\">\n        <span class=\"nav-dot\"></span> Sync\n      </button>\n      <button class=\"nav-item\" onclick=\"switchTab('inspect', this)\">\n        <span class=\"nav-dot\"></span> Inspect\n      </button>\n    </div>\n    <div class=\"nav-section\">\n      <div class=\"nav-label\">Data</div>\n      <button class=\"nav-item\" onclick=\"switchTab('properties', this)\">\n        <span class=\"nav-dot\"></span> Properties\n      </button>\n      <button class=\"nav-item\" onclick=\"switchTab('collections', this)\">\n        <span class=\"nav-dot\"></span> Collections\n      </button>\n    </div>\n    <div class=\"nav-section\">\n      <div class=\"nav-label\">System</div>\n      <button class=\"nav-item\" onclick=\"switchTab('settings', this)\">\n        <span class=\"nav-dot\"></span> Settings\n      </button>\n    </div>\n  </nav>\n\n  <div class=\"sidebar-footer\">\n    <div class=\"worker-url\" id=\"sidebar-url\">not configured</div>\n  </div>\n</aside>\n\n<!-- MAIN -->\n<main class=\"main\">\n  <div class=\"topbar\">\n    <div class=\"page-title\" id=\"page-title\">Overview</div>\n    <div style=\"display:flex;gap:10px;align-items:center;\">\n      <div class=\"status-pill\">\n        <span class=\"pulse\"></span>\n        <span id=\"last-sync-label\">checking...</span>\n      </div>\n      <button class=\"btn btn-ghost btn-sm\" onclick=\"loadOverview()\">\u21bb Refresh</button>\n    </div>\n  </div>\n\n  <div class=\"content\">\n\n    <!-- WORKER CONFIG BAR (always visible) -->\n    <div class=\"config-bar\">\n      <label>WORKER URL</label>\n      <input type=\"text\" id=\"worker-url\" placeholder=\"https://your-worker.workers.dev\" style=\"max-width:300px;\">\n      <label>SECRET KEY</label>\n      <input type=\"password\" id=\"dashboard-key\" placeholder=\"Dashboard key\" style=\"max-width:180px;\">\n      <button class=\"btn btn-primary btn-sm\" onclick=\"saveConfig()\">Connect</button>\n      <span id=\"config-status\" style=\"font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);\"></span>\n    </div>\n\n    <!-- \u2500\u2500\u2500 OVERVIEW \u2500\u2500\u2500 -->\n    <div id=\"tab-overview\" class=\"tab-content active\">\n      <div class=\"grid-4\">\n        <div class=\"card\">\n          <div class=\"card-label\">Tagged in Guesty</div>\n          <div class=\"card-value accent\" id=\"stat-tagged\">\u2014</div>\n          <div class=\"card-sub\">website tag</div>\n        </div>\n        <div class=\"card\">\n          <div class=\"card-label\">In Webflow</div>\n          <div class=\"card-value green\" id=\"stat-webflow\">\u2014</div>\n          <div class=\"card-sub\">published units</div>\n        </div>\n        <div class=\"card\">\n          <div class=\"card-label\">MTL Units</div>\n          <div class=\"card-value\" id=\"stat-mtl\">\u2014</div>\n          <div class=\"card-sub\">multi-unit listings</div>\n        </div>\n        <div class=\"card\">\n          <div class=\"card-label\">Singles</div>\n          <div class=\"card-value\" id=\"stat-singles\">\u2014</div>\n          <div class=\"card-sub\">single listings</div>\n        </div>\n      </div>\n\n      <div class=\"grid-3\">\n        <div class=\"card\">\n          <div class=\"card-label\">Last Smart Sync</div>\n          <div class=\"card-value accent\" id=\"stat-last-smart\" style=\"font-size:15px;margin-bottom:4px;\">\u2014</div>\n          <div class=\"card-sub\" id=\"stat-last-smart-ago\"></div>\n        </div>\n        <div class=\"card\">\n          <div class=\"card-label\">Last Full Sync</div>\n          <div class=\"card-value accent\" id=\"stat-last-full\" style=\"font-size:15px;margin-bottom:4px;\">\u2014</div>\n          <div class=\"card-sub\" id=\"stat-last-full-ago\"></div>\n        </div>\n        <div class=\"card\">\n          <div class=\"card-label\">Last Price Sync</div>\n          <div class=\"card-value accent\" id=\"stat-last-price\" style=\"font-size:15px;margin-bottom:4px;\">\u2014</div>\n          <div class=\"card-sub\" id=\"stat-last-price-ago\"></div>\n        </div>\n      </div>\n\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Quick Actions</div>\n        </div>\n        <div style=\"display:flex;gap:10px;flex-wrap:wrap;\">\n          <button class=\"btn btn-primary\" onclick=\"runSync('smart', this)\">\u25b6 Smart Sync</button>\n          <button class=\"btn btn-ghost\" onclick=\"runSync('prices', this)\">\u25b6 Price Sync</button>\n          <button class=\"btn btn-ghost\" onclick=\"runSync('reviews', this)\">\u25b6 Reviews Sync</button>\n          <button class=\"btn btn-ghost\" onclick=\"runSync('counts', this)\">\u21bb Recalculate Counts</button>\n        </div>\n        <div id=\"overview-response\" class=\"response-panel\"></div>\n      </div>\n\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Health</div>\n        </div>\n        <div id=\"health-output\" class=\"table-wrap\">\n          <div class=\"empty\">Click refresh to load health status</div>\n        </div>\n      </div>\n    </div>\n\n    <!-- \u2500\u2500\u2500 SYNC \u2500\u2500\u2500 -->\n    <div id=\"tab-sync\" class=\"tab-content\">\n\n      <!-- FULL SYNC -->\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Full Sync</div>\n        </div>\n        <div class=\"card\">\n          <p style=\"font-size:12px;color:var(--muted);margin-bottom:16px;font-family:'DM Mono',monospace;line-height:1.6;\">\n            Runs all steps in sequence: Cities \u2192 Buildings \u2192 Amenities \u2192 Tags \u2192 Units \u2192 Reviews \u2192 Counts. Use for initial setup or full recovery.\n          </p>\n          <div style=\"display:flex;gap:10px;align-items:center;flex-wrap:wrap;\">\n            <button class=\"btn btn-primary\" onclick=\"runFullSync()\">\u25b6 Run Full Sync</button>\n            <span style=\"font-size:11px;font-family:'DM Mono',monospace;color:var(--muted);\">Batch size: 10 per step</span>\n          </div>\n          <div style=\"margin-top:20px;\" id=\"full-sync-steps\">\n            <div class=\"sync-steps\">\n              <div class=\"sync-step\" id=\"step-cities\"><span class=\"step-icon pending\">1</span><span class=\"step-name\">Cities</span><span class=\"step-result\" id=\"step-cities-result\">\u2014</span></div>\n              <div class=\"sync-step\" id=\"step-buildings\"><span class=\"step-icon pending\">2</span><span class=\"step-name\">Buildings</span><span class=\"step-result\" id=\"step-buildings-result\">\u2014</span></div>\n              <div class=\"sync-step\" id=\"step-amenities\"><span class=\"step-icon pending\">3</span><span class=\"step-name\">Amenities</span><span class=\"step-result\" id=\"step-amenities-result\">\u2014</span></div>\n              <div class=\"sync-step\" id=\"step-tags\"><span class=\"step-icon pending\">4</span><span class=\"step-name\">Tags</span><span class=\"step-result\" id=\"step-tags-result\">\u2014</span></div>\n              <div class=\"sync-step\" id=\"step-units\"><span class=\"step-icon pending\">5</span><span class=\"step-name\">Units</span><span class=\"step-result\" id=\"step-units-result\">\u2014</span></div>\n              <div class=\"sync-step\" id=\"step-reviews\"><span class=\"step-icon pending\">6</span><span class=\"step-name\">Reviews</span><span class=\"step-result\" id=\"step-reviews-result\">\u2014</span></div>\n              <div class=\"sync-step\" id=\"step-counts\"><span class=\"step-icon pending\">7</span><span class=\"step-name\">Property Counts</span><span class=\"step-result\" id=\"step-counts-result\">\u2014</span></div>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"divider\"></div>\n\n      <!-- INDIVIDUAL SYNCS -->\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Individual Syncs</div>\n        </div>\n        <div class=\"card\">\n          <div class=\"form-row\">\n            <div class=\"form-group\" style=\"max-width:180px;\">\n              <label>Collection</label>\n              <select id=\"ind-collection\">\n                <option value=\"cities\">Cities</option>\n                <option value=\"buildings\">Buildings</option>\n                <option value=\"amenities\">Amenities</option>\n                <option value=\"tags\">Tags</option>\n                <option value=\"units\">All Units</option>\n                <option value=\"mtl\">MTL Only</option>\n                <option value=\"singles\">Singles Only</option>\n                <option value=\"reviews\">Reviews</option>\n                <option value=\"prices\">Prices</option>\n                <option value=\"counts\">Counts</option>\n              </select>\n            </div>\n            <div class=\"form-group\" style=\"max-width:100px;\">\n              <label>Offset</label>\n              <input type=\"number\" id=\"ind-offset\" value=\"0\" min=\"0\">\n            </div>\n            <div class=\"form-group\" style=\"max-width:100px;\">\n              <label>Batch Size</label>\n              <input type=\"number\" id=\"ind-batchsize\" value=\"10\" min=\"1\" max=\"50\">\n            </div>\n            <button class=\"btn btn-primary\" onclick=\"runIndividualSync()\">\u25b6 Run</button>\n          </div>\n          <div id=\"ind-response\" class=\"response-panel\"></div>\n        </div>\n      </div>\n\n      <div class=\"divider\"></div>\n\n      <!-- FIELD SYNC -->\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Field-Level Sync</div>\n        </div>\n        <div class=\"card\">\n          <div class=\"form-row\">\n            <div class=\"form-group\" style=\"max-width:180px;\">\n              <label>Field</label>\n              <select id=\"field-name\">\n                <option value=\"price\">Price</option>\n                <option value=\"descriptions\">Descriptions</option>\n                <option value=\"images\">Images</option>\n                <option value=\"amenities\">Amenities</option>\n                <option value=\"specs\">Specs</option>\n                <option value=\"checkinout\">Check-in/out</option>\n                <option value=\"location\">Location</option>\n                <option value=\"status\">Status</option>\n              </select>\n            </div>\n            <div class=\"form-group\">\n              <label>Guesty ID (leave blank for all)</label>\n              <input type=\"text\" id=\"field-listing-id\" placeholder=\"e.g. 6861483c1e2fda0013d20e43\">\n            </div>\n            <button class=\"btn btn-primary\" onclick=\"runFieldSync()\">\u25b6 Sync Field</button>\n          </div>\n          <div id=\"field-response\" class=\"response-panel\"></div>\n        </div>\n      </div>\n\n      <div class=\"divider\"></div>\n\n      <!-- SINGLE PROPERTY -->\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Single Property Sync</div>\n        </div>\n        <div class=\"card\">\n          <div class=\"form-row\">\n            <div class=\"form-group\">\n              <label>Guesty Listing ID</label>\n              <input type=\"text\" id=\"single-listing-id\" placeholder=\"e.g. 6861483c1e2fda0013d20e43\">\n            </div>\n            <button class=\"btn btn-primary\" onclick=\"runSingleSync()\">\u25b6 Sync Property</button>\n            <button class=\"btn btn-ghost\" onclick=\"runSingleReviews()\">\u25b6 Sync Reviews</button>\n          </div>\n          <div id=\"single-response\" class=\"response-panel\"></div>\n        </div>\n      </div>\n    </div>\n\n    <!-- \u2500\u2500\u2500 INSPECT \u2500\u2500\u2500 -->\n    <div id=\"tab-inspect\" class=\"tab-content\">\n\n      <!-- DIAGNOSTICS -->\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Diagnostics</div>\n          <button class=\"btn btn-ghost btn-sm\" onclick=\"loadDiagnostics()\">\u21bb Load All</button>\n        </div>\n        <div class=\"inspect-grid\" id=\"diagnostics-grid\">\n          <div class=\"inspect-card\" onclick=\"runInspect('diff', 'inspect-response')\">\n            <div class=\"inspect-card-title\">Diff</div>\n            <div class=\"inspect-card-desc\">Guesty tagged vs Webflow \u2014 missing + stale</div>\n            <div class=\"inspect-card-count\" id=\"diag-diff\">\u2014</div>\n          </div>\n          <div class=\"inspect-card\" onclick=\"runInspect('orphans', 'inspect-response')\">\n            <div class=\"inspect-card-title\">Orphans</div>\n            <div class=\"inspect-card-desc\">Webflow items with no matching Guesty listing</div>\n            <div class=\"inspect-card-count\" id=\"diag-orphans\">\u2014</div>\n          </div>\n          <div class=\"inspect-card\" onclick=\"runInspect('missing-images', 'inspect-response')\">\n            <div class=\"inspect-card-title\">Missing Images</div>\n            <div class=\"inspect-card-desc\">Units with no main image set</div>\n            <div class=\"inspect-card-count\" id=\"diag-images\">\u2014</div>\n          </div>\n          <div class=\"inspect-card\" onclick=\"runInspect('missing-prices', 'inspect-response')\">\n            <div class=\"inspect-card-title\">Missing Prices</div>\n            <div class=\"inspect-card-desc\">Units with null or zero price</div>\n            <div class=\"inspect-card-count\" id=\"diag-prices\">\u2014</div>\n          </div>\n          <div class=\"inspect-card\" onclick=\"runInspect('missing-descriptions', 'inspect-response')\">\n            <div class=\"inspect-card-title\">Missing Descriptions</div>\n            <div class=\"inspect-card-desc\">Units with empty description-summary</div>\n            <div class=\"inspect-card-count\" id=\"diag-desc\">\u2014</div>\n          </div>\n          <div class=\"inspect-card\" onclick=\"runInspect('missing-icons', 'inspect-response')\">\n            <div class=\"inspect-card-title\">Missing Icons</div>\n            <div class=\"inspect-card-desc\">Amenities with no icon-class set</div>\n            <div class=\"inspect-card-count\" id=\"diag-icons\">\u2014</div>\n          </div>\n          <div class=\"inspect-card\" onclick=\"runInspect('broken-refs', 'inspect-response')\">\n            <div class=\"inspect-card-title\">Broken Refs</div>\n            <div class=\"inspect-card-desc\">Units with missing city or building reference</div>\n            <div class=\"inspect-card-count\" id=\"diag-refs\">\u2014</div>\n          </div>\n          <div class=\"inspect-card\" onclick=\"runInspect('orphans', 'inspect-response')\">\n            <div class=\"inspect-card-title\">Webflow Overview</div>\n            <div class=\"inspect-card-desc\">Counts across all collections</div>\n            <div class=\"inspect-card-count\" id=\"diag-wf\">\u2014</div>\n          </div>\n        </div>\n        <div id=\"inspect-response\" class=\"response-panel\"></div>\n      </div>\n\n      <div class=\"divider\"></div>\n\n      <!-- LISTING LOOKUP -->\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Listing Lookup</div>\n        </div>\n        <div class=\"card\">\n          <div class=\"form-row\">\n            <div class=\"form-group\">\n              <label>Guesty Listing ID</label>\n              <input type=\"text\" id=\"lookup-id\" placeholder=\"e.g. 6861483c1e2fda0013d20e43\">\n            </div>\n            <div class=\"form-group\" style=\"max-width:160px;\">\n              <label>View</label>\n              <select id=\"lookup-view\">\n                <option value=\"\">Raw Data</option>\n                <option value=\"/map\">Map Output</option>\n                <option value=\"/calendar\">Calendar</option>\n                <option value=\"/price\">Price</option>\n                <option value=\"/reviews\">Reviews</option>\n                <option value=\"/amenities\">Amenities</option>\n                <option value=\"/children\">Children</option>\n              </select>\n            </div>\n            <button class=\"btn btn-primary\" onclick=\"runListingLookup()\">Inspect</button>\n          </div>\n          <div id=\"lookup-response\" class=\"response-panel\"></div>\n        </div>\n      </div>\n\n      <div class=\"divider\"></div>\n\n      <!-- COLLECTION BROWSE -->\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Browse Collections</div>\n        </div>\n        <div class=\"card\">\n          <div class=\"form-row\">\n            <div class=\"form-group\" style=\"max-width:200px;\">\n              <label>Collection</label>\n              <select id=\"browse-collection\">\n                <option value=\"overview\">Overview</option>\n                <option value=\"mtl\">MTL Listings</option>\n                <option value=\"singles\">Single Listings</option>\n                <option value=\"complexes\">Complexes</option>\n                <option value=\"untagged\">Untagged</option>\n                <option value=\"cities\">Cities (Webflow)</option>\n                <option value=\"buildings\">Buildings (Guesty)</option>\n                <option value=\"amenity-groups\">Amenity Groups</option>\n              </select>\n            </div>\n            <button class=\"btn btn-primary\" onclick=\"runBrowse()\">Browse</button>\n          </div>\n          <div id=\"browse-response\" class=\"response-panel\"></div>\n        </div>\n      </div>\n    </div>\n\n    <!-- \u2500\u2500\u2500 PROPERTIES \u2500\u2500\u2500 -->\n    <div id=\"tab-properties\" class=\"tab-content\">\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Webflow Units</div>\n          <div style=\"display:flex;gap:10px;\">\n            <button class=\"btn btn-ghost btn-sm\" onclick=\"loadProperties()\">\u21bb Load</button>\n          </div>\n        </div>\n        <div style=\"display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;\">\n          <select id=\"prop-filter-city\" style=\"max-width:160px;\">\n            <option value=\"\">All Cities</option>\n            <option value=\"Miami\">Miami</option>\n            <option value=\"Philadelphia\">Philadelphia</option>\n            <option value=\"London\">London</option>\n          </select>\n          <select id=\"prop-filter-type\" style=\"max-width:160px;\">\n            <option value=\"\">All Types</option>\n            <option value=\"MTL\">MTL</option>\n            <option value=\"SINGLE\">Single</option>\n          </select>\n        </div>\n        <div class=\"table-wrap\">\n          <table>\n            <thead>\n              <tr>\n                <th>Name</th>\n                <th>Type</th>\n                <th>City</th>\n                <th>Status</th>\n                <th>Last Synced</th>\n                <th>Actions</th>\n              </tr>\n            </thead>\n            <tbody id=\"properties-tbody\">\n              <tr><td colspan=\"6\" class=\"empty\">Click Load to fetch properties</td></tr>\n            </tbody>\n          </table>\n        </div>\n        <div id=\"prop-response\" class=\"response-panel\"></div>\n      </div>\n    </div>\n\n    <!-- \u2500\u2500\u2500 COLLECTIONS \u2500\u2500\u2500 -->\n    <div id=\"tab-collections\" class=\"tab-content\">\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Webflow Collection Counts</div>\n          <button class=\"btn btn-ghost btn-sm\" onclick=\"loadCounts()\">\u21bb Load</button>\n        </div>\n        <div class=\"grid-3\" id=\"collection-counts\">\n          <div class=\"card\"><div class=\"card-label\">Multi Units</div><div class=\"card-value\" id=\"cnt-mtl\">\u2014</div></div>\n          <div class=\"card\"><div class=\"card-label\">Single Units</div><div class=\"card-value\" id=\"cnt-singles\">\u2014</div></div>\n          <div class=\"card\"><div class=\"card-label\">Reviews</div><div class=\"card-value\" id=\"cnt-reviews\">\u2014</div></div>\n          <div class=\"card\"><div class=\"card-label\">Amenities</div><div class=\"card-value\" id=\"cnt-amenities\">\u2014</div></div>\n          <div class=\"card\"><div class=\"card-label\">Tags</div><div class=\"card-value\" id=\"cnt-tags\">\u2014</div></div>\n          <div class=\"card\"><div class=\"card-label\">Cities</div><div class=\"card-value\" id=\"cnt-cities\">\u2014</div></div>\n          <div class=\"card\"><div class=\"card-label\">Buildings</div><div class=\"card-value\" id=\"cnt-buildings\">\u2014</div></div>\n        </div>\n      </div>\n\n      <div class=\"divider\"></div>\n\n      <!-- WEBFLOW ITEM ACTIONS -->\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Item Actions</div>\n        </div>\n        <div class=\"card\">\n          <div class=\"form-row\">\n            <div class=\"form-group\">\n              <label>Guesty ID</label>\n              <input type=\"text\" id=\"item-guesty-id\" placeholder=\"Guesty listing ID\">\n            </div>\n            <button class=\"btn btn-ghost\" onclick=\"runItemAction('get')\">View</button>\n            <button class=\"btn btn-green\" onclick=\"runItemAction('publish')\">Publish</button>\n            <button class=\"btn btn-danger\" onclick=\"runItemAction('unpublish')\">Unpublish</button>\n          </div>\n          <div id=\"item-response\" class=\"response-panel\"></div>\n        </div>\n      </div>\n    </div>\n\n    <!-- \u2500\u2500\u2500 SETTINGS \u2500\u2500\u2500 -->\n    <div id=\"tab-settings\" class=\"tab-content\">\n\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Sync Timestamps</div>\n          <button class=\"btn btn-ghost btn-sm\" onclick=\"loadSyncStatus()\">\u21bb Load</button>\n        </div>\n        <div class=\"card\">\n          <div id=\"kv-timestamps\">\n            <div class=\"empty\">Click Load to fetch</div>\n          </div>\n          <div style=\"margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;\">\n            <button class=\"btn btn-ghost\" onclick=\"initTimestamp()\">Initialize Timestamp (Now)</button>\n          </div>\n          <div id=\"settings-response\" class=\"response-panel\" style=\"margin-top:14px;\"></div>\n        </div>\n      </div>\n\n      <div class=\"divider\"></div>\n\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Cache</div>\n        </div>\n        <div class=\"card\">\n          <div class=\"form-row\">\n            <button class=\"btn btn-danger\" onclick=\"clearCache()\">Clear Token Cache</button>\n            <button class=\"btn btn-ghost\" onclick=\"runInspect2('cache/status', 'cache-response')\">View Cache Status</button>\n          </div>\n          <div id=\"cache-response\" class=\"response-panel\"></div>\n        </div>\n      </div>\n\n      <div class=\"divider\"></div>\n\n      <div class=\"section\">\n        <div class=\"section-header\">\n          <div class=\"section-title\">Worker Config</div>\n        </div>\n        <div class=\"card\">\n          <div class=\"form-row\" style=\"margin-bottom:16px;\">\n            <div class=\"form-group\">\n              <label>Worker URL</label>\n              <input type=\"text\" id=\"settings-worker-url\" placeholder=\"https://your-worker.workers.dev\">\n            </div>\n            <div class=\"form-group\" style=\"max-width:240px;\">\n              <label>Secret Key</label>\n              <input type=\"password\" id=\"settings-dashboard-key\" placeholder=\"Dashboard key\">\n            </div>\n            <button class=\"btn btn-primary\" onclick=\"saveConfig()\">Save</button>\n          </div>\n          <p style=\"font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;line-height:1.6;\">\n            The worker URL is stored in your browser's localStorage. It is never sent anywhere except directly to your worker.\n          </p>\n        </div>\n      </div>\n    </div>\n\n  </div><!-- /content -->\n</main>\n\n<script>\n  // \u2500\u2500\u2500 STATE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  let WORKER_URL = localStorage.getItem('sc_worker_url') || '';\n\n  // Init\n  document.getElementById('worker-url').value = WORKER_URL;\n  document.getElementById('settings-worker-url').value = WORKER_URL;\n  document.getElementById('dashboard-key').value = DASHBOARD_KEY;\n  document.getElementById('settings-dashboard-key').value = DASHBOARD_KEY;\n  document.getElementById('sidebar-url').textContent = WORKER_URL || 'not configured';\n\n  function saveConfig() {\n    const url = (document.getElementById('worker-url').value || document.getElementById('settings-worker-url').value).trim().replace(/\\/$/, '');\n    const key = (document.getElementById('dashboard-key').value || document.getElementById('settings-dashboard-key').value || '').trim();\n    WORKER_URL = url;\n    DASHBOARD_KEY = key;\n    localStorage.setItem('sc_worker_url', url);\n    localStorage.setItem('sc_dashboard_key', key);\n    document.getElementById('worker-url').value = url;\n    document.getElementById('settings-worker-url').value = url;\n    document.getElementById('dashboard-key').value = key;\n    document.getElementById('settings-dashboard-key').value = key;\n    document.getElementById('sidebar-url').textContent = url || 'not configured';\n    document.getElementById('config-status').textContent = '\u2713 saved';\n    setTimeout(() => document.getElementById('config-status').textContent = '', 2000);\n    loadOverview();\n  }\n\n  // \u2500\u2500\u2500 NAV \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  const TITLES = { overview: 'Overview', sync: 'Sync', inspect: 'Inspect', properties: 'Properties', collections: 'Collections', settings: 'Settings' };\n\n  function switchTab(tab, el) {\n    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));\n    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));\n    document.getElementById('tab-' + tab).classList.add('active');\n    el.classList.add('active');\n    document.getElementById('page-title').textContent = TITLES[tab];\n    if (tab === 'overview') loadOverview();\n    if (tab === 'collections') loadCounts();\n  }\n\n  // \u2500\u2500\u2500 API CALL \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  let DASHBOARD_KEY = localStorage.getItem('sc_dashboard_key') || '';\n\n  async function api(path, method = 'GET') {\n    if (!WORKER_URL) return { error: 'Worker URL not configured. Set it in the config bar above.' };\n    try {\n      const separator = path.includes('?') ? '&' : '?';\n      const r = await fetch(WORKER_URL + path + separator + 'key=' + encodeURIComponent(DASHBOARD_KEY), { method });\n      const text = await r.text();\n      try { return JSON.parse(text); } catch { return { raw: text }; }\n    } catch(e) {\n      return { error: e.message };\n    }\n  }\n\n  function showResponse(panelId, data, status = 'ok') {\n    const panel = document.getElementById(panelId);\n    panel.classList.add('visible');\n    panel.innerHTML = `\n      <div class=\"response-header\">\n        <span class=\"response-label\">Response</span>\n        <span class=\"response-status ${status}\">${status === 'loading' ? '\u25cf loading' : status === 'err' ? '\u2715 error' : '\u2713 ok'}</span>\n      </div>\n      <div class=\"response-body\">${JSON.stringify(data, null, 2)}</div>\n    `;\n  }\n\n  function setLoading(panelId) {\n    const panel = document.getElementById(panelId);\n    panel.classList.add('visible');\n    panel.innerHTML = `\n      <div class=\"response-header\">\n        <span class=\"response-label\">Response</span>\n        <span class=\"response-status loading\">\u25cf loading</span>\n      </div>\n      <div class=\"response-body\" style=\"color:var(--muted);\">Waiting for worker...</div>\n    `;\n  }\n\n  // \u2500\u2500\u2500 OVERVIEW \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  async function loadOverview() {\n    if (!WORKER_URL) return;\n\n    // Health\n    const health = await api('/health');\n    if (health && !health.error) {\n      document.getElementById('stat-tagged').textContent = health.guestyTagged ?? '\u2014';\n      document.getElementById('stat-mtl').textContent = health.webflow?.multiUnits ?? '\u2014';\n      document.getElementById('stat-singles').textContent = health.webflow?.singleUnits ?? '\u2014';\n      const total = (health.webflow?.multiUnits || 0) + (health.webflow?.singleUnits || 0);\n      document.getElementById('stat-webflow').textContent = total || '\u2014';\n\n      const renderTime = (ts) => {\n        if (!ts) return '\u2014';\n        const d = new Date(ts);\n        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });\n      };\n      const ago = (ts) => {\n        if (!ts) return '';\n        const diff = Date.now() - new Date(ts);\n        const h = Math.floor(diff / 3600000);\n        const m = Math.floor((diff % 3600000) / 60000);\n        if (h > 24) return `${Math.floor(h/24)}d ago`;\n        if (h > 0) return `${h}h ${m}m ago`;\n        return `${m}m ago`;\n      };\n\n      document.getElementById('stat-last-smart').textContent = renderTime(health.lastSync?.smart);\n      document.getElementById('stat-last-smart-ago').textContent = ago(health.lastSync?.smart);\n      document.getElementById('stat-last-full').textContent = renderTime(health.lastSync?.full);\n      document.getElementById('stat-last-full-ago').textContent = ago(health.lastSync?.full);\n      document.getElementById('stat-last-price').textContent = renderTime(health.lastSync?.price);\n      document.getElementById('stat-last-price-ago').textContent = ago(health.lastSync?.price);\n\n      document.getElementById('last-sync-label').textContent = ago(health.lastSync?.smart) || 'never synced';\n\n      // Health table\n      const kvs = [\n        ['Guesty Token', health.guestyToken ? '\u2713 active' : '\u2715 missing'],\n        ['Webflow Token', health.webflowToken ? '\u2713 active' : '\u2715 missing'],\n        ['Tagged Listings', health.guestyTagged],\n        ['Multi Units (WF)', health.webflow?.multiUnits],\n        ['Single Units (WF)', health.webflow?.singleUnits],\n        ['Reviews (WF)', health.webflow?.reviews],\n        ['Amenities (WF)', health.webflow?.amenities],\n      ];\n      document.getElementById('health-output').innerHTML = kvs.map(([k, v]) => `\n        <div class=\"kv-row\"><span class=\"kv-key\">${k}</span><span class=\"kv-val\">${v ?? '\u2014'}</span></div>\n      `).join('');\n    }\n  }\n\n  // \u2500\u2500\u2500 QUICK SYNC \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  async function runSync(type, btn) {\n    setLoading('overview-response');\n    btn.disabled = true;\n    const data = await api('/sync/' + type, 'POST');\n    btn.disabled = false;\n    showResponse('overview-response', data, data?.error ? 'err' : 'ok');\n  }\n\n  // \u2500\u2500\u2500 FULL SYNC STEPS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  const STEPS = ['cities', 'buildings', 'amenities', 'tags', 'units', 'reviews', 'counts'];\n\n  function setStep(name, state, result = '') {\n    const icon = document.querySelector(`#step-${name} .step-icon`);\n    if (icon) {\n      icon.className = `step-icon ${state}`;\n      icon.textContent = state === 'done' ? '\u2713' : state === 'error' ? '\u2715' : state === 'running' ? '\u25cc' : icon.textContent;\n    }\n    const res = document.getElementById(`step-${name}-result`);\n    if (res && result) res.textContent = result;\n  }\n\n  async function runFullSync() {\n    STEPS.forEach(s => setStep(s, 'pending', '\u2014'));\n\n    for (const step of STEPS) {\n      setStep(step, 'running');\n      const data = await api('/sync/' + step, 'POST');\n      if (data?.error) {\n        setStep(step, 'error', data.error.substring(0, 60));\n      } else {\n        const result = data?.processed !== undefined\n          ? `${data.processed} processed, ${data.errors || 0} errors`\n          : data?.synced !== undefined ? `${data.synced} synced`\n          : '\u2713';\n        setStep(step, 'done', result);\n      }\n    }\n  }\n\n  // \u2500\u2500\u2500 INDIVIDUAL SYNC \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  async function runIndividualSync() {\n    const col = document.getElementById('ind-collection').value;\n    const offset = document.getElementById('ind-offset').value;\n    const batch = document.getElementById('ind-batchsize').value;\n    setLoading('ind-response');\n    const data = await api(`/sync/${col}?offset=${offset}&batchSize=${batch}`, 'POST');\n    showResponse('ind-response', data, data?.error ? 'err' : 'ok');\n  }\n\n  // \u2500\u2500\u2500 FIELD SYNC \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  async function runFieldSync() {\n    const field = document.getElementById('field-name').value;\n    const id = document.getElementById('field-listing-id').value.trim();\n    const path = id ? `/sync/field/${field}/${id}` : `/sync/field/${field}/all`;\n    setLoading('field-response');\n    const data = await api(path, 'POST');\n    showResponse('field-response', data, data?.error ? 'err' : 'ok');\n  }\n\n  // \u2500\u2500\u2500 SINGLE SYNC \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  async function runSingleSync() {\n    const id = document.getElementById('single-listing-id').value.trim();\n    if (!id) { alert('Enter a Guesty listing ID'); return; }\n    setLoading('single-response');\n    const data = await api(`/sync/listing/${id}`, 'POST');\n    showResponse('single-response', data, data?.error ? 'err' : 'ok');\n  }\n\n  async function runSingleReviews() {\n    const id = document.getElementById('single-listing-id').value.trim();\n    if (!id) { alert('Enter a Guesty listing ID'); return; }\n    setLoading('single-response');\n    const data = await api(`/sync/reviews/${id}`, 'POST');\n    showResponse('single-response', data, data?.error ? 'err' : 'ok');\n  }\n\n  // \u2500\u2500\u2500 INSPECT \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  async function runInspect(endpoint, panelId) {\n    setLoading(panelId);\n    const data = await api(`/inspect/${endpoint}`);\n    showResponse(panelId, data, data?.error ? 'err' : 'ok');\n  }\n\n  async function runInspect2(endpoint, panelId) {\n    setLoading(panelId);\n    const data = await api(`/${endpoint}`);\n    showResponse(panelId, data, data?.error ? 'err' : 'ok');\n  }\n\n  async function runListingLookup() {\n    const id = document.getElementById('lookup-id').value.trim();\n    const view = document.getElementById('lookup-view').value;\n    if (!id) { alert('Enter a Guesty listing ID'); return; }\n    setLoading('lookup-response');\n    const data = await api(`/inspect/listing/${id}${view}`);\n    showResponse('lookup-response', data, data?.error ? 'err' : 'ok');\n  }\n\n  async function runBrowse() {\n    const col = document.getElementById('browse-collection').value;\n    setLoading('browse-response');\n    const data = await api(`/inspect/${col}`);\n    showResponse('browse-response', data, data?.error ? 'err' : 'ok');\n  }\n\n  async function loadDiagnostics() {\n    const endpoints = [\n      ['diff', 'diag-diff'],\n      ['orphans', 'diag-orphans'],\n      ['missing-images', 'diag-images'],\n      ['missing-prices', 'diag-prices'],\n      ['missing-descriptions', 'diag-desc'],\n      ['missing-icons', 'diag-icons'],\n      ['broken-refs', 'diag-refs'],\n    ];\n    for (const [ep, el] of endpoints) {\n      const data = await api(`/inspect/${ep}`);\n      const el2 = document.getElementById(el);\n      if (el2) {\n        const count = data?.count ?? data?.total ?? data?.missing?.length ?? (Array.isArray(data) ? data.length : '\u2014');\n        el2.textContent = count;\n        el2.style.color = count > 0 ? 'var(--yellow)' : 'var(--green)';\n      }\n    }\n  }\n\n  // \u2500\u2500\u2500 PROPERTIES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  async function loadProperties() {\n    const data = await api('/webflow/units');\n    if (!data || data.error) return;\n\n    const units = [...(data.multiUnits?.items || []), ...(data.singleUnits?.items || [])];\n    const tbody = document.getElementById('properties-tbody');\n\n    if (!units.length) {\n      tbody.innerHTML = '<tr><td colspan=\"6\" class=\"empty\">No units found</td></tr>';\n      return;\n    }\n\n    const cityFilter = document.getElementById('prop-filter-city').value;\n    const typeFilter = document.getElementById('prop-filter-type').value;\n\n    const filtered = units.filter(u => {\n      if (cityFilter && u.city !== cityFilter) return false;\n      if (typeFilter && u.type !== typeFilter) return false;\n      return true;\n    });\n\n    tbody.innerHTML = filtered.map(u => `\n      <tr>\n        <td>${u.name || '\u2014'}</td>\n        <td><span class=\"badge ${u.type === 'MTL' ? 'badge-blue' : 'badge-muted'}\">${u.type || '\u2014'}</span></td>\n        <td>${u.city || '\u2014'}</td>\n        <td><span class=\"badge ${u.isActive ? 'badge-green' : 'badge-red'}\">${u.isActive ? 'active' : 'inactive'}</span></td>\n        <td>${u.lastSynced ? new Date(u.lastSynced).toLocaleDateString('en-GB') : '\u2014'}</td>\n        <td>\n          <button class=\"btn btn-ghost btn-sm\" onclick=\"syncOne('${u.guestyId}')\">Sync</button>\n        </td>\n      </tr>\n    `).join('');\n  }\n\n  async function syncOne(id) {\n    setLoading('prop-response');\n    const data = await api(`/sync/listing/${id}`, 'POST');\n    showResponse('prop-response', data, data?.error ? 'err' : 'ok');\n  }\n\n  // \u2500\u2500\u2500 COLLECTIONS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  async function loadCounts() {\n    const data = await api('/webflow/counts');\n    if (!data || data.error) return;\n    const map = {\n      'multi-units': 'cnt-mtl',\n      'single-units': 'cnt-singles',\n      'reviews': 'cnt-reviews',\n      'amenities': 'cnt-amenities',\n      'tags': 'cnt-tags',\n      'cities': 'cnt-cities',\n      'buildings': 'cnt-buildings',\n    };\n    for (const [key, elId] of Object.entries(map)) {\n      const el = document.getElementById(elId);\n      if (el) el.textContent = data[key] ?? data.counts?.[key] ?? '\u2014';\n    }\n  }\n\n  async function runItemAction(action) {\n    const id = document.getElementById('item-guesty-id').value.trim();\n    if (!id) { alert('Enter a Guesty ID'); return; }\n    setLoading('item-response');\n    let data;\n    if (action === 'get') data = await api(`/webflow/item/guesty-id/${id}`);\n    else if (action === 'publish') data = await api(`/webflow/publish/${id}`, 'POST');\n    else if (action === 'unpublish') data = await api(`/webflow/unpublish/${id}`, 'POST');\n    showResponse('item-response', data, data?.error ? 'err' : 'ok');\n  }\n\n  // \u2500\u2500\u2500 SETTINGS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  async function loadSyncStatus() {\n    const data = await api('/sync/status');\n    if (!data || data.error) return;\n    const keys = Object.entries(data).filter(([k]) => !k.startsWith('_'));\n    document.getElementById('kv-timestamps').innerHTML = keys.map(([k, v]) => `\n      <div class=\"kv-row\"><span class=\"kv-key\">${k}</span><span class=\"kv-val\">${v || '\u2014'}</span></div>\n    `).join('');\n  }\n\n  async function initTimestamp() {\n    setLoading('settings-response');\n    const data = await api('/sync/init-timestamp', 'POST');\n    showResponse('settings-response', data, data?.error ? 'err' : 'ok');\n  }\n\n  async function clearCache() {\n    setLoading('cache-response');\n    const data = await api('/cache/clear-tokens', 'POST');\n    showResponse('cache-response', data, data?.error ? 'err' : 'ok');\n  }\n\n  // \u2500\u2500\u2500 INIT \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  if (WORKER_URL) loadOverview();\n</script>";

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

  if (WORKER_URL) loadOverview();
})();
