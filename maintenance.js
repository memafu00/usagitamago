/* ============================================================
   メンテナンス切替（全ページ共通）
   data/site.json の "maintenance": { "enabled": true } にすると
   どのページを開いてもメンテナンス画面を表示します。
   ============================================================ */
(async function(){
  try{
    const res = await fetch('data/site.json', { cache: 'no-store' });
    const site = await res.json();
    const m = site.maintenance;
    if(!m || !m.enabled) return;

    const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const title = esc(m.title || 'メンテナンス中');
    const message = esc(m.message || 'ただいまメンテナンス中です。').replace(/\n/g,'<br>');

    const ov = document.createElement('div');
    ov.className = 'maintenance-screen';
    ov.innerHTML =
      '<div class="maintenance-card">' +
        '<div class="maintenance-deco">☆.｡.:*・°☆.｡.:*・°☆</div>' +
        '<div class="maintenance-icon">🐰💤</div>' +
        '<div class="maintenance-title">' + title + '</div>' +
        '<div class="maintenance-msg">' + message + '</div>' +
        '<div class="maintenance-deco">☆.｡.:*・°☆.｡.:*・°☆</div>' +
      '</div>';
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
  }catch(e){ /* 取得失敗時は通常表示のまま */ }
})();
