(function () {
  if (window.__enpiceFeedback__) {
    window.__enpiceFeedback__.toggle();
    return;
  }

  // ─── Persistance localStorage ─────────────────────────────────────────────
  var LS_KEY = '__ef_annotations__';
  function lsSave() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ counter: state.counter, annotations: state.annotations })); } catch(e) {}
  }
  function lsLoad() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      state.annotations = data.annotations || [];
      state.counter = data.counter || 0;
    } catch(e) {}
  }
  function lsClear() {
    try { localStorage.removeItem(LS_KEY); } catch(e) {}
  }

  // ─── State ───────────────────────────────────────────────────────────────
  const state = {
    mode: null, // null | 'select' | 'free'
    annotations: [],
    counter: 0,
    panelOpen: false,
  };
  lsLoad(); // restaurer les annotations sauvegardées

  // ─── Styles ──────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.id = '__ef-style__';
  style.textContent = [
    '#__ef-toolbar__{position:fixed;bottom:24px;right:24px;z-index:2147483640;background:#0f172a;color:#f8fafc;border-radius:14px;padding:10px 14px;display:flex;align-items:center;gap:8px;font:600 12px/1 system-ui,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,.5);user-select:none}',
    '#__ef-toolbar__ .ef-logo{font-size:16px}',
    '#__ef-toolbar__ .ef-label{color:#94a3b8;font-size:11px}',
    '#__ef-toolbar__ .ef-sep{width:1px;height:20px;background:#1e293b}',
    '#__ef-toolbar__ button{border:none;border-radius:8px;padding:7px 12px;cursor:pointer;font:600 11px system-ui,sans-serif;transition:all .15s;white-space:nowrap}',
    '#__ef-toolbar__ .ef-btn-select{background:#6366f1;color:#fff}',
    '#__ef-toolbar__ .ef-btn-select:hover{background:#4f46e5}',
    '#__ef-toolbar__ .ef-btn-select.active{background:#ef4444}',
    '#__ef-toolbar__ .ef-btn-free{background:#0ea5e9;color:#fff}',
    '#__ef-toolbar__ .ef-btn-free:hover{background:#0284c7}',
    '#__ef-toolbar__ .ef-btn-free.active{background:#ef4444}',
    '#__ef-toolbar__ .ef-btn-panel{background:#1e293b;color:#94a3b8;position:relative}',
    '#__ef-toolbar__ .ef-btn-panel:hover{background:#334155;color:#f8fafc}',
    '#__ef-toolbar__ .ef-btn-panel.has-items{color:#f8fafc}',
    '#__ef-toolbar__ .ef-badge{position:absolute;top:-5px;right:-5px;background:#6366f1;color:#fff;border-radius:50%;width:16px;height:16px;font-size:9px;display:flex;align-items:center;justify-content:center}',
    '#__ef-toolbar__ .ef-btn-close{background:transparent;color:#475569;font-size:14px;padding:4px 8px}',
    '#__ef-toolbar__ .ef-btn-close:hover{color:#f8fafc}',
    '.__ef-hover__{outline:2px solid #6366f1 !important;outline-offset:2px !important;cursor:crosshair !important;background-color:rgba(99,102,241,.07) !important}',
    '.__ef-free-cursor__ *{cursor:crosshair !important}',
    '.__ef-dot__{position:fixed;z-index:2147483639;width:22px;height:22px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font:700 10px system-ui,sans-serif;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.4);pointer-events:none}',
    '.__ef-dot__.bug{background:#ef4444}',
    '.__ef-dot__.suggestion{background:#6366f1}',
    '.__ef-dot__.design{background:#f59e0b}',
    '.__ef-dot__.question{background:#0ea5e9}',
    '#__ef-modal__{position:fixed;inset:0;z-index:2147483645;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}',
    '#__ef-modal__ .ef-dialog{background:#fff;border-radius:16px;padding:28px;width:480px;max-width:94vw;box-shadow:0 16px 48px rgba(0,0,0,.3);font-family:system-ui,sans-serif}',
    '#__ef-modal__ h3{margin:0 0 4px;font-size:15px;color:#0f172a}',
    '#__ef-modal__ .ef-subtitle{margin:0 0 18px;font-size:11px;color:#94a3b8}',
    '#__ef-modal__ .ef-meta{background:#f8fafc;border-radius:8px;padding:10px 12px;margin-bottom:18px;font-size:11px;color:#64748b;display:flex;flex-direction:column;gap:4px}',
    '#__ef-modal__ .ef-meta code{background:#e2e8f0;padding:2px 6px;border-radius:4px;color:#4f46e5;font-family:monospace;font-size:10px}',
    '#__ef-modal__ .ef-row{display:flex;gap:10px;margin-bottom:14px}',
    '#__ef-modal__ .ef-field{flex:1}',
    '#__ef-modal__ label{display:block;font-size:11px;font-weight:600;color:#374151;margin-bottom:5px}',
    '#__ef-modal__ select,#__ef-modal__ textarea{width:100%;border:1.5px solid #e2e8f0;border-radius:8px;padding:8px 10px;font:13px system-ui,sans-serif;color:#0f172a;outline:none;background:#fff;transition:border-color .15s}',
    '#__ef-modal__ select:focus,#__ef-modal__ textarea:focus{border-color:#6366f1}',
    '#__ef-modal__ textarea{resize:vertical;min-height:90px}',
    '#__ef-modal__ .ef-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}',
    '#__ef-modal__ .ef-actions button{border:none;border-radius:8px;padding:9px 18px;cursor:pointer;font:600 12px system-ui,sans-serif;transition:all .15s}',
    '#__ef-modal__ .ef-copy{background:#6366f1;color:#fff}',
    '#__ef-modal__ .ef-copy:hover{background:#4f46e5}',
    '#__ef-modal__ .ef-cancel{background:#f1f5f9;color:#475569}',
    '#__ef-modal__ .ef-cancel:hover{background:#e2e8f0}',
    '#__ef-panel__{position:fixed;bottom:80px;right:24px;z-index:2147483641;background:#0f172a;border-radius:14px;width:360px;max-width:94vw;box-shadow:0 12px 40px rgba(0,0,0,.5);font-family:system-ui,sans-serif;overflow:hidden;animation:ef-panel-in .2s ease}',
    '@keyframes ef-panel-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}',
    '#__ef-panel__ .ef-panel-header{padding:14px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1e293b}',
    '#__ef-panel__ .ef-panel-title{font:600 13px system-ui;color:#f8fafc}',
    '#__ef-panel__ .ef-panel-actions{display:flex;gap:8px}',
    '#__ef-panel__ .ef-panel-actions button{border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font:600 10px system-ui}',
    '#__ef-panel__ .ef-btn-copy-all{background:#6366f1;color:#fff}',
    '#__ef-panel__ .ef-btn-copy-all:hover{background:#4f46e5}',
    '#__ef-panel__ .ef-btn-clear{background:#1e293b;color:#94a3b8}',
    '#__ef-panel__ .ef-btn-clear:hover{background:#334155;color:#f8fafc}',
    '#__ef-panel__ .ef-panel-body{max-height:320px;overflow-y:auto;padding:8px 0}',
    '#__ef-panel__ .ef-panel-empty{padding:24px;text-align:center;color:#475569;font-size:12px}',
    '#__ef-panel__ .ef-item{padding:10px 16px;border-bottom:1px solid #1e293b;display:flex;gap:10px;align-items:flex-start}',
    '#__ef-panel__ .ef-item:last-child{border-bottom:none}',
    '#__ef-panel__ .ef-item-dot{width:20px;height:20px;min-width:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 9px system-ui;color:#fff;margin-top:1px}',
    '#__ef-panel__ .ef-item-dot.bug{background:#ef4444}',
    '#__ef-panel__ .ef-item-dot.suggestion{background:#6366f1}',
    '#__ef-panel__ .ef-item-dot.design{background:#f59e0b}',
    '#__ef-panel__ .ef-item-dot.question{background:#0ea5e9}',
    '#__ef-panel__ .ef-item-body{flex:1;min-width:0}',
    '#__ef-panel__ .ef-item-top{display:flex;align-items:center;gap:6px;margin-bottom:3px}',
    '#__ef-panel__ .ef-item-comp{font:600 11px system-ui;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#__ef-panel__ .ef-item-prio{font:600 9px system-ui;padding:2px 5px;border-radius:4px}',
    '#__ef-panel__ .ef-item-prio.haute{background:#fef2f2;color:#ef4444}',
    '#__ef-panel__ .ef-item-prio.moyenne{background:#fffbeb;color:#f59e0b}',
    '#__ef-panel__ .ef-item-prio.basse{background:#f0fdf4;color:#22c55e}',
    '#__ef-panel__ .ef-item-comment{font-size:11px;color:#94a3b8;line-height:1.4;word-break:break-word}',
    '#__ef-panel__ .ef-item-actions{display:flex;gap:4px;flex-shrink:0}',
    '#__ef-panel__ .ef-item-copy{background:none;border:none;color:#6366f1;cursor:pointer;font-size:12px;padding:2px 5px;border-radius:4px}',
    '#__ef-panel__ .ef-item-copy:hover{background:#1e293b;color:#818cf8}',
    '#__ef-panel__ .ef-item-delete{background:none;border:none;color:#334155;cursor:pointer;font-size:13px;padding:2px 4px;border-radius:4px}',
    '#__ef-panel__ .ef-item-delete:hover{color:#ef4444;background:#1e293b}',
    '#__ef-toast__{position:fixed;bottom:88px;right:24px;z-index:2147483647;background:#22c55e;color:#fff;border-radius:10px;padding:10px 16px;font:600 12px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.3);animation:ef-toast-in .2s ease}',
    '@keyframes ef-toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
  ].join('');
  document.head.appendChild(style);

  // ─── Toolbar ─────────────────────────────────────────────────────────────
  const toolbar = document.createElement('div');
  toolbar.id = '__ef-toolbar__';
  document.body.appendChild(toolbar);

  function renderToolbar() {
    const n = state.annotations.length;
    toolbar.innerHTML =
      '<span class="ef-logo">💬</span>' +
      '<span class="ef-label">Feedback</span>' +
      '<span class="ef-sep"></span>' +
      '<button class="ef-btn-select' + (state.mode === 'select' ? ' active' : '') + '">' +
        (state.mode === 'select' ? '✋ Stop' : '🎯 Composant') +
      '</button>' +
      '<button class="ef-btn-free' + (state.mode === 'free' ? ' active' : '') + '">' +
        (state.mode === 'free' ? '✋ Stop' : '✏️ Libre') +
      '</button>' +
      '<button class="ef-btn-panel' + (n > 0 ? ' has-items' : '') + '">' +
        '📋 Historique' + (n > 0 ? ' <span class="ef-badge">' + n + '</span>' : '') +
      '</button>' +
      '<button class="ef-btn-close">✕</button>';

    toolbar.querySelector('.ef-btn-select').onclick = function() { setMode(state.mode === 'select' ? null : 'select'); };
    toolbar.querySelector('.ef-btn-free').onclick   = function() { setMode(state.mode === 'free' ? null : 'free'); };
    toolbar.querySelector('.ef-btn-panel').onclick  = togglePanel;
    toolbar.querySelector('.ef-btn-close').onclick  = destroy;
  }

  // ─── Modes ───────────────────────────────────────────────────────────────
  var hovered = null;

  function setMode(newMode) {
    if (state.mode === 'select') {
      document.removeEventListener('mouseover', onSelectOver, true);
      document.removeEventListener('mouseout', onSelectOut, true);
      document.removeEventListener('click', onSelectClick, true);
      if (hovered) { hovered.classList.remove('__ef-hover__'); hovered = null; }
    }
    if (state.mode === 'free') {
      document.removeEventListener('click', onFreeClick, true);
      document.documentElement.classList.remove('__ef-free-cursor__');
    }
    state.mode = newMode;
    if (state.mode === 'select') {
      document.addEventListener('mouseover', onSelectOver, true);
      document.addEventListener('mouseout', onSelectOut, true);
      document.addEventListener('click', onSelectClick, true);
    }
    if (state.mode === 'free') {
      document.addEventListener('click', onFreeClick, true);
      document.documentElement.classList.add('__ef-free-cursor__');
    }
    renderToolbar();
  }

  function onSelectOver(e) {
    if (e.target.closest('#__ef-toolbar__') || e.target.closest('#__ef-modal__') || e.target.closest('#__ef-panel__')) return;
    if (hovered) hovered.classList.remove('__ef-hover__');
    hovered = e.target;
    hovered.classList.add('__ef-hover__');
  }
  function onSelectOut() {
    if (hovered) { hovered.classList.remove('__ef-hover__'); hovered = null; }
  }
  function onSelectClick(e) {
    if (e.target.closest('#__ef-toolbar__') || e.target.closest('#__ef-modal__') || e.target.closest('#__ef-panel__')) return;
    e.preventDefault(); e.stopPropagation();
    if (hovered) { hovered.classList.remove('__ef-hover__'); hovered = null; }
    showModal({ el: e.target, x: e.clientX, y: e.clientY });
  }
  function onFreeClick(e) {
    if (e.target.closest('#__ef-toolbar__') || e.target.closest('#__ef-modal__') || e.target.closest('#__ef-panel__')) return;
    e.preventDefault(); e.stopPropagation();
    showModal({ x: e.clientX, y: e.clientY, free: true });
  }

  // ─── Helpers DOM ─────────────────────────────────────────────────────────
  function getAngularComponent(el) {
    var cur = el;
    while (cur && cur !== document.body) {
      if (cur.tagName && cur.tagName.toLowerCase().indexOf('-') > -1) return cur.tagName.toLowerCase();
      cur = cur.parentElement;
    }
    return null;
  }

  function getCssPath(el) {
    if (!el) return null;
    var parts = [], cur = el;
    while (cur && cur !== document.body) {
      if (cur.id) { parts.unshift('#' + cur.id); break; }
      var seg = cur.tagName.toLowerCase();
      var cls = [].slice.call(cur.classList).filter(function(c){ return c.indexOf('__ef') === -1; }).slice(0,2).join('.');
      if (cls) seg += '.' + cls;
      parts.unshift(seg);
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  }

  function getSnippet(el) {
    var t = (el && el.innerText || '').trim().replace(/\s+/g, ' ');
    return t.length > 60 ? t.slice(0,60) + '…' : t;
  }

  // ─── Modal ───────────────────────────────────────────────────────────────
  var TYPE_ICONS = { bug: '🐛', suggestion: '💡', design: '🎨', question: '❓' };

  function showModal(opts) {
    var el = opts.el, x = opts.x, y = opts.y, free = opts.free;
    var component = el ? (getAngularComponent(el) || el.tagName.toLowerCase()) : null;
    var cssPath   = el ? getCssPath(el) : null;
    var snippet   = el ? getSnippet(el) : null;

    var modal = document.createElement('div');
    modal.id = '__ef-modal__';

    var metaHtml = '';
    if (!free) {
      metaHtml = '<div class="ef-meta">' +
        (component ? '<div>Composant : <code>' + component + '</code></div>' : '') +
        (cssPath   ? '<div>Sélecteur : <code>' + cssPath + '</code></div>' : '') +
        (snippet   ? '<div>Contenu : <code>' + escHtml(snippet) + '</code></div>' : '') +
        '</div>';
    }

    modal.innerHTML =
      '<div class="ef-dialog">' +
        '<h3>' + (free ? '✏️ Annotation libre' : '🎯 Annotation composant') + '</h3>' +
        '<p class="ef-subtitle">' + (free ? 'Position : (' + Math.round(x) + ', ' + Math.round(y) + ')' : 'Page : ' + location.pathname) + '</p>' +
        metaHtml +
        '<div class="ef-row">' +
          '<div class="ef-field"><label>Type</label>' +
            '<select id="__ef-type__">' +
              '<option value="bug">🐛 Bug</option>' +
              '<option value="suggestion">💡 Suggestion</option>' +
              '<option value="design" selected>🎨 Design</option>' +
              '<option value="question">❓ Question</option>' +
            '</select></div>' +
          '<div class="ef-field"><label>Priorité</label>' +
            '<select id="__ef-priority__">' +
              '<option value="haute">🔴 Haute</option>' +
              '<option value="moyenne" selected>🟡 Moyenne</option>' +
              '<option value="basse">🟢 Basse</option>' +
            '</select></div>' +
        '</div>' +
        '<div><label>Commentaire</label>' +
          '<textarea id="__ef-comment__" placeholder="Décrivez le problème ou le changement souhaité…"></textarea>' +
        '</div>' +
        '<div class="ef-actions">' +
          '<button class="ef-cancel">Annuler</button>' +
          '<button class="ef-copy">💾 Sauvegarder</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    var textarea  = modal.querySelector('#__ef-comment__');
    var btnCopy   = modal.querySelector('.ef-copy');
    var btnCancel = modal.querySelector('.ef-cancel');

    setTimeout(function(){ textarea.focus(); }, 50);

    modal.onclick = function(e){ if (e.target === modal) modal.remove(); };
    btnCancel.onclick = function(){ modal.remove(); };
    textarea.addEventListener('keydown', function(e){
      if (e.key === 'Escape') modal.remove();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) btnCopy.click();
    });

    btnCopy.onclick = function(){
      var comment = textarea.value.trim();
      if (!comment) { textarea.focus(); return; }
      var type     = modal.querySelector('#__ef-type__').value;
      var priority = modal.querySelector('#__ef-priority__').value;
      var annotation = {
        id: ++state.counter,
        type: type, priority: priority, comment: comment,
        component: component, cssPath: cssPath, snippet: snippet,
        page: location.pathname,
        x: Math.round(x), y: Math.round(y),
        free: !!free,
      };
      state.annotations.push(annotation);
      lsSave();
      modal.remove();
      placeDot(annotation);
      renderToolbar();
      state.panelOpen = true;
      renderPanel();
      showToast('💾 Feedback #' + annotation.id + ' sauvegardé !');
    };
  }

  // ─── Format & Copy ───────────────────────────────────────────────────────
  function formatAnnotation(a) {
    var icon = TYPE_ICONS[a.type] || '📌';
    var lines = [
      '## ' + icon + ' Feedback #' + a.id + ' — ' + capitalize(a.type) + ' (priorité ' + a.priority + ')',
      '',
    ];
    if (a.component) lines.push('**Composant** : `' + a.component + '`');
    if (a.cssPath)   lines.push('**Sélecteur**  : `' + a.cssPath + '`');
    if (a.snippet)   lines.push('**Contenu**    : "' + a.snippet + '"');
    lines.push('**Page**       : ' + a.page);
    if (a.free) lines.push('**Position**   : (' + a.x + ', ' + a.y + ')');
    lines.push('', '**Commentaire** :', a.comment);
    return lines.join('\n');
  }

  function copyText(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }

  function copyAnnotation(a) {
    var text = formatAnnotation(a);
    try { navigator.clipboard.writeText(text).catch(function(){ copyText(text); }); }
    catch(e) { copyText(text); }
    showToast('📋 #' + a.id + ' copié — collez dans Claude Code !');
  }

  function copyAll() {
    if (!state.annotations.length) return;
    var text = state.annotations.map(formatAnnotation).join('\n\n---\n\n');
    try { navigator.clipboard.writeText(text).catch(function(){ copyText(text); }); }
    catch(e) { copyText(text); }
    showToast('✅ ' + state.annotations.length + ' annotation(s) copiées !');
  }

  // ─── Dot markers ─────────────────────────────────────────────────────────
  var dots = {};

  function placeDot(a) {
    var dot = document.createElement('div');
    dot.className = '__ef-dot__ ' + a.type;
    dot.textContent = a.id;
    dot.style.left = (a.x - 11) + 'px';
    dot.style.top  = (a.y - 11) + 'px';
    document.body.appendChild(dot);
    dots[a.id] = dot;
  }

  function removeDot(id) {
    if (dots[id]) { dots[id].remove(); delete dots[id]; }
  }

  // ─── Panel ───────────────────────────────────────────────────────────────
  function togglePanel() {
    state.panelOpen = !state.panelOpen;
    if (state.panelOpen) renderPanel();
    else { var p = document.getElementById('__ef-panel__'); if (p) p.remove(); }
  }

  function renderPanel() {
    var existing = document.getElementById('__ef-panel__');
    if (existing) existing.remove();

    var panel = document.createElement('div');
    panel.id = '__ef-panel__';

    var itemsHtml = state.annotations.length === 0
      ? '<div class="ef-panel-empty">Aucune annotation pour l\'instant.</div>'
      : state.annotations.map(function(a){
          return '<div class="ef-item">' +
            '<div class="ef-item-dot ' + a.type + '">' + a.id + '</div>' +
            '<div class="ef-item-body">' +
              '<div class="ef-item-top">' +
                '<span class="ef-item-comp">' + escHtml(a.component || a.page) + '</span>' +
                '<span class="ef-item-prio ' + a.priority + '">' + a.priority + '</span>' +
              '</div>' +
              '<div class="ef-item-comment">' + escHtml(a.comment) + '</div>' +
            '</div>' +
            '<div class="ef-item-actions">' +
              '<button class="ef-item-copy" data-id="' + a.id + '" title="Copier">📋</button>' +
              '<button class="ef-item-delete" data-id="' + a.id + '" title="Supprimer">✕</button>' +
            '</div>' +
          '</div>';
        }).join('');

    var actionsHtml = state.annotations.length > 0
      ? '<button class="ef-btn-copy-all">Copier tout</button><button class="ef-btn-clear">Effacer</button>'
      : '';

    panel.innerHTML =
      '<div class="ef-panel-header">' +
        '<span class="ef-panel-title">📋 Annotations (' + state.annotations.length + ')</span>' +
        '<div class="ef-panel-actions">' + actionsHtml + '</div>' +
      '</div>' +
      '<div class="ef-panel-body">' + itemsHtml + '</div>';

    var btnCopyAll = panel.querySelector('.ef-btn-copy-all');
    var btnClear   = panel.querySelector('.ef-btn-clear');
    if (btnCopyAll) btnCopyAll.addEventListener('click', copyAll);
    if (btnClear) btnClear.addEventListener('click', function(){
      if (!confirm('Vider tout l\'historique ?')) return;
      state.annotations.forEach(function(a){ removeDot(a.id); });
      state.annotations = []; state.counter = 0;
      lsClear();
      renderToolbar(); renderPanel();
    });
    panel.querySelectorAll('.ef-item-copy').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = Number(btn.getAttribute('data-id'));
        var a = state.annotations.find(function(x){ return x.id === id; });
        if (a) copyAnnotation(a);
      });
    });
    panel.querySelectorAll('.ef-item-delete').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = Number(btn.getAttribute('data-id'));
        state.annotations = state.annotations.filter(function(a){ return a.id !== id; });
        removeDot(id);
        lsSave();
        renderToolbar(); renderPanel();
      });
    });

    document.body.appendChild(panel);
  }

  // ─── Toast ───────────────────────────────────────────────────────────────
  function showToast(msg) {
    var old = document.getElementById('__ef-toast__');
    if (old) old.remove();
    var t = document.createElement('div');
    t.id = '__ef-toast__'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 3000);
  }

  // ─── Utils ───────────────────────────────────────────────────────────────
  function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ─── Destroy / Toggle ────────────────────────────────────────────────────
  function toggle() {
    toolbar.style.display = toolbar.style.display === 'none' ? '' : 'none';
  }

  function destroy() {
    setMode(null);
    toolbar.remove();
    var ids = ['__ef-style__','__ef-modal__','__ef-panel__','__ef-toast__'];
    ids.forEach(function(id){ var el = document.getElementById(id); if (el) el.remove(); });
    Object.keys(dots).forEach(function(id){ dots[id].remove(); });
    delete window.__enpiceFeedback__;
  }

  window.__enpiceFeedback__ = { destroy: destroy, toggle: toggle };
  renderToolbar();
})();
