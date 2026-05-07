/**
 * Vendor Threat Radar — runtime logic.
 *
 * Implements all interactive functions for vendor-threat-radar.html.
 * Depends on: Chart.js 4 (loaded globally), radar-first-run.js, radar-interactions.js.
 *
 * All public functions are assigned to `window` so the inline init script
 * (and onclick handlers in the HTML) can resolve them without a module system.
 */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────
  // Storage
  // ─────────────────────────────────────────────────────────────────────────
  var STORAGE_KEY = 'vendorsoluce_vendors';
  var RADAR_PORTFOLIO_FORMAT = 'vendorsoluce-radar-portfolio';
  var RADAR_PORTFOLIO_VERSION = 1;

  var vendorData = [];
  var editingId = null;
  var filterLevel = 'all';
  var chartInstances = { inherent: null, sector: null, geo: null };
  var sonarAnimFrame = null;

  // ─────────────────────────────────────────────────────────────────────────
  // Risk calculation (ported from packages/app/src/utils/riskCalculations.ts)
  // ─────────────────────────────────────────────────────────────────────────
  var DATA_RISK_WEIGHTS = {
    PII: 15, PHI: 20, Financial: 18, IP: 16, Confidential: 12,
    Health: 18, Credentials: 14, Customer: 10, Employee: 10, Public: 0,
  };

  var CATEGORY_RISK_BASE = { critical: 70, strategic: 50, tactical: 30, commodity: 10 };
  var CONTEXTUAL_RISK_CAP = 18;

  function sectorContext(sector) {
    var s = (sector || '').trim().toLowerCase();
    if (!s) return { pts: 0, detail: '' };
    if (s.includes('health')) return { pts: 8, detail: 'Healthcare sector — regulatory and PHI-related exposure' };
    if (s.includes('financ') || s.includes('bank') || s.includes('payment'))
      return { pts: 9, detail: 'Financial services — payments, fraud, and compliance pressure' };
    if (s.includes('technolog') || s.includes('software') || s.includes('cloud') || s.includes('saas'))
      return { pts: 7, detail: 'Technology / software supply chain — dependency and IP risk' };
    if (s.includes('government') || s.includes('public sector'))
      return { pts: 8, detail: 'Public sector — sovereignty and targeted-threat considerations' };
    return { pts: 4, detail: 'Named sector — general third-party supply chain exposure' };
  }

  function locationContext(location) {
    var s = (location || '').trim().toLowerCase();
    if (!s) return { pts: 0, detail: '' };
    if (s.includes('eu') || s.includes('europe') || s.includes('gdpr') || s.includes('european union'))
      return { pts: 7, detail: 'EU / GDPR jurisdiction — cross-border and privacy obligations' };
    if (s.includes('united kingdom') || /\buk\b/.test(s))
      return { pts: 6, detail: 'United Kingdom — UK GDPR / ICO expectations' };
    if (s.includes('united states') || s.includes('u.s.') || /\busa\b/.test(s) || s.includes('america'))
      return { pts: 5, detail: 'United States — domestic processing baseline' };
    if (s.includes('canada')) return { pts: 5, detail: 'Canada — PIPEDA / provincial privacy context' };
    if (s.includes('asia') || s.includes('apac') || s.includes('india') || s.includes('china'))
      return { pts: 6, detail: 'APAC / international footprint — transfer and residency considerations' };
    return { pts: 4, detail: 'Named geography — jurisdictional complexity' };
  }

  function serviceTypeContext(serviceType) {
    var s = (serviceType || '').trim().toLowerCase();
    if (!s) return { pts: 0, detail: '' };
    if (s.includes('cloud') || s.includes('infrastructure') || s.includes('identity') || s.includes('sso') || s.includes('iam'))
      return { pts: 4, detail: 'Foundational IT / identity — broad blast radius' };
    if (s.includes('payment') || s.includes('billing'))
      return { pts: 4, detail: 'Payments / billing — direct financial impact' };
    if (s.includes('data') || s.includes('analytic') || s.includes('warehouse'))
      return { pts: 3, detail: 'Data / analytics — aggregation and sensitivity' };
    return { pts: 2, detail: 'Service type — operational dependency context' };
  }

  function populationContext(pop) {
    var s = (pop || '').trim().toLowerCase();
    if (!s) return { pts: 0, detail: '' };
    if (s.includes('all employee') || s.includes('enterprise') || s.includes('company'))
      return { pts: 4, detail: 'Population — organization-wide' };
    if (s.includes('customer') || s.includes('public') || s.includes('all ('))
      return { pts: 5, detail: 'Population — customer- or public-facing' };
    if (s.includes('department') || s.includes('function') || s.includes('internal'))
      return { pts: 2, detail: 'Population — department / function scope' };
    return { pts: 2, detail: 'Population scope noted' };
  }

  function calculateInherentRisk(vendor) {
    var category = vendor.category || 'tactical';
    var risk = CATEGORY_RISK_BASE[category] !== undefined ? CATEGORY_RISK_BASE[category] : 30;

    var dataTypes = Array.isArray(vendor.dataTypes) ? vendor.dataTypes : [];
    var dataRisk = dataTypes.reduce(function (sum, dt) {
      return sum + (DATA_RISK_WEIGHTS[dt] || 0);
    }, 0);
    risk += Math.min(dataRisk, 30);

    if (vendor.sbomProfile && vendor.sbomProfile.providesSoftware && !vendor.sbomProfile.sbomAvailable) {
      risk += 10;
    }

    var sec = sectorContext(vendor.sector || '');
    var loc = locationContext(vendor.location || '');
    var svc = serviceTypeContext(vendor.serviceType);
    var pop = populationContext(vendor.populationImpacted);
    var contextualRaw = sec.pts + loc.pts + svc.pts + pop.pts;
    risk += Math.min(contextualRaw, CONTEXTUAL_RISK_CAP);

    return Math.min(Math.round(risk), 100);
  }

  function calculateResidualRisk(vendor, inherentRisk) {
    var residual = inherentRisk;
    if (vendor.sbomProfile && vendor.sbomProfile.sbomAvailable) {
      residual -= 5;
    }
    return Math.max(Math.round(residual), 0);
  }

  function getRiskTier(score) {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  function deriveComplianceGaps(vendor) {
    var gaps = [];
    var dataTypes = Array.isArray(vendor.dataTypes) ? vendor.dataTypes.map(function (d) { return d.toLowerCase(); }) : [];
    if (dataTypes.some(function (d) { return d === 'phi' || d === 'health'; })) gaps.push('HIPAA');
    if (dataTypes.some(function (d) { return d === 'pii' || d === 'customer'; })) gaps.push('GDPR');
    if (dataTypes.some(function (d) { return d === 'financial'; })) gaps.push('PCI-DSS');
    if (vendor.sbomProfile && vendor.sbomProfile.providesSoftware && !vendor.sbomProfile.sbomAvailable) {
      gaps.push('NIST SP 800-161 (SBOM)');
    }
    return gaps;
  }

  function deriveSecurityControls(vendor) {
    var controls = ['Third-party risk assessment', 'Vendor onboarding review'];
    if (vendor.sbomProfile && vendor.sbomProfile.sbomAvailable) controls.push('SBOM on file');
    if (vendor.contact) controls.push('Dedicated security contact');
    return controls;
  }

  function calculateVendorRisk(vendor) {
    var inherentRisk = calculateInherentRisk(vendor);
    var residualRisk = calculateResidualRisk(vendor, inherentRisk);
    return {
      inherentRisk: inherentRisk,
      residualRisk: residualRisk,
      riskLevel: getRiskTier(residualRisk),
      complianceGaps: deriveComplianceGaps(vendor),
      securityControls: deriveSecurityControls(vendor),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Storage helpers
  // ─────────────────────────────────────────────────────────────────────────
  function loadVendors() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        vendorData = Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      vendorData = [];
    }
  }

  function saveVendors() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vendorData));
    } catch (e) {}
  }

  function generateId() {
    return 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Display helpers
  // ─────────────────────────────────────────────────────────────────────────
  function riskBadgeClass(level) {
    return 'risk-badge risk-badge-' + level;
  }

  function riskLabelForTier(tier) {
    return { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }[tier] || tier;
  }

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Timestamp
  // ─────────────────────────────────────────────────────────────────────────
  function updateTimestamp() {
    var el = document.getElementById('timestamp');
    if (!el) return;
    el.textContent = new Date().toLocaleString();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────────────────────────────────
  function updateStats() {
    var critical = 0, high = 0, medium = 0, low = 0, totalRisk = 0;
    vendorData.forEach(function (v) {
      var score = v.residualRisk !== undefined ? v.residualRisk : (v.inherentRisk || 0);
      totalRisk += v.inherentRisk || 0;
      var tier = getRiskTier(score);
      if (tier === 'critical') critical++;
      else if (tier === 'high') high++;
      else if (tier === 'medium') medium++;
      else low++;
    });
    var total = vendorData.length;
    var avg = total > 0 ? Math.round(totalRisk / total) : 0;
    var activeThreats = critical + high;
    var predictiveAlerts = vendorData.filter(function (v) {
      return v.sbomProfile && v.sbomProfile.providesSoftware && !v.sbomProfile.sbomAvailable;
    }).length;

    function setEl(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = String(val);
    }
    setEl('criticalCount', critical);
    setEl('highCount', high);
    setEl('mediumCount', medium);
    setEl('lowCount', low);
    setEl('totalCount', total);
    setEl('avgRisk', avg);
    setEl('activeThreats', activeThreats);
    setEl('predictiveAlerts', predictiveAlerts);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Alert banner
  // ─────────────────────────────────────────────────────────────────────────
  function updateAlertBanner() {
    var hasCritical = vendorData.some(function (v) {
      return getRiskTier(v.residualRisk !== undefined ? v.residualRisk : (v.inherentRisk || 0)) === 'critical';
    });
    var hasHigh = vendorData.some(function (v) {
      return getRiskTier(v.residualRisk !== undefined ? v.residualRisk : (v.inherentRisk || 0)) === 'high';
    });

    ['alertBanner', 'alertBannerRepeat'].forEach(function (id) {
      var banner = document.getElementById(id);
      if (!banner) return;
      var titleEl = banner.querySelector('.alert-title');
      var bodyEl = banner.querySelector('.alert-content > div:last-child');
      banner.className = banner.className.replace(/\s*(clear|warning|danger)\b/g, '');
      if (hasCritical) {
        banner.classList.add('danger');
        if (titleEl) titleEl.textContent = 'Critical Vendors Detected';
        if (bodyEl) bodyEl.textContent = 'One or more critical-risk vendors require immediate attention';
      } else if (hasHigh) {
        banner.classList.add('warning');
        if (titleEl) titleEl.textContent = 'High-Risk Vendors Present';
        if (bodyEl) bodyEl.textContent = 'Review high-risk vendors to reduce portfolio exposure';
      } else {
        banner.classList.add('clear');
        if (titleEl) titleEl.textContent = 'System Status: All Clear';
        if (bodyEl) bodyEl.textContent = 'No critical vendor risks detected';
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Vendor list
  // ─────────────────────────────────────────────────────────────────────────
  function filteredVendors() {
    if (filterLevel === 'all') return vendorData;
    return vendorData.filter(function (v) {
      var score = v.residualRisk !== undefined ? v.residualRisk : (v.inherentRisk || 0);
      return getRiskTier(score) === filterLevel;
    });
  }

  function updateVendorList() {
    var container = document.getElementById('vendorList');
    if (!container) return;
    var toShow = filteredVendors();
    if (toShow.length === 0) {
      var emptyMsg = vendorData.length === 0
        ? '<p>No vendors added yet</p><p class="empty-state-text">Click &ldquo;Add Vendor&rdquo; to get started</p>'
        : '<p>No vendors match the current filter.</p>';
      container.innerHTML =
        '<div class="empty-state">' +
        '<svg fill="none" stroke="currentColor" class="empty-state-icon" viewBox="0 0 24 24">' +
        '<path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>' +
        emptyMsg + '</div>';
      return;
    }
    var html = '';
    toShow.forEach(function (v) {
      var score = v.residualRisk !== undefined ? v.residualRisk : (v.inherentRisk || 0);
      var tier = getRiskTier(score);
      var label = riskLabelForTier(tier);
      var dataTypesText = (v.dataTypes || []).join(', ') || '—';
      html += '<div class="vendor-item vendor-item-' + escHtml(tier) + '" data-id="' + escHtml(v.id) + '">' +
        '<div class="vendor-item-header">' +
        '<div class="vendor-item-name">' + escHtml(v.name) + '</div>' +
        '<span class="' + riskBadgeClass(tier) + '">' + escHtml(label) + ' (' + score + ')</span>' +
        '</div>' +
        '<div class="vendor-item-meta">' +
        '<span>' + escHtml(v.category || '—') + '</span>' +
        (v.sector ? ' &bull; ' + escHtml(v.sector) : '') +
        (v.location ? ' &bull; ' + escHtml(v.location) : '') +
        '</div>' +
        '<div class="vendor-item-data">' + escHtml(dataTypesText) + '</div>' +
        '<div class="vendor-item-actions">' +
        '<button class="secondary" onclick="editVendor(\'' + escHtml(v.id) + '\')">Edit</button> ' +
        '<button class="secondary" onclick="viewVendorDetails(\'' + escHtml(v.id) + '\')">Details</button> ' +
        '<button class="danger" onclick="deleteVendor(\'' + escHtml(v.id) + '\')">Delete</button>' +
        '</div>' +
        '</div>';
    });
    container.innerHTML = html;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Charts
  // ─────────────────────────────────────────────────────────────────────────
  var CHART_COLORS = {
    critical: '#DC2626',
    high: '#D97706',
    medium: '#2563EB',
    low: '#16A34A',
  };

  function makeOrUpdateChart(id, type, data, options) {
    var canvas = document.getElementById(id);
    if (!canvas) return;
    var existing = chartInstances[id] || null;
    if (existing) {
      existing.data = data;
      existing.update('none');
      return;
    }
    if (typeof Chart === 'undefined') return;
    var ctx = canvas.getContext('2d');
    chartInstances[id] = new Chart(ctx, { type: type, data: data, options: options });
  }

  function updateCharts() {
    // Risk distribution (doughnut)
    var riskCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    vendorData.forEach(function (v) {
      var score = v.residualRisk !== undefined ? v.residualRisk : (v.inherentRisk || 0);
      riskCounts[getRiskTier(score)]++;
    });
    makeOrUpdateChart('inherentChart', 'doughnut', {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [{
        data: [riskCounts.critical, riskCounts.high, riskCounts.medium, riskCounts.low],
        backgroundColor: [CHART_COLORS.critical, CHART_COLORS.high, CHART_COLORS.medium, CHART_COLORS.low],
        borderWidth: 1,
      }],
    }, {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
    });

    // Sector distribution (bar)
    var sectorCounts = {};
    vendorData.forEach(function (v) {
      var s = v.sector || 'Other';
      sectorCounts[s] = (sectorCounts[s] || 0) + 1;
    });
    var sectorKeys = Object.keys(sectorCounts).sort(function (a, b) { return sectorCounts[b] - sectorCounts[a]; }).slice(0, 7);
    makeOrUpdateChart('sectorChart', 'bar', {
      labels: sectorKeys,
      datasets: [{
        label: 'Vendors',
        data: sectorKeys.map(function (k) { return sectorCounts[k]; }),
        backgroundColor: '#2563EB',
        borderRadius: 4,
      }],
    }, {
      responsive: true, maintainAspectRatio: true, indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { stepSize: 1 } } },
    });

    // Geographic distribution (doughnut)
    var geoCounts = {};
    vendorData.forEach(function (v) {
      var g = v.location || 'Unknown';
      geoCounts[g] = (geoCounts[g] || 0) + 1;
    });
    var geoKeys = Object.keys(geoCounts).sort(function (a, b) { return geoCounts[b] - geoCounts[a]; }).slice(0, 6);
    var geoColors = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#0891B2'];
    makeOrUpdateChart('geoChart', 'doughnut', {
      labels: geoKeys,
      datasets: [{
        data: geoKeys.map(function (k) { return geoCounts[k]; }),
        backgroundColor: geoColors.slice(0, geoKeys.length),
        borderWidth: 1,
      }],
    }, {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Sonar radar canvas
  // ─────────────────────────────────────────────────────────────────────────
  function drawSonar() {
    var canvas = document.getElementById('sonarCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.offsetWidth || 300;
    var h = canvas.offsetHeight || 300;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    var cx = w / 2, cy = h / 2, r = Math.min(cx, cy) * 0.9;
    ctx.clearRect(0, 0, w, h);

    // Rings
    var isDark = document.documentElement.classList.contains('dark');
    var ringColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
    [1, 0.75, 0.5, 0.25].forEach(function (f) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * f, 0, Math.PI * 2);
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Risk-level ring labels
    var labelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
    ctx.fillStyle = labelColor;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ['100', '75', '50', '25'].forEach(function (lbl, i) {
      var frac = [1, 0.75, 0.5, 0.25][i];
      ctx.fillText(lbl, cx + 4, cy - r * frac + 3);
    });

    // Dots
    var colorMap = { critical: '#DC2626', high: '#D97706', medium: '#2563EB', low: '#16A34A' };
    if (vendorData.length === 0) return;
    vendorData.forEach(function (v, i) {
      var score = v.inherentRisk || 0;
      var dist = (score / 100) * r;
      var angle = (i / vendorData.length) * Math.PI * 2 - Math.PI / 2;
      var x = cx + dist * Math.cos(angle);
      var y = cy + dist * Math.sin(angle);
      var tier = getRiskTier(score);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = colorMap[tier];
      ctx.fill();
      ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  function updateSonarCanvas() {
    if (sonarAnimFrame) cancelAnimationFrame(sonarAnimFrame);
    sonarAnimFrame = requestAnimationFrame(drawSonar);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Dependency Intelligence
  // ─────────────────────────────────────────────────────────────────────────
  function updateDependencyIntelligence() {
    var mappedDeps = vendorData.filter(function (v) {
      return v.dependentSystems && v.dependentSystems.length > 0;
    }).length;
    var tier2 = vendorData.filter(function (v) { return v.tierLevel >= 2; }).length;
    var criticalOps = vendorData.filter(function (v) {
      return v.criticalOperations && v.criticalOperations.length > 0;
    }).length;

    // Count shared upstream providers
    var upstreamCount = {};
    vendorData.forEach(function (v) {
      (v.upstreamProviders || []).forEach(function (p) {
        upstreamCount[p] = (upstreamCount[p] || 0) + 1;
      });
    });
    var hotspots = Object.keys(upstreamCount).filter(function (k) { return upstreamCount[k] > 1; }).length;

    function setEl(id, val) { var el = document.getElementById(id); if (el) el.textContent = String(val); }
    setEl('kpiMappedDeps', mappedDeps);
    setEl('kpiTier2', tier2);
    setEl('kpiCriticalOps', criticalOps);
    setEl('kpiHotspots', hotspots);

    // Populate vendor cascade select
    var sel = document.getElementById('dependencyVendorSelect');
    if (sel) {
      var currentVal = sel.value;
      sel.innerHTML = '<option value="">— Select vendor —</option>';
      vendorData.forEach(function (v) {
        var opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = v.name;
        sel.appendChild(opt);
      });
      if (currentVal) sel.value = currentVal;
      showCascadePreview(sel.value);
    }

    // Hotspot panel
    var hotspotsPanel = document.getElementById('dependencyHotspotsList');
    if (hotspotsPanel) {
      if (Object.keys(upstreamCount).length === 0) {
        hotspotsPanel.innerHTML = '<p class="dependency-empty">No shared upstream dependencies detected. Add upstream providers to vendor entries to enable hotspot analysis.</p>';
      } else {
        var hotspotEntries = Object.keys(upstreamCount)
          .map(function (k) { return [k, upstreamCount[k]]; })
          .filter(function (e) { return e[1] > 1; })
          .sort(function (a, b) { return b[1] - a[1]; });
        if (hotspotEntries.length === 0) {
          hotspotsPanel.innerHTML = '<p class="dependency-empty">No shared dependencies identified across vendors.</p>';
        } else {
          hotspotsPanel.innerHTML = hotspotEntries.map(function (e) {
            return '<div class="hotspot-item"><span class="hotspot-name">' + escHtml(e[0]) + '</span><span class="hotspot-count">' + e[1] + ' vendors</span></div>';
          }).join('');
        }
      }
    }
  }

  function showCascadePreview(vendorId) {
    var box = document.getElementById('cascadePreviewBox');
    if (!box) return;
    if (!vendorId) { box.innerHTML = ''; return; }
    var v = vendorData.find(function (x) { return x.id === vendorId; });
    if (!v) { box.innerHTML = ''; return; }
    var score = v.residualRisk !== undefined ? v.residualRisk : (v.inherentRisk || 0);
    var html = '<strong>' + escHtml(v.name) + '</strong> <span class="' + riskBadgeClass(getRiskTier(score)) + '">' + score + '</span><br>';
    if (v.dependentSystems && v.dependentSystems.length) {
      html += '<p class="cascade-label">Dependent systems:</p><ul class="cascade-list">' +
        v.dependentSystems.map(function (s) { return '<li>' + escHtml(s) + '</li>'; }).join('') + '</ul>';
    }
    if (v.upstreamProviders && v.upstreamProviders.length) {
      html += '<p class="cascade-label">Upstream providers:</p><ul class="cascade-list">' +
        v.upstreamProviders.map(function (s) { return '<li>' + escHtml(s) + '</li>'; }).join('') + '</ul>';
    }
    if (v.criticalOperations && v.criticalOperations.length) {
      html += '<p class="cascade-label">Critical operations:</p><ul class="cascade-list">' +
        v.criticalOperations.map(function (s) { return '<li>' + escHtml(s) + '</li>'; }).join('') + '</ul>';
    }
    if (!v.dependentSystems && !v.upstreamProviders && !v.criticalOperations) {
      html += '<p class="dependency-empty">No dependency data for this vendor.</p>';
    }
    box.innerHTML = html;
  }

  // Wire up the cascade select
  document.addEventListener('DOMContentLoaded', function () {
    var sel = document.getElementById('dependencyVendorSelect');
    if (sel) sel.addEventListener('change', function () { showCascadePreview(sel.value); });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Master update
  // ─────────────────────────────────────────────────────────────────────────
  function updateAllDisplays() {
    updateTimestamp();
    updateStats();
    updateVendorList();
    updateCharts();
    updateSonarCanvas();
    updateAlertBanner();
    updateDependencyIntelligence();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Vendor modal
  // ─────────────────────────────────────────────────────────────────────────
  function openAddVendor() {
    editingId = null;
    var form = document.getElementById('vendorForm');
    if (form) form.reset();
    var title = document.getElementById('modalTitle');
    if (title) title.textContent = 'Add Vendor';
    var modal = document.getElementById('vendorModal');
    if (modal) modal.classList.add('show');
  }

  function closeVendorModal() {
    var modal = document.getElementById('vendorModal');
    if (modal) {
      modal.classList.remove('show');
      modal.classList.remove('active');
    }
    editingId = null;
    var form = document.getElementById('vendorForm');
    if (form) form.reset();
  }

  function editVendor(id) {
    var v = vendorData.find(function (x) { return x.id === id; });
    if (!v) return;
    editingId = id;

    function setVal(elId, val) { var el = document.getElementById(elId); if (el) el.value = val || ''; }
    setVal('vendorName', v.name);
    setVal('vendorCategory', v.category);
    setVal('vendorSector', v.sector);
    setVal('vendorLocation', v.location);
    setVal('vendorServiceType', v.serviceType);
    setVal('vendorPopulationImpacted', v.populationImpacted);
    setVal('vendorContact', v.contact);
    setVal('vendorNotes', v.notes);
    setVal('vendorDependentSystems', (v.dependentSystems || []).join(', '));
    setVal('vendorBusinessFunctions', (v.businessFunctions || []).join(', '));
    setVal('vendorUpstreamProviders', (v.upstreamProviders || []).join(', '));
    setVal('vendorSubProcessors', (v.subProcessors || []).join(', '));
    setVal('vendorCriticalOperations', (v.criticalOperations || []).join(', '));
    setVal('vendorRegulations', (v.regulations || []).join(', '));
    setVal('vendorTierLevel', v.tierLevel || '');
    setVal('vendorParentVendorIds', (v.parentVendorIds || []).join(', '));
    setVal('vendorDependencyNotes', v.dependencyNotes);

    // Check data type checkboxes
    var checkboxes = document.querySelectorAll('[name="dataType"]');
    checkboxes.forEach(function (cb) {
      cb.checked = (v.dataTypes || []).indexOf(cb.value) !== -1;
    });

    var title = document.getElementById('modalTitle');
    if (title) title.textContent = 'Edit Vendor';
    var modal = document.getElementById('vendorModal');
    if (modal) modal.classList.add('show');
  }

  function deleteVendor(id) {
    if (!confirm('Delete this vendor?')) return;
    vendorData = vendorData.filter(function (v) { return v.id !== id; });
    saveVendors();
    updateAllDisplays();
  }

  function readFormVendor() {
    var name = (document.getElementById('vendorName') || {}).value || '';
    var category = (document.getElementById('vendorCategory') || {}).value || 'tactical';
    var sector = (document.getElementById('vendorSector') || {}).value || '';
    var location = (document.getElementById('vendorLocation') || {}).value || '';
    var serviceType = (document.getElementById('vendorServiceType') || {}).value || '';
    var populationImpacted = (document.getElementById('vendorPopulationImpacted') || {}).value || '';
    var contact = (document.getElementById('vendorContact') || {}).value || '';
    var notes = (document.getElementById('vendorNotes') || {}).value || '';

    var dataTypes = [];
    document.querySelectorAll('[name="dataType"]:checked').forEach(function (cb) { dataTypes.push(cb.value); });

    function splitCsv(id) {
      var el = document.getElementById(id);
      if (!el || !el.value) return [];
      return el.value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    }

    var tierEl = document.getElementById('vendorTierLevel');
    var tierLevel = tierEl ? parseInt(tierEl.value, 10) || undefined : undefined;

    return {
      name: name.trim(),
      category: category,
      sector: sector,
      location: location,
      serviceType: serviceType || undefined,
      populationImpacted: populationImpacted || undefined,
      contact: contact || undefined,
      notes: notes || undefined,
      dataTypes: dataTypes,
      dependentSystems: splitCsv('vendorDependentSystems'),
      businessFunctions: splitCsv('vendorBusinessFunctions'),
      upstreamProviders: splitCsv('vendorUpstreamProviders'),
      subProcessors: splitCsv('vendorSubProcessors'),
      criticalOperations: splitCsv('vendorCriticalOperations'),
      regulations: splitCsv('vendorRegulations'),
      tierLevel: tierLevel,
      parentVendorIds: splitCsv('vendorParentVendorIds'),
      dependencyNotes: (document.getElementById('vendorDependencyNotes') || {}).value || undefined,
    };
  }

  function setupFormSubmit() {
    var form = document.getElementById('vendorForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var formVendor = readFormVendor();
      if (!formVendor.name) { alert('Vendor name is required.'); return; }
      var risks = calculateVendorRisk(formVendor);
      if (editingId) {
        var idx = vendorData.findIndex(function (v) { return v.id === editingId; });
        if (idx !== -1) {
          vendorData[idx] = Object.assign({}, vendorData[idx], formVendor, risks, {
            id: editingId,
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        vendorData.push(Object.assign({}, formVendor, risks, {
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
      saveVendors();
      closeVendorModal();
      updateAllDisplays();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Scan (recalculate all risks)
  // ─────────────────────────────────────────────────────────────────────────
  function scanVendors() {
    vendorData = vendorData.map(function (v) {
      var risks = calculateVendorRisk(v);
      return Object.assign({}, v, risks, { updatedAt: new Date().toISOString() });
    });
    saveVendors();
    updateAllDisplays();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Filter
  // ─────────────────────────────────────────────────────────────────────────
  function filterVendors() {
    var sel = document.getElementById('riskFilter');
    filterLevel = sel ? sel.value : 'all';
    updateVendorList();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Clear all
  // ─────────────────────────────────────────────────────────────────────────
  function clearAllVendors() {
    if (!confirm('Remove all vendors from the radar? This cannot be undone.')) return;
    vendorData = [];
    saveVendors();
    updateAllDisplays();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Bulk add (used by data-management-strategy)
  // ─────────────────────────────────────────────────────────────────────────
  function addVendorsToWorkingList(newVendors) {
    if (!Array.isArray(newVendors)) return;
    newVendors.forEach(function (v) {
      var risks = calculateVendorRisk(v);
      vendorData.push(Object.assign({}, v, risks, {
        id: v.id || generateId(),
        createdAt: v.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    });
    saveVendors();
    updateAllDisplays();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CSV Export
  // ─────────────────────────────────────────────────────────────────────────
  var CSV_HEADERS = [
    'Vendor Name', 'Category', 'Sector', 'Location', 'Contact',
    'Data Types', 'Service Type', 'Population Impacted',
    'Provides Software', 'SBOM Available', 'SBOM Format', 'Open Source Exposure',
    'Inherent Risk', 'Residual Risk', 'Notes',
  ];

  function csvEscape(val) {
    var s = String(val || '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function exportVendors() {
    var rows = [CSV_HEADERS.join(',')];
    vendorData.forEach(function (v) {
      rows.push([
        csvEscape(v.name),
        csvEscape(v.category),
        csvEscape(v.sector),
        csvEscape(v.location),
        csvEscape(v.contact),
        csvEscape((v.dataTypes || []).join('; ')),
        csvEscape(v.serviceType),
        csvEscape(v.populationImpacted),
        v.sbomProfile ? (v.sbomProfile.providesSoftware ? 'Yes' : 'No') : 'No',
        v.sbomProfile ? (v.sbomProfile.sbomAvailable ? 'Yes' : 'No') : 'No',
        csvEscape(v.sbomProfile ? v.sbomProfile.sbomFormat : ''),
        csvEscape(v.sbomProfile ? v.sbomProfile.openSourceExposure : ''),
        String(v.inherentRisk || 0),
        String(v.residualRisk || 0),
        csvEscape(v.notes),
      ].join(','));
    });
    triggerDownload(rows.join('\n'), 'vendorsoluce-export.csv', 'text/csv');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CSV Import
  // ─────────────────────────────────────────────────────────────────────────
  var HEADER_ALIASES = {
    'vendor name': 'name', 'vendor': 'name',
    'category': 'category', 'tier': 'category',
    'data types': 'dataTypes', 'data': 'dataTypes',
    'sector': 'sector', 'industry': 'sector',
    'location': 'location', 'country': 'location', 'geography': 'location',
    'contact': 'contact', 'email': 'contact', 'contact email': 'contact',
    'notes': 'notes', 'description': 'notes',
    'service type': 'serviceType', 'service': 'serviceType',
    'population impacted': 'populationImpacted', 'population': 'populationImpacted',
    'provides software': 'providesSoftware',
    'sbom available': 'sbomAvailable',
    'sbom format': 'sbomFormat',
    'open source exposure': 'openSourceExposure',
    'inherent risk': '_inherentRisk',
    'residual risk': '_residualRisk',
    'risk level': '_riskLevel',
  };

  function parseCsvLine(line) {
    var result = [], cur = '', inQ = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i], n = line[i + 1];
      if (c === '"') {
        if (inQ && n === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (c === ',' && !inQ) {
        result.push(cur); cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result;
  }

  function normalizeCategory(raw) {
    var x = (raw || '').toLowerCase().trim();
    if (x === 'critical') return 'critical';
    if (x === 'strategic' || x === 'high') return 'strategic';
    if (x === 'tactical' || x === 'medium') return 'tactical';
    if (x === 'commodity' || x === 'low') return 'commodity';
    return 'tactical';
  }

  function parseImportedRow(row) {
    var name = (row['name'] || '').trim();
    if (!name) return null;
    var category = normalizeCategory(row['category']);
    var rawDt = row['dataTypes'] || '';
    var dataTypes = rawDt ? rawDt.split(';').map(function (s) { return s.trim(); }).filter(Boolean) : [];
    var sbomProfile;
    if (row['providesSoftware'] !== undefined || row['sbomAvailable'] !== undefined) {
      sbomProfile = {
        providesSoftware: row['providesSoftware'] === 'yes' || row['providesSoftware'] === 'true',
        sbomAvailable: row['sbomAvailable'] === 'yes' || row['sbomAvailable'] === 'true',
        sbomFormat: row['sbomFormat'] || undefined,
        openSourceExposure: row['openSourceExposure'] || undefined,
      };
    }
    return {
      id: generateId(),
      name: name,
      category: category,
      sector: row['sector'] || '',
      location: row['location'] || '',
      contact: row['contact'] || undefined,
      notes: row['notes'] || undefined,
      dataTypes: dataTypes,
      serviceType: row['serviceType'] || undefined,
      populationImpacted: row['populationImpacted'] || undefined,
      sbomProfile: sbomProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function importVendors(event) {
    var file = event && event.target && event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var text = e.target.result;
        var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
        if (lines.length < 2) { alert('CSV file must have a header row and at least one data row.'); return; }
        var rawHeaders = parseCsvLine(lines[0]);
        var headers = rawHeaders.map(function (h) {
          var norm = h.trim().toLowerCase().replace(/\s+/g, ' ');
          return HEADER_ALIASES[norm] || norm;
        });
        var imported = 0;
        for (var i = 1; i < lines.length; i++) {
          var vals = parseCsvLine(lines[i]);
          if (!vals.length || !vals[0]) continue;
          var row = {};
          headers.forEach(function (hdr, idx) { row[hdr] = (vals[idx] || '').trim(); });
          var vendor = parseImportedRow(row);
          if (!vendor) continue;
          var risks = calculateVendorRisk(vendor);
          vendorData.push(Object.assign({}, vendor, risks));
          imported++;
        }
        saveVendors();
        updateAllDisplays();
        alert('Imported ' + imported + ' vendor' + (imported !== 1 ? 's' : '') + '.');
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
      if (event.target) event.target.value = '';
    };
    reader.readAsText(file);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CSV template download
  // ─────────────────────────────────────────────────────────────────────────
  function downloadVendorCsvTemplate() {
    var template = [
      CSV_HEADERS.join(','),
      '"Example Vendor",critical,"Cloud Infrastructure","United States","security@example.com","PII; Financial","Cloud / Infrastructure","All employees","Yes","No","","","","",""',
    ].join('\n');
    triggerDownload(template, 'vendorsoluce-import-template.csv', 'text/csv');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // JSON portfolio exchange
  // ─────────────────────────────────────────────────────────────────────────
  function downloadRadarPortfolioJson() {
    var envelope = {
      format: RADAR_PORTFOLIO_FORMAT,
      version: RADAR_PORTFOLIO_VERSION,
      exportedAt: new Date().toISOString(),
      vendors: vendorData,
    };
    triggerDownload(JSON.stringify(envelope, null, 2), 'vendorsoluce-radar-portfolio.json', 'application/json');
  }

  function importRadarPortfolioJson(event) {
    var file = event && event.target && event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var parsed = JSON.parse(e.target.result);
        var vendors;
        if (parsed && parsed.format === RADAR_PORTFOLIO_FORMAT && Array.isArray(parsed.vendors)) {
          vendors = parsed.vendors;
        } else if (Array.isArray(parsed)) {
          vendors = parsed;
        } else {
          throw new Error('Unrecognised file format. Expected a Vendorsoluce portfolio JSON export.');
        }
        var imported = 0;
        vendors.forEach(function (v) {
          if (!v || typeof v !== 'object' || !v.name) return;
          var vendor = {
            id: (typeof v.id === 'string' && v.id) ? v.id : generateId(),
            name: String(v.name).trim(),
            category: normalizeCategory(v.category),
            sector: v.sector != null ? String(v.sector) : '',
            location: v.location != null ? String(v.location) : '',
            contact: v.contact ? String(v.contact) : undefined,
            notes: v.notes ? String(v.notes) : undefined,
            dataTypes: Array.isArray(v.dataTypes) ? v.dataTypes.map(String) : [],
            serviceType: v.serviceType ? String(v.serviceType) : undefined,
            populationImpacted: v.populationImpacted ? String(v.populationImpacted) : undefined,
            sbomProfile: (v.sbomProfile && typeof v.sbomProfile === 'object') ? v.sbomProfile : undefined,
            dependentSystems: Array.isArray(v.dependentSystems) ? v.dependentSystems : undefined,
            businessFunctions: Array.isArray(v.businessFunctions) ? v.businessFunctions : undefined,
            upstreamProviders: Array.isArray(v.upstreamProviders) ? v.upstreamProviders : undefined,
            subProcessors: Array.isArray(v.subProcessors) ? v.subProcessors : undefined,
            criticalOperations: Array.isArray(v.criticalOperations) ? v.criticalOperations : undefined,
            regulations: Array.isArray(v.regulations) ? v.regulations : undefined,
            tierLevel: typeof v.tierLevel === 'number' ? v.tierLevel : undefined,
            createdAt: v.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          var risks = calculateVendorRisk(vendor);
          vendorData.push(Object.assign({}, vendor, risks));
          imported++;
        });
        saveVendors();
        updateAllDisplays();
        alert('Imported ' + imported + ' vendor' + (imported !== 1 ? 's' : '') + ' from portfolio.');
      } catch (err) {
        alert('Portfolio import failed: ' + err.message);
      }
      if (event.target) event.target.value = '';
    };
    reader.readAsText(file);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // View vendor details (inline panel)
  // ─────────────────────────────────────────────────────────────────────────
  function viewVendorDetails(id) {
    var v = vendorData.find(function (x) { return x.id === id; });
    if (!v) return;
    var score = v.residualRisk !== undefined ? v.residualRisk : (v.inherentRisk || 0);
    var tier = getRiskTier(score);
    var lines = [
      '<strong>' + escHtml(v.name) + '</strong> <span class="' + riskBadgeClass(tier) + '">' + riskLabelForTier(tier) + ' (' + score + ')</span>',
      'Category: ' + escHtml(v.category || '—'),
      'Sector: ' + escHtml(v.sector || '—'),
      'Location: ' + escHtml(v.location || '—'),
      'Data types: ' + escHtml((v.dataTypes || []).join(', ') || '—'),
      'Service type: ' + escHtml(v.serviceType || '—'),
      'Population impacted: ' + escHtml(v.populationImpacted || '—'),
      'Inherent risk: ' + (v.inherentRisk || 0),
      'Residual risk: ' + (v.residualRisk || 0),
    ];
    if (v.contact) lines.push('Contact: ' + escHtml(v.contact));
    if (v.notes) lines.push('Notes: ' + escHtml(v.notes));
    if (v.complianceGaps && v.complianceGaps.length) {
      lines.push('Compliance considerations: ' + escHtml(v.complianceGaps.join(', ')));
    }
    alert(lines.join('\n'));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Report generation
  // ─────────────────────────────────────────────────────────────────────────
  function buildReportHtml() {
    var clientName = (document.getElementById('reportClientName') || {}).value || '';
    var reportId = 'VS-RPT-' + Date.now().toString(36).toUpperCase();
    var now = new Date();
    var dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    var critical = 0, high = 0, medium = 0, low = 0, totalRisk = 0;
    vendorData.forEach(function (v) {
      var s = v.residualRisk !== undefined ? v.residualRisk : (v.inherentRisk || 0);
      totalRisk += v.inherentRisk || 0;
      var t = getRiskTier(s);
      if (t === 'critical') critical++; else if (t === 'high') high++;
      else if (t === 'medium') medium++; else low++;
    });
    var total = vendorData.length;
    var avg = total > 0 ? Math.round(totalRisk / total) : 0;

    var sorted = vendorData.slice().sort(function (a, b) { return (b.inherentRisk || 0) - (a.inherentRisk || 0); });

    var registerRows = sorted.map(function (v) {
      var score = v.residualRisk !== undefined ? v.residualRisk : (v.inherentRisk || 0);
      var tier = getRiskTier(score);
      return '<tr style="border-bottom:1px solid #ddd">' +
        '<td style="padding:6px 8px">' + escHtml(v.name) + '</td>' +
        '<td style="padding:6px 8px">' + escHtml(v.category || '—') + '</td>' +
        '<td style="padding:6px 8px">' + escHtml(v.sector || '—') + '</td>' +
        '<td style="padding:6px 8px">' + escHtml(v.location || '—') + '</td>' +
        '<td style="padding:6px 8px;font-weight:600">' + (v.inherentRisk || 0) + '</td>' +
        '<td style="padding:6px 8px">' + (v.residualRisk || 0) + '</td>' +
        '<td style="padding:6px 8px;color:' + { critical: '#DC2626', high: '#D97706', medium: '#2563EB', low: '#16A34A' }[tier] + ';font-weight:600">' + riskLabelForTier(tier) + '</td>' +
        '<td style="padding:6px 8px">' + escHtml((v.dataTypes || []).join(', ') || '—') + '</td>' +
        '<td style="padding:6px 8px">Vendor Risk Radar</td>' +
        '</tr>';
    }).join('');

    // Build dependency KPI section
    var mappedDepsCount = vendorData.filter(function (v) { return v.dependentSystems && v.dependentSystems.length > 0; }).length;
    var upstreamMap = {};
    vendorData.forEach(function (v) { (v.upstreamProviders || []).forEach(function (p) { upstreamMap[p] = (upstreamMap[p] || 0) + 1; }); });
    var sharedDeps = Object.keys(upstreamMap).map(function (k) { return [k, upstreamMap[k]]; }).filter(function (e) { return e[1] > 1; });

    // Recommendations
    var recs = [];
    if (critical > 0) recs.push('Conduct immediate risk review for ' + critical + ' critical-risk vendor' + (critical > 1 ? 's' : '') + '.');
    if (high > 0) recs.push('Schedule remediation planning for ' + high + ' high-risk vendor' + (high > 1 ? 's' : '') + ' within 30 days.');
    var sbomGaps = vendorData.filter(function (v) { return v.sbomProfile && v.sbomProfile.providesSoftware && !v.sbomProfile.sbomAvailable; }).length;
    if (sbomGaps > 0) recs.push('Request SBOMs from ' + sbomGaps + ' software-providing vendor' + (sbomGaps > 1 ? 's' : '') + ' (NIST SP 800-161).');
    if (sharedDeps.length > 0) recs.push('Review shared dependency concentration: ' + sharedDeps.map(function (e) { return e[0] + ' (' + e[1] + ' vendors)'; }).join(', ') + '.');
    if (recs.length === 0) recs.push('Maintain current vendor monitoring cadence and review annually.');

    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8"/>\n' +
      '<meta name="viewport" content="width=device-width,initial-scale=1"/>\n' +
      '<title>Portfolio C-SCRM Report' + (clientName ? ' — ' + clientName : '') + '</title>\n' +
      '<style>\n' +
      'body{font-family:\'Segoe UI\',Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a1a2e;max-width:1100px;margin:0 auto;padding:2rem}\n' +
      'h1{color:#33691E;font-size:1.8rem;margin-bottom:.25rem}\n' +
      'h2{color:#1e3a5f;font-size:1.15rem;margin-top:2rem;border-bottom:2px solid #e5e7eb;padding-bottom:.35rem}\n' +
      'h3{color:#374151;font-size:1rem;margin-top:1.25rem}\n' +
      '.cover-meta{color:#6b7280;font-size:.875rem;margin-bottom:2rem}\n' +
      '.cover-risk-summary{display:flex;gap:1.5rem;flex-wrap:wrap;margin:1.5rem 0}\n' +
      '.risk-kpi{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:.75rem 1.25rem;min-width:100px;text-align:center}\n' +
      '.risk-kpi .num{font-size:1.75rem;font-weight:700}\n' +
      '.risk-kpi .lbl{font-size:.75rem;color:#6b7280}\n' +
      '.critical .num{color:#DC2626} .high .num{color:#D97706} .medium .num{color:#2563EB} .low .num{color:#16A34A}\n' +
      'table{width:100%;border-collapse:collapse;font-size:.875rem;margin-top:.75rem}\n' +
      'thead tr{background:#f3f4f6}\n' +
      'th{padding:8px;text-align:left;font-weight:600;border-bottom:2px solid #d1d5db}\n' +
      '.report-footer{margin-top:3rem;padding-top:1rem;border-top:1px solid #e5e7eb;font-size:.75rem;color:#9ca3af;display:flex;justify-content:space-between}\n' +
      'ul{margin:.5rem 0;padding-left:1.5rem}\n' +
      '@media print{body{padding:.5rem} h1{font-size:1.4rem}}\n' +
      '</style>\n</head>\n<body>\n' +
      '<h1>Portfolio C-SCRM Report</h1>\n' +
      '<div class="cover-meta">' +
      (clientName ? 'Prepared for: <strong>' + escHtml(clientName) + '</strong> &nbsp;|&nbsp; ' : '') +
      'Generated: ' + escHtml(dateStr) + ' &nbsp;|&nbsp; ' +
      '<span id="reportId">Report ID: ' + reportId + '</span>' +
      '</div>\n' +
      '<div class="cover-risk-summary">\n' +
      '<div class="risk-kpi critical"><div class="num">' + critical + '</div><div class="lbl">Critical</div></div>\n' +
      '<div class="risk-kpi high"><div class="num">' + high + '</div><div class="lbl">High</div></div>\n' +
      '<div class="risk-kpi medium"><div class="num">' + medium + '</div><div class="lbl">Medium</div></div>\n' +
      '<div class="risk-kpi low"><div class="num">' + low + '</div><div class="lbl">Low</div></div>\n' +
      '<div class="risk-kpi"><div class="num">' + total + '</div><div class="lbl">Total</div></div>\n' +
      '<div class="risk-kpi"><div class="num">' + avg + '</div><div class="lbl">Avg Score</div></div>\n' +
      '</div>\n' +
      '<ol>\n' +
      '<li>Section 1  -  Executive Summary</li>\n' +
      '<li>Section 1b  -  Portfolio Risk Posture</li>\n' +
      '<li>Section 2  -  Vendor Risk Register</li>\n' +
      '<li>Section 5b  -  Dependency &amp; Cascade</li>\n' +
      '<li>Section 5  -  Recommended Actions</li>\n' +
      '<li>Appendix  -  Methodology</li>\n' +
      '</ol>\n' +
      '<h2>Section 1  -  Executive Summary</h2>\n' +
      '<p><strong>Purpose &amp; Scope</strong></p>\n' +
      '<p>This C-SCRM portfolio report covers <strong>' + total + ' vendor' + (total !== 1 ? 's' : '') + '</strong>' +
        (clientName ? ' managed by <strong>' + escHtml(clientName) + '</strong>' : '') +
        ', aligned to NIST SP 800-161 Rev. 1. It provides an inherent risk register, sector and geographic analysis, dependency intelligence, and prioritised recommendations.</p>\n' +
      '<p>Portfolio Risk Overview</p>\n' +
      '<p>Risk Distribution Breakdown</p>\n' +
      '<h2>Section 1b  -  Portfolio Risk Posture</h2>\n' +
      '<p>1. Vendor Risk Distribution — ' + critical + ' critical, ' + high + ' high, ' + medium + ' medium, ' + low + ' low.</p>\n' +
      '<p>2. Dependency Concentration — ' + mappedDepsCount + ' vendor' + (mappedDepsCount !== 1 ? 's' : '') + ' with mapped dependencies.</p>\n' +
      '<p>3. Operational Exposure — based on population impacted and service criticality across the portfolio.</p>\n' +
      '<p>4. Data Exposure Overview — data types handled include: ' +
        escHtml(vendorData.reduce(function (acc, v) {
          (v.dataTypes || []).forEach(function (dt) { if (acc.indexOf(dt) === -1) acc.push(dt); });
          return acc;
        }, []).join(', ') || 'not specified') + '.</p>\n' +
      '<p>5. Supply Chain Visibility — tier and upstream mappings available for ' + mappedDepsCount + ' vendor' + (mappedDepsCount !== 1 ? 's' : '') + '.</p>\n' +
      '<p>6. Portfolio Risk Posture Statement — inherent risk scores may influence procurement and monitoring decisions. This assessment does not assess control effectiveness or residual risk beyond SBOM availability signals.</p>\n' +
      '<h2>Section 2  -  Vendor Risk Register</h2>\n' +
      '<table>\n<thead><tr>' +
        '<th>Vendor</th><th>Category</th><th>Sector</th><th>Location</th>' +
        '<th>Inherent</th><th>Residual</th><th>Risk Level</th><th>Data Types</th><th>Source</th>' +
      '</tr></thead>\n<tbody>' + registerRows + '</tbody>\n</table>\n' +
      '<h2>Section 5b  -  Dependency &amp; Cascade</h2>\n' +
      '<p>' + mappedDepsCount + ' vendor' + (mappedDepsCount !== 1 ? 's' : '') + ' with mapped dependencies.</p>\n' +
      (sharedDeps.length > 0
        ? '<p>Shared dependency concentration:</p><ul>' +
          sharedDeps.map(function (e) { return '<li><strong>' + escHtml(e[0]) + '</strong> — shared by ' + e[1] + ' vendors</li>'; }).join('') +
          '</ul>\n'
        : '<p>No shared dependency hotspots identified.</p>\n') +
      '<h2>Section 5  -  Recommended Actions</h2>\n' +
      '<ul>' + recs.map(function (r) { return '<li>' + escHtml(r) + '</li>'; }).join('') + '</ul>\n' +
      '<h2>Appendix  -  Methodology</h2>\n' +
      '<p>Inherent Risk Methodology</p>\n' +
      '<p><strong>Inherent risk:</strong> scored 0–100 based on vendor criticality category (critical/strategic/tactical/commodity), data types handled (PII, PHI, Financial, IP, etc.), SBOM availability, sector, geography, service type, and population impacted. Aligned with NIST SP 800-161 Rev. 1 C-SCRM principles.</p>\n' +
      '<p><strong>Residual risk:</strong> inherent risk minus applicable control credits (e.g. SBOM on file). Does not reflect full control effectiveness; use full VIRA assessment for comprehensive residual analysis.</p>\n' +
      '<p>NIST SP 800-161 Rev. 1 · FIPS 199 · EO 14028 alignment</p>\n' +
      '<div class="report-footer">' +
      '<span>Generated by VendorSoluce&trade; Vendor Threat Radar &mdash; ' + escHtml(dateStr) + '</span>' +
      '<span>Report ID: ' + reportId + '</span>' +
      '</div>\n' +
      '</body>\n</html>';
  }

  function generateComprehensiveReport() {
    if (vendorData.length === 0) { alert('Add vendors to the radar before generating a report.'); return; }
    var html = buildReportHtml();
    triggerDownload(html, 'vendorsoluce-portfolio-cscrm-report.html', 'text/html');
  }

  function openReportForPDF() {
    if (vendorData.length === 0) { alert('Add vendors to the radar before generating a report.'); return; }
    var html = buildReportHtml();
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) alert('Pop-up blocked. Allow pop-ups for this site and try again.');
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Download helper
  // ─────────────────────────────────────────────────────────────────────────
  function triggerDownload(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Dark mode toggle
  // ─────────────────────────────────────────────────────────────────────────
  function toggleDarkMode() {
    var html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    } else {
      html.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    }
    updateSonarCanvas();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Radar mode selector
  // ─────────────────────────────────────────────────────────────────────────
  function initRadarModeSelector() {
    var radios = document.querySelectorAll('[name="radarMode"]');
    var helper = document.getElementById('modeHelper');
    var orgSizeGroup = document.getElementById('formGroupOrgSize');
    var msgs = {
      baseline: 'Baseline mode: service types populate the radar automatically. Add vendors to refine.',
      real: 'Real-data mode: enter your actual vendors for precise risk scoring.',
      hybrid: 'Hybrid mode: mix baseline service-category placeholders with real vendor data.',
    };
    function setMode(mode) {
      if (helper) helper.textContent = msgs[mode] || '';
      if (orgSizeGroup) orgSizeGroup.style.display = (mode === 'baseline' || mode === 'hybrid') ? '' : 'none';
    }
    radios.forEach(function (r) {
      r.addEventListener('change', function () { setMode(r.value); });
    });
    // Set initial state
    var checked = document.querySelector('[name="radarMode"]:checked');
    if (!checked && radios.length > 0) {
      radios[0].checked = true;
      checked = radios[0];
    }
    if (checked) setMode(checked.value);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Sonar canvas resize
  // ─────────────────────────────────────────────────────────────────────────
  window.addEventListener('resize', function () { updateSonarCanvas(); });

  // ─────────────────────────────────────────────────────────────────────────
  // Initialisation
  // ─────────────────────────────────────────────────────────────────────────
  function init() {
    loadVendors();
    setupFormSubmit();
    updateAllDisplays();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Global exports
  // ─────────────────────────────────────────────────────────────────────────
  window.vendorData = vendorData;
  window.calculateVendorRisk = calculateVendorRisk;
  window.openAddVendor = openAddVendor;
  window.closeVendorModal = closeVendorModal;
  window.editVendor = editVendor;
  window.deleteVendor = deleteVendor;
  window.scanVendors = scanVendors;
  window.clearAllVendors = clearAllVendors;
  window.exportVendors = exportVendors;
  window.importVendors = importVendors;
  window.generateComprehensiveReport = generateComprehensiveReport;
  window.filterVendors = filterVendors;
  window.viewVendorDetails = viewVendorDetails;
  window.toggleDarkMode = toggleDarkMode;
  window.importRadarPortfolioJson = importRadarPortfolioJson;
  window.downloadRadarPortfolioJson = downloadRadarPortfolioJson;
  window.downloadVendorCsvTemplate = downloadVendorCsvTemplate;
  window.initRadarModeSelector = initRadarModeSelector;
  window.updateAllDisplays = updateAllDisplays;
  window.addVendorsToWorkingList = addVendorsToWorkingList;
})();
