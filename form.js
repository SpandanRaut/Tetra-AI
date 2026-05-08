/* =====================================================
   form.js — contact form chips, validation, submit
   Submissions go directly to team@tetrainfo.org via
   FormSubmit.co (no mail client popup).
   First submission triggers a one-time activation email
   to team@tetrainfo.org — click the link to activate.
   ===================================================== */

(() => {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return;

  // — Chip selection —
  const chips     = document.querySelectorAll('#chips .chip');
  const serviceIn = document.getElementById('service');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      if (serviceIn) serviceIn.value = chip.dataset.value || '';
    });
  });

  // — Submit —
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const service = (serviceIn && serviceIn.value) || 'Not specified';
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      flashInvalid(form);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      flashInvalid(form, 'email');
      return;
    }

    const btn = form.querySelector('.btn--submit');
    const btnLabel = btn && btn.querySelector('.btn__label');
    if (btnLabel) btnLabel.textContent = 'Sending…';
    if (btn) btn.disabled = true;

    try {
      const res = await fetch('https://formsubmit.co/ajax/team@tetrainfo.org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          service,
          message,
          _subject: `New project enquiry — ${name}`,
          _replyto: email,
          _template: 'table',
        }),
      });

      if (res.ok) {
        confirmSent(form, btnLabel, btn);
      } else {
        throw new Error('Server error');
      }
    } catch {
      if (btnLabel) btnLabel.textContent = 'Failed — try again';
      if (btn) btn.disabled = false;
      setTimeout(() => {
        if (btnLabel) btnLabel.textContent = 'Send it over';
      }, 3000);
    }
  });

  function flashInvalid(form, only) {
    const fields = only
      ? [form.querySelector(`[name="${only}"]`)]
      : form.querySelectorAll('input, textarea');
    fields.forEach(f => {
      if (!f) return;
      f.style.borderColor = '#ff3aa1';
      setTimeout(() => { f.style.borderColor = ''; }, 1200);
    });
  }

  function confirmSent(form, btnLabel, btn) {
    if (btnLabel) btnLabel.textContent = 'Message sent ✓';
    if (btn) btn.disabled = true;
    form.querySelectorAll('input, textarea').forEach(f => {
      f.value = '';
      f.style.borderColor = '';
    });
    document.querySelectorAll('#chips .chip').forEach(c => c.classList.remove('is-active'));
    if (serviceIn) serviceIn.value = '';
  }

})();
