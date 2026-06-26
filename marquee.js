/* ============================================================
   マーキー文言の決定（全ページ共通でTOPと同じ表示にする）
   data/site.json の marquee_* と、保存済みカウントから決める。
   ============================================================ */
(function(){
  function getMoonAge(d){
    const k = new Date(2000,0,6);
    return (((d - k)/(1000*60*60*24)) % 29.53 + 29.53) % 29.53;
  }
  // 日付の判定に使う
  function getEggDate(y){
    const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,
          f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
          h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,
          l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
          mo=Math.floor((h+l-7*m+114)/31)-1,
          day=((h+l-7*m+114)%31)+1;
    return new Date(y,mo,day);
  }

  // site とカウントから表示する文言を決める
  window.pickMarqueeText = function(site, count){
    const age = getMoonAge(new Date());
    const isTamago = isTamagoDay();
    const isFull = age>=13 && age<=16;
    if(typeof count !== 'number'){
      count = parseInt(localStorage.getItem('utamago_clock_count')||'0',10) || 0;
    }
    if(isTamago) return site.marquee_tamago;
    if(isFull)   return site.marquee_fullmoon;
    let txt = site.marquee_default;
    if(Array.isArray(site.marquee_count)){
      for(const m of site.marquee_count){ if(count >= m.min) txt = m.text; }
    }
    return txt;
  };

  // 他ページから呼ぶ
  window.applyMarquee = function(site){
    const el = document.getElementById('marqueeText');
    if(el) el.textContent = window.pickMarqueeText(site);
  };

  function isTamagoDay(){
    const q = new URLSearchParams(location.search);
    if(q.get('tamago')==='1'){ try{localStorage.setItem('utamago_tamago_test','1');}catch(e){} return true; }
    if(q.get('tamago')==='0'){ try{localStorage.removeItem('utamago_tamago_test');}catch(e){} return false; }
    try{ if(localStorage.getItem('utamago_tamago_test')==='1') return true; }catch(e){}
    const now = new Date(), egg = getEggDate(now.getFullYear());
    return now.getMonth()===egg.getMonth() && now.getDate()===egg.getDate();
  }
  window.isTamagoDay = isTamagoDay;

  if(isTamagoDay()){
    document.documentElement.classList.add('tamago-day');
    const addEggNav = function(){
      const ul = document.getElementById('navLinks');
      if(!ul || ul.querySelector('.egg-nav')) return;
      const li = document.createElement('li');
      li.className = 'egg-nav';
      const here = /(^|\/)egg\.html(\?|#|$)/.test(location.pathname + location.search);
      li.innerHTML = '<a href="egg.html"'+(here?' class="active"':'')+'>\u2726EGG\u2726</a>';
      ul.appendChild(li);
    };
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', addEggNav);
    } else { addEggNav(); }
  }
})();
