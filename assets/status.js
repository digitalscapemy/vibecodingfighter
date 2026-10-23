/* Dikongsi oleh success.html, failed.html, pending.html.
   1) Baca parameter dari BCL (Redirect After Payment).
   2) Simpan dalam sessionStorage supaya refresh tak hilang data.
   3) Buang parameter dari URL (data peribadi tak kekal dalam history / bila link dikongsi).
   4) Isi ringkasan, pautan WhatsApp dan countdown kelas. */
(() => {
  const WA = '60179525174';
  const KEY = 'vcf-last-payment';
  const q = new URLSearchParams(location.search);
  // Nilai yang BCL tak ganti (cth. "{order_number}") diabaikan
  const ok = v => v && !/[{}]/.test(v) && !/^(null|undefined)$/i.test(v);
  const pick = (...k) => k.map(x => q.get(x)).find(ok) || '';

  let d = {
    ref: pick('order_number', 'order_no', 'orderNumber', 'order_id', 'order', 'reference_id', 'reference',
              'ref', 'transaction_id', 'txn_id', 'invoice', 'invoice_no', 'bill_code', 'billcode', 'id'),
    amount: pick('amount', 'total'),
    name: pick('customer_name', 'name'),
    method: pick('payment_method', 'method'),
    status: pick('status', 'reason'),
  };
  try {
    if (d.ref) sessionStorage.setItem(KEY, JSON.stringify(d));
    else {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || '{}');
      if (saved.ref) d = saved;
    }
  } catch (e) {}
  // Bersihkan URL hanya bila No. order dikenali (jika tidak, URL kekal untuk semakan)
  if (location.search && d.ref) history.replaceState(null, '', location.pathname + location.hash);

  const amt = parseFloat(String(d.amount || '').replace(/[^0-9.]/g, ''));
  const amtTxt = isNaN(amt) ? '' : 'RM' + amt.toFixed(2);
  const first = (d.name || '').trim().split(/\s+/)[0] || '';

  // Ringkasan
  const set = (k, v) => { const el = document.querySelector('[data-f="' + k + '"]'); if (!el) return; if (v) el.textContent = v; else el.closest('div').hidden = true; };
  set('ref', d.ref);
  set('amount', amtTxt);
  set('name', d.name);
  set('method', d.method ? d.method.toUpperCase() : '');
  const sum = document.querySelector('.summary');
  if (sum && ![...sum.children].some(x => !x.hidden)) sum.hidden = true;
  document.querySelectorAll('[data-first]').forEach(el => { if (first) el.textContent = ', ' + first; });

  // Kandungan khas peserta: hanya bila ada No. order
  document.querySelectorAll('[data-need-ref]').forEach(el => { el.hidden = !d.ref; });
  document.querySelectorAll('[data-no-ref]').forEach(el => { el.hidden = !!d.ref; });

  // WhatsApp dengan maklumat order
  document.querySelectorAll('[data-wa]').forEach(a => {
    const msg = a.dataset.wa + (d.name ? '\nNama: ' + d.name : '') + (d.ref ? '\nNo. order: ' + d.ref : '') + (amtTxt ? '\nJumlah: ' + amtTxt : '');
    a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    a.target = '_blank'; a.rel = 'noopener';
  });

  // Countdown kelas: Sabtu 7 Nov 2026, 9:00 pagi (MYT)
  const cd = document.getElementById('cd');
  if (cd) {
    const target = new Date('2026-11-07T09:00:00+08:00').getTime();
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const t = Math.max(0, target - Date.now());
      const v = { d: Math.floor(t / 864e5), h: Math.floor(t / 36e5) % 24, m: Math.floor(t / 6e4) % 60, s: Math.floor(t / 1e3) % 60 };
      cd.querySelectorAll('[data-cd]').forEach(el => el.textContent = pad(v[el.dataset.cd]));
    };
    tick(); setInterval(tick, 1000);
  }

  if (window.lucide) lucide.createIcons();
})();
