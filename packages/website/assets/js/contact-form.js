/**
 * Contact form handler — submits to Supabase contact-form edge function.
 * Messages are emailed to contact@ermits.com (with support@ermits.com fallback).
 * Works with both Netlify form structure (name, email, company, request_type, message) and platform fields.
 */
(function () {
  const form = document.getElementById('contact-form');
  if (!form || !form.hasAttribute('data-netlify')) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn ? btn.innerHTML : '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="animate-pulse">Sending...</span>';
    }

    const formData = new FormData(form);
    const name = formData.get('name') || '';
    const email = formData.get('email') || '';
    const company = formData.get('company') || '';
    const request_type = formData.get('request_type') || '';
    const message = formData.get('message') || '';

    const payload = {
      name: String(name).trim(),
      email: String(email).trim(),
      company: company ? String(company).trim() : null,
      request_type: request_type || null,
      message: String(message).trim(),
    };

    const apiUrl = (window.CONTACT_API_URL || '').trim();
    if (!apiUrl) {
      showError(form, 'Contact form is not configured. Please email contact@ermits.com directly.');
      if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
      return;
    }

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.details || `Request failed (${res.status})`);
      }

      showSuccess(form);
      form.reset();
    } catch (err) {
      console.error('Contact form error:', err);
      showError(form, err.message || 'Failed to send. Please email contact@ermits.com directly.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }
  });

  function showSuccess(formEl) {
    clearFeedback(formEl);
    const div = document.createElement('div');
    div.className = 'mt-4 p-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800';
    div.innerHTML = '<strong>Thank you!</strong> Your request has been sent. We will respond to ' + (formEl.querySelector('input[name="email"]')?.value || 'you') + ' shortly.';
    formEl.appendChild(div);
  }

  function showError(formEl, message) {
    clearFeedback(formEl);
    const div = document.createElement('div');
    div.className = 'mt-4 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';
    div.innerHTML = '<strong>Error:</strong> ' + String(message).replace(/</g, '&lt;');
    formEl.appendChild(div);
  }

  function clearFeedback(formEl) {
    const existing = formEl.querySelectorAll('[class*="bg-green"], [class*="bg-red"]');
    existing.forEach(function (el) { el.remove(); });
  }
})();
