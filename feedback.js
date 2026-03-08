(function () {
  if (window.__enpiceFeedback__) {
    window.__enpiceFeedback__.destroy();
    return;
  }

  /* ── Styles ── */
  const style = document.createElement('style');
  style.id = '__ef-style__';
  style.textContent = `
    #__ef-toolbar__ {
      position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;
      background: #0f172a; color: #f8fafc; border-radius: 12px;
      padding: 10px 16px; display: flex; align-items: center; gap: 10px;
      font: 600 13px/1 'Inter', sans-serif;
      box-shadow: 0 4px 24px rgba(0,0,0,.45);
      user-select: none;
    }
    #__ef-toolbar__ .ef-logo { font-size: 15px; }
    #__ef-toolbar__ button {
      border: none; border-radius: 8px; padding: 7px 14px;
      cursor: pointer; font: inherit; font-size: 12px;
    }
    #__ef-toolbar__ .ef-btn {
      background: #6366f1; color: #fff; transition: background .15s;
    }
    #__ef-toolbar__ .ef-btn:hover  { background: #4f46e5; }
    #__ef-toolbar__ .ef-btn.active { background: #ef4444; }
    #__ef-toolbar__ .ef-btn.active:hover { background: #dc2626; }
    #__ef-toolbar__ .ef-close {
      background: transparent; color: #94a3b8; font-size: 16px; padding: 4px 8px;
    }
    #__ef-toolbar__ .ef-close:hover { color: #f8fafc; }
    .__ef-hover__ {
      outline: 2px solid #6366f1 !important;
      outline-offset: 2px !important;
      cursor: crosshair !important;
      background-color: rgba(99,102,241,.06) !important;
    }
    #__ef-modal__ {
      position: fixed; inset: 0; z-index: 2147483646;
      background: rgba(0,0,0,.55); display: flex;
      align-items: center; justify-content: center;
    }
    #__ef-modal__ .ef-dialog {
      background: #fff; border-radius: 14px; padding: 28px;
      width: 460px; max-width: 92vw;
      box-shadow: 0 12px 40px rgba(0,0,0,.3);
      font-family: 'Inter', sans-serif;
    }
    #__ef-modal__ h3 {
      margin: 0 0 6px; font-size: 15px; color: #0f172a; font-weight: 700;
    }
    #__ef-modal__ .ef-meta {
      margin: 0 0 16px; font-size: 12px; color: #64748b;
      display: flex; flex-direction: column; gap: 4px;
    }
    #__ef-modal__ .ef-meta code {
      background: #f1f5f9; padding: 3px 7px; border-radius: 5px;
      font-size: 11px; color: #4f46e5; font-family: monospace;
      display: inline-block; max-width: 100%; overflow: hidden;
      text-overflow: ellipsis; white-space: nowrap;
    }
    #__ef-modal__ label {
      display: block; font-size: 12px; font-weight: 600;
      color: #374151; margin-bottom: 6px;
    }
    #__ef-modal__ textarea {
      width: 100%; box-sizing: border-box;
      border: 1.5px solid #e2e8f0; border-radius: 8px;
      padding: 10px 12px; font-size: 13px; font-family: inherit;
      resize: vertical; min-height: 90px; outline: none; color: #0f172a;
      transition: border-color .15s;
    }
    #__ef-modal__ textarea:focus { border-color: #6366f1; }
    #__ef-modal__ .ef-actions {
      display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px;
    }
    #__ef-modal__ .ef-actions button {
      border: none; border-radius: 8px; padding: 9px 18px;
      cursor: pointer; font: 600 13px 'Inter', sans-serif;
    }
    #__ef-modal__ .ef-copy { background: #6366f1; color: #fff; }
    #__ef-modal__ .ef-copy:hover { background: #4f46e5; }
    #__ef-modal__ .ef-cancel { background: #f1f5f9; color: #475569; }
    #__ef-modal__ .ef-cancel:hover { background: #e2e8f0; }
    #__ef-toast__ {
      position: fixed; bottom: 80px; right: 20px; z-index: 2147483647;
      background: #22c55e; color: #fff; border-radius: 10px;
      padding: 10px 18px; font: 600 13px 'Inter', sans-serif;
      box-shadow: 0 4px 16px rgba(0,0,0,.25);
      animation: ef-slide-in .2s ease;
    }
    @keyframes ef-slide-in {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  /* ── Toolbar ── */
  const toolbar = document.createElement('div');
  toolbar.id = '__ef-toolbar__';
  let active = false;

  function renderToolbar() {
    toolbar.innerHTML = `
      <span class="ef-logo">💬</span>
      <span>Feedback ENPICE</span>
      <button class="ef-btn ${active ? 'active' : ''}" id="__ef-toggle__">
        ${active ? '✋ Arrêter' : '🎯 Sélectionner'}
      </button>
      <button class="ef-close" id="__ef-close__">✕</button>
    `;
    document.getElementById('__ef-toggle__').onclick = toggleMode;
    document.getElementById('__ef-close__').onclick = destroy;
  }

  document.body.appendChild(toolbar);
  renderToolbar();

  /* ── Helpers ── */
  function getAngularComponent(el) {
    let cur = el;
    while (cur && cur !== document.body) {
      const tag = cur.tagName.toLowerCase();
      if (tag.includes('-')) return tag; // custom element = composant Angular
      cur = cur.parentElement;
    }
    return null;
  }

  function getCssPath(el) {
    const parts = [];
    let cur = el;
    while (cur && cur !== document.body) {
      let seg = cur.tagName.toLowerCase();
      if (cur.id) { parts.unshift('#' + cur.id); break; }
      const cls = [...cur.classList]
        .filter(c => !c.startsWith('__ef'))
        .slice(0, 2).join('.');
      if (cls) seg += '.' + cls;
      parts.unshift(seg);
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  }

  function getInnerTextSnippet(el) {
    const t = (el.innerText || '').trim().replace(/\s+/g, ' ');
    return t.length > 60 ? t.slice(0, 60) + '…' : t;
  }

  /* ── Mode sélection ── */
  let hovered = null;

  function onOver(e) {
    if (e.target.closest('#__ef-toolbar__') || e.target.closest('#__ef-modal__')) return;
    if (hovered) hovered.classList.remove('__ef-hover__');
    hovered = e.target;
    hovered.classList.add('__ef-hover__');
  }

  function onOut() {
    if (hovered) { hovered.classList.remove('__ef-hover__'); hovered = null; }
  }

  function onClick(e) {
    if (e.target.closest('#__ef-toolbar__') || e.target.closest('#__ef-modal__')) return;
    e.preventDefault(); e.stopPropagation();
    const el = e.target;
    if (hovered) { hovered.classList.remove('__ef-hover__'); hovered = null; }
    showModal(el);
  }

  function toggleMode() {
    active = !active;
    if (active) {
      document.addEventListener('mouseover', onOver, true);
      document.addEventListener('mouseout', onOut, true);
      document.addEventListener('click', onClick, true);
    } else {
      document.removeEventListener('mouseover', onOver, true);
      document.removeEventListener('mouseout', onOut, true);
      document.removeEventListener('click', onClick, true);
      if (hovered) { hovered.classList.remove('__ef-hover__'); hovered = null; }
    }
    renderToolbar();
  }

  /* ── Modal ── */
  function showModal(el) {
    const component = getAngularComponent(el) || el.tagName.toLowerCase();
    const cssPath = getCssPath(el);
    const snippet = getInnerTextSnippet(el);

    const modal = document.createElement('div');
    modal.id = '__ef-modal__';
    modal.innerHTML = `
      <div class="ef-dialog">
        <h3>Nouveau feedback</h3>
        <div class="ef-meta">
          <div>Composant : <code>${component}</code></div>
          <div>Sélecteur : <code title="${cssPath}">${cssPath}</code></div>
          ${snippet ? `<div>Contenu : <code>${snippet}</code></div>` : ''}
        </div>
        <label for="__ef-comment__">Commentaire</label>
        <textarea id="__ef-comment__" placeholder="Décrivez le problème ou le changement souhaité…"></textarea>
        <div class="ef-actions">
          <button class="ef-cancel" id="__ef-cancel__">Annuler</button>
          <button class="ef-copy" id="__ef-copy__">📋 Copier le feedback</button>
        </div>
      </div>
    `;

    document.getElementById('__ef-cancel__')?.remove();
    document.body.appendChild(modal);

    const textarea = document.getElementById('__ef-comment__');
    const btnCopy  = document.getElementById('__ef-copy__');
    const btnCancel = modal.querySelector('.ef-cancel');

    setTimeout(() => textarea.focus(), 50);

    btnCancel.onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.remove();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) btnCopy.click();
    });

    btnCopy.onclick = () => {
      const comment = textarea.value.trim();
      if (!comment) { textarea.focus(); return; }

      const text = [
        '## Feedback ENPICE',
        '',
        `**Composant** : \`${component}\``,
        `**Sélecteur**  : \`${cssPath}\``,
        snippet ? `**Contenu**    : "${snippet}"` : null,
        `**Page**       : ${location.pathname}`,
        '',
        '**Commentaire** :',
        comment,
      ].filter(l => l !== null).join('\n');

      navigator.clipboard.writeText(text).then(() => {
        modal.remove();
        showToast('✅ Feedback copié — collez-le dans Claude Code !');
      }).catch(() => {
        // Fallback si clipboard API bloquée
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove();
        modal.remove();
        showToast('✅ Feedback copié !');
      });
    };
  }

  /* ── Toast ── */
  function showToast(msg) {
    const t = document.createElement('div');
    t.id = '__ef-toast__'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  /* ── Destroy ── */
  function destroy() {
    if (active) toggleMode();
    toolbar.remove();
    document.getElementById('__ef-style__')?.remove();
    document.getElementById('__ef-modal__')?.remove();
    document.getElementById('__ef-toast__')?.remove();
    delete window.__enpiceFeedback__;
  }

  window.__enpiceFeedback__ = { destroy };
})();
