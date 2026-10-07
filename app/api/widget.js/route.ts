export const dynamic = "force-dynamic";

/**
 * GET /api/widget.js — embeddable chat widget.
 *
 * Install on any site with:
 *   <script src="https://YOUR-HOST/api/widget.js" data-title="Help center" async></script>
 *
 * The widget derives its API base from the script's own `src` origin, or from
 * an explicit `data-api="https://YOUR-HOST"` attribute.
 */
export async function GET() {
  // NOTE: the embedded script intentionally uses only single quotes and `+`
  // concatenation — no backticks / ${} so it survives this TS template literal.
  const js = `(function () {
  'use strict';
  var script = document.currentScript;
  var apiAttr = script && script.getAttribute('data-api');
  function originFromSrc(src) {
    try { return new URL(src, window.location.href).origin; } catch (e) { return null; }
  }
  var API = (apiAttr && apiAttr.replace(/\\/$/, '')) ||
            (script && script.src && originFromSrc(script.src)) ||
            window.location.origin;
  var TITLE = (script && script.getAttribute('data-title')) || 'Help center';

  var css = [
    '#fd-bubble{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:50%;',
    'background:#0d9488;color:#fff;border:none;cursor:pointer;z-index:2147483000;',
    'box-shadow:0 6px 20px rgba(0,0,0,.25);font-size:24px;line-height:1}',
    '#fd-panel{position:fixed;right:20px;bottom:88px;width:360px;max-width:calc(100vw - 40px);height:480px;',
    'max-height:calc(100vh - 120px);background:#fff;border:1px solid #e2e8f0;border-radius:14px;z-index:2147483000;',
    'display:none;flex-direction:column;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.22);',
    'color:#0f172a;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}',
    '#fd-panel.open{display:flex}',
    '#fd-head{background:#0f766e;color:#fff;padding:12px 14px;font-weight:600;font-size:15px;display:flex;justify-content:space-between;align-items:center}',
    '#fd-head button{background:none;border:none;color:#fff;font-size:18px;cursor:pointer}',
    '#fd-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;font-size:14px;line-height:1.45}',
    '.fd-m{max-width:85%;padding:8px 12px;border-radius:12px;white-space:pre-wrap;word-break:break-word}',
    '.fd-u{align-self:flex-end;background:#0d9488;color:#fff}',
    '.fd-a{align-self:flex-start;background:#f1f5f9;color:#0f172a}',
    '.fd-cite{font-size:12px;margin-top:6px}',
    '.fd-cite a{color:#0d9488;text-decoration:none}',
    '#fd-form{display:flex;border-top:1px solid #e2e8f0}',
    '#fd-input{flex:1;border:none;padding:12px;font-size:14px;outline:none;background:#fff;color:#0f172a;font-family:inherit}',
    '#fd-input::placeholder{color:#94a3b8}',
    '#fd-send{border:none;background:#0d9488;color:#fff;padding:0 16px;cursor:pointer;font-size:14px}',
    '#fd-send:disabled{opacity:.5;cursor:default}'
  ].join('');

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var bubble = document.createElement('button');
  bubble.id = 'fd-bubble';
  bubble.setAttribute('aria-label', 'Open help chat');
  bubble.textContent = '\\uD83D\\uDCAC';
  document.body.appendChild(bubble);

  var panel = document.createElement('div');
  panel.id = 'fd-panel';
  panel.innerHTML =
    '<div id="fd-head"><span>' + esc(TITLE) + '</span><button id="fd-x" aria-label="Close">\\u00D7</button></div>' +
    '<div id="fd-msgs"></div>' +
    '<form id="fd-form"><input id="fd-input" placeholder="Ask a question..." autocomplete="off" />' +
    '<button id="fd-send" type="submit">Send</button></form>';
  document.body.appendChild(panel);

  var msgs = panel.querySelector('#fd-msgs');
  var form = panel.querySelector('#fd-form');
  var input = panel.querySelector('#fd-input');
  var sendBtn = panel.querySelector('#fd-send');

  function addMsg(cls, html) {
    var d = document.createElement('div');
    d.className = 'fd-m ' + cls;
    d.innerHTML = html;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  function renderAnswer(data) {
    var html = esc(data.answer || 'Sorry, something went wrong.').replace(/\\n/g, '<br>');
    if (data.citations && data.citations.length) {
      html += '<div class="fd-cite">Sources: ' + data.citations.map(function (c) {
        return '<a target="_blank" rel="noopener" href="' + esc(API) + '/docs/' + esc(c.slug) + '">[' + c.index + '] ' + esc(c.title) + '</a>';
      }).join(' &middot; ') + '</div>';
    }
    return html;
  }

  addMsg('fd-a', 'Hi! Ask me anything about the docs — I\\u2019ll answer with sources.');

  function toggle(force) {
    var open = typeof force === 'boolean' ? force : !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    if (open) input.focus();
  }
  bubble.addEventListener('click', function () { toggle(); });
  panel.querySelector('#fd-x').addEventListener('click', function () { toggle(false); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    addMsg('fd-u', esc(q));
    input.value = '';
    sendBtn.disabled = true;
    var thinking = addMsg('fd-a', 'Thinking...');
    fetch(API + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) { thinking.innerHTML = renderAnswer(data); msgs.scrollTop = msgs.scrollHeight; })
      .catch(function () { thinking.textContent = 'Could not reach the help server.'; })
      .finally(function () { sendBtn.disabled = false; });
  });

  window.FreshDocsWidget = { open: function () { toggle(true); }, close: function () { toggle(false); } };
})();`;

  return new Response(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
