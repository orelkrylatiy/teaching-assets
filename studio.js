/* Teaching Assets photo-first extension. Compatible with existing static HTML lessons. */
(() => {
  'use strict';
  const root = document.body.dataset.root || '';
  const lessons = window.LESSONS || [];
  const lesson = lessons.find(l => l.id === document.body.dataset.id);
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const PHOTO_IDS = {
    'hello-english':['photo-1524504388940-b1c1722653e1','photo-1517841905240-472988babdf9','photo-1534528741775-53994a69daeb','photo-1544005313-94ddf0286df2','photo-1529156069898-49953e39b3ac','photo-1527980965255-d3b416303d12'],
    'picture-me':['photo-1514888286974-6c03e2ca1dba','photo-1552053831-71594a27632d','photo-1512820790803-83ca734da794','photo-1511707171634-5f897ff02aa9','photo-1509042239860-f550ce710b93','photo-1493225457124-a3eb161ffa5f'],
    'at-the-cafe':['photo-1442512595331-e89e73853f31','photo-1554118811-1e0d58224f24','photo-1501339847302-ac426a4a7cbb','photo-1495474472287-4d71bcdd2085','photo-1466978913421-dad2ebd01d17','photo-1517248135467-4c7edcad34c4'],
    'my-home':['photo-1600607687939-ce8a6c25118c','photo-1600566752355-35792bedcfea','photo-1600585154340-be6161a56a0c','photo-1600607687920-4e2a09cf159d','photo-1560448204-e02f11c3d0e2','photo-1484154218962-a197022b5858'],
    'around-the-city':['photo-1519501025264-65ba15a82390','photo-1480714378408-67cf0d13bc1b','photo-1477959858617-67f85cf4f1df','photo-1520262494112-9fe481d36ec3','photo-1500530855697-b586d89ba3ee','photo-1494526585095-c41746248156'],
    'travel-transport':['photo-1436491865332-7a61a109cc05','photo-1488085061387-422e29b40080','photo-1473448912268-2022ce9509d8','photo-1464037866556-6812c9d1c72e','photo-1501785888041-af3ef285b470','photo-1540339832862-474599807836'],
    'weekend-plans':['photo-1470770841072-f978cf4d019e','photo-1518837695005-2083093ee35b','photo-1500534623283-312aade485b7','photo-1500534314209-a25ddb2bd429','photo-1530549387789-4c1017266635','photo-1519681393784-d120267933ba'],
    'work-life-balance':['photo-1497366754035-f200968a6e72','photo-1521737711867-e3b97375f902','photo-1499951360447-b19be8fe80f5','photo-1497215728101-856f4ea42174','photo-1516321318423-f06f85e504b3','photo-1522071820081-009f0129c71c'],
    'stories-that-changed-me':['photo-1470225620780-dba8ba36b745','photo-1519681393784-d120267933ba','photo-1451187580459-43490279c0fa','photo-1500534623283-312aade485b7','photo-1529156069898-49953e39b3ac','photo-1464822759023-fed622ff2c3b'],
    'problem-solving':['photo-1556761175-b413da4baf72','photo-1522071820081-009f0129c71c','photo-1504384308090-c894fdcc538d','photo-1497366754035-f200968a6e72','photo-1454165804606-c3d57bc86b40','photo-1486406146926-c627a92ad1ab'],
    'digital-habits':['photo-1516321318423-f06f85e504b3','photo-1519389950473-47ba0277781c','photo-1531297484001-80022131f5a1','photo-1523275335684-37898b6baf30','photo-1512941937669-90a1b58e7e9d','photo-1460925895917-afdab827c52f'],
    'future-of-work':['photo-1485827404703-89b55fcc595e','photo-1497366754035-f200968a6e72','photo-1531482615713-2afd69097998','photo-1522071820081-009f0129c71c','photo-1516321318423-f06f85e504b3','photo-1504384308090-c894fdcc538d'],
    'sustainable-choices':['photo-1542601906990-b4d3fb778b09','photo-1441974231531-c6227db76b6e','photo-1500534623283-312aade485b7','photo-1470071459604-3b5ec3a7fe05','photo-1451187580459-43490279c0fa','photo-1525498128493-380d1990a112'],
    'ai-everyday':['photo-1677442136019-21780ecad995','photo-1485827404703-89b55fcc595e','photo-1518770660439-4636190af475','photo-1526379095098-d400fd0bf935','photo-1635070041078-e363dbe005cb','photo-1555949963-ff9fe0c870eb']
  };
  const daily = ['wake-up','get-dressed','have-breakfast','brush-my-teeth','go-to-work','study','have-lunch','exercise','cook-dinner','relax','read-a-book','go-to-bed'];
  const dailySlides = ['cover','vocabulary','speaking','worksheet','photo-story','vocabulary-alternative'];
  const own = l => l && l.id === 'daily-routines';
  const photo = (l,i,w=1000) => own(l)
    ? root + 'assets/photos/daily-routines/' + daily[((i%daily.length)+daily.length)%daily.length] + '.webp'
    : 'https://images.unsplash.com/' + ((PHOTO_IDS[l.id]||['photo-1441974231531-c6227db76b6e'])[i % (PHOTO_IDS[l.id]||[]).length]) + '?auto=format&fit=crop&w='+w+'&q=82';
  const image = (src,alt,klass='') => `<img class="${klass}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`;
  let visual = 'photos', selected = 0, revealed = false, reading = false;
  try { visual = localStorage.getItem('ta:visual-mode') || 'photos'; } catch (_) {}
  function coverCatalog(){
    $$('.lesson-card').forEach(card => {
      const l = lessons.find(x => (card.getAttribute('href')||'').includes('/'+x.id+'/'));
      if(!l) return;
      const c = card.querySelector('.lesson-cover'); if(!c) return;
      c.insertAdjacentHTML('beforeend', image(photo(l,0),l.title + ' photo cover','studio-cover'));
      c.querySelector('.studio-cover')?.addEventListener('error',e => e.target.remove(),{once:true});
    });
    const hero = $('.hero-art'), dailyLesson = lessons.find(x=>x.id==='daily-routines');
    if(hero && dailyLesson) hero.insertAdjacentHTML('beforeend',image(root+'assets/slides/daily-routines/cover.webp','Daily Routines photographic lesson cover','studio-hero'));
  }
  function tab(id,label){
    $('.tabs')?.insertAdjacentHTML('beforeend',`<button class="tab" data-tab="${id}" role="tab" aria-selected="false">${label}</button>`);
    const sidebar = $('.sidebar');
    if(sidebar){const a=document.createElement('a');a.href='#'+id;a.className='side-link';a.dataset.tab=id;a.textContent=label;sidebar.insertBefore(a,sidebar.querySelector('.sidebar-tip'));}
  }
  function makeGallery(){
    const count=own(lesson)?12:6;
    const cards=Array.from({length:count},(_,i)=>`<button class="photo-scene-card" data-studio="choose" data-index="${i}">${image(photo(lesson,i,700),'Photo '+(i+1))}<span>${own(lesson)?esc(lesson.words[i].en):'Scene '+(i+1)}</span></button>`).join('');
    return `<div id="studio" class="tab-panel" hidden><div class="studio-heading"><div class="eyebrow">VISUAL TEACHING LAB</div><h2>Photo studio<span style="color:#6e967a">.</span></h2><p>Explore images, tell stories and ask students to describe real situations. Choose photographs or classic emoji-style cards.</p></div><div class="studio-top-actions"><button class="btn primary" data-studio="photos">◫ Live photos</button><button class="btn" data-studio="emoji">☺ Emoji cards</button><button class="btn" data-studio="reveal">Aa Reveal word</button></div><div class="studio-viewer"><div class="studio-viewer-frame" id="studio-viewer-frame"></div><div class="studio-viewer-caption"><div><small>PHOTO <span id="studio-current">01</span> / ${count}</small><h3 id="studio-viewer-title"></h3><p id="studio-viewer-prompt"></p></div><div class="button-row"><button class="btn" data-studio="prev">←</button><button class="btn primary" data-studio="next">Next →</button></div></div></div><div class="studio-gallery">${cards}</div><p class="studio-caption">${own(lesson)?'12 original AI-generated photos permanently stored in the repository.':'Context photos from Unsplash are used as teaching references. They do not directly illustrate each vocabulary word and are not offered for bulk resale or redistribution.'}</p><div class="studio-three-tasks"><article><b>01 · Observe</b><p>Who is there? What objects do you see? What is the mood?</p></article><article><b>02 · Explain</b><p>What happened before this moment? What happens next?</p></article><article><b>03 · Create</b><p>Make your own story with three pictures. Ask a partner two questions.</p></article></div>${own(lesson)?`<section class="studio-resource-area"><h3>Ready-made photo slides</h3><p>Original designed slides and an A4 worksheet for printing.</p><div class="studio-slide-gallery">${dailySlides.map(name=>`<a target="_blank" href="${root}assets/slides/daily-routines/${name}.webp">${image(root+'assets/slides/daily-routines/'+name+'.webp',name)}<span>${name.replace(/-/g,' ')}</span></a>`).join('')}</div><div class="button-row"><a class="btn primary" download href="${root}assets/worksheets/daily-routines-worksheet.pdf">↓ Download printable worksheet PDF</a></div></section>`:''}</div>`;
  }
  function makeListening(){
    const url='https://learnenglish.britishcouncil.org/free-resources/listening/'+(lesson.level==='A0'?'a1':lesson.level.toLowerCase());
    return `<div id="listening" class="tab-panel" hidden><div class="studio-heading"><div class="eyebrow">ENGLISH LISTENING</div><h2>Listening lab<span style="color:#6e967a">.</span></h2><p>Listen to an original short story using your browser voice, then answer comprehension questions. No copyrighted audio is copied.</p></div><div class="studio-listening-grid"><div class="studio-listening-player"><div class="studio-audio-symbol">♫</div><div class="eyebrow">SHORT STORY · ${esc(lesson.level)}</div><h3>${esc(lesson.title)}</h3><p>Listen twice. First understand the main idea, then focus on details.</p><div class="button-row"><button class="btn primary" data-studio="play" id="studio-play">▶ Play</button><button class="btn" data-studio="pause">Ⅱ Pause / resume</button><button class="btn" data-studio="stop">■ Stop</button></div><div class="studio-audio-settings"><label>Speed <select id="studio-rate"><option value=".75">0.75×</option><option value=".9" selected>0.9×</option><option value="1">1×</option><option value="1.15">1.15×</option></select></label><label>Accent <select id="studio-accent"><option value="en-GB">British</option><option value="en-US">American</option></select></label></div><button class="btn soft" data-studio="transcript" id="studio-transcript-btn">▤ Show transcript</button><blockquote class="studio-transcript" id="studio-transcript" hidden>${esc(lesson.story)}</blockquote><p class="studio-caption">Generated by your device's speech synthesis; recording quality and voice availability depend on the browser.</p></div><div class="studio-listening-questions"><h3>Check understanding</h3>${['Who or what is the story about?','Which action happens first? Mention two details.','What is the main challenge or interesting moment?','Retell the story using three new expressions.'].map((q,i)=>`<div class="studio-question"><strong>${String(i+1).padStart(2,'0')}</strong><p>${q}</p></div>`).join('')}<div class="studio-source-link"><b>Authentic listening resources</b><p>More level-based recordings are available on British Council LearnEnglish.</p><a href="${url}" target="_blank" rel="noopener noreferrer">Open ${esc(lesson.level)} listening activities ↗</a></div></div></div></div>`;
  }
  function setupLesson(){
    if(!$('.lesson-main'))return;
    tab('studio','◫ Photo studio');tab('listening','♫ Listening');
    $('.lesson-main').insertAdjacentHTML('beforeend',makeGallery()+makeListening());
    $('.stage-head .button-row')?.insertAdjacentHTML('afterbegin','<button class="btn small" data-studio="toggle" id="studio-mode-btn">◫ Live photos</button>');
    $('#assets .export-grid')?.insertAdjacentHTML('afterend',`<div class="studio-resource-area"><h3>Visual teaching resources</h3><a class="btn" href="#studio" data-tab="studio">◫ Open photo studio</a>${own(lesson)?` <a class="btn primary" href="${root}assets/worksheets/daily-routines-worksheet.pdf" download>↓ Download proper PDF worksheet</a>`:''}</div>`);
    $('#speaking .section-header')?.insertAdjacentHTML('afterend',`<div class="studio-speaking-photo">${image(photo(lesson,0),lesson.title+' visual speaking prompt')}</div>`);
    const stage = $('#stage-card');
    if(stage){new MutationObserver(enhanceStage).observe(stage,{childList:true});}
    const flash = $('#flash-card');
    if(flash){new MutationObserver(enhanceFlash).observe(flash,{childList:true});}
    const prompts = $('#speaking-list');
    if(prompts)new MutationObserver(updateSpeaking).observe(prompts,{childList:true});
    if('ResizeObserver' in window&&stage)new ResizeObserver(fitSlide).observe(stage);
    window.addEventListener('resize',fitSlide);
    document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)document.body.classList.remove('presenter');fitSlide();});
    updateViewer();enhanceStage();enhanceFlash();updateMode();
    if(location.hash==='#studio'||location.hash==='#listening')$(`.tabs [data-tab="${location.hash.slice(1)}"]`)?.click();
  }
  function updateViewer(){
    if(!lesson||!$('#studio-viewer-frame'))return;
    const n=own(lesson)?12:6;selected=((selected%n)+n)%n;
    const word=lesson.words[selected%lesson.words.length];
    $('#studio-viewer-frame').innerHTML=image(photo(lesson,selected,1600),word.en);
    $('#studio-current').textContent=String(selected+1).padStart(2,'0');
    $('#studio-viewer-title').textContent=revealed&&own(lesson)?word.en:'Look. Think. Speak.';
    $('#studio-viewer-prompt').textContent=revealed&&own(lesson)?word.example:'Describe the picture, then make a sentence or predict what happens next.';
    $$('.photo-scene-card').forEach((e,i)=>e.classList.toggle('active',i===selected));
  }
  function updateMode(){
    const button=$('#studio-mode-btn');if(button)button.textContent=visual==='photos'?'◫ Live photos':'☺ Classic emoji';
    $$('[data-studio="photos"],[data-studio="emoji"]').forEach(b=>b.classList.toggle('primary',(b.dataset.studio==='photos')===(visual==='photos')));
    enhanceStage();enhanceFlash();
  }
  function fitSlide(){
    const host=$('#stage-card'),inner=host?.querySelector('.studio-canvas');if(!host||!inner)return;
    const scale=Math.min(host.clientWidth/1280,host.clientHeight/720);
    if(scale>0)inner.style.transform=`translate(-50%,-50%) scale(${scale})`;
  }
  function enhanceStage(){
    const host=$('#stage-card');if(!host||!lesson)return;
    let inner=host.querySelector('.studio-canvas');
    if(!inner){inner=document.createElement('div');inner.className='studio-canvas';while(host.firstChild)inner.appendChild(host.firstChild);host.appendChild(inner);}
    const slide=(Number(($('#slide-count')?.textContent||'').match(/\d+/)?.[0])||1)-1;
    const art=inner.querySelector('.slide-art');
    if(art){
      const old=art.querySelector('.studio-over-image');
      if(visual==='photos'&&!old){
        const src=own(lesson)?root+'assets/slides/daily-routines/'+(slide===0?'cover':'photo-story')+'.webp':photo(lesson,slide,1500);
        art.insertAdjacentHTML('beforeend',image(src,lesson.title+' themed photo','studio-over-image'));
        art.querySelector('.studio-over-image')?.addEventListener('error',e=>e.target.remove(),{once:true});
      }else if(visual!=='photos'&&old)old.remove();
    }
    inner.querySelectorAll('.mini-art').forEach((item,i)=>{
      let existing=item.querySelector('.studio-mini-image');
      if(visual==='photos'&&!existing){
        item.insertAdjacentHTML('afterbegin',image(photo(lesson,slide===8?i+2:i,480),'Vocabulary illustration','studio-mini-image'));
        item.querySelector('.studio-mini-image')?.addEventListener('error',e=>e.target.remove(),{once:true});
      }else if(visual!=='photos'&&existing)existing.remove();
    });
    inner.classList.toggle('studio-photos-on',visual==='photos');
    fitSlide();
  }
  function enhanceFlash(){
    const card=$('#flash-card .flash-card');if(!card||!lesson)return;
    const n=(Number(($('#flash-position')?.textContent||'').match(/\d+/)?.[0])||1)-1;
    let photoEl=card.querySelector('.studio-flash-image');
    if(visual==='photos'&&!photoEl){
      card.insertAdjacentHTML('afterbegin',image(photo(lesson,n,850),lesson.words[n%lesson.words.length].en,'studio-flash-image'));
      photoEl=card.querySelector('.studio-flash-image');photoEl?.addEventListener('error',e=>{e.target.remove();card.classList.remove('studio-photo-card-active');},{once:true});
    }else if(visual!=='photos'&&photoEl)photoEl.remove();
    card.classList.toggle('studio-photo-card-active',visual==='photos'&&!!card.querySelector('.studio-flash-image'));
  }
  function updateSpeaking(){
    const element=$('#speaking .studio-speaking-photo img');const active=$('#speaking-list .speaking-item.active');
    if(element)element.src=photo(lesson,Number(active?.dataset.prompt||0),960);
  }
  function focus(e){
    const button=e.target.closest('[data-action="focus"]');if(!button)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(document.body.classList.contains('presenter')){
      document.body.classList.remove('presenter');if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
    }else{
      document.body.classList.add('presenter');const container=$('.lesson-stage');
      if(container?.requestFullscreen)container.requestFullscreen().catch(()=>{});
    }
    requestAnimationFrame(fitSlide);
  }
  function studioClick(e){
    const b=e.target.closest('[data-studio]');if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();
    const a=b.dataset.studio;
    if(a==='choose'){selected=Number(b.dataset.index)||0;revealed=false;updateViewer();}
    if(a==='prev'){selected--;revealed=false;updateViewer();}
    if(a==='next'){selected++;revealed=false;updateViewer();}
    if(a==='reveal'){revealed=!revealed;updateViewer();}
    if(['photos','emoji','toggle'].includes(a)){
      visual=a==='photos'?'photos':a==='emoji'?'emoji':visual==='photos'?'emoji':'photos';
      try{localStorage.setItem('ta:visual-mode',visual)}catch(_){}
      updateMode();
    }
    if(a==='play'){
      if(!window.speechSynthesis){$('#studio-play').textContent='Voice unavailable';return;}
      speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(lesson.story);u.lang=$('#studio-accent').value;u.rate=Number($('#studio-rate').value)||.9;
      u.onend=()=>{$('#studio-play').textContent='▶ Play';};speechSynthesis.speak(u);$('#studio-play').textContent='◉ Playing';
    }
    if(a==='pause'&&window.speechSynthesis){if(speechSynthesis.paused)speechSynthesis.resume();else speechSynthesis.pause();}
    if(a==='stop'&&window.speechSynthesis){speechSynthesis.cancel();$('#studio-play').textContent='▶ Play';}
    if(a==='transcript'){
      reading=!reading;$('#studio-transcript').hidden=!reading;$('#studio-transcript-btn').textContent=reading?'▤ Hide transcript':'▤ Show transcript';
    }
  }
  const link=document.createElement('link');link.rel='stylesheet';link.href=root+'studio.css';document.head.appendChild(link);
  document.addEventListener('click',focus,true);
  document.addEventListener('click',studioClick,true);
  if(lesson)setupLesson();else coverCatalog();
})();
