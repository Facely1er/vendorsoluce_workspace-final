/**
 * Vendor Exposure Map™ — portfolio HTML report (single source of truth).
 * Used by: Vendor Threat Radar download/open PDF, sample-portfolio-cscrm-report.html
 * Input shape matches radar vendorData[] (see radar-runtime.js).
 */
(function () {
  'use strict';

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getRiskTier(score) {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  function riskLabelForTier(tier) {
    return { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }[tier] || tier;
  }

  function coerceDependencyStringArray(val) {
    if (Array.isArray(val)) {
      return val.map(function (s) { return String(s).trim(); }).filter(Boolean);
    }
    if (val == null || val === '') return [];
    if (typeof val === 'string') {
      return val.split(/[,;]/).map(function (s) { return s.trim(); }).filter(Boolean);
    }
    return [];
  }

  function vendorHasMappedDependencies(v) {
    return (
      coerceDependencyStringArray(v.dependentSystems).length > 0 ||
      coerceDependencyStringArray(v.upstreamProviders).length > 0 ||
      coerceDependencyStringArray(v.subProcessors).length > 0
    );
  }

  function badgeClass(tier) {
    return (
      'badge-' +
      ({ critical: 'critical', high: 'high', medium: 'medium', low: 'low' }[tier] || 'low')
    );
  }

  function depCount(v) {
    return (
      coerceDependencyStringArray(v.upstreamProviders).length +
      coerceDependencyStringArray(v.dependentSystems).length
    );
  }

  function impact15(inh) {
    return Math.max(1, Math.min(5, Math.ceil((inh || 0) / 20)));
  }

  function density15(v) {
    var n = depCount(v);
    return Math.max(1, Math.min(5, n + 1));
  }

  function threat15(tier) {
    return { critical: 5, high: 4, medium: 3, low: 2 }[tier] || 2;
  }

  function exposureTotal(v) {
    var s = v.residualRisk !== undefined ? v.residualRisk : v.inherentRisk || 0;
    var t = getRiskTier(s);
    return impact15(v.inherentRisk || 0) * density15(v) * threat15(t);
  }

  function buildPortfolioState(vendors) {
    var critical = 0;
    var high = 0;
    var medium = 0;
    var low = 0;
    var totalRisk = 0;
    var mappedDepsCount = 0;
    vendors.forEach(function (v) {
      var score = v.residualRisk !== undefined ? v.residualRisk : v.inherentRisk || 0;
      totalRisk += v.inherentRisk || 0;
      var t = getRiskTier(score);
      if (t === 'critical') critical++;
      else if (t === 'high') high++;
      else if (t === 'medium') medium++;
      else low++;
      if (vendorHasMappedDependencies(v)) mappedDepsCount++;
    });
    var total = vendors.length;
    var avg = total > 0 ? Math.round(totalRisk / total) : 0;

    var upstreamMap = {};
    var upstreamLabel = {};
    vendors.forEach(function (v) {
      coerceDependencyStringArray(v.upstreamProviders).forEach(function (p) {
        var raw = p.trim();
        if (!raw) return;
        var norm = raw.toLowerCase();
        if (!upstreamLabel[norm]) upstreamLabel[norm] = raw;
        upstreamMap[norm] = (upstreamMap[norm] || 0) + 1;
      });
    });
    var sharedDeps = Object.keys(upstreamMap)
      .map(function (k) {
        return [upstreamLabel[k] || k, upstreamMap[k]];
      })
      .filter(function (e) {
        return e[1] > 1;
      })
      .sort(function (a, b) {
        return b[1] - a[1];
      });

    var maxHotspotShare = 0;
    sharedDeps.forEach(function (e) {
      if (e[1] > maxHotspotShare) maxHotspotShare = e[1];
    });
    var concentrationPct =
      total > 0 && maxHotspotShare > 0
        ? Math.min(100, Math.round((maxHotspotShare / total) * 100))
        : 0;

    var sorted = vendors.slice().sort(function (a, b) {
      return (b.inherentRisk || 0) - (a.inherentRisk || 0);
    });
    var maxInh = sorted.length ? sorted[0].inherentRisk || 0 : 0;
    var cascadeSev = ((maxInh / 100) * 5).toFixed(1);

    var dataTypesUnion = [];
    vendors.forEach(function (v) {
      (v.dataTypes || []).forEach(function (dt) {
        if (dataTypesUnion.indexOf(dt) === -1) dataTypesUnion.push(dt);
      });
    });

    var recs = [];
    if (critical > 0) {
      recs.push(
        'Conduct immediate risk review for ' +
          critical +
          ' critical-risk vendor' +
          (critical > 1 ? 's' : '') +
          '.'
      );
    }
    if (high > 0) {
      recs.push(
        'Schedule remediation planning for ' +
          high +
          ' high-risk vendor' +
          (high > 1 ? 's' : '') +
          ' within 30 days.'
      );
    }
    var sbomGaps = vendors.filter(function (v) {
      return v.sbomProfile && v.sbomProfile.providesSoftware && !v.sbomProfile.sbomAvailable;
    }).length;
    if (sbomGaps > 0) {
      recs.push(
        'Request SBOMs from ' +
          sbomGaps +
          ' software-providing vendor' +
          (sbomGaps > 1 ? 's' : '') +
          ' (NIST SP 800-161).'
      );
    }
    if (sharedDeps.length > 0) {
      recs.push(
        'Review shared dependency concentration: ' +
          sharedDeps
            .map(function (e) {
              return e[0] + ' (' + e[1] + ' vendors)';
            })
            .join(', ') +
          '.'
      );
    }
    if (recs.length === 0) {
      recs.push('Maintain current vendor monitoring cadence and review annually.');
    }

    var tier2 = vendors.filter(function (v) {
      var n = v.tierLevel;
      if (n === null || n === undefined || n === '') return false;
      var num = typeof n === 'number' ? n : parseInt(String(n), 10);
      return !isNaN(num) && num >= 2;
    }).length;

    return {
      critical: critical,
      high: high,
      medium: medium,
      low: low,
      total: total,
      avg: avg,
      mappedDepsCount: mappedDepsCount,
      sharedDeps: sharedDeps,
      upstreamMap: upstreamMap,
      sorted: sorted,
      dataTypesUnion: dataTypesUnion,
      recs: recs,
      concentrationPct: concentrationPct,
      cascadeSev: cascadeSev,
      tier2: tier2,
      maxInh: maxInh,
    };
  }

  function serviceLower(v) {
    return String(v.serviceType || '').toLowerCase();
  }

  function scenarioBlocks(vendors) {
    var any = function (re) {
      return vendors.some(function (v) {
        return re.test(serviceLower(v));
      });
    };
    var cloud = any(/\b(cloud|aws|azure|gcp|hosting|infrastructure|cdn)\b/);
    var id = any(/\b(identity|sso|okta|auth|iam|access management)\b/);
    var pay = any(/\b(payment|stripe|billing|payroll|transaction)\b/);

    var a = cloud
      ? {
          title: 'Scenario A — Cloud / hosting stress',
          badge: 'high',
          trigger: 'Material outage or degradation of shared cloud or hosting dependencies.',
          propagation: 'Hosting → API availability → dependent applications and internal operations.',
          effect:
            'Customer-facing downtime, delivery delays, and degraded support when workloads share common regions or providers.',
        }
      : {
          title: 'Scenario A — Portfolio concentration',
          badge: 'medium',
          trigger: 'Any widespread failure affecting multiple vendors in the same dependency class.',
          propagation: 'Shared supplier → overlapping recovery windows → correlated business impact.',
          effect: 'Elevated business interruption where diversification is limited.',
        };

    var b = id
      ? {
          title: 'Scenario B — Identity / access disruption',
          badge: 'critical',
          trigger: 'Identity provider compromise, misconfiguration, or widespread authentication failure.',
          propagation: 'Authentication → workforce and application access → administrative control paths.',
          effect:
            'Broad operational lockout, slower incident response, and elevated business interruption until recovery paths are exercised.',
        }
      : {
          title: 'Scenario B — Privileged access path',
          badge: 'high',
          trigger: 'Loss of administrative or break-glass access during an incident.',
          propagation: 'Access constraints → delayed restoration → extended outage windows.',
          effect: 'Recovery sequencing risk for critical services.',
        };

    var c = pay
      ? {
          title: 'Scenario C — Payment or financial API failure',
          badge: 'high',
          trigger: 'Payment processor or financial integration outage.',
          propagation: 'Transactions → order completion → revenue collection → customer trust.',
          effect: 'Immediate revenue friction and abandonment risk without degraded-mode handling.',
        }
      : {
          title: 'Scenario C — Critical data or analytics path',
          badge: 'high',
          trigger: 'Loss of key data or analytics services supporting decisions or operations.',
          propagation: 'Reporting gaps → delayed leadership decisions → operational drag.',
          effect: 'Compliance and customer commitments at risk when evidence trails break.',
        };

    return [a, b, c];
  }

  var CSS =
    ':root{--bg:#f5f7fb;--surface:#fff;--surface-2:#f8fafc;--ink:#0f172a;--muted:#475569;--line:#dbe3ef;--brand:#0f766e;--shadow:0 12px 28px rgba(15,23,42,.08);--radius:18px;--max:1180px}' +
    '*{box-sizing:border-box}html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);font:15px/1.6 Inter,Segoe UI,Arial,sans-serif}' +
    'h1,h2,h3,h4{margin:0 0 10px;line-height:1.2}h1{font-size:42px;letter-spacing:-.03em}h2{font-size:28px;letter-spacing:-.02em}h3{font-size:20px}h4{font-size:16px}p{margin:0 0 12px}' +
    '.page{max-width:var(--max);margin:0 auto;padding:28px}' +
    '.hero{background:linear-gradient(135deg,#0f172a 0%,#111827 34%,#0f766e 100%);color:#fff;border-radius:28px;padding:40px 42px;box-shadow:var(--shadow);position:relative;overflow:hidden}' +
    '.eyebrow{display:inline-block;padding:8px 12px;border:1px solid rgba(255,255,255,.18);border-radius:999px;font-size:12px;text-transform:uppercase;letter-spacing:.12em;margin-bottom:18px;background:rgba(255,255,255,.06)}' +
    '.hero-grid{display:grid;grid-template-columns:1.3fr .9fr;gap:28px;align-items:end}' +
    '.hero p.lead{font-size:18px;color:rgba(255,255,255,.88);max-width:760px}' +
    '.meta-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px);border-radius:20px;padding:18px}' +
    '.meta-row{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.12)}.meta-row:last-child{border-bottom:0}' +
    '.meta-row span:first-child{color:rgba(255,255,255,.72)}.meta-row span:last-child{font-weight:700}' +
    '.section{margin-top:22px}' +
    '.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:24px}' +
    '.section-head{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-bottom:16px}.section-head p{margin:0;color:var(--muted)}' +
    '.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:18px}.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}' +
    '.metric{background:linear-gradient(180deg,#fff,#f9fbff);border:1px solid var(--line);border-radius:18px;padding:18px}' +
    '.metric .label{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}' +
    '.metric .value{font-size:34px;font-weight:800;letter-spacing:-.03em;margin-top:6px}' +
    '.metric .sub{color:var(--muted);font-size:13px;margin-top:6px}' +
    '.badge{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}' +
    '.badge-critical{background:#fee2e2;color:#991b1b}.badge-high{background:#ffedd5;color:#9a3412}.badge-medium{background:#fef3c7;color:#92400e}.badge-low{background:#dcfce7;color:#166534}' +
    '.kpi-list{display:grid;gap:12px}' +
    '.kpi-item{display:flex;gap:12px;align-items:flex-start;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--surface-2)}' +
    '.kpi-item .dot{width:10px;height:10px;border-radius:999px;background:var(--brand);margin-top:7px;flex:0 0 10px}' +
    'table{width:100%;border-collapse:collapse}th,td{padding:12px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}' +
    'th{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}tbody tr:hover{background:#fafcff}' +
    '.small{font-size:13px;color:var(--muted)}' +
    '.pill{display:inline-block;padding:4px 8px;border-radius:999px;background:#e2e8f0;font-size:12px;font-weight:700;color:#334155}' +
    '.flow{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;align-items:center}' +
    '.flow-step{background:linear-gradient(180deg,#fff,#f8fafc);border:1px solid var(--line);border-radius:16px;padding:14px;min-height:118px}' +
    '.arrow{display:flex;align-items:center;justify-content:center;color:#64748b;font-size:24px}' +
    '.scenario{border:1px solid var(--line);border-radius:18px;padding:18px;background:linear-gradient(180deg,#fff,#fbfdff)}' +
    '.scenario .title-row{display:flex;justify-content:space-between;gap:10px;align-items:start;margin-bottom:10px}' +
    '.scenario .impact{border-left:4px solid var(--brand);padding-left:12px;margin-top:12px}' +
    '.bars{display:grid;gap:10px}' +
    '.bar-row{display:grid;grid-template-columns:170px 1fr 52px;gap:12px;align-items:center}' +
    '.track{height:12px;background:#e5e7eb;border-radius:999px;overflow:hidden}' +
    '.fill{height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6)}' +
    '.rank-card{border:1px solid var(--line);border-radius:16px;padding:16px;background:#fff}' +
    '.rank-card .top{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:6px}' +
    '.score{font-weight:800;font-size:28px;letter-spacing:-.03em}' +
    '.callout{background:#ecfeff;border:1px solid #bae6fd;border-radius:16px;padding:18px}' +
    '.footer{margin:22px 0 30px;color:var(--muted);font-size:13px;text-align:center}' +
    '.sample-banner{background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:.75rem 1rem;margin:0 auto 18px;max-width:var(--max);font-size:.875rem;color:#92400e}' +
    '.print-toolbar{position:sticky;top:0;z-index:40;display:flex;justify-content:center;padding:12px 0;background:linear-gradient(180deg,rgba(245,247,251,.98),rgba(245,247,251,.82),rgba(245,247,251,0))}' +
    '.toolbar-inner{display:flex;gap:10px;align-items:center;background:rgba(15,23,42,.94);color:#fff;padding:10px 12px;border-radius:999px;box-shadow:var(--shadow)}' +
    'button{appearance:none;border:0;border-radius:999px;padding:10px 14px;background:#14b8a6;color:#052e2b;font-weight:800;cursor:pointer}' +
    'button.secondary{background:#1f2937;color:#fff;border:1px solid rgba(255,255,255,.14)}' +
    '.muted-box{background:#f8fafc;border:1px dashed #cbd5e1;border-radius:14px;padding:14px;color:#475569}' +
    '.cscrm-inline{font-size:13px;color:var(--muted);margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}' +
    '@media (max-width:1024px){.hero-grid,.grid-2,.grid-3,.grid-4,.flow{grid-template-columns:1fr}.arrow{display:none}h1{font-size:34px}}' +
    '@media print{:root{--bg:#fff;--shadow:none}.print-toolbar,.sample-banner{display:none!important}.page{max-width:none;padding:0}.hero,.card,.metric,.scenario,.rank-card{box-shadow:none}.section{break-inside:avoid}body{background:#fff}}';

  /**
   * @param {Array} vendors - same objects as radar vendorData
   * @param {object} options - clientName, reportId, dateStr, illustrative, fixedDate
   */
  function buildVendorExposureMapReportHtml(vendors, options) {
    options = options || {};
    var clientName = options.clientName || '';
    var reportId = options.reportId || 'VS-RPT-' + Date.now().toString(36).toUpperCase();
    var dateStr =
      options.dateStr ||
      options.fixedDate ||
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    var illustrative = !!options.illustrative;

    var st = buildPortfolioState(vendors);
    var scenarios = scenarioBlocks(vendors);

    var topForBars = st.sorted.slice(0, 5);

    var kpi1 =
      st.sharedDeps.length > 0
        ? '<strong>Shared upstream concentration.</strong><br><span class="small">' +
          escHtml(st.sharedDeps[0][0]) +
          ' appears across multiple vendor relationships — review failover and diversification.</span>'
        : '<strong>Dependency mapping.</strong><br><span class="small">' +
          (st.mappedDepsCount
            ? st.mappedDepsCount + ' vendor(s) have mapped dependencies; expand coverage for critical tiers.'
            : 'Add upstream providers and dependent systems to unlock hotspot analysis.') +
          '</span>';

    var outagePct =
      st.total > 0 ? Math.min(100, Math.round(((st.critical + st.high) / st.total) * 100)) : 0;
    var kpi2 =
      '<strong>High materiality in the portfolio.</strong><br><span class="small">About ' +
      outagePct +
      '% of vendors are rated critical or high — prioritize continuity evidence for those relationships.</span>';

    var kpi3 =
      '<strong>Tier 2+ visibility.</strong><br><span class="small">' +
      (st.tier2
        ? st.tier2 + ' vendor(s) show Tier 2+ in your register; validate sub-processor and cascade data where gaps remain.'
        : 'Capture tier depth and sub-processor visibility for top critical vendors.') +
      '</span>';

    var immediate = st.recs.slice(0, 4);
    while (immediate.length < 4) {
      immediate.push('Establish a recurring exposure review cadence with updated threat overlays.');
    }

    var registerRows = st.sorted
      .map(function (v) {
        var score = v.residualRisk !== undefined ? v.residualRisk : v.inherentRisk || 0;
        var tier = getRiskTier(score);
        var bc =
          coerceDependencyStringArray(v.criticalOperations)[0] ||
          v.category ||
          '—';
        var tierLabel = v.tierLevel != null && v.tierLevel !== '' ? 'Tier ' + escHtml(String(v.tierLevel)) : '—';
        return (
          '<tr>' +
          '<td>' +
          escHtml(v.name) +
          '</td>' +
          '<td>' +
          escHtml(v.serviceType || '—') +
          '</td>' +
          '<td>' +
          escHtml(bc) +
          '</td>' +
          '<td>' +
          escHtml((v.dataTypes || []).join(', ') || '—') +
          '</td>' +
          '<td><span class="pill">' +
          tierLabel +
          '</span></td>' +
          '<td><span class="badge ' +
          badgeClass(tier) +
          '">' +
          escHtml(riskLabelForTier(tier)) +
          '</span></td>' +
          '<td class="small">' +
          escHtml(
            (coerceDependencyStringArray(v.upstreamProviders).slice(0, 2).join('; ') ||
              v.notes ||
              '—').slice(0, 160)
          ) +
          '</td>' +
          '</tr>'
        );
      })
      .join('');

    var topUpstream = Object.keys(st.upstreamMap)
      .sort(function (a, b) {
        return st.upstreamMap[b] - st.upstreamMap[a];
      })
      .slice(0, 6)
      .map(function (k) {
        return k;
      });
    var upstreamReadable = topUpstream.length
      ? topUpstream.map(function (k) {
          for (var i = 0; i < vendors.length; i++) {
            var ups = coerceDependencyStringArray(vendors[i].upstreamProviders);
            for (var j = 0; j < ups.length; j++) {
              if (ups[j].trim().toLowerCase() === k) return ups[j].trim();
            }
          }
          return k;
        })
      : [];
    var flowDeps =
      upstreamReadable.length > 0
        ? upstreamReadable.slice(0, 5).join(' / ')
        : st.sorted.length
          ? 'Map upstream providers on vendor rows'
          : '—';

    var barRows = topForBars
      .map(function (v) {
        var w = Math.min(100, v.inherentRisk || 0);
        return (
          '<div class="bar-row"><span>' +
          escHtml(v.name.length > 22 ? v.name.slice(0, 20) + '…' : v.name) +
          '</span><div class="track"><div class="fill" style="width:' +
          w +
          '%"></div></div><span>' +
          (v.inherentRisk || 0) +
          '</span></div>'
        );
      })
      .join('');

    var scoreRows = st.sorted.slice(0, 12)
      .map(function (v) {
        var score = v.residualRisk !== undefined ? v.residualRisk : v.inherentRisk || 0;
        var tier = getRiskTier(score);
        var im = impact15(v.inherentRisk || 0);
        var den = density15(v);
        var th = threat15(tier);
        var tot = im * den * th;
        var cat =
          tier === 'critical'
            ? 'Systemic / centralized'
            : tier === 'high'
              ? 'Revenue / availability'
              : tier === 'medium'
                ? 'Operational'
                : 'Lower priority';
        return (
          '<tr><td>' +
          escHtml(v.name) +
          '</td><td>' +
          im +
          '</td><td>' +
          den +
          '</td><td>' +
          th +
          '</td><td><strong>' +
          tot +
          '</strong></td><td><span class="badge ' +
          badgeClass(tier) +
          '">' +
          escHtml(cat) +
          '</span></td></tr>'
        );
      })
      .join('');

    var rank3 = st.sorted.slice(0, 3);
    var rankCards = rank3
      .map(function (v, idx) {
        var tot = exposureTotal(v);
        var score = v.residualRisk !== undefined ? v.residualRisk : v.inherentRisk || 0;
        var tier = getRiskTier(score);
        var action =
          tier === 'critical'
            ? 'Validate resilience architecture, recovery priority, and contractual support paths.'
            : tier === 'high'
              ? 'Tighten monitoring, contingency triggers, and evidence collection for this dependency class.'
              : 'Maintain periodic review and dependency updates.';
        return (
          '<div class="rank-card"><div class="top"><div><h3>#' +
          (idx + 1) +
          ' ' +
          escHtml(v.name) +
          '</h3><p class="small">' +
          escHtml(v.serviceType || 'Registered service') +
          '</p></div><div class="score">' +
          tot +
          '</div></div><p><strong>Action:</strong> ' +
          action +
          '</p></div>'
        );
      })
      .join('');

    if (rankCards === '') {
      rankCards =
        '<div class="rank-card"><p class="small">Add vendors to populate the action queue.</p></div>';
    }

    var scenHtml = scenarios
      .map(function (s) {
        return (
          '<div class="scenario"><div class="title-row"><h3>' +
          escHtml(s.title) +
          '</h3><span class="badge badge-' +
          s.badge +
          '">' +
          escHtml(s.badge.charAt(0).toUpperCase() + s.badge.slice(1)) +
          '</span></div><p><strong>Trigger:</strong> ' +
          escHtml(s.trigger) +
          '</p><p><strong>Propagation:</strong> ' +
          escHtml(s.propagation) +
          '</p><div class="impact"><p><strong>Estimated effect:</strong> ' +
          escHtml(s.effect) +
          '</p></div></div>'
        );
      })
      .join('');

    var banner = illustrative
      ? '<div class="sample-banner"><strong>Illustrative sample only.</strong> Fictional or demo vendors for layout review. ' +
        '<a href="vendor-threat-radar.html#vendor-inherent-risk-report" style="color:#92400e;font-weight:600">Generate a report from your portfolio</a> in Vendor Threat Radar (same engine).</div>'
      : '';

    var dataTypesText = st.dataTypesUnion.join(', ') || 'not specified';

    var html =
      '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8"/>\n' +
      '<meta name="viewport" content="width=device-width,initial-scale=1"/>\n' +
      '<title>Vendor Exposure Map™ — Portfolio C-SCRM report' +
      (clientName ? ' — ' + escHtml(clientName) : '') +
      '</title>\n' +
      (illustrative ? '<meta name="robots" content="noindex, follow"/>\n' : '') +
      '<style>\n' +
      CSS +
      '\n</style>\n</head>\n<body>\n' +
      banner +
      '<div class="print-toolbar"><div class="toolbar-inner"><span>Vendor Exposure Map™ · Portfolio report</span>' +
      '<button type="button" onclick="window.print()">Print / Save PDF</button>' +
      '<button type="button" class="secondary" onclick="document.querySelectorAll(\'.small,.muted-box\').forEach(function(el){el.style.display=el.style.display===\'none\'?\'\':\'none\';})">Toggle guidance</button></div></div>' +
      '<main class="page">' +
      '<section class="hero"><div class="hero-grid"><div>' +
      '<div class="eyebrow">VendorSoluce / ERMITS · NIST SP 800-161 Rev. 1 · C-SCRM</div>' +
      '<h1>Vendor Exposure Map™</h1>' +
      '<p class="lead">Dependency and cascade view for your vendor portfolio. Risk scores and dependency fields come from the same Vendor Threat Radar register you use in the browser. Aligned to NIST SP 800-161 supply chain risk management practices.</p>' +
      '</div><aside class="meta-card">' +
      '<div class="meta-row"><span>Client</span><span>' +
      (clientName ? escHtml(clientName) : '—') +
      '</span></div>' +
      '<div class="meta-row"><span>Report date</span><span>' +
      escHtml(dateStr) +
      '</span></div>' +
      '<div class="meta-row"><span>Prepared by</span><span>ERMITS Advisory</span></div>' +
      '<div class="meta-row"><span>Report ID</span><span>' +
      escHtml(reportId) +
      '</span></div>' +
      '<div class="meta-row"><span>Classification</span><span>Confidential / client use</span></div>' +
      '</aside></div></section>' +

      '<section class="section card"><div class="section-head"><div><h2>1. Executive summary</h2>' +
      '<p>Leadership snapshot derived from current portfolio scores and dependency mappings.</p></div>' +
      '<div><span class="badge badge-critical">Critical</span> <span class="badge badge-high">High</span> ' +
      '<span class="badge badge-medium">Medium</span> <span class="badge badge-low">Low</span></div></div>' +

      '<div class="grid-4">' +
      '<div class="metric"><div class="label">Critical vendors</div><div class="value">' +
      st.critical +
      '</div><div class="sub">Of ' +
      st.total +
      ' in register</div></div>' +
      '<div class="metric"><div class="label">Shared dependency concentration</div><div class="value">' +
      (st.sharedDeps.length ? st.concentrationPct + '%' : '—') +
      '</div><div class="sub">' +
      (st.sharedDeps.length
        ? 'Largest shared upstream footprint vs portfolio size'
        : 'No shared upstream hotspots yet') +
      '</div></div>' +
      '<div class="metric"><div class="label">Cascade severity (max)</div><div class="value">' +
      st.cascadeSev +
      '/5</div><div class="sub">By highest inherent materiality</div></div>' +
      '<div class="metric"><div class="label">Action window</div><div class="value">30d</div><div class="sub">Priority remediation horizon</div></div>' +
      '</div>' +

      '<div class="grid-2" style="margin-top:18px"><div class="kpi-list">' +
      '<div class="kpi-item"><div class="dot"></div><div>' +
      kpi1 +
      '</div></div>' +
      '<div class="kpi-item"><div class="dot"></div><div>' +
      kpi2 +
      '</div></div>' +
      '<div class="kpi-item"><div class="dot"></div><div>' +
      kpi3 +
      '</div></div>' +
      '</div><div class="callout"><h3>Immediate actions</h3>' +
      immediate
        .map(function (r, i) {
          return '<p><strong>' + (i + 1) + '.</strong> ' + escHtml(r) + '</p>';
        })
        .join('') +
      '</div></div>' +

      '<div class="cscrm-inline"><p><strong>Section 1b — Portfolio risk posture (C-SCRM)</strong></p>' +
      '<p>1. Vendor risk distribution — ' +
      st.critical +
      ' critical, ' +
      st.high +
      ' high, ' +
      st.medium +
      ' medium, ' +
      st.low +
      ' low.</p>' +
      '<p>2. Dependency concentration — ' +
      st.mappedDepsCount +
      ' vendor(s) with mapped dependencies.</p>' +
      '<p>3. Operational exposure — based on population impacted and service criticality across the portfolio.</p>' +
      '<p>4. Data exposure overview — data types: ' +
      escHtml(dataTypesText) +
      '.</p>' +
      '<p>5. Supply chain visibility — tier and upstream mappings captured for ' +
      st.mappedDepsCount +
      ' vendor(s).</p>' +
      '<p>6. Posture statement — inherent scores inform procurement and monitoring; this export does not assess full control effectiveness or residual posture beyond SBOM signals captured in the tool.</p>' +
      '<p><strong>Purpose &amp; scope:</strong> Portfolio-level view aligned to NIST SP 800-161 Rev. 1. <strong>Portfolio risk overview</strong> and <strong>risk distribution breakdown</strong> are reflected in the metrics and register above.</p>' +
      '</div></section>' +

      '<section class="section card"><div class="section-head"><div><h2>2. Scope and methodology</h2>' +
      '<p>Generated from Vendor Threat Radar portfolio data (same source as the interactive radar).</p></div></div>' +
      '<div class="grid-2"><div><h3>Scope</h3><table><tbody>' +
      '<tr><th>Vendors assessed</th><td>' +
      st.total +
      '</td></tr>' +
      '<tr><th>Coverage depth</th><td>Tier 1 register; dependency fields optional per vendor</td></tr>' +
      '<tr><th>Data sources</th><td>Radar register, CSV import, portfolio JSON</td></tr>' +
      '</tbody></table></div>' +
      '<div><h3>Methodology</h3><div class="muted-box">' +
      '<p><strong>Dependency mapping:</strong> Upstream providers, dependent systems, and critical operations when provided.</p>' +
      '<p><strong>Risk scoring:</strong> Inherent/residual scores from the same calculator as the radar UI.</p>' +
      '<p><strong>Hotspots:</strong> Shared upstream labels counted across vendors (case-insensitive merge).</p>' +
      '<p class="small"><strong>Framework:</strong> NIST SP 800-161, NIST CSF 2.0 supplier themes, ISO/IEC 27001 supplier controls.</p>' +
      '</div></div></div></section>' +

      '<section class="section card"><div class="section-head"><div><h2>3. Vendor inventory and criticality</h2>' +
      '<p>Section 2 — vendor risk register (sorted by inherent materiality).</p></div></div>' +
      '<table><thead><tr><th>Vendor</th><th>Service</th><th>Business function / ops</th><th>Data sensitivity</th><th>Tier</th><th>Criticality</th><th>Notes</th></tr></thead><tbody>' +
      registerRows +
      '</tbody></table></section>' +

      '<section class="section card"><div class="section-head"><div><h2>4. Dependency and exposure flow</h2>' +
      '<p>Section 5b — dependency &amp; cascade (portfolio roll-up).</p></div></div>' +
      '<div class="flow">' +
      '<div class="flow-step"><h4>Business services</h4><p class="small">As described on vendor rows (critical operations / categories)</p></div>' +
      '<div class="arrow">→</div>' +
      '<div class="flow-step"><h4>Applications &amp; integrations</h4><p class="small">Dependent systems where captured</p></div>' +
      '<div class="arrow">→</div>' +
      '<div class="flow-step"><h4>Upstream &amp; shared providers</h4><p>' +
      escHtml(flowDeps) +
      '</p><p class="small">' +
      (st.sharedDeps.length
        ? 'Shared concentration: ' +
          escHtml(
            st.sharedDeps
              .map(function (e) {
                return e[0] + ' (' + e[1] + ' vendors)';
              })
              .join('; ')
          )
        : 'Add upstream providers to see shared hotspots') +
      '</p></div></div>' +
      '<div class="grid-2" style="margin-top:18px"><div><h3>Observations</h3><div class="kpi-list">' +
      '<div class="kpi-item"><div class="dot"></div><div><strong>Mapped dependencies:</strong> ' +
      st.mappedDepsCount +
      ' of ' +
      st.total +
      ' vendors.</div></div>' +
      '<div class="kpi-item"><div class="dot"></div><div><strong>Shared hotspots:</strong> ' +
      st.sharedDeps.length +
      ' detected.</div></div>' +
      '</div></div><div><h3>Inherent materiality (bars)</h3><div class="bars">' +
      barRows +
      '</div><p class="small">Bar width tracks inherent risk score (0–100).</p></div></div></section>' +

      '<section class="section card"><div class="section-head"><div><h2>5. Cascade risk scenarios</h2>' +
      '<p>Illustrative scenarios selected from service types in the portfolio.</p></div></div>' +
      '<div class="grid-3">' +
      scenHtml +
      '</div></section>' +

      '<section class="section card"><div class="section-head"><div><h2>6. Exposure scoring model</h2>' +
      '<p>Composite score = impact × dependency density × threat weight (1–5 each).</p></div></div>' +
      '<div class="grid-2"><div class="muted-box"><h3 style="margin-bottom:8px">Core formula</h3>' +
      '<p style="font-family:ui-monospace,monospace">Exposure score = Impact × Dependency density × Threat weight</p>' +
      '<p class="small">Impact from inherent materiality; density from mapped dependency count; threat weight from residual tier.</p></div><div><table><thead><tr><th>Factor</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>Impact</td><td>Derived from inherent risk bucket</td></tr>' +
      '<tr><td>Dependency density</td><td>Mapped upstream + dependent systems</td></tr>' +
      '<tr><td>Threat weight</td><td>Tier from residual/inherent score</td></tr>' +
      '</tbody></table></div></div>' +
      '<table style="margin-top:16px"><thead><tr><th>Vendor</th><th>Impact</th><th>Density</th><th>Threat</th><th>Score</th><th>Category</th></tr></thead><tbody>' +
      scoreRows +
      '</tbody></table></section>' +

      '<section class="section card"><div class="section-head"><div><h2>7. Critical vendor ranking</h2>' +
      '<p>Top of the action queue (composite exposure score).</p></div></div>' +
      '<div class="grid-3">' +
      rankCards +
      '</div></section>' +

      '<section class="section card"><div class="section-head"><div><h2>8. Recommendations and roadmap</h2></div></div>' +
      '<div class="grid-3">' +
      '<div class="scenario"><h3>0–30 days</h3><p>Validate continuity evidence, contacts, and escalation paths for top-ranked vendors.</p></div>' +
      '<div class="scenario"><h3>30–90 days</h3><p>Reduce concentration where feasible; expand Tier 2 mapping for critical SaaS and infrastructure.</p></div>' +
      '<div class="scenario"><h3>90+ days</h3><p>Operationalize recurring exposure reviews and integrate into third-party governance.</p></div>' +
      '</div></section>' +

      '<section class="section card"><div class="section-head"><div><h2>9. Required inputs and evidence</h2></div></div>' +
      '<div class="grid-2"><div><h3>Minimum</h3><table><tbody>' +
      '<tr><th>Vendor list</th><td>Normalized register with owners</td></tr>' +
      '<tr><th>Dependency fields</th><td>Upstream providers, dependent systems, critical operations</td></tr>' +
      '</tbody></table></div><div><h3>Preferred</h3><table><tbody>' +
      '<tr><th>Contracts &amp; SLAs</th><td>Resilience commitments</td></tr>' +
      '<tr><th>BCP / DR</th><td>Evidence summaries</td></tr>' +
      '</tbody></table></div></div></section>' +

      '<section class="section card"><div class="section-head"><div><h2>10. Appendix — methodology</h2></div></div>' +
      '<div class="callout">' +
      '<p><strong>Inherent risk:</strong> scored 0–100 in the radar from category, data types, SBOM gap signals, sector, geography, service type, and population — NIST SP 800-161 C-SCRM alignment.</p>' +
      '<p><strong>Residual risk:</strong> inherent minus applicable credits (e.g. SBOM on file). Does not replace a full VIRA assessment.</p>' +
      '<p class="small">NIST SP 800-161 Rev. 1 · FIPS 199 · EO 14028 themes</p>' +
      '</div></section>' +

      '<div class="footer">Generated by VendorSoluce™ Vendor Threat Radar · ' +
      escHtml(dateStr) +
      ' · Report ID ' +
      escHtml(reportId) +
      '</div>' +
      '</main></body></html>';

    return html;
  }

  window.buildVendorExposureMapReportHtml = buildVendorExposureMapReportHtml;
})();
