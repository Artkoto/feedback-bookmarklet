(function () {
  if (window.__enpiceFeedback__) { window.__enpiceFeedback__.toggle(); return; }

  // ─── localStorage ─────────────────────────────────────────────────────────
  var LS_KEY = '__ef_annotations__';
  function lsSave() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ annotations: state.annotations })); } catch(e) {}
  }
  function lsLoad() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      state.annotations = data.annotations || [];
    } catch(e) {}
  }
  function lsClear() { try { localStorage.removeItem(LS_KEY); } catch(e) {} }

  // ─── State ────────────────────────────────────────────────────────────────
  var state = { mode: null, annotations: [], panelOpen: false, basket: [], draft: null };
  lsLoad();

  // Prochain ID : max existant + 1 (jamais de collision)
  function nextId() {
    if (!state.annotations.length) return 1;
    return Math.max.apply(null, state.annotations.map(function(a){ return a.id; })) + 1;
  }

  // Renumérotation après suppression : 1..n, met à jour les dots
  function renumber() {
    state.annotations.forEach(function(a, i) {
      var newId = i + 1;
      if (newId !== a.id) {
        if (dots[a.id]) { dots[newId] = dots[a.id]; dots[newId].textContent = newId; delete dots[a.id]; }
        a.id = newId;
      }
    });
    lsSave();
  }

  // ─── Styles ───────────────────────────────────────────────────────────────
  var style = document.createElement('style');
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
    '.__ef-hover__{outline:2px dashed #6366f1 !important;outline-offset:2px !important;cursor:crosshair !important;background-color:rgba(99,102,241,.07) !important}',
    '.__ef-selected__{outline:2px solid #6366f1 !important;outline-offset:2px !important;background-color:rgba(99,102,241,.12) !important}',
    '.__ef-free-cursor__ *{cursor:crosshair !important}',
    // Basket
    '#__ef-basket__{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:2147483642;background:#0f172a;color:#f8fafc;border-radius:12px;padding:8px 12px;display:flex;align-items:center;gap:10px;font:600 12px system-ui,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.5);animation:ef-panel-in .2s ease}',
    '#__ef-basket__ .ef-basket-count{background:#6366f1;border-radius:6px;padding:3px 8px;font-size:11px}',
    '#__ef-basket__ .ef-basket-items{color:#94a3b8;font-size:11px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#__ef-basket__ button{border:none;border-radius:7px;padding:6px 12px;cursor:pointer;font:600 11px system-ui}',
    '#__ef-basket__ .ef-basket-ok{background:#6366f1;color:#fff}',
    '#__ef-basket__ .ef-basket-ok:hover{background:#4f46e5}',
    '#__ef-basket__ .ef-basket-clear{background:#1e293b;color:#94a3b8}',
    '#__ef-basket__ .ef-basket-clear:hover{color:#f8fafc}',
    // Dots
    '.__ef-dot__{position:fixed;z-index:2147483639;width:22px;height:22px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font:700 10px system-ui,sans-serif;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.4);pointer-events:none}',
    '.__ef-dot__.bug{background:#ef4444}',
    '.__ef-dot__.suggestion{background:#6366f1}',
    '.__ef-dot__.design{background:#f59e0b}',
    '.__ef-dot__.question{background:#0ea5e9}',
    // Draft chip
    '#__ef-draft-chip__{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:2147483643;background:rgba(245,158,11,.75);color:#0f172a;border-radius:20px;padding:7px 14px;display:flex;align-items:center;gap:8px;font:600 12px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.3);cursor:pointer;animation:ef-panel-in .2s ease;backdrop-filter:blur(4px)}',
    '#__ef-draft-chip__ .ef-draft-dismiss{border:none;background:rgba(0,0,0,.15);color:#0f172a;border-radius:50%;width:18px;height:18px;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;padding:0}',
    // Modal
    '#__ef-modal__{position:fixed;inset:0;z-index:2147483645;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}',
    '#__ef-modal__ .ef-dialog{background:#fff;border-radius:16px;padding:28px;width:480px;max-width:94vw;box-shadow:0 16px 48px rgba(0,0,0,.3);font-family:system-ui,sans-serif}',
    '#__ef-modal__ h3{margin:0 0 4px;font-size:15px;color:#0f172a}',
    '#__ef-modal__ .ef-subtitle{margin:0 0 14px;font-size:11px;color:#94a3b8}',
    '#__ef-modal__ .ef-row{display:flex;gap:10px;margin-bottom:14px}',
    '#__ef-modal__ .ef-field{flex:1}',
    '#__ef-modal__ label{display:block;font-size:11px;font-weight:600;color:#374151;margin-bottom:5px}',
    '#__ef-modal__ select,#__ef-modal__ textarea{width:100%;border:1.5px solid #e2e8f0;border-radius:8px;padding:8px 10px;font:13px system-ui,sans-serif;color:#0f172a;outline:none;background:#fff;transition:border-color .15s}',
    '#__ef-modal__ select:focus,#__ef-modal__ textarea:focus{border-color:#6366f1}',
    '#__ef-modal__ textarea{resize:vertical;min-height:90px}',
    '#__ef-modal__ .ef-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:18px}',
    '#__ef-modal__ .ef-actions button{border:none;border-radius:8px;padding:9px 18px;cursor:pointer;font:600 12px system-ui,sans-serif;transition:all .15s}',
    '#__ef-modal__ .ef-save{background:#6366f1;color:#fff}',
    '#__ef-modal__ .ef-save:hover{background:#4f46e5}',
    '#__ef-modal__ .ef-cancel{background:#f1f5f9;color:#475569}',
    '#__ef-modal__ .ef-cancel:hover{background:#e2e8f0}',
    '#__ef-modal__ .ef-minimize{background:#f1f5f9;color:#475569}',
    '#__ef-modal__ .ef-minimize:hover{background:#e2e8f0}',
    // Composants éditables dans modal
    '#__ef-modal__ .ef-comp-section{margin-bottom:14px}',
    '#__ef-modal__ .ef-comp-section label{margin-bottom:6px}',
    '#__ef-modal__ .ef-comp-list{display:flex;flex-direction:column;gap:4px;margin-bottom:6px}',
    '#__ef-modal__ .ef-comp-item{display:flex;align-items:center;gap:6px;background:#f8fafc;border-radius:6px;padding:5px 8px;font-size:11px}',
    '#__ef-modal__ .ef-comp-item code{flex:1;color:#4f46e5;font-family:monospace;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#__ef-modal__ .ef-comp-path{color:#94a3b8;font-size:10px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#__ef-modal__ .ef-comp-remove{border:none;background:none;color:#94a3b8;cursor:pointer;font-size:12px;padding:0 3px;border-radius:3px}',
    '#__ef-modal__ .ef-comp-remove:hover{color:#ef4444}',
    '#__ef-modal__ .ef-btn-add-comp{border:1.5px dashed #cbd5e1;background:none;color:#64748b;border-radius:6px;padding:5px 10px;cursor:pointer;font:600 11px system-ui;width:100%}',
    '#__ef-modal__ .ef-btn-add-comp:hover{border-color:#6366f1;color:#6366f1}',
    // Panel
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
    '#__ef-panel__ .ef-item{padding:10px 16px;border-bottom:1px solid #1e293b;display:flex;gap:10px;align-items:flex-start;transition:background .1s}',
    '#__ef-panel__ .ef-item.selected{background:#1e293b}',
    '#__ef-panel__ .ef-item:last-child{border-bottom:none}',
    '#__ef-panel__ .ef-item-check{appearance:none;width:14px;height:14px;min-width:14px;border:1.5px solid #334155;border-radius:3px;cursor:pointer;margin-top:3px;background:#0f172a;transition:all .15s}',
    '#__ef-panel__ .ef-item-check:checked{background:#6366f1;border-color:#6366f1}',
    '#__ef-panel__ .ef-sel-bar{padding:8px 16px;background:#1e293b;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #334155}',
    '#__ef-panel__ .ef-sel-info{font:600 10px system-ui;color:#94a3b8}',
    '#__ef-panel__ .ef-sel-actions{display:flex;gap:6px}',
    '#__ef-panel__ .ef-sel-actions button{border:none;border-radius:5px;padding:4px 9px;cursor:pointer;font:600 10px system-ui}',
    '#__ef-panel__ .ef-btn-copy-sel{background:#6366f1;color:#fff}',
    '#__ef-panel__ .ef-btn-copy-sel:disabled{background:#334155;color:#475569;cursor:default}',
    '#__ef-panel__ .ef-btn-del-sel{background:#7f1d1d;color:#fca5a5}',
    '#__ef-panel__ .ef-btn-del-sel:hover:not(:disabled){background:#ef4444;color:#fff}',
    '#__ef-panel__ .ef-btn-del-sel:disabled{background:#334155;color:#475569;cursor:default}',
    '#__ef-panel__ .ef-btn-sel-all{background:#1e293b;color:#94a3b8;border:1px solid #334155 !important}',
    '#__ef-panel__ .ef-btn-sel-all:hover{color:#f8fafc}',
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
    '#__ef-panel__ .ef-item-edit{background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px;padding:2px 5px;border-radius:4px}',
    '#__ef-panel__ .ef-item-edit:hover{background:#1e293b;color:#f8fafc}',
    '#__ef-panel__ .ef-item-delete{background:none;border:none;color:#334155;cursor:pointer;font-size:13px;padding:2px 4px;border-radius:4px}',
    '#__ef-panel__ .ef-item-delete:hover{color:#ef4444;background:#1e293b}',
    '#__ef-panel__ .ef-confirm{display:flex;align-items:center;gap:4px;animation:ef-panel-in .15s ease}',
    '#__ef-panel__ .ef-confirm span{font:600 10px system-ui;color:#f87171;white-space:nowrap}',
    '#__ef-panel__ .ef-confirm .ef-confirm-yes{border:none;border-radius:4px;padding:3px 8px;cursor:pointer;font:600 10px system-ui;background:#ef4444;color:#fff}',
    '#__ef-panel__ .ef-confirm .ef-confirm-no{border:none;border-radius:4px;padding:3px 8px;cursor:pointer;font:600 10px system-ui;background:#1e293b;color:#94a3b8}',
    // Toast
    '#__ef-toast__{position:fixed;bottom:88px;right:24px;z-index:2147483647;background:#22c55e;color:#fff;border-radius:10px;padding:10px 16px;font:600 12px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.3);animation:ef-toast-in .2s ease}',
    '@keyframes ef-toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
  ].join('');
  document.head.appendChild(style);

  // ─── Toolbar ──────────────────────────────────────────────────────────────
  var toolbar = document.createElement('div');
  toolbar.id = '__ef-toolbar__';
  document.body.appendChild(toolbar);

  function renderToolbar() {
    var n = state.annotations.length;
    toolbar.innerHTML =
      '<span class="ef-logo">💬</span>' +
      '<span class="ef-label">Feedback</span>' +
      '<span class="ef-sep"></span>' +
      '<button class="ef-btn-select' + (state.mode === 'select' ? ' active' : '') + '">' + (state.mode === 'select' ? '✋ Stop' : '🎯 Composant') + '</button>' +
      '<button class="ef-btn-free' + (state.mode === 'free' ? ' active' : '') + '">' + (state.mode === 'free' ? '✋ Stop' : '✏️ Libre') + '</button>' +
      '<button class="ef-btn-panel' + (n > 0 ? ' has-items' : '') + '">📋 Historique' + (n > 0 ? ' <span class="ef-badge">' + n + '</span>' : '') + '</button>' +
      '<button class="ef-btn-close">✕</button>';
    toolbar.querySelector('.ef-btn-select').onclick = function() { setMode(state.mode === 'select' ? null : 'select'); };
    toolbar.querySelector('.ef-btn-free').onclick   = function() { setMode(state.mode === 'free' ? null : 'free'); };
    toolbar.querySelector('.ef-btn-panel').onclick  = togglePanel;
    toolbar.querySelector('.ef-btn-close').onclick  = destroy;
  }

  // ─── Modes ────────────────────────────────────────────────────────────────
  var hovered = null;

  function setMode(newMode) {
    if (state.mode === 'select') {
      document.removeEventListener('mouseover', onSelectOver, true);
      document.removeEventListener('mouseout',  onSelectOut,  true);
      document.removeEventListener('click',     onSelectClick, true);
      if (hovered) { hovered.classList.remove('__ef-hover__'); hovered = null; }
      clearBasket();
    }
    if (state.mode === 'free') {
      document.removeEventListener('click', onFreeClick, true);
      document.documentElement.classList.remove('__ef-free-cursor__');
    }
    state.mode = newMode;
    if (state.mode === 'select') {
      document.addEventListener('mouseover', onSelectOver, true);
      document.addEventListener('mouseout',  onSelectOut,  true);
      document.addEventListener('click',     onSelectClick, true);
    }
    if (state.mode === 'free') {
      document.addEventListener('click', onFreeClick, true);
      document.documentElement.classList.add('__ef-free-cursor__');
    }
    renderToolbar();
  }

  function onSelectOver(e) {
    if (e.target.closest('#__ef-toolbar__') || e.target.closest('#__ef-modal__') || e.target.closest('#__ef-panel__') || e.target.closest('#__ef-basket__') || e.target.closest('#__ef-draft-chip__')) return;
    if (hovered) hovered.classList.remove('__ef-hover__');
    hovered = e.target;
    hovered.classList.add('__ef-hover__');
  }
  function onSelectOut() {
    if (hovered) { hovered.classList.remove('__ef-hover__'); hovered = null; }
  }
  function onSelectClick(e) {
    if (e.target.closest('#__ef-toolbar__') || e.target.closest('#__ef-modal__') || e.target.closest('#__ef-panel__') || e.target.closest('#__ef-basket__') || e.target.closest('#__ef-draft-chip__')) return;
    e.preventDefault(); e.stopPropagation();
    var el = e.target;
    if (hovered) { hovered.classList.remove('__ef-hover__'); hovered = null; }
    var idx = state.basket.findIndex(function(b){ return b.el === el; });
    if (idx > -1) {
      el.classList.remove('__ef-selected__');
      state.basket.splice(idx, 1);
    } else {
      el.classList.add('__ef-selected__');
      state.basket.push({ el: el, component: getAngularComponent(el) || el.tagName.toLowerCase(), cssPath: getCssPath(el), snippet: getSnippet(el), x: Math.round(e.clientX), y: Math.round(e.clientY) });
    }
    renderBasket();
  }
  function onFreeClick(e) {
    if (e.target.closest('#__ef-toolbar__') || e.target.closest('#__ef-modal__') || e.target.closest('#__ef-panel__') || e.target.closest('#__ef-draft-chip__')) return;
    e.preventDefault(); e.stopPropagation();
    showModal({ free: true, x: e.clientX, y: e.clientY });
  }

  // ─── Helpers DOM ──────────────────────────────────────────────────────────
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
    return t.length > 60 ? t.slice(0,60) + '...' : t;
  }

  // ─── Panier ───────────────────────────────────────────────────────────────
  function clearBasket() {
    state.basket.forEach(function(b){ if (b.el) b.el.classList.remove('__ef-selected__'); });
    state.basket = [];
    var el = document.getElementById('__ef-basket__');
    if (el) el.remove();
  }

  function renderBasket() {
    var existing = document.getElementById('__ef-basket__');
    if (existing) existing.remove();
    if (!state.basket.length) return;

    var names = state.basket.map(function(b){ return b.component; }).join(', ');
    var el = document.createElement('div');
    el.id = '__ef-basket__';
    el.innerHTML =
      '<span class="ef-basket-count">' + state.basket.length + ' composant' + (state.basket.length > 1 ? 's' : '') + '</span>' +
      '<span class="ef-basket-items">' + escHtml(names) + '</span>' +
      '<button class="ef-basket-ok">✏️ Feedback</button>' +
      '<button class="ef-basket-clear">✕</button>';

    el.querySelector('.ef-basket-ok').onclick = function() {
      var items = state.basket.slice();
      clearBasket();
      // Si draft en mode pickingComponents, fusionner
      if (state.draft && state.draft.pickingComponents) {
        var merged = (state.draft.basket || []).concat(items);
        var d = state.draft;
        state.draft = null;
        removeDraftChip();
        showModal({ basket: merged, editId: d.editId, draft: { type: d.type, priority: d.priority, comment: d.comment } });
      } else {
        showModal({ basket: items });
      }
    };
    el.querySelector('.ef-basket-clear').onclick = function() {
      clearBasket();
      // Si on était en mode pickingComponents, rouvrir le draft
      if (state.draft && state.draft.pickingComponents) {
        var d = state.draft;
        state.draft = null;
        removeDraftChip();
        showModal({ basket: d.basket || [], editId: d.editId, draft: { type: d.type, priority: d.priority, comment: d.comment } });
      }
    };
    document.body.appendChild(el);
  }

  // ─── Draft chip ───────────────────────────────────────────────────────────
  function renderDraftChip() {
    removeDraftChip();
    if (!state.draft || state.draft.pickingComponents) return;
    var chip = document.createElement('div');
    chip.id = '__ef-draft-chip__';
    var label = '✏️ Draft en cours — reprendre';
    chip.innerHTML = '<span>' + label + '</span><button class="ef-draft-dismiss" title="Annuler">✕</button>';
    chip.querySelector('span').onclick = function() {
      if (state.draft) {
        var d = state.draft; state.draft = null; removeDraftChip();
        showModal({ basket: d.basket || [], editId: d.editId, free: d.free, x: d.x, y: d.y, draft: { type: d.type, priority: d.priority, comment: d.comment } });
      }
    };
    chip.querySelector('.ef-draft-dismiss').onclick = function(e) {
      e.stopPropagation();
      state.draft = null;
      removeDraftChip();
      setMode(null);
    };
    document.body.appendChild(chip);
  }
  function removeDraftChip() {
    var c = document.getElementById('__ef-draft-chip__');
    if (c) c.remove();
  }

  // ─── Modal (création + édition) ───────────────────────────────────────────
  var TYPE_ICONS = { bug: '🐛', suggestion: '💡', design: '🎨', question: '❓' };

  function showModal(opts) {
    var free    = opts.free   || false;
    var x       = opts.x     || 0;
    var y       = opts.y     || 0;
    var editId  = opts.editId || null;
    var prefill = opts.draft  || null; // { type, priority, comment }

    // Panier de composants courant
    var basket = opts.basket ? opts.basket.slice() : [];

    // Si édition, charger les données existantes
    var existing = editId ? state.annotations.find(function(a){ return a.id === editId; }) : null;
    var defType     = prefill ? prefill.type     : (existing ? existing.type     : 'design');
    var defPriority = prefill ? prefill.priority : (existing ? existing.priority : 'moyenne');
    var defComment  = prefill ? prefill.comment  : (existing ? existing.comment  : '');
    // Basket initial pour l'édition
    if (!basket.length && existing && existing.components) basket = existing.components.slice();
    else if (!basket.length && existing && existing.component && !free) {
      basket = [{ component: existing.component, cssPath: existing.cssPath, snippet: existing.snippet }];
    }

    var modal = document.createElement('div');
    modal.id = '__ef-modal__';

    function buildCompHtml() {
      if (!basket.length) return '';
      return '<div class="ef-comp-section"><label>Composants ciblés</label>' +
        '<div class="ef-comp-list">' +
          basket.map(function(b, i){
            return '<div class="ef-comp-item">' +
              '<code>' + escHtml(b.component || '') + '</code>' +
              '<span class="ef-comp-path">' + escHtml(b.cssPath || '') + '</span>' +
              '<button class="ef-comp-remove" data-idx="' + i + '">✕</button>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<button class="ef-btn-add-comp">➕ Ajouter des composants</button>' +
      '</div>';
    }

    function opt(val, cur, label) { return '<option value="' + val + '"' + (cur===val?' selected':'') + '>' + label + '</option>'; }

    modal.innerHTML =
      '<div class="ef-dialog">' +
        '<h3>' + (editId ? '✏️ Modifier feedback #' + editId : free ? '✏️ Annotation libre' : '🎯 Annotation composant') + '</h3>' +
        '<p class="ef-subtitle">Page : ' + location.pathname + (free ? ' — (' + Math.round(x) + ', ' + Math.round(y) + ')' : '') + '</p>' +
        '<div id="__ef-comp-area__">' + buildCompHtml() + '</div>' +
        '<div class="ef-row">' +
          '<div class="ef-field"><label>Type</label><select id="__ef-type__">' +
            opt('bug', defType, '🐛 Bug') + opt('suggestion', defType, '💡 Suggestion') + opt('design', defType, '🎨 Design') + opt('question', defType, '❓ Question') +
          '</select></div>' +
          '<div class="ef-field"><label>Priorité</label><select id="__ef-priority__">' +
            opt('haute', defPriority, '🔴 Haute') + opt('moyenne', defPriority, '🟡 Moyenne') + opt('basse', defPriority, '🟢 Basse') +
          '</select></div>' +
        '</div>' +
        '<div><label>Commentaire</label><textarea id="__ef-comment__" placeholder="Décrivez le problème ou le changement souhaité...">' + escHtml(defComment) + '</textarea></div>' +
        '<div class="ef-actions">' +
          '<button class="ef-cancel">Annuler</button>' +
          '<button class="ef-minimize">⬇ Réduire</button>' +
          '<button class="ef-save">💾 Sauvegarder</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    var textarea = modal.querySelector('#__ef-comment__');
    var compArea = modal.querySelector('#__ef-comp-area__');

    setTimeout(function(){ textarea.focus(); textarea.setSelectionRange(textarea.value.length, textarea.value.length); }, 50);

    function refreshComps() {
      compArea.innerHTML = buildCompHtml();
      bindComps();
    }
    function bindComps() {
      compArea.querySelectorAll('.ef-comp-remove').forEach(function(btn){
        btn.addEventListener('click', function(e){
          e.stopPropagation();
          basket.splice(Number(btn.getAttribute('data-idx')), 1);
          refreshComps();
        });
      });
      var btnAdd = compArea.querySelector('.ef-btn-add-comp');
      if (btnAdd) btnAdd.addEventListener('click', function(){
        minimizeToDraft(true);
      });
    }
    bindComps();

    function getCurrentDraft(picking) {
      return {
        type:     modal.querySelector('#__ef-type__').value,
        priority: modal.querySelector('#__ef-priority__').value,
        comment:  textarea.value,
        basket:   basket.slice(),
        editId:   editId,
        free:     free, x: x, y: y,
        pickingComponents: picking || false,
      };
    }

    function minimizeToDraft(picking) {
      state.draft = getCurrentDraft(picking);
      modal.remove();
      if (picking) setMode('select');
      renderDraftChip();
    }

    modal.onclick    = function(e){ if (e.target === modal) minimizeToDraft(false); };
    modal.querySelector('.ef-cancel').onclick  = function(){ state.draft = null; removeDraftChip(); modal.remove(); };
    modal.querySelector('.ef-minimize').onclick = function(){ minimizeToDraft(false); };
    textarea.addEventListener('keydown', function(e){
      if (e.key === 'Escape') minimizeToDraft(false);
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) modal.querySelector('.ef-save').click();
    });

    modal.querySelector('.ef-save').onclick = function(){
      var comment  = textarea.value.trim();
      if (!comment) { textarea.focus(); return; }
      var type     = modal.querySelector('#__ef-type__').value;
      var priority = modal.querySelector('#__ef-priority__').value;

      if (editId && existing) {
        existing.type      = type;
        existing.priority  = priority;
        existing.comment   = comment;
        existing.components = basket.length > 1 ? basket.slice() : null;
        existing.component  = basket.length ? basket.map(function(b){ return b.component; }).join(', ') : existing.component;
        existing.cssPath    = basket.length ? basket.map(function(b){ return b.cssPath; }).join(' | ') : existing.cssPath;
        if (dots[existing.id]) dots[existing.id].className = '__ef-dot__ ' + existing.type;
        lsSave();
        modal.remove(); state.draft = null; removeDraftChip();
        renderToolbar();
        if (state.panelOpen) renderPanel();
        showToast('💾 Feedback #' + editId + ' mis à jour !');
        return;
      }

      var id = nextId();
      var annotation = {
        id: id, type: type, priority: priority, comment: comment,
        component: basket.length ? basket.map(function(b){ return b.component; }).join(', ') : null,
        cssPath:   basket.length ? basket.map(function(b){ return b.cssPath;   }).join(' | ') : null,
        snippet:   basket.length === 1 ? basket[0].snippet : null,
        components: basket.length > 1 ? basket.slice() : null,
        page: location.pathname, x: Math.round(x), y: Math.round(y), free: free,
      };
      state.annotations.push(annotation);
      lsSave();
      modal.remove(); state.draft = null; removeDraftChip();
      placeDot(annotation);
      renderToolbar();
      state.panelOpen = true;
      renderPanel();
      showToast('💾 Feedback #' + id + ' sauvegardé !');
    };
  }

  // ─── Format & Copy ────────────────────────────────────────────────────────
  function formatAnnotation(a) {
    var icon = TYPE_ICONS[a.type] || '📌';
    var lines = ['## ' + icon + ' Feedback #' + a.id + ' — ' + capitalize(a.type) + ' (priorité ' + a.priority + ')', ''];
    if (a.components && a.components.length > 1) {
      a.components.forEach(function(b, i){ lines.push('**Composant ' + (i+1) + '** : `' + b.component + '` — `' + (b.cssPath||'') + '`'); });
    } else {
      if (a.component) lines.push('**Composant** : `' + a.component + '`');
      if (a.cssPath)   lines.push('**Sélecteur**  : `' + a.cssPath + '`');
      if (a.snippet)   lines.push('**Contenu**    : "' + a.snippet + '"');
    }
    lines.push('**Page**       : ' + a.page);
    if (a.free) lines.push('**Position**   : (' + a.x + ', ' + a.y + ')');
    lines.push('', '**Commentaire** :', a.comment);
    return lines.join('\n');
  }

  function copyText(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  function copyAnnotation(a) {
    var text = formatAnnotation(a);
    try { navigator.clipboard.writeText(text).catch(function(){ copyText(text); }); } catch(e) { copyText(text); }
    showToast('📋 #' + a.id + ' copié — collez dans Claude Code !');
  }
  function copyAll() {
    if (!state.annotations.length) return;
    var text = state.annotations.map(formatAnnotation).join('\n\n---\n\n');
    try { navigator.clipboard.writeText(text).catch(function(){ copyText(text); }); } catch(e) { copyText(text); }
    showToast('✅ ' + state.annotations.length + ' annotation(s) copiées !');
  }

  // ─── Dots ─────────────────────────────────────────────────────────────────
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
  function removeDot(id) { if (dots[id]) { dots[id].remove(); delete dots[id]; } }

  // ─── Panel ────────────────────────────────────────────────────────────────
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

    var itemsHtml = !state.annotations.length
      ? '<div class="ef-panel-empty">Aucune annotation pour l\'instant.</div>'
      : state.annotations.map(function(a){
          return '<div class="ef-item" data-id="' + a.id + '">' +
            '<input type="checkbox" class="ef-item-check" data-id="' + a.id + '">' +
            '<div class="ef-item-dot ' + a.type + '">' + a.id + '</div>' +
            '<div class="ef-item-body">' +
              '<div class="ef-item-top"><span class="ef-item-comp">' + escHtml(a.component || a.page) + '</span><span class="ef-item-prio ' + a.priority + '">' + a.priority + '</span></div>' +
              '<div class="ef-item-comment">' + escHtml(a.comment) + '</div>' +
            '</div>' +
            '<div class="ef-item-actions">' +
              '<button class="ef-item-edit"  data-id="' + a.id + '" title="Modifier">✏️</button>' +
              '<button class="ef-item-copy"  data-id="' + a.id + '" title="Copier">📋</button>' +
              '<button class="ef-item-delete" data-id="' + a.id + '" title="Supprimer">✕</button>' +
            '</div>' +
          '</div>';
        }).join('');

    var hasItems = !!state.annotations.length;
    panel.innerHTML =
      '<div class="ef-panel-header"><span class="ef-panel-title">📋 Annotations (' + state.annotations.length + ')</span>' +
        '<div class="ef-panel-actions">' + (hasItems ? '<button class="ef-btn-copy-all">Copier tout</button><button class="ef-btn-clear">Effacer</button>' : '') + '</div>' +
      '</div>' +
      (hasItems ? '<div class="ef-sel-bar"><span class="ef-sel-info">0 sélectionné</span><div class="ef-sel-actions"><button class="ef-btn-sel-all">Tout sélectionner</button><button class="ef-btn-copy-sel" disabled>📋 Copier</button><button class="ef-btn-del-sel" disabled>🗑️ Supprimer</button></div></div>' : '') +
      '<div class="ef-panel-body">' + itemsHtml + '</div>';

    // Actions header
    var btnCopyAll = panel.querySelector('.ef-btn-copy-all');
    var btnClear   = panel.querySelector('.ef-btn-clear');
    if (btnCopyAll) btnCopyAll.addEventListener('click', copyAll);
    if (btnClear) btnClear.addEventListener('click', function(){
      inlineConfirm(btnClear, 'Tout vider ?', function(){
        state.annotations.forEach(function(a){ removeDot(a.id); });
        state.annotations = [];
        lsClear(); renderToolbar(); renderPanel();
      });
    });

    // Sélection multiple
    var selInfo    = panel.querySelector('.ef-sel-info');
    var btnSelAll  = panel.querySelector('.ef-btn-sel-all');
    var btnCopySel = panel.querySelector('.ef-btn-copy-sel');
    var btnDelSel  = panel.querySelector('.ef-btn-del-sel');

    function getSelectedIds() {
      return [].map.call(panel.querySelectorAll('.ef-item-check:checked'), function(cb){ return Number(cb.getAttribute('data-id')); });
    }
    function updateSelBar() {
      if (!selInfo) return;
      var n = panel.querySelectorAll('.ef-item-check:checked').length;
      selInfo.textContent = n + ' sélectionné' + (n > 1 ? 's' : '');
      btnCopySel.disabled = n === 0; btnDelSel.disabled = n === 0;
      var allChecked = n === state.annotations.length && n > 0;
      if (btnSelAll) btnSelAll.textContent = allChecked ? 'Tout désélectionner' : 'Tout sélectionner';
      panel.querySelectorAll('.ef-item').forEach(function(item){
        var cb = item.querySelector('.ef-item-check');
        item.classList.toggle('selected', cb && cb.checked);
      });
    }

    if (btnSelAll) btnSelAll.addEventListener('click', function(){
      var allChecked = panel.querySelectorAll('.ef-item-check:checked').length === state.annotations.length;
      panel.querySelectorAll('.ef-item-check').forEach(function(cb){ cb.checked = !allChecked; });
      updateSelBar();
    });
    if (btnCopySel) btnCopySel.addEventListener('click', function(){
      var ids = getSelectedIds();
      var sel = state.annotations.filter(function(a){ return ids.indexOf(a.id) > -1; });
      if (!sel.length) return;
      var text = sel.map(formatAnnotation).join('\n\n---\n\n');
      try { navigator.clipboard.writeText(text).catch(function(){ copyText(text); }); } catch(e) { copyText(text); }
      showToast('📋 ' + sel.length + ' annotation(s) copiée(s) !');
    });
    if (btnDelSel) btnDelSel.addEventListener('click', function(){
      var ids = getSelectedIds();
      if (!ids.length) return;
      inlineConfirm(btnDelSel, 'Supprimer ' + ids.length + ' ?', function(){
        ids.forEach(function(id){ removeDot(id); });
        state.annotations = state.annotations.filter(function(a){ return ids.indexOf(a.id) === -1; });
        renumber(); renderToolbar(); renderPanel();
      });
    });
    panel.querySelectorAll('.ef-item-check').forEach(function(cb){ cb.addEventListener('change', updateSelBar); });

    // Actions par item
    panel.querySelectorAll('.ef-item-edit').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = Number(btn.getAttribute('data-id'));
        showModal({ editId: id });
      });
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
        inlineConfirm(btn, 'Supprimer ?', function(){
          removeDot(id);
          state.annotations = state.annotations.filter(function(a){ return a.id !== id; });
          renumber(); lsSave(); renderToolbar(); renderPanel();
        });
      });
    });

    document.body.appendChild(panel);

    // Fermer au clic extérieur
    setTimeout(function(){
      function onOutside(e) {
        if (!panel.contains(e.target) && !toolbar.contains(e.target)) {
          state.panelOpen = false; panel.remove(); renderToolbar();
          document.removeEventListener('mousedown', onOutside, true);
        }
      }
      document.addEventListener('mousedown', onOutside, true);
    }, 0);
  }

  // ─── Confirmation inline ──────────────────────────────────────────────────
  function inlineConfirm(triggerBtn, label, onConfirm) {
    var existing = document.querySelector('.__ef-confirm-active__');
    if (existing) existing.remove();
    var wrap = document.createElement('span');
    wrap.className = '__ef-confirm-active__ ef-confirm';
    wrap.innerHTML = '<span>' + label + '</span><button class="ef-confirm-yes">Oui</button><button class="ef-confirm-no">Non</button>';
    triggerBtn.style.display = 'none';
    triggerBtn.parentNode.insertBefore(wrap, triggerBtn.nextSibling);
    wrap.querySelector('.ef-confirm-yes').onclick = function(e){ e.stopPropagation(); wrap.remove(); triggerBtn.style.display = ''; onConfirm(); };
    wrap.querySelector('.ef-confirm-no').onclick  = function(e){ e.stopPropagation(); wrap.remove(); triggerBtn.style.display = ''; };
  }

  // ─── Toast ────────────────────────────────────────────────────────────────
  function showToast(msg) {
    var old = document.getElementById('__ef-toast__'); if (old) old.remove();
    var t = document.createElement('div'); t.id = '__ef-toast__'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 3000);
  }

  // ─── Utils ────────────────────────────────────────────────────────────────
  function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
  function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ─── Destroy / Toggle ─────────────────────────────────────────────────────
  function toggle() { toolbar.style.display = toolbar.style.display === 'none' ? '' : 'none'; }

  function destroy() {
    setMode(null);
    toolbar.remove();
    ['__ef-style__','__ef-modal__','__ef-panel__','__ef-toast__','__ef-basket__','__ef-draft-chip__'].forEach(function(id){
      var el = document.getElementById(id); if (el) el.remove();
    });
    Object.keys(dots).forEach(function(id){ dots[id].remove(); });
    delete window.__enpiceFeedback__;
  }

  window.__enpiceFeedback__ = { destroy: destroy, toggle: toggle };
  renderToolbar();
})();
