/*
 Embeddable WhatsApp Chat Widget
 - Drop-in script to render a floating WhatsApp button on any page
 - Configure via data-* attributes on the script tag

  Example:
  <script src="/assets/js/whatsapp-widget.js" data-phone="919876543210" data-message="Hello!" data-color="#25D366" data-position="bottom-right" data-size="56" data-shape="round" data-badge="true" data-badge-count="1" data-avail-start="09:00" data-avail-end="18:00" async></script>
*/
(function(){
  'use strict';

  function getScriptEl(){
    return document.currentScript || (function(){
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
  }

  const scriptEl = getScriptEl();
  if(!scriptEl){ return; }

  function readBool(value, fallback){
    if(value == null) return !!fallback;
    const v = String(value).toLowerCase();
    return v === '1' || v === 'true' || v === 'yes' || v === 'on';
  }

  function clamp(num, min, max){ return Math.max(min, Math.min(max, num)); }

  function withinAvailability(start, end){
    const now = new Date();
    const [sh, sm] = (start || '00:00').split(':').map(Number);
    const [eh, em] = (end || '23:59').split(':').map(Number);
    const mins = now.getHours()*60 + now.getMinutes();
    const smins = sh*60 + sm; const emins = eh*60 + em;
    if(emins >= smins) return mins >= smins && mins <= emins;
    return mins >= smins || mins <= emins; // overnight window
  }

  function buildUrls(phone, message){
    const digits = (phone || '').replace(/\D+/g, '');
    const encoded = encodeURIComponent(message || '');
    const web = digits ? `https://web.whatsapp.com/send?phone=${digits}&text=${encoded}` : '#';
    const mobile = digits ? `https://wa.me/${digits}?text=${encoded}` : '#';
    return { web, mobile };
  }

  const opts = {
    phone: scriptEl.getAttribute('data-phone') || '',
    message: scriptEl.getAttribute('data-message') || 'Hello! I have a question about...',
    color: scriptEl.getAttribute('data-color') || '#25D366',
    position: (scriptEl.getAttribute('data-position') || 'bottom-right'),
    size: clamp(parseInt(scriptEl.getAttribute('data-size') || '56', 10) || 56, 40, 100),
    shape: (scriptEl.getAttribute('data-shape') || 'round'),
    badge: readBool(scriptEl.getAttribute('data-badge'), true),
    badgeCount: clamp(parseInt(scriptEl.getAttribute('data-badge-count') || '1', 10) || 0, 0, 99),
    availStart: scriptEl.getAttribute('data-avail-start') || '00:00',
    availEnd: scriptEl.getAttribute('data-avail-end') || '23:59',
    offlineNotice: scriptEl.getAttribute('data-offline-notice') || ''
  };

  if(document.getElementById('wa-widget-root')){
    // Already initialized on this page
    return;
  }

  const root = document.createElement('div');
  root.id = 'wa-widget-root';
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'WhatsApp chat widget');
  document.body.appendChild(root);

  const style = document.createElement('style');
  style.textContent = `
    .wa-widget{position:fixed; z-index:2147483000; display:flex; align-items:center}
    .wa-widget--br{right:16px; bottom:16px}
    .wa-widget--bl{left:16px; bottom:16px}
    .wa-btn{display:grid; place-items:center; color:#fff; border:none; cursor:pointer; box-shadow:0 10px 25px rgba(0,0,0,.35)}
    .wa-btn--round{border-radius:999px}
    .wa-btn--squircle{border-radius:18px}
    .wa-badge{position:absolute; right:-6px; top:-6px; background:#ff4d4f; color:#fff; border-radius:999px; padding:2px 6px; font-size:12px; border:2px solid #fff}
    .wa-sr-only{position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0}
  `;
  root.appendChild(style);

  const container = document.createElement('div');
  container.className = 'wa-widget ' + (opts.position === 'bottom-left' ? 'wa-widget--bl' : 'wa-widget--br');
  container.style.gap = '8px';
  container.style.alignItems = 'center';
  container.style.pointerEvents = 'auto';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'wa-btn ' + (opts.shape === 'squircle' ? 'wa-btn--squircle' : 'wa-btn--round');
  button.setAttribute('aria-label', 'Open WhatsApp chat');
  button.style.width = opts.size + 'px';
  button.style.height = opts.size + 'px';
  button.style.background = opts.color;

  button.innerHTML = '<span class="wa-sr-only">WhatsApp</span>' +
    '<svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M19.11 17.25c-.25-.12-1.47-.72-1.7-.8-.23-.08-.4-.12-.57.12-.17.23-.65.8-.8.96-.15.17-.3.18-.55.06-.25-.12-1.06-.39-2.03-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.23-.02-.38.1-.5.1-.1.23-.27.35-.4.12-.13.15-.23.23-.38.08-.17.04-.3-.02-.42-.06-.12-.57-1.38-.78-1.88-.2-.48-.4-.42-.57-.43l-.48-.01c-.17 0-.42.06-.64.3-.22.23-.84.82-.84 2 0 1.17.86 2.3.98 2.46.12.16 1.7 2.58 4.12 3.61 2.42 1.03 2.42.69 2.86.66.44-.03 1.47-.6 1.68-1.19.2-.6.2-1.1.15-1.19-.06-.1-.22-.16-.47-.28zM16 3c-7.18 0-13 5.82-13 13 0 2.29.6 4.44 1.66 6.3L3 29l6.86-1.8A12.96 12.96 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 24c-2.27 0-4.38-.66-6.15-1.8l-.44-.27-4.08 1.07 1.09-3.98-.29-.44A10.98 10.98 0 0 1 5 16C5 10.48 9.48 6 15 6s10 4.48 10 10-4.48 11-9 11z"/></svg>';

  container.appendChild(button);

  if(opts.badge){
    const badge = document.createElement('div');
    badge.className = 'wa-badge';
    badge.textContent = String(opts.badgeCount);
    badge.setAttribute('aria-hidden', 'true');
    badge.style.position = 'absolute';
    badge.style.right = '-6px';
    badge.style.top = '-6px';
    container.style.position = 'fixed';
    container.appendChild(badge);
    // Ensure badge overlays the button
    container.style.position = 'fixed';
  }

  root.appendChild(container);

  function openWhatsApp(){
    if(!withinAvailability(opts.availStart, opts.availEnd)){
      if(opts.offlineNotice){
        try { alert(opts.offlineNotice); } catch(_) {}
      }
    }
    const { web, mobile } = buildUrls(opts.phone, opts.message);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = isMobile ? mobile : web;
    if(url === '#') return;
    window.open(url, '_blank', 'noopener');
  }

  button.addEventListener('click', openWhatsApp);
})();

