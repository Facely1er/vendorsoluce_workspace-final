(function () {
  'use strict';

  var STORAGE_KEY = 'vendorsoluce.vendorReview.v1';
  var vendors = [];

  function $(id) { return document.getElementById(id); }
  function value(id) { return ($(id) && $(id).value || '').trim(); }
  function number(id) { return Number(value(id) || 0); }
  function uid() { return 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
  function escapeHtml(text) {
    return String(text || '').replace(/[&<>'"]/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char];
    });
  }

  function scoreVendor(v) {
    var weighted = (v.criticality * 22) + (v.dataAccess * 20) + (v.dependency * 18) + (v.concentration * 14) + (v.securityPosture * 14) + (v.contractControls * 12);
    return Math.max(0, Math.min(100, Math.round(weighted / 4)));
  }

  function tier(score) {
    if (score >= 78) return { label: 'Critical', cls: 'vs-tier-critical' };
    if (score >= 62) return { label: 'High', cls: 'vs-tier-high' };
    if (score >= 40) return { label: 'Moderate', cls: 'vs-tier-moderate' };
    return { label: 'Low', cls: 'vs-tier-low' };
  }

  function primaryIssue(v) {
    var issues = [];
    if (v.criticality >= 4 || v.dependency >= 4) issues.push('operational dependency');
    if (v.dataAccess >= 3) issues.push('regulated or sensitive data access');
    if (v.securityPosture >= 3) issues.push('missing or outdated security evidence');
    if (v.contractControls >= 3) issues.push('weak contractual controls');
    if (v.concentration >= 3) issues.push('limited substitution options');
    return issues.length ? issues.join(', ') : 'routine monitoring';
  }

  function normalizeVendor(raw) {
    var v = Object.assign({}, raw);
    v.score = scoreVendor(v);
    v.tier = tier(v.score).label;
    v.updatedAt = new Date().toISOString();
    return v;
  }

  function load() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      vendors = Array.isArray(parsed) ? parsed.map(normalizeVendor) : [];
    } catch (e) {
      vendors = [];
    }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors)); } catch (e) {}
  }

  function portfolioScore() {
    if (!vendors.length) return 0;
    return Math.round(vendors.reduce(function (sum, v) { return sum + v.score; }, 0) / vendors.length);
  }

  function renderMetrics() {
    var score = portfolioScore();
    var t = vendors.length ? tier(score).label : 'No data';
    $('portfolio-score').textContent = score;
    $('portfolio-tier').textContent = t;
    $('vendor-count').textContent = vendors.length;
    $('high-priority-count').textContent = vendors.filter(function (v) { return v.score >= 62; }).length;
    $('evidence-gap-count').textContent = vendors.filter(function (v) { return v.securityPosture >= 3 || v.contractControls >= 3; }).length;
  }

  function renderList() {
    var list = $('vendor-list');
    var empty = $('empty-state');
    if (!list || !empty) return;
    list.innerHTML = '';
    empty.style.display = vendors.length ? 'none' : 'block';
    vendors.slice().sort(function (a, b) { return b.score - a.score; }).forEach(function (v) {
      var t = tier(v.score);
      var row = document.createElement('article');
      row.className = 'vs-vendor-row';
      row.innerHTML = '' +
        '<div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">' +
          '<div class="min-w-0">' +
            '<div class="flex flex-wrap items-center gap-2">' +
              '<h4 class="text-base font-bold text-gray-900 dark:text-white">' + escapeHtml(v.name) + '</h4>' +
              '<span class="vs-tier ' + t.cls + '">' + t.label + '</span>' +
            '</div>' +
            '<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">' + escapeHtml(v.category) + ' · ' + escapeHtml(v.region) + '</p>' +
            '<p class="mt-2 text-sm text-gray-700 dark:text-gray-300"><strong class="text-gray-900 dark:text-white">Main driver:</strong> ' + escapeHtml(primaryIssue(v)) + '.</p>' +
            (v.notes ? '<p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Notes: ' + escapeHtml(v.notes) + '</p>' : '') +
          '</div>' +
          '<div class="flex lg:flex-col items-center lg:items-end gap-2 shrink-0">' +
            '<div class="text-right"><span class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Score</span><strong class="text-2xl font-black text-gray-900 dark:text-white">' + v.score + '</strong></div>' +
            '<div class="flex gap-2">' +
              '<button type="button" class="vs-review-secondary-small" data-edit="' + v.id + '">Edit</button>' +
              '<button type="button" class="vs-review-danger px-3 py-2 text-xs" data-delete="' + v.id + '">Delete</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      list.appendChild(row);
    });
  }

  function renderActions() {
    var target = $('action-plan');
    if (!target) return;
    if (!vendors.length) {
      target.innerHTML = '<p class="text-gray-600 dark:text-gray-400">Add vendor data to generate a specific action plan.</p>';
      return;
    }
    var sorted = vendors.slice().sort(function (a, b) { return b.score - a.score; });
    var top = sorted[0];
    var high = sorted.filter(function (v) { return v.score >= 62; });
    var gaps = sorted.filter(function (v) { return v.securityPosture >= 3 || v.contractControls >= 3; });
    var html = [];
    html.push('<div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800/60"><strong class="block text-gray-900 dark:text-white">Immediate triage</strong><p class="mt-1">Review ' + escapeHtml(top.name) + ' first because its current score is ' + top.score + ' and the main driver is ' + escapeHtml(primaryIssue(top)) + '.</p></div>');
    html.push('<div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800/60"><strong class="block text-gray-900 dark:text-white">30-day remediation</strong><p class="mt-1">For ' + high.length + ' high-priority vendor(s), request current security evidence, confirm business continuity coverage, and validate contract clauses for notification, audit rights, SLA, subcontractors, and data return/deletion.</p></div>');
    html.push('<div class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800/60"><strong class="block text-gray-900 dark:text-white">Monitoring rule</strong><p class="mt-1">Track ' + gaps.length + ' evidence/control gap(s). Re-score after evidence is received or after renewal, incident, scope change, or dependency increase.</p></div>');
    target.innerHTML = html.join('');
  }

  function render() { renderMetrics(); renderList(); renderActions(); save(); }

  function formVendor() {
    return normalizeVendor({
      id: value('vendor-id') || uid(),
      name: value('vendor-name'),
      category: value('vendor-category'),
      region: value('vendor-region'),
      criticality: number('criticality'),
      dataAccess: number('data-access'),
      dependency: number('dependency'),
      concentration: number('concentration'),
      securityPosture: number('security-posture'),
      contractControls: number('contract-controls'),
      notes: value('vendor-notes')
    });
  }

  function clearForm() {
    var form = $('vendor-review-form');
    if (form) form.reset();
    if ($('vendor-id')) $('vendor-id').value = '';
  }

  function editVendor(id) {
    var v = vendors.find(function (item) { return item.id === id; });
    if (!v) return;
    $('vendor-id').value = v.id;
    $('vendor-name').value = v.name;
    $('vendor-category').value = v.category;
    $('vendor-region').value = v.region;
    $('criticality').value = v.criticality;
    $('data-access').value = v.dataAccess;
    $('dependency').value = v.dependency;
    $('concentration').value = v.concentration;
    $('security-posture').value = v.securityPosture;
    $('contract-controls').value = v.contractControls;
    $('vendor-notes').value = v.notes || '';
    $('vendor-review-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function loadDemo() {
    vendors = [
      { id: uid(), name: 'CloudCore Hosting', category: 'Cloud / Infrastructure', region: 'United States', criticality: 4, dataAccess: 4, dependency: 4, concentration: 3, securityPosture: 2, contractControls: 2, notes: 'Hosts production workloads and privileged admin paths.' },
      { id: uid(), name: 'PayBridge Services', category: 'Payments / Finance', region: 'Global / Multi-region', criticality: 3, dataAccess: 3, dependency: 3, concentration: 2, securityPosture: 3, contractControls: 3, notes: 'Current evidence package is incomplete.' },
      { id: uid(), name: 'TalentFlow HR', category: 'HR / Workforce', region: 'United States', criticality: 2, dataAccess: 3, dependency: 2, concentration: 2, securityPosture: 2, contractControls: 2, notes: 'Contains employee personal data.' },
      { id: uid(), name: 'OfficeSupply Direct', category: 'Operations / Logistics', region: 'United States', criticality: 1, dataAccess: 1, dependency: 1, concentration: 1, securityPosture: 1, contractControls: 2, notes: 'Low inherent exposure.' }
    ].map(normalizeVendor);
    clearForm();
    render();
  }

  function download(filename, content, type) {
    var blob = new Blob([content], { type: type || 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    var headers = ['name','category','region','score','tier','criticality','dataAccess','dependency','concentration','securityPosture','contractControls','notes'];
    var rows = vendors.map(function (v) { return headers.map(function (h) { return '"' + String(v[h] == null ? '' : v[h]).replace(/"/g, '""') + '"'; }).join(','); });
    download('vendorsoluce-vendor-review.csv', headers.join(',') + '\n' + rows.join('\n'), 'text/csv');
  }

  function exportJson() {
    download('vendorsoluce-vendor-review.json', JSON.stringify({ generatedAt: new Date().toISOString(), portfolioScore: portfolioScore(), vendors: vendors }, null, 2), 'application/json');
  }

  function bind() {
    var form = $('vendor-review-form');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = formVendor();
      if (!v.name) return;
      var index = vendors.findIndex(function (item) { return item.id === v.id; });
      if (index >= 0) vendors[index] = v; else vendors.push(v);
      clearForm();
      render();
    });
    ['load-demo', 'vs-load-demo-top'].forEach(function (id) { if ($(id)) $(id).addEventListener('click', loadDemo); });
    if ($('reset-form')) $('reset-form').addEventListener('click', clearForm);
    if ($('clear-all')) $('clear-all').addEventListener('click', function () { vendors = []; clearForm(); render(); });
    if ($('export-csv')) $('export-csv').addEventListener('click', exportCsv);
    if ($('export-json')) $('export-json').addEventListener('click', exportJson);
    if ($('print-report')) $('print-report').addEventListener('click', function () { window.print(); });
    document.addEventListener('click', function (e) {
      var edit = e.target.closest && e.target.closest('[data-edit]');
      var del = e.target.closest && e.target.closest('[data-delete]');
      if (edit) editVendor(edit.getAttribute('data-edit'));
      if (del) { vendors = vendors.filter(function (v) { return v.id !== del.getAttribute('data-delete'); }); render(); }
    });
  }

  document.addEventListener('DOMContentLoaded', function () { load(); bind(); render(); });
})();
