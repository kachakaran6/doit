/* DoIt DOM audit — injected into the page by capture.spec.ts (page.evaluate). Returns an array of findings.
 * Each finding: { sev: 'ERROR'|'WARN', code, text, selector, msg }.
 * Heuristics, not truth: the agent reviews findings. Untested against your app — fix selectors/assumptions in V0. */
(function domAudit(opts) {
  const o = Object.assign({ minTargetDesktop: 24, minTargetMobile: 40, minFont: 12 }, opts || {});
  const out = [];
  const isMobile = window.innerWidth < 768;
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
  const sel = (el) => { let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id;
    if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.'); return s; };
  const add = (sev, code, el, msg) => out.push({ sev, code, text: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 60), selector: sel(el), msg });

  // 1. horizontal page scroll
  if (document.documentElement.scrollWidth > window.innerWidth + 1)
    out.push({ sev: 'ERROR', code: 'H_SCROLL', text: '', selector: 'html', msg: `page scrolls horizontally (${document.documentElement.scrollWidth} > ${window.innerWidth})` });

  const all = Array.from(document.querySelectorAll('body *')).filter(vis);
  const statusStyles = {};            // text -> Set(background colors)
  const RAW_ENUM = /^[A-Z]{2,}(?:_[A-Z]{2,})+$/;   // IN_PROGRESS, WONT_FIX …
  let primaryButtons = [];

  for (const el of all) {
    const s = getComputedStyle(el);
    const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();

    if (own) {
      // 2. raw enums / underscored constants shown to users
      if (RAW_ENUM.test(own)) add('ERROR', 'RAW_ENUM', el, `raw enum shown to user: "${own}" (use the label map)`);
      // 3. uppercase-transformed labels (shouty)
      if (s.textTransform === 'uppercase' && own.length > 3 && own.length < 60 && !el.closest('[data-allow-uppercase]'))
        add('WARN', 'UPPERCASE_LABEL', el, 'uppercase-transformed label; use sentence case');
      // 4. tiny text
      const fs = parseFloat(s.fontSize); if (fs < o.minFont) add('WARN', 'TINY_TEXT', el, `font-size ${fs}px < ${o.minFont}px`);
      // 5. clipped text without ellipsis
      if (el.scrollWidth > el.clientWidth + 1 && s.overflowX !== 'visible' && s.textOverflow !== 'ellipsis' && el.clientWidth > 0)
        add('WARN', 'CLIPPED_TEXT', el, 'content wider than box without text-overflow: ellipsis');
      // 6. status style consistency: same visible text, different backgrounds (A4)
      if (/^(to ?do|in[ _]progress|in review|done|cancelled|urgent|high|medium|low|critical|major|minor|trivial|new|triaged|resolved)$/i.test(own)) {
        const host = el.closest('[data-badge],span,div') || el; const bg = getComputedStyle(host).backgroundColor + '|' + getComputedStyle(host).color;
        (statusStyles[own.toLowerCase().replace(/_/g, ' ')] ||= new Set()).add(bg);
      }
    }

    // 7. interactive target size + accessible name
    const interactive = el.matches('button, a[href], [role="button"], input:not([type=hidden]), select, textarea, [role="tab"], [role="menuitem"]');
    if (interactive) {
      const r = el.getBoundingClientRect(); const min = isMobile ? o.minTargetMobile : o.minTargetDesktop;
      if ((r.width < min || r.height < min) && el.type !== 'checkbox' && el.type !== 'radio') add('WARN', 'SMALL_TARGET', el, `target ${Math.round(r.width)}×${Math.round(r.height)}px < ${min}px`);
      const name = (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.innerText || el.getAttribute('title') || el.getAttribute('placeholder') || '').trim();
      if (!name && !el.closest('label')) add('ERROR', 'NO_ACCESSIBLE_NAME', el, 'interactive element has no accessible name');
      // primary buttons (filled with accent) — duplicate CTA detection (A6)
      if (el.matches('button, a[href]') && s.backgroundColor !== 'rgba(0, 0, 0, 0)' && /primary/.test(el.className + ' ' + (el.dataset.variant || ''))) primaryButtons.push(el);
    }

    // 8. border-heavy cards: a card-like box with a border that contains ≥3 bordered children (C2)
    if (s.borderTopWidth !== '0px' && s.borderTopStyle !== 'none' && el.children.length > 0) {
      const bordered = Array.from(el.children).filter(c => { const cs = getComputedStyle(c); return cs.borderTopWidth !== '0px' && cs.borderTopStyle !== 'none'; });
      if (bordered.length >= 3 && el.getBoundingClientRect().width > 300) add('WARN', 'BORDER_HEAVY', el, `${bordered.length} bordered children inside a bordered box`);
    }
  }
  for (const [txt, set] of Object.entries(statusStyles))
    if (set.size > 1) out.push({ sev: 'ERROR', code: 'INCONSISTENT_STATUS_STYLE', text: txt, selector: '', msg: `"${txt}" is rendered with ${set.size} different styles on this page` });
  const visiblePrimary = primaryButtons.filter(vis);
  if (visiblePrimary.length > 2)
    out.push({ sev: 'WARN', code: 'MANY_PRIMARY_CTAS', text: visiblePrimary.map(b => b.innerText.trim()).join(' | '), selector: '', msg: `${visiblePrimary.length} primary buttons visible — duplicate create actions?` });
  // 9. brand text typed as plain text ("Dolt" look-alike)
  const t = document.body.innerText; if (/\bDolt\b/.test(t)) out.push({ sev: 'ERROR', code: 'BRAND_TEXT', text: 'Dolt', selector: 'body', msg: 'found "Dolt" (lowercase L) — product name must be the SVG wordmark / correct "DoIt"' });
  return out;
})
