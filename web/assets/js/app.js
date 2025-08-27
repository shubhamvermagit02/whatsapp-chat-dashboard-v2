  // Simple state with localStorage persistence
  const STORAGE_KEY = 'wa_chat_settings_v1';
  const GUIDE_KEY = 'guideCompleted';

  const defaultState = {
    enabled: true,
    phone: '',
    message: 'Hello! I have a question about...',
    color: '#25D366',
    position: 'bottom-right',
    size: 56,
    shape: 'round',
    badge: true,
    badgeCount: 1,
    availStart: '09:00',
    availEnd: '18:00'
  };

  function loadState(){
    try{ return {...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY))||{})}; }
    catch{ return {...defaultState}; }
  }
  function saveState(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  // Elements
  const phoneInput = document.getElementById('phoneInput');
  const messageInput = document.getElementById('messageInput');
  const colorInput = document.getElementById('colorInput');
  const positionSelect = document.getElementById('positionSelect');
  const enabledToggle = document.getElementById('enabledToggle');
  const phoneError = document.getElementById('phoneError');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const testWeb = document.getElementById('testWeb');
  const testMobile = document.getElementById('testMobile');
  const sizeRange = document.getElementById('sizeRange');
  const sizeValue = document.getElementById('sizeValue');
  const shapeSelect = document.getElementById('shapeSelect');
  const badgeToggle = document.getElementById('badgeToggle');
  const badgeCount = document.getElementById('badgeCount');
  const availStart = document.getElementById('availStart');
  const availEnd = document.getElementById('availEnd');
  const emojiBtn = document.getElementById('emojiBtn');
  const emojiPanel = document.getElementById('emojiPanel');

  // routing
  const routes = Array.from(document.querySelectorAll('.route'));
  const sidebar = document.querySelector('.sidebar[data-auto-tabs="true"]');
  if(sidebar){
    sidebar.innerHTML = '';
    routes.forEach(r => {
      const routeId = r.id.replace('route-','');
      const title = r.getAttribute('data-title') || routeId;
      const btn = document.createElement('button');
      btn.className = 'nav-link' + (r.classList.contains('show') ? ' active' : '');
      btn.setAttribute('data-route', routeId);
      btn.textContent = title;
      sidebar.appendChild(btn);
    });
  }
  let routeButtons = Array.from(document.querySelectorAll('.nav-link, .route-btn'));

  const widget = document.getElementById('widget');
  const wbtn = document.getElementById('wbtn');
  const wbadge = document.getElementById('wbadge');
  const chatWindow = document.getElementById('chatWindow');
  const chatClose = document.getElementById('chatClose');
  const chatOpenWA = document.getElementById('chatOpenWA');

  const banner = document.getElementById('configBanner');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const exitButton = document.getElementById('exitButton');
  const stepTitle = document.getElementById('stepTitle');
  const stepDescription = document.getElementById('stepDescription');
  const steps = Array.from(document.querySelectorAll('.step'));

  const yearEl = document.getElementById('year');
  yearEl.textContent = new Date().getFullYear();

  // Validation
  function validPhone(v){ return /^[0-9]{8,15}$/.test(v); }

  // Build URLs
  function buildUrls(state){
    const encoded = encodeURIComponent(state.message || '');
    const base = state.phone ? state.phone : '';
    const web = base ? `https://web.whatsapp.com/send?phone=${base}&text=${encoded}` : '#';
    const mobile = base ? `https://wa.me/${base}?text=${encoded}` : '#';
    return { web, mobile };
  }

  // Apply UI state
  function applyState(state){
    // inputs
    phoneInput.value = state.phone;
    messageInput.value = state.message;
    colorInput.value = state.color;
    positionSelect.value = state.position;
    enabledToggle.checked = state.enabled;
    sizeRange.value = state.size; sizeValue.textContent = state.size;
    shapeSelect.value = state.shape;
    badgeToggle.checked = state.badge;
    badgeCount.value = state.badgeCount;
    availStart.value = state.availStart;
    availEnd.value = state.availEnd;

    // widget
    widget.classList.toggle('widget--br', state.position === 'bottom-right');
    widget.classList.toggle('widget--bl', state.position === 'bottom-left');
    wbtn.style.background = state.enabled ? state.color : '#2a356e';
    widget.style.display = state.enabled ? 'flex' : 'none';
    wbtn.style.width = `${state.size}px`;
    wbtn.style.height = `${state.size}px`;
    wbtn.classList.toggle('squircle', state.shape === 'squircle');
    wbadge.style.display = state.badge ? 'block' : 'none';
    wbadge.textContent = state.badgeCount;

    const { web, mobile } = buildUrls(state);
    testWeb.href = web;
    testMobile.href = mobile;
  }

  // Onboarding guide
  const guideSteps = [
    { title: 'Step 1: Connect your WhatsApp number', desc: 'Include ISD code for your country. No + or 00 required.', onNext: () => phoneInput.focus() },
    { title: 'Step 2: Set a prefilled message', desc: 'This will appear in the chat input when a customer opens WhatsApp.', onNext: () => messageInput.focus() },
    { title: 'Step 3: Choose your theme color', desc: 'Select a brand color for the floating button.', onNext: () => colorInput.focus() },
    { title: 'Step 4: Pick widget position', desc: 'Place the widget at bottom-left or bottom-right.', onNext: () => positionSelect.focus() },
    { title: 'Step 5: Enable the widget', desc: 'Toggle the switch to show or hide the widget on your site.', onNext: () => enabledToggle.focus() },
    { title: 'Step 6: Save your settings', desc: 'Click Save to persist your configuration to this browser.', onNext: () => saveBtn.focus() }
  ];
  let stepIndex = 0;

  function setStep(i){
    stepIndex = Math.max(0, Math.min(guideSteps.length-1, i));
    stepTitle.textContent = guideSteps[stepIndex].title;
    stepDescription.textContent = guideSteps[stepIndex].desc;
    steps.forEach((el, idx) => el.classList.toggle('step--active', idx === stepIndex));
    prevButton.classList.toggle('hidden', stepIndex === 0);
    nextButton.textContent = stepIndex === guideSteps.length-1 ? 'Finish' : 'Next';
  }

  function showBanner(){ banner.classList.remove('banner--hidden'); setStep(stepIndex); }
  function hideBanner(){ banner.classList.add('banner--hidden'); }

  // Init
  const state = loadState();
  applyState(state);
  if(!localStorage.getItem(GUIDE_KEY)) showBanner();

  // Routes
  function wireRoutes(){
    routeButtons.forEach(btn => btn.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-route');
      if(!target) return;
      routes.forEach(r => r.classList.toggle('show', r.id === `route-${target}`));
      document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active', b.getAttribute('data-route') === target));
    }));
  }
  wireRoutes();

  // Events
  const phoneErrorEl = phoneError;
  function currentInputs(){
    return {
      enabled: enabledToggle.checked,
      phone: (phoneInput.value||'').trim(),
      message: messageInput.value || '',
      color: colorInput.value || '#25D366',
      position: positionSelect.value,
      size: +sizeRange.value,
      shape: shapeSelect.value,
      badge: badgeToggle.checked,
      badgeCount: Math.max(0, Math.min(9, +badgeCount.value || 0)),
      availStart: availStart.value,
      availEnd: availEnd.value
    };
  }

  function validate(){
    const s = currentInputs();
    const okPhone = !s.enabled || validPhone(s.phone);
    phoneErrorEl.classList.toggle('hidden', okPhone);
    return okPhone;
  }

  sizeRange.addEventListener('input', () => { sizeValue.textContent = sizeRange.value; wbtn.style.width = sizeRange.value+'px'; wbtn.style.height = sizeRange.value+'px'; });
  phoneInput.addEventListener('input', validate);
  badgeCount.addEventListener('input', () => { if(+badgeCount.value > 9) badgeCount.value = 9; if(+badgeCount.value < 0) badgeCount.value = 0; });

  saveBtn.addEventListener('click', () => {
    if(!validate()) return;
    const next = currentInputs();
    saveState(next);
    applyState(next);
    saveBtn.textContent = 'Saved';
    setTimeout(() => saveBtn.textContent = 'Save Settings', 900);
  });

  resetBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    const fresh = loadState();
    applyState(fresh);
    saveBtn.textContent = 'Save Settings';
  });

  // Widget interactions
  function withinAvailability(start, end){
    const now = new Date();
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const mins = now.getHours()*60 + now.getMinutes();
    const smins = sh*60 + sm; const emins = eh*60 + em;
    if(emins >= smins) return mins >= smins && mins <= emins;
    // overnight window
    return mins >= smins || mins <= emins;
  }

  wbtn.addEventListener('click', () => {
    const s = loadState();
    if(!withinAvailability(s.availStart, s.availEnd)){
      chatWindow.classList.remove('hidden');
      return;
    }
    const { web, mobile } = buildUrls(s);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = isMobile ? mobile : web;
    if(url === '#') return;
    window.open(url, '_blank', 'noopener');
  });
  chatClose.addEventListener('click', () => chatWindow.classList.add('hidden'));
  chatOpenWA.addEventListener('click', () => {
    const s = loadState();
    const { web, mobile } = buildUrls(s);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    window.open(isMobile ? mobile : web, '_blank', 'noopener');
  });

  // Emoji picker (simple set)
  const EMOJIS = ['😀','😁','😂','🤣','😊','😍','😘','😎','🤩','👍','👋','🙏','🔥','✨','💡','✅','❓','💬','🛒','💳','📦','🚚','⏳','⚡'];
  function renderEmoji(){
    emojiPanel.innerHTML = '';
    EMOJIS.forEach(e => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'emoji-item'; b.textContent = e; b.setAttribute('role','menuitem');
      b.addEventListener('click', () => {
        const s = messageInput.selectionStart || messageInput.value.length;
        const val = messageInput.value;
        messageInput.value = val.slice(0, s) + e + val.slice(s);
        emojiPanel.classList.add('hidden');
        messageInput.focus();
      });
      emojiPanel.appendChild(b);
    });
  }
  emojiBtn.addEventListener('click', () => {
    if(emojiPanel.classList.contains('hidden')){ renderEmoji(); emojiPanel.classList.remove('hidden'); }
    else emojiPanel.classList.add('hidden');
  });
  document.addEventListener('click', (e) => {
    if(!emojiPanel.contains(e.target) && e.target !== emojiBtn) emojiPanel.classList.add('hidden');
  });

  // Dashboard mocks
  const kpiClicks = document.getElementById('kpiClicks');
  const kpiVisitors = document.getElementById('kpiVisitors');
  const kpiCtr = document.getElementById('kpiCtr');
  const kpiConv = document.getElementById('kpiConv');
  function rand(n){ return Math.floor(Math.random()*n); }
  function seedKpis(){
    const clicks = 120 + rand(80);
    const visitors = 1000 + rand(500);
    const ctr = ((clicks/visitors)*100).toFixed(1)+'%';
    const conv = 20 + rand(20);
    kpiClicks.textContent = clicks;
    kpiVisitors.textContent = visitors;
    kpiCtr.textContent = ctr;
    kpiConv.textContent = conv;
  }
  seedKpis();

  // Simple charts with canvas
  function drawLine(ctx, data, color){
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle = '#2a356e'; ctx.lineWidth = 1; // grid
    for(let i=1;i<5;i++){ ctx.beginPath(); ctx.moveTo(0, i*H/5); ctx.lineTo(W, i*H/5); ctx.stroke(); }
    const max = Math.max(...data) || 1;
    const stepX = W/(data.length-1);
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
    data.forEach((v,i)=>{
      const x = i*stepX;
      const y = H - (v/max)*(H-20) - 10;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
  }

  function genSeries(n, base){ return Array.from({length:n}, (_,i)=> Math.round(base + Math.sin(i/2)*base*0.2 + rand(base*0.2))); }

  const chart = document.getElementById('chart').getContext('2d');
  drawLine(chart, genSeries(7, 30), '#25D366');

  const clicksChart = document.getElementById('clicksChart').getContext('2d');
  const ctrChart = document.getElementById('ctrChart').getContext('2d');
  let range = 7;
  function updateAnalytics(){
    drawLine(clicksChart, genSeries(range, 40), '#25D366');
    drawLine(ctrChart, genSeries(range, 20), '#3c8deb');
    // table
    const body = document.getElementById('tableBody');
    body.innerHTML = '';
    for(let i=range-1;i>=0;i--){
      const row = document.createElement('div'); row.className='table__row';
      const visitors = 100+rand(200); const clicks = 10+rand(60); const ctr = ((clicks/visitors)*100).toFixed(1)+'%';
      const day = new Date(Date.now()-i*86400000).toLocaleDateString();
      row.innerHTML = `<div>${day}</div><div>${visitors}</div><div>${clicks}</div><div>${ctr}</div>`;
      body.appendChild(row);
    }
  }
  updateAnalytics();

  document.querySelectorAll('.range-btn').forEach(b=> b.addEventListener('click', (e)=>{
    document.querySelectorAll('.range-btn').forEach(x=>x.classList.remove('active'));
    e.currentTarget.classList.add('active');
    range = +e.currentTarget.getAttribute('data-range');
    updateAnalytics();
  }));

  // Automations (mock save)
  document.getElementById('autoSave').addEventListener('click', () => {
    // no-op persistence, just visual feedback
    const btn = document.getElementById('autoSave');
    btn.textContent = 'Saved';
    setTimeout(()=> btn.textContent = 'Save Automation', 900);
  });

  // Banner events
  const guideStepsEls = Array.from(document.querySelectorAll('.step'));
  const nextButtonEl = nextButton;
  const prevButtonEl = prevButton;
  const exitButtonEl = exitButton;

  if(nextButtonEl){
    nextButtonEl.addEventListener('click', () => {
      if(stepIndex < guideSteps.length-1){
        setStep(stepIndex+1); guideSteps[stepIndex].onNext?.();
      } else { localStorage.setItem(GUIDE_KEY, '1'); hideBanner(); }
    });
  }
  if(prevButtonEl){ prevButtonEl.addEventListener('click', () => setStep(stepIndex-1)); }
  if(exitButtonEl){ exitButtonEl.addEventListener('click', () => { localStorage.setItem(GUIDE_KEY, '1'); hideBanner(); }); }