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

  // 10. identity placeholders (user must see their real name/email)
  const bodyText = document.body.innerText;
  if (/\bActive User\b/.test(bodyText)) out.push({ sev: 'ERROR', code: 'PLACEHOLDER_IDENTITY', text: 'Active User', selector: 'body', msg: 'placeholder user name shown; load the real name from /me' });
  const side = document.querySelector('aside, nav[aria-label*="ide" i], [data-sidebar]');
  if (side) { const foot = Array.from(side.querySelectorAll('*')).filter(vis).filter(e => e.getBoundingClientRect().top > window.innerHeight - 140);
    const ft = foot.map(e => e.innerText || '').join(' ').trim();
    if (/^Account\b/.test(ft) && !/@/.test(ft)) out.push({ sev: 'ERROR', code: 'PLACEHOLDER_IDENTITY', text: ft.slice(0, 40), selector: 'sidebar footer', msg: 'sidebar footer shows generic "Account" instead of real name + email' }); }
  // 11. layout: symmetric gutters + dead space inside <main>
  const main = document.querySelector('main, [role="main"]');
  if (main && vis(main)) {
    const mr = main.getBoundingClientRect();
    const rects = Array.from(main.querySelectorAll('*')).filter(vis).map(e => e.getBoundingClientRect()).filter(r => r.width > 60 && r.height > 12);
    if (rects.length) {
      const L = Math.min(...rects.map(r => r.left)), R = Math.max(...rects.map(r => r.right));
      const lg = Math.round(L - mr.left), rg = Math.round(mr.right - R), cw = Math.round(R - L);
      out.push({ sev: 'INFO', code: 'LAYOUT_METRICS', text: '', selector: 'main', msg: JSON.stringify({ viewport: window.innerWidth, mainW: Math.round(mr.width), contentW: cw, leftGutter: lg, rightGutter: rg }) });
      if (Math.abs(lg - rg) > 24 && cw < mr.width * 0.92) out.push({ sev: 'ERROR', code: 'GUTTER_ASYMMETRY', text: '', selector: 'main', msg: `content gutters differ: left ${lg}px vs right ${rg}px (center the container or fill the width)` });
      if (window.innerWidth >= 1280 && (lg > 96 || rg > 96) && Math.abs(lg - rg) <= 24) out.push({ sev: 'WARN', code: 'WIDE_GUTTERS', text: '', selector: 'main', msg: `gutters ${lg}/${rg}px are large; content is only ${cw}px of ${Math.round(mr.width)}px` });
      if (lg < 16 || rg < 16) out.push({ sev: 'WARN', code: 'TIGHT_GUTTER', text: '', selector: 'main', msg: `gutter ${lg}/${rg}px < 16px` });
    }
  }
  // 12. nested horizontal padding stacks (layout + page + card wrappers)
  let el = main && main.firstElementChild, depth = 0, padSum = 0;
  while (el && depth < 4) { const cs = getComputedStyle(el); padSum += parseFloat(cs.paddingLeft) || 0; el = el.children.length === 1 ? el.firstElementChild : null; depth++; }
  if (padSum > 64) out.push({ sev: 'WARN', code: 'NESTED_PADDING', text: '', selector: 'main > …', msg: `stacked wrapper padding totals ${Math.round(padSum)}px on the left (use one PageContainer)` });
  return out;
})
