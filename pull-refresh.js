/* 上端から下に引っぱると、画面上のすき間からキャラがのぞいて更新する演出。
   スマホはタッチ、PCはマウスのドラッグで動く。*/
(function(){
  var ICON = 'images/site/pull.png';
  var MSG = '';          // 上に出す一言（空なら出さない）
  var THRESHOLD = 70;    // これ以上引いて離すと更新
  var MAX = 230;         // 引ける量の上限（実際は画像の高さに合わせる）
  var RESIST = 0.6;      // 引きの重さ
  function pullCap(){    // のぞく層の高さまでしか引けない（画像が切れないように）
    var h = wrap.offsetHeight;
    return (h && h > 40) ? h : MAX;
  }

  // キャラ層（本体のうしろに置く）。一言＋横長画像。
  var wrap = document.createElement('div');
  wrap.id = 'ptr-wrap';
  wrap.innerHTML =
    (MSG ? '<div id="ptr-msg">'+MSG+'</div>' : '') +
    '<img id="ptr-img" src="'+ICON+'" alt="">';

  var style = document.createElement('style');
  style.textContent =
    // すき間とページ下の地色は本体と同じ水玉にそろえる
    'html{background-color:#fafc9c;'+
      'background-image:radial-gradient(circle, rgba(255,255,255,0.95) 9px, transparent 10px);'+
      'background-size:42px 42px;background-attachment:fixed;}'+
    '.tamago-day{background-color:#fff6e9;'+
      'background-image:'+
        'radial-gradient(ellipse 10px 13px at 22px 24px,#ffc6d8 99%,transparent 100%),'+
        'radial-gradient(ellipse 10px 13px at 66px 62px,#bfe3ff 99%,transparent 100%),'+
        'radial-gradient(ellipse 10px 13px at 66px 20px,#dcc8ff 99%,transparent 100%),'+
        'radial-gradient(ellipse 10px 13px at 22px 64px,#c6f0d4 99%,transparent 100%),'+
        'radial-gradient(ellipse 10px 13px at 44px 44px,#fff1a6 99%,transparent 100%);'+
      'background-size:88px 88px;background-attachment:fixed;}'+
    // 画面いちばん上に固定。本体のうしろ（z-index:-1）
    '#ptr-wrap{position:fixed;left:0;right:0;top:0;z-index:-1;display:none;'+
      'flex-direction:column;align-items:center;pointer-events:none;}'+
    // 一言はキャラより上のレイヤーに重ねる（小さめ・うすめ）
    '#ptr-msg{position:absolute;left:0;right:0;bottom:14px;z-index:2;text-align:center;'+
      'font-family:"Mochiy Pop One","Kaisei Decol",sans-serif;font-size:15px;'+
      'color:#f2afc6;text-shadow:0 1px 0 #fff,0 0 4px #fff;letter-spacing:.06em;}'+
    '.tamago-day #ptr-msg{color:#e6b3c6;}'+
    '#ptr-img{width:100%;max-width:760px;height:auto;display:block;margin-top:-52px;}'+
    // 本体は引きに合わせて下へ（戻すときだけアニメ）
    'body.ptr-snap{transition:transform .34s cubic-bezier(.34,1.4,.64,1);}'+
    // ブラウザ標準のプル更新は止める
    'html,body{overscroll-behavior-y:contain;}';

  function mount(){
    if(document.getElementById('ptr-wrap')) return;
    document.head.appendChild(style);
    document.documentElement.appendChild(wrap);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mount);
  } else { mount(); }

  var startY = 0, pulling = false, dist = 0;
  function atTop(){ return (window.pageYOffset || document.documentElement.scrollTop || 0) <= 0; }
  // 全画面（漫画・動画・webtoon）が開いている間は止める。本体を動かすと固定表示が崩れるため。
  function overlayOpen(){
    return !!document.querySelector('.manga-modal.open, .video-overlay.open, .webtoon-overlay.open');
  }

  function begin(y){
    if(!atTop() || overlayOpen()) return;
    startY = y; pulling = true; dist = 0;
    document.body.classList.remove('ptr-snap');
    document.body.style.willChange = 'transform';
    wrap.style.display = 'flex';
  }
  function move(y){
    if(!pulling) return false;
    var dy = y - startY;
    if(dy <= 0){ pulling = false; settle(0); return false; }
    if(!atTop()){ pulling = false; return false; }
    dist = Math.min(pullCap(), dy * RESIST);
    document.body.style.transform = 'translateY(' + dist + 'px)';
    return true;
  }
  function settle(toDist){
    document.body.classList.add('ptr-snap');
    document.body.style.transform = 'translateY(' + toDist + 'px)';
    if(toDist === 0){
      setTimeout(function(){
        if(!pulling){
          wrap.style.display = 'none';
          document.body.style.willChange = '';
          // transform は必ず空に戻す（残すと固定表示の全画面がずれる）
          document.body.style.transform = '';
          document.body.classList.remove('ptr-snap');
        }
      }, 360);
    }
  }
  function end(){
    if(!pulling) return;
    pulling = false;
    if(dist >= THRESHOLD){
      location.reload();
    } else {
      settle(0);
    }
  }

  // タッチ
  window.addEventListener('touchstart', function(e){
    if(e.touches.length !== 1) return;
    begin(e.touches[0].clientY);
  }, {passive:true});
  window.addEventListener('touchmove', function(e){
    if(!pulling) return;
    var pulled = move(e.touches[0].clientY);
    if(pulled && e.cancelable) e.preventDefault();
  }, {passive:false});
  window.addEventListener('touchend', end, {passive:true});
  window.addEventListener('touchcancel', end, {passive:true});

  // マウス
  var mouseArmed = false;
  function interactive(el){
    return !!(el && el.closest && el.closest('a,button,input,textarea,select,label,.hamburger,[onclick]'));
  }
  window.addEventListener('mousedown', function(e){
    if(e.button !== 0) return;
    var edge = Math.max(260, window.innerHeight * 0.45);
    if(!atTop() || e.clientY > edge) return;
    if(interactive(e.target)) return;
    mouseArmed = true;
    begin(e.clientY);
  });
  window.addEventListener('mousemove', function(e){
    if(!mouseArmed) return;
    if(move(e.clientY)) e.preventDefault();
  });
  window.addEventListener('mouseup', function(){
    if(!mouseArmed) return;
    mouseArmed = false;
    end();
  });
})();
