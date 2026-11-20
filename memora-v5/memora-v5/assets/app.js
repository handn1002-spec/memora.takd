window.memoraSaved=function(){try{return JSON.parse(localStorage.getItem('memoraSaved')||'[]')}catch(e){return []}};
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* Mobile menu */
  var menuBtn = $('#menuToggle'), nav = $('#mainNav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.textContent = open ? '✕' : '☰';
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); menuBtn.textContent = '☰'; }
    });
  }

  /* FAQ accordion */
  var faqs = $$('.faq-item');
  faqs.forEach(function (item) {
    var q = $('.faq-question', item), t = $('.faq-toggle', item);
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      faqs.forEach(function (o) { o.classList.remove('open'); $('.faq-toggle', o).textContent = '+'; });
      if (!wasOpen) { item.classList.add('open'); t.textContent = '×'; }
    });
  });

  /* Featured journeys strip arrows */
  var strip = $('#featuredStrip');
  function stepSize() { var c = $('.tour-card', strip); return c ? c.getBoundingClientRect().width + 24 : 360; }
  if (strip) {
    var prev = $('#tourPrev'), next = $('#tourNext');
    if (prev) prev.addEventListener('click', function () { strip.scrollBy({ left: -stepSize(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { strip.scrollBy({ left: stepSize(), behavior: 'smooth' }); });
  }

  /* Journeys page: region filter + search */
  var grid = $('#journeyGrid');
  if (grid) {
    var cards = $$('.tour-card', grid), pills = $$('.filter-pill'), search = $('#journeySearch'), empty = $('#journeyEmpty');
    var region = 'All';
    var apply = function () {
      var q = (search.value || '').trim().toLowerCase(), shown = 0;
      cards.forEach(function (c) {
        var ok = (region === 'All' || (region === 'Saved' ? window.memoraSaved().indexOf(c.getAttribute('data-slug')) > -1 : c.getAttribute('data-region') === region)) &&
                 (!q || c.getAttribute('data-name').indexOf(q) !== -1);
        c.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    };
    pills.forEach(function (p) {
      p.addEventListener('click', function () {
        pills.forEach(function (o) { o.classList.remove('active'); });
        p.classList.add('active'); region = p.getAttribute('data-filter'); apply();
      });
    });
    search.addEventListener('input', apply);
  }

  /* Booking form */
  var form = $('#bookingForm');
  if (form) {
    var params = new URLSearchParams(location.search);
    var pkg = params.get('package'), jr = params.get('journey');
    if (pkg && $('#package')) { $$('#package option').forEach(function (o) { if (o.value.toLowerCase() === pkg.toLowerCase()) $('#package').value = o.value; }); }
    if (jr && $('#journey')) { $$('#journey option').forEach(function (o) { if (o.value === jr) $('#journey').value = jr; }); }

    var msg = $('#message'), count = $('#messageCount'), fb = $('#formFeedback');
    msg.addEventListener('input', function () { count.textContent = msg.value.length + '/500'; });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      fb.className = 'form-feedback';
      var guests = parseInt($('#guests').value, 10);
      if (!(guests >= 2 && guests <= 20)) { fb.classList.add('err'); fb.textContent = 'Please choose between 2 and 20 guests.'; return; }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {};
      $$('input[name],select[name],textarea[name]', form).forEach(function (f) { data[f.name] = f.value; });
      data.submittedAt = new Date().toISOString();
      var list = []; try { list = JSON.parse(safeGet('memoraBookings') || '[]'); } catch (x) {}
      list.push(data); safeSet('memoraBookings', JSON.stringify(list));
      fb.classList.add('ok');
      fb.textContent = 'Thank you, ' + data.name.split(' ')[0] + '! We have your request and will reply within 24 hours.';
      form.reset(); count.textContent = '0/500'; $('#guests').value = 2;
    });
  }

  /* Chat assistant */
  var chat = $('#chatPanel'), launch = $('#chatLaunch'), closeBtn = $('#chatClose'),
      cform = $('#chatForm'), input = $('#chatInput'), body = $('#chatBody');
  if (launch && chat) launch.addEventListener('click', function () { chat.hidden = !chat.hidden; });
  if (closeBtn && chat) closeBtn.addEventListener('click', function () { chat.hidden = true; });
  function addMsg(text, me) {
    var m = document.createElement('div');
    m.className = 'chat-msg' + (me ? ' me' : '');
    m.textContent = text; body.appendChild(m); body.scrollTop = body.scrollHeight;
  }
  if (cform) cform.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim(); if (!v) return;
    addMsg(v, true); input.value = '';
    setTimeout(function () {
      addMsg('Thank you! A MEMORA team member will reply shortly. You can also call 0795 232 448 (08:00 – 20:00).', false);
    }, 600);
  });
})();

(function(){
  'use strict';
  var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var T=window.MEMORA_TOURS||{}, root=document.body.getAttribute('data-root')||'';
  var fmt=function(n){return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.')+'₫'};

  /* header shadow, progress bar, back-to-top */
  var hdr=$('.site-header'),bar=$('#progress'),top=$('#toTop');
  function onScroll(){var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;
    if(hdr)hdr.classList.toggle('scrolled',y>20); if(bar)bar.style.width=(h>0?y/h*100:0)+'%'; if(top)top.classList.toggle('show',y>600);}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  if(top)top.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'})});

  /* reveal on scroll */
  var rv=$$('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}})},{threshold:.12});
    rv.forEach(function(el){io.observe(el)});
  } else rv.forEach(function(el){el.classList.add('in')});

  /* animated counters */
  var cs=$$('[data-count]');
  if('IntersectionObserver' in window && cs.length){
    var co=new IntersectionObserver(function(es){es.forEach(function(x){
      if(!x.isIntersecting)return;co.unobserve(x.target);
      var el=x.target,end=+el.getAttribute('data-count'),suf=el.getAttribute('data-suffix')||'',comma=el.getAttribute('data-comma'),t0=performance.now();
      (function tick(t){var k=Math.min(1,(t-t0)/1400),v=Math.round(end*(1-Math.pow(1-k,3)));
        el.textContent=(comma?v.toLocaleString('en-US'):v)+suf; if(k<1)requestAnimationFrame(tick);})(t0);
    })},{threshold:.6});cs.forEach(function(el){co.observe(el)});
  }

  /* currency toggle */
  var ct=$('#currencyToggle');
  if(ct)ct.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
    $$('button',ct).forEach(function(o){o.classList.toggle('active',o===b)});
    var usd=b.getAttribute('data-cur')==='USD';
    $$('[data-vnd]').forEach(function(el){el.textContent=el.getAttribute(usd?'data-usd':'data-vnd')});});

  /* quick view modal */
  var modal=$('#tourModal');
  function openTour(id){var t=T[id];if(!t||!modal)return;
    $('#mImg').src=root+'assets/img/'+t.img;$('#mImg').alt=t.name;$('#mScent').textContent=t.scent;
    $('#mPlace').textContent=t.region+' · '+t.place;$('#mTitle').textContent=t.name;
    $('#mRating').innerHTML='★ '+t.rating+' <small>('+t.n+' reviews)</small>';$('#mDesc').textContent=t.desc;
    $('#mMeta').innerHTML='<span>◷ &nbsp;'+t.dur+'</span><span>♧ &nbsp;'+t.guests+'</span>';
    $('#mPrice').innerHTML=fmt(t.price)+'<em class="per"> / guest</em>';$('#mBook').href=root+'contact/index.html?journey='+id;
    modal.hidden=false;document.body.style.overflow='hidden';}
  function closeTour(){if(modal){modal.hidden=true;document.body.style.overflow='';}}
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-quickview]');
    if(a&&modal){e.preventDefault();openTour(a.getAttribute('data-quickview'));return;}
    if(e.target.closest('[data-close]'))closeTour();});
  addEventListener('keydown',function(e){if(e.key==='Escape')closeTour()});

  /* journeys: sorting + result count */
  var grid=$('#journeyGrid'),sort=$('#journeySort');
  if(grid&&sort){
    var orig=$$('.tour-card',grid);
    sort.addEventListener('change',function(){
      var v=sort.value,arr=orig.slice();
      if(v==='price-asc')arr.sort(function(a,b){return a.dataset.price-b.dataset.price});
      if(v==='price-desc')arr.sort(function(a,b){return b.dataset.price-a.dataset.price});
      if(v==='rating')arr.sort(function(a,b){return b.dataset.rating-a.dataset.rating});
      arr.forEach(function(c){grid.appendChild(c)});
    });
  }

  /* booking: live estimate, min date, success card */
  var form=$('#bookingForm');
  if(form){
    var P={Essential:2190000,Memory:2790000,Creative:3190000,Premium:3790000};
    var dep=$('#departure');if(dep){dep.min=new Date().toISOString().slice(0,10);}
    function est(){
      var j=$('#journey').value,pk=$('#package').value,g=Math.max(0,parseInt($('#guests').value,10)||0);
      var per=P[pk]||(T[j]&&T[j].price)||0;
      if(!per||!j){$('#estTotal').textContent='—';$('#estNote').textContent='Choose a journey to see an estimate. Final price is confirmed by our team.';return;}
      $('#estTotal').textContent=fmt(per*g);
      $('#estNote').textContent=g+' guest'+(g>1?'s':'')+' × '+fmt(per)+' ('+(P[pk]?pk+' package':'journey base price')+'). Final price is confirmed by our team.';
    }
    ['journey','package','guests'].forEach(function(id){$('#'+id).addEventListener('input',est)});est();
    form.addEventListener('submit',function(){
      setTimeout(function(){
        var fb=$('#formFeedback');if(!fb||!fb.classList.contains('ok'))return;
        var panel=$('.form-panel'),code='MEM-'+Math.random().toString(36).slice(2,8).toUpperCase();
        panel.innerHTML='<div class="success-card"><div class="tick">✓</div><h2>Request received</h2><p>Thank you! Our team will reply within 24 hours to confirm dates and recommend the right package. No payment is needed yet.</p><code>Ref: '+code+'</code><br><br><a class="btn btn-outline" href="'+root+'index.html">Back to home</a></div>';
        panel.scrollIntoView({behavior:'smooth',block:'center'});
      },30);
    });
  }

  /* smarter chat */
  var cb=$('#chatBody'),ci=$('#chatInput'),cf=$('#chatForm');
  if(cb&&cf){
    var chips=document.createElement('div');chips.className='chat-chips';
    ['Prices','Scent workshop','How long?','Book a tour'].forEach(function(q){var b=document.createElement('button');b.type='button';b.textContent=q;b.addEventListener('click',function(){ci.value=q;cf.requestSubmit?cf.requestSubmit():cf.dispatchEvent(new Event('submit',{cancelable:true}));});chips.appendChild(b);});
    cf.parentNode.insertBefore(chips,cf);
    var R=[[/price|cost|gi[aá]|bao nhi/i,'Journeys start from 2.190.000₫ per guest. Packages: Essential 2.190.000₫, Memory 2.790.000₫, Creative 3.190.000₫, Premium 3.790.000₫.'],
      [/scent|perfume|n[uư][oơ]́?c hoa|workshop/i,'On every journey you blend your own scent with a local perfumer. We keep your formula on file so you can reorder it anytime.'],
      [/long|day|how many|bao l[aâ]u|ng[aà]y/i,'Journeys run from 1 day (Ninh Binh) up to 3 days / 2 nights (Sapa, Phu Quoc). Your film and scent arrive in 5–7 days.'],
      [/book|[dđ][aặ]t|reserve/i,'You can send a request on our Contact page — no payment needed. We reply within 24 hours.']];
    cf.addEventListener('submit',function(){
      var v=(ci.value||'').trim();if(!v)return;
      var hit=R.filter(function(r){return r[0].test(v)})[0];
      if(hit){setTimeout(function(){var m=cb.lastElementChild;if(m&&!m.classList.contains('me')){m.textContent=hit[1];}},620);}
    },true);
  }
})();

(function(){
  'use strict';
  var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var T=window.MEMORA_TOURS||{},root=document.body.getAttribute('data-root')||'';
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function setSaved(a){try{localStorage.setItem('memoraSaved',JSON.stringify(a))}catch(e){}}

  /* preloader */
  var pl=$('#preloader');
  if(pl&&document.documentElement.classList.contains('pl')){
    var hide=function(){pl.classList.add('done');try{sessionStorage.setItem('memoraSeen','1')}catch(e){}};
    setTimeout(hide,1500);
  }

  /* page transitions */
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href]');
    if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank'||a.hasAttribute('data-quickview'))return;
    var h=a.getAttribute('href');
    if(!h||h.charAt(0)==='#'||/^(mailto|tel|https?:)/.test(h))return;
    var u=new URL(a.href,location.href);
    if(u.pathname===location.pathname&&u.search===location.search)return;
    e.preventDefault();document.body.classList.add('leaving');
    setTimeout(function(){location.href=a.href},230);
  });
  addEventListener('pageshow',function(){document.body.classList.remove('leaving')});

  /* hero slider */
  var slides=$$('.hero-slide'),dots=$('#heroDots'),cap=$('#heroCap');
  if(slides.length){
    var cur=0,timer;
    slides.forEach(function(_,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Slide '+(i+1));b.addEventListener('click',function(){go(i,true)});dots.appendChild(b)});
    function go(i,manual){
      cur=(i+slides.length)%slides.length;
      slides.forEach(function(s,k){s.classList.toggle('on',k===cur)});
      $$('button',dots).forEach(function(b,k){b.classList.remove('on');void b.offsetWidth;b.classList.toggle('on',k===cur)});
      cap.style.opacity=0;setTimeout(function(){cap.textContent=slides[cur].getAttribute('data-cap');cap.style.opacity=1},250);
      clearInterval(timer);timer=setInterval(function(){go(cur+1)},6000);
    }
    go(0);
  }

  /* hearts / wishlist */
  function renderSaved(){
    var a=window.memoraSaved(),n=$('#wishCount');
    if(n){n.textContent=a.length;n.hidden=!a.length;}
    $$('[data-heart]').forEach(function(h){var on=a.indexOf(h.getAttribute('data-heart'))>-1;h.classList.toggle('on',on);h.textContent=on?'♥':'♡'});
    var ms=$('#mSave'),mb=$('#mBook');
    if(ms&&mb&&ms.dataset.id){var on2=a.indexOf(ms.dataset.id)>-1;ms.classList.toggle('on',on2);ms.textContent=on2?'♥ Saved':'♡ Save'}
  }
  function toggleSaved(id){
    var a=window.memoraSaved(),i=a.indexOf(id);
    if(i>-1)a.splice(i,1);else a.push(id);
    setSaved(a);renderSaved();
    var se=$('#journeySearch');if(se)se.dispatchEvent(new Event('input'));
  }
  document.addEventListener('click',function(e){
    var h=e.target.closest('[data-heart]');
    if(h){e.preventDefault();e.stopPropagation();toggleSaved(h.getAttribute('data-heart'));}
    var s=e.target.closest('#mSave');if(s&&s.dataset.id)toggleSaved(s.dataset.id);
  });
  /* journeys: add "Saved" pill */
  var pillsBox=$('#journeyFilters');
  if(pillsBox){
    var sp=document.createElement('button');sp.className='filter-pill';sp.setAttribute('data-filter','Saved');sp.textContent='♥ Saved';
    pillsBox.appendChild(sp);
    sp.addEventListener('click',function(){}); // handled by existing pill listener? (added after) -> wire manually
    sp.addEventListener('click',function(){$$('.filter-pill').forEach(function(o){o.classList.toggle('active',o===sp)})});
    // existing code bound listeners before this pill existed, so re-run filtering by mimicking
    sp.addEventListener('click',function(){
      var saved=window.memoraSaved(),shown=0;
      $$('#journeyGrid .tour-card').forEach(function(c){var ok=saved.indexOf(c.getAttribute('data-slug'))>-1;c.style.display=ok?'':'none';if(ok)shown++});
      var em=$('#journeyEmpty');if(em){em.hidden=shown!==0;em.textContent='You have not saved any journeys yet. Tap the ♡ on a card to keep it here.'}
    });
    $$('.filter-pill').forEach(function(o){if(o!==sp)o.addEventListener('click',function(){sp.classList.remove('active');var em=$('#journeyEmpty');if(em)em.textContent='No journeys match your search yet. Try another destination.'})});
    if(/[?&]saved=1/.test(location.search))sp.click();
  }

  /* quick view extras: season + save id (wrap openTour via MutationObserver on title) */
  var modal=$('#tourModal');
  if(modal){
    new MutationObserver(function(){
      if(modal.hidden)return;
      var id=($('#mBook').getAttribute('href')||'').split('journey=')[1];
      var t=T[id];if(!t)return;
      $('#mSave').dataset.id=id;renderSaved();
      var M=['J','F','M','A','M','J','J','A','S','O','N','D'],box=$('#mMonths');
      box.innerHTML=M.map(function(m,i){return '<span class="'+(t.best.indexOf(i+1)>-1?'good':'')+'">'+m+'</span>'}).join('');
    }).observe(modal,{attributes:true,attributeFilter:['hidden']});
  }
  renderSaved();

  /* command palette */
  var ck=$('#cmdk'),ci=$('#cmdkInput'),cl=$('#cmdkList');
  if(ck){
    var items=[
      {t:'Home',s:'Page',ic:'⌂',go:root+'index.html'},{t:'Journeys',s:'Page',ic:'✣',go:root+'journeys/index.html'},
      {t:'About MEMORA',s:'Page',ic:'ℹ',go:root+'about/index.html'},{t:'Book a tour / Contact',s:'Page',ic:'✉',go:root+'contact/index.html'},
      {t:'Pricing & packages',s:'Section',ic:'₫',go:root+'index.html#pricing'},{t:'Scent Lab — build your scent',s:'Section',ic:'⚗',go:root+'index.html#scent-lab'},
      {t:'Frequently asked questions',s:'Section',ic:'?',go:root+'index.html#how-we-work'},{t:'Saved journeys',s:'Page',ic:'♥',go:root+'journeys/index.html?saved=1'}
    ];
    Object.keys(T).forEach(function(k){items.push({t:T[k].name,s:T[k].scent,ic:'◈',q:k,key:T[k].name+' '+T[k].place+' '+T[k].scent+' '+T[k].region})});
    var sel=0,list=[];
    function draw(){
      var q=ci.value.trim().toLowerCase();
      list=items.filter(function(i){return !q||(i.t+' '+(i.key||'')+' '+i.s).toLowerCase().indexOf(q)>-1});
      sel=Math.min(sel,Math.max(0,list.length-1));
      cl.innerHTML=list.length?list.map(function(i,k){return '<li data-k="'+k+'" class="'+(k===sel?'sel':'')+'"><span class="ic">'+i.ic+'</span>'+i.t+'<small>'+i.s+'</small></li>'}).join(''):'<li>No results</li>';
    }
    function run(i){if(!i)return;close();if(i.q){var cardBtn=document.querySelector('[data-quickview="'+i.q+'"]');if(cardBtn){cardBtn.click();}else{location.href=root+'contact/index.html?journey='+i.q}}else location.href=i.go}
    function open(){ck.hidden=false;ci.value='';sel=0;draw();setTimeout(function(){ci.focus()},30);document.body.style.overflow='hidden'}
    function close(){ck.hidden=true;document.body.style.overflow=''}
    var sb=$('#searchBtn');if(sb)sb.addEventListener('click',open);
    ci.addEventListener('input',function(){sel=0;draw()});
    cl.addEventListener('click',function(e){var li=e.target.closest('li[data-k]');if(li)run(list[+li.dataset.k])});
    ck.addEventListener('click',function(e){if(e.target.closest('[data-cmdk-close]'))close()});
    addEventListener('keydown',function(e){
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();ck.hidden?open():close();return}
      if(ck.hidden)return;
      if(e.key==='Escape')close();
      if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(list.length-1,sel+1);draw()}
      if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(0,sel-1);draw()}
      if(e.key==='Enter'){e.preventDefault();run(list[sel])}
    });
  }

  /* gallery lightbox */
  var lb=$('#lightbox'),gi=$$('[data-lightbox]'),li=0;
  if(lb&&gi.length){
    function show(i){li=(i+gi.length)%gi.length;$('#lbImg').src=gi[li].getAttribute('data-lightbox');$('#lbCap').textContent=gi[li].getAttribute('data-cap');}
    gi.forEach(function(g,i){g.addEventListener('click',function(){show(i);lb.hidden=false;document.body.style.overflow='hidden'})});
    var closeLb=function(){lb.hidden=true;document.body.style.overflow=''};
    lb.addEventListener('click',function(e){if(e.target===lb||e.target.closest('[data-lb-close]'))closeLb()});
    $('#lbPrev').addEventListener('click',function(){show(li-1)});$('#lbNext').addEventListener('click',function(){show(li+1)});
    addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')closeLb();if(e.key==='ArrowLeft')show(li-1);if(e.key==='ArrowRight')show(li+1)});
  }

  /* scent lab */
  var lab=$('#scent-lab');
  if(lab){
    var pick={top:null,heart:null,base:null};
    var ys={top:{y:320,h:0},heart:{y:320,h:0},base:{y:320,h:0}};
    function paint(){
      var n=['top','heart','base'].filter(function(k){return pick[k]}).length,H=210;
      // stack from bottom: base, heart, top (equal thirds of the filled liquid)
      var total=H*(0.35+0.2*n),per=total/Math.max(n,1),y=320;
      ['base','heart','top'].forEach(function(k){
        var el=$('#ly'+k.charAt(0).toUpperCase()+k.slice(1));
        if(pick[k]){y-=per;el.setAttribute('y',y);el.setAttribute('height',per+1);el.setAttribute('fill',pick[k].color)}
        else{el.setAttribute('height',0);el.setAttribute('y',320)}
      });
      var nm=$('#labName').value.trim();
      $('#svgName').textContent=nm||'Your scent';
      var names=['top','heart','base'].map(function(k){return pick[k]?pick[k].name:'…'});
      $('#svgNotes').textContent=names.join(' · ').toLowerCase();
      if(n<3){$('#labTour').textContent='Pick three notes to begin';$('#labFormula').textContent=n?names.join(' · '):'Your formula will appear here.';$('#labBook').hidden=true;return}
      var score={};['top','heart','base'].forEach(function(k){pick[k].tags.split(',').forEach(function(t){score[t]=(score[t]||0)+(k==='heart'?2:1)})});
      var best=Object.keys(score).sort(function(a,b){return score[b]-score[a]})[0];
      $('#labTour').textContent=T[best].name+' · '+T[best].scent;
      $('#labFormula').textContent=(nm?'“'+nm+'” — ':'')+names.join(' · ');
      var b=$('#labBook');b.hidden=false;b.href=root+'contact/index.html?journey='+best;
    }
    lab.addEventListener('click',function(e){
      var b=e.target.closest('.note');if(!b)return;
      var L=b.dataset.layer;
      $$('.note[data-layer="'+L+'"]',lab).forEach(function(o){o.classList.toggle('on',o===b)});
      pick[L]={name:b.dataset.name,color:b.dataset.color,tags:b.dataset.tags};paint();
    });
    $('#labName').addEventListener('input',paint);
  }

  /* tilt, magnetic, parallax, cursor */
  if(fine&&!reduce){
    document.addEventListener('mousemove',function(e){
      var c=e.target.closest&&e.target.closest('.tour-card');
      $$('.tour-card').forEach(function(x){if(x!==c){x.style.setProperty('--rx','0deg');x.style.setProperty('--ry','0deg')}});
      if(c){var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
        c.style.setProperty('--ry',(px*6).toFixed(2)+'deg');c.style.setProperty('--rx',(-py*6).toFixed(2)+'deg')}
      var m=e.target.closest&&e.target.closest('.btn');
      $$('.btn').forEach(function(x){if(x!==m){x.style.setProperty('--mx','0px');x.style.setProperty('--my','0px')}});
      if(m){var q=m.getBoundingClientRect();m.style.setProperty('--mx',((e.clientX-q.left-q.width/2)*.18).toFixed(1)+'px');m.style.setProperty('--my',((e.clientY-q.top-q.height/2)*.28).toFixed(1)+'px')}
    });
    var cu=$('#cursor');
    if(cu){
      var cx=0,cy=0,tx=0,ty=0;
      addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;cu.classList.add('on');
        cu.classList.toggle('big',!!e.target.closest('a,button,.tour-card,.g-item,.note,select,input,textarea'))});
      document.addEventListener('mouseleave',function(){cu.classList.remove('on')});
      (function loop(){cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;cu.style.transform='translate('+cx+'px,'+cy+'px)';requestAnimationFrame(loop)})();
    }
    var par=$$('[data-parallax]');
    function pz(){par.forEach(function(el){var r=el.parentElement.getBoundingClientRect(),k=(r.top+r.height/2-innerHeight/2)/innerHeight;el.style.setProperty('--py',(-k*40).toFixed(1)+'px')})}
    if(par.length){addEventListener('scroll',pz,{passive:true});pz()}
  }

  /* newsletter */
  var nf=$('#newsForm');
  if(nf)nf.addEventListener('submit',function(e){e.preventDefault();var v=$('input',nf).value.trim();
    var l=[];try{l=JSON.parse(localStorage.getItem('memoraNews')||'[]')}catch(x){}l.push(v);try{localStorage.setItem('memoraNews',JSON.stringify(l))}catch(x){}
    $('#newsMsg').textContent='Thank you — you are on the list. ✣';nf.reset();});

  /* booking wizard */
  var form=$('#bookingForm');
  if(form&&$('#wizNext')){
    var step=1,panes=$$('.wiz-pane',form),lis=$$('#wizSteps li');
    var back=$('#wizBack'),next=$('#wizNext'),send=$('#wizSend');
    function show(n){
      step=n;panes.forEach(function(p){p.classList.toggle('on',+p.dataset.step===n)});
      lis.forEach(function(l,i){l.classList.toggle('on',i+1===n);l.classList.toggle('done',i+1<n)});
      back.hidden=n===1;next.hidden=n===3;send.hidden=n!==3;
      if(n===3)review();
      var top=form.getBoundingClientRect().top+scrollY-110;scrollTo({top:top,behavior:'smooth'});
    }
    function valid(n){
      var ok=true;$$('.wiz-pane[data-step="'+n+'"] input,.wiz-pane[data-step="'+n+'"] select',form).forEach(function(f){
        f.classList.remove('bad');if(!f.checkValidity()){ok=false;f.classList.add('bad');if(ok===false&&!valid.first){valid.first=f}}});
      if(!ok&&valid.first){valid.first.reportValidity();valid.first=null}
      return ok;
    }
    function review(){
      var jr=$('#journey'),pk=$('#package');
      var rows=[['Journey',jr.options[jr.selectedIndex].text],['Package',pk.value],['Guests',$('#guests').value],['Departure',$('#departure').value||'Flexible'],['Name',$('#fullName').value],['Email',$('#email').value],['Phone',$('#phone').value]];
      $('#review').innerHTML=rows.map(function(r){return '<div><span>'+r[0]+'</span><b>'+r[1].replace(/</g,'&lt;')+'</b></div>'}).join('');
      $('#journey').dispatchEvent(new Event('input'));
    }
    next.addEventListener('click',function(){if(valid(step))show(step+1)});
    back.addEventListener('click',function(){show(step-1)});
    form.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.tagName!=='TEXTAREA'&&step<3){e.preventDefault();next.click()}});
  }
})();
