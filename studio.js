(function StudioV2(){
  'use strict';
  const root=document.body.dataset.root||'';
  const lessons=window.LESSONS||[];
  const lesson=lessons.find(l=>l.id===document.body.dataset.id);
  const $=q=>document.querySelector(q), $$=q=>Array.from(document.querySelectorAll(q));
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dailyNames=['wake-up','get-dressed','have-breakfast','brush-my-teeth','go-to-work','study','have-lunch','exercise','cook-dinner','relax','read-a-book','go-to-bed'];
  const dailySlideNames=['cover','vocabulary','speaking','worksheet','photo-story','vocabulary-alternative'];
  const themeSets={
    'hello-english':['hello-english','picture-me','tutoring-online','at-the-cafe','weekend-plans'],
    'picture-me':['picture-me','my-home','at-the-cafe','weekend-plans','travel-transport'],
    'at-the-cafe':['at-the-cafe','hello-english','weekend-plans','my-home','travel-transport'],
    'my-home':['my-home','picture-me','work-life-balance','digital-habits','weekend-plans'],
    'around-the-city':['around-the-city','travel-transport','weekend-plans','sustainable-choices','at-the-cafe'],
    'travel-transport':['travel-transport','around-the-city','weekend-plans','sustainable-choices','my-home'],
    'weekend-plans':['weekend-plans','around-the-city','at-the-cafe','picture-me','travel-transport'],
    'work-life-balance':['work-life-balance','digital-habits','future-of-work','my-home','tutoring-online'],
    'stories-that-changed-me':['stories-that-changed-me','travel-transport','weekend-plans','hello-english','my-home'],
    'problem-solving':['problem-solving','future-of-work','work-life-balance','digital-habits','hello-english'],
    'digital-habits':['digital-habits','ai-everyday','future-of-work','work-life-balance','my-home'],
    'future-of-work':['future-of-work','ai-everyday','digital-habits','work-life-balance','problem-solving'],
    'sustainable-choices':['sustainable-choices','travel-transport','around-the-city','my-home','weekend-plans'],
    'ai-everyday':['ai-everyday','digital-habits','future-of-work','problem-solving','tutoring-online']
  };
  const isDaily=l=>l?.id==='daily-routines';
  const photo=(l,i=0)=>{
    if(isDaily(l)) return root+'assets/photos/daily-routines/'+dailyNames[((i%12)+12)%12]+'.webp';
    const set=themeSets[l.id]||[l.id,'tutoring-online','my-home','weekend-plans','future-of-work'];
    return root+'assets/photos/lesson-covers/'+set[((i%set.length)+set.length)%set.length]+'.webp';
  };
  const heroPhoto=l=>isDaily(l)?root+'assets/slides/daily-routines/cover.webp':root+'assets/photos/lesson-covers/'+l.id+'.webp';
  const img=(src,alt,cls='',eager=false)=>`<img class="${cls}" src="${escape(src)}" alt="${escape(alt)}" ${eager?'loading="eager"':'loading="lazy"'} decoding="async">`;
  let mode='photo',scene=0,showWord=false,story=[],listeningMode='story',clipIndex=0,voices=[];
  try{mode=localStorage.getItem('ta:visual-mode')==='emoji'?'emoji':'photo';}catch(_){}
  function catalog(){
    $$('.lesson-card').forEach(c=>{
      const l=lessons.find(x=>(c.getAttribute('href')||'').includes('/'+x.id+'/'));
      const cover=c.querySelector('.lesson-cover');if(!l||!cover)return;
      cover.insertAdjacentHTML('beforeend',img(heroPhoto(l),l.title+' photographic cover','ta-cover-img'));
    });
    const h=$('.hero-art'), l=lessons.find(x=>x.id==='daily-routines');
    if(h&&l)h.insertAdjacentHTML('beforeend',img(heroPhoto(l),'Original Daily Routines photograph composition','ta-hero-img',true));
  }
  function sceneCount(){return isDaily(lesson)?12:5;}
  function sceneWord(i){return isDaily(lesson)?lesson.words[i]?.en:('Photo '+(i+1));}
  function galleryHtml(){
    const cards=Array.from({length:sceneCount()},(_,i)=>`<button class="ta-scene ${i===0?'active':''}" data-ta="scene" data-i="${i}" aria-label="Open photo ${i+1}">${img(photo(lesson,i),sceneWord(i))}<span>${escape(sceneWord(i))}</span></button>`).join('');
    const designed=isDaily(lesson)?`<section class="ta-ready"><div class="ta-split-heading"><div><h3>Ready-to-teach photo slides</h3><p>Six original designs you can display, download or print.</p></div></div><div class="ta-slide-gallery">${dailySlideNames.map(x=>`<a href="${root}assets/slides/daily-routines/${x}.webp" target="_blank" rel="noopener">${img(root+'assets/slides/daily-routines/'+x+'.webp',x)}<span>${escape(x.replace(/-/g,' '))} ↗</span></a>`).join('')}</div><a class="btn primary" download href="${root}assets/worksheets/daily-routines-worksheet.pdf">↓ Download A4 photo worksheet (PDF)</a></section>`:'';
    return `<section id="studio" class="tab-panel ta-studio" hidden><div class="ta-page-heading"><div class="eyebrow">PHOTO-BASED LEARNING</div><h2>Visual lesson studio<span>.</span></h2><p>Real, locally hosted lesson photos. Observe, discuss, order scenes and build a mini picture story. The emoji vocabulary cards are available separately.</p></div><div class="ta-top-controls"><button class="btn primary" data-ta="mode-photo">◫ Photos</button><button class="btn" data-ta="mode-emoji">☺ Emoji cards</button><button class="btn" data-ta="word">Aa Reveal label</button><button class="btn" data-ta="photo-fullscreen">⛶ Fullscreen photo</button><button class="btn" data-ta="download-photo">↓ Photo WebP</button></div><div id="ta-photo-viewer" class="ta-photo-viewer"><div id="ta-photo-stage" class="ta-photo-stage">${img(photo(lesson,0),lesson.title+' teaching photograph','',true)}</div><div class="ta-photo-bar"><div class="ta-photo-info"><span class="eyebrow">PHOTO <b id="ta-photo-count">01</b> / ${sceneCount()}</span><h3 id="ta-photo-title">Look, think and speak.</h3><p id="ta-photo-question">${escape(lesson.questions[0])}</p></div><div class="button-row"><button class="btn" data-ta="prev">←</button><button class="btn primary" data-ta="next">Next photo →</button></div></div></div><div class="ta-scene-gallery" id="ta-photo-grid">${cards}</div><div class="ta-activity-row"><article><b>01 · Observe</b><p>Describe five details in the picture. Who, where, what and why?</p></article><article><b>02 · Predict</b><p>What happened immediately before this photo? What might happen next?</p></article><article><b>03 · Discuss</b><p>Answer the question, then ask your partner a follow-up question.</p></article></div><section class="ta-story-builder"><div class="ta-split-heading"><div><h3>Your three-picture story</h3><p>Select photos and arrange them into a conversation prompt. Download a standalone HTML handout.</p></div><div class="button-row"><button class="btn" data-ta="add-story">+ Add current photo</button><button class="btn" data-ta="clear-story">Clear</button><button class="btn primary" data-ta="story-download">↓ Handout</button></div></div><div id="ta-story-strip" class="ta-story-strip"></div></section>${designed}<p class="ta-photo-note">${isDaily(lesson)?'These 12 photos are original AI-generated image assets illustrating the Daily Routines vocabulary.':'This lesson uses its own locally hosted thematic cover plus a curated selection of related in-project photos for contextual speaking. These are not claimed to illustrate every individual vocabulary word.'}</p></section>`;
  }
  function listenHtml(){
    return `<section id="listening" class="tab-panel ta-listen" hidden><div class="ta-page-heading"><div class="eyebrow">LISTEN · NOTICE · RESPOND</div><h2>Listening lab<span>.</span></h2><p>Use your browser’s English voice for an original short reading or vocabulary practice. Play, pause, repeat and check your understanding.</p></div><div class="ta-listen-grid"><article class="ta-listen-player"><div class="ta-sound-icon" aria-hidden="true">♫</div><span class="eyebrow">${escape(lesson.level)} · ${escape(lesson.title)}</span><h3>Listen first. Read later.</h3><div class="ta-top-controls"><button class="btn primary" data-ta="listen-story" id="ta-listen-play">▶ Play story</button><button class="btn" data-ta="listen-word">🔊 Word practice</button><button class="btn" data-ta="listen-pause">Ⅱ Pause</button><button class="btn" data-ta="listen-stop">■ Stop</button></div><div class="ta-listen-options"><label>Speed<select id="ta-speed"><option value=".75">0.75×</option><option value=".9" selected>0.90×</option><option value="1">1×</option><option value="1.15">1.15×</option></select></label><label>Accent<select id="ta-locale"><option value="en-GB">British</option><option value="en-US">American</option></select></label></div><div class="ta-clip-info" id="ta-clip-info" role="status">Short story · listen for the main idea.</div><button class="btn soft" data-ta="transcript">▤ Show / hide transcript</button><div class="ta-transcript" id="ta-transcript" hidden>${escape(lesson.story)}</div><p class="ta-photo-note">Audio comes from device speech synthesis. Voice availability differs across browsers. No third-party recordings are copied.</p></article><article class="ta-listen-tasks"><h3>Listen and respond</h3><p>Play twice. Don’t read the transcript during the first listen.</p><div class="ta-task"><b>01 · Main idea</b><p>Summarize the recording in one sentence.</p></div><div class="ta-task"><b>02 · Detail</b><p>Which two actions or details can you remember?</p></div><div class="ta-task"><b>03 · Vocabulary</b><p>Listen to each word and repeat it. Write an example of your own.</p></div><div class="ta-task"><b>04 · Comprehension</b><p>Which of these words appeared in the story?</p><div id="ta-listen-choices" class="ta-listen-choices"></div><p id="ta-listen-feedback" role="status" class="ta-listen-feedback"></p></div></article></div></section>`;
  }
  function installTabs(){
    const tabs=$('.tabs'),sidebar=$('.sidebar');if(!tabs)return;
    [['studio','◫ Photo studio'],['listening','♫ Listening']].forEach(([id,title])=>{
      tabs.insertAdjacentHTML('beforeend',`<button class="tab" data-tab="${id}" role="tab" aria-selected="false">${title}</button>`);
      if(sidebar){const a=document.createElement('a');a.className='side-link';a.href='#'+id;a.dataset.tab=id;a.textContent=title;sidebar.insertBefore(a,sidebar.querySelector('.sidebar-tip'));}
    });
    $('.lesson-main')?.insertAdjacentHTML('beforeend',galleryHtml()+listenHtml());
    $('.stage-head .button-row')?.insertAdjacentHTML('afterbegin','<button class="btn small" data-ta="mode-toggle" id="ta-photo-switch">◫ Photos</button>');
    $('#assets .export-grid')?.insertAdjacentHTML('afterend','<div class="ta-resources"><h3>Photo-based lesson materials</h3><p>View all lesson images and download photo-based resources.</p><button class="btn primary" data-tab="studio">◫ Open photo studio</button><button class="btn" data-ta="print-lesson">↓ Print photo lesson / PDF</button></div>');
    const speaking=$('#speaking .section-header');
    if(speaking)speaking.insertAdjacentHTML('afterend',`<div class="ta-speaking-photo">${img(heroPhoto(lesson),lesson.title+' speaking photo')}</div>`);
    $$('.tab-panel').forEach(p=>{if(p.id!=='slides')p.hidden=true;});
    if(location.hash==='#studio'||location.hash==='#listening')setTimeout(()=>$('.tabs [data-tab="'+location.hash.slice(1)+'"]')?.click(),0);
    refreshScene();refreshStory();refreshMode();renderListeningQuestion();
  }
  function renderListeningQuestion(){
    const source=lesson.story.toLowerCase();
    const plausible=lesson.words.slice(0,Math.min(lesson.words.length,8));
    const inStory=plausible.find(w=>source.includes(w.en.toLowerCase()));
    const answer=inStory||lesson.words.find(w=>source.includes(w.en.toLowerCase()))||null;
    const fallback=answer?null:lesson.words[0];
    const correct=answer?.en||fallback?.en;
    const distractors=lesson.words.filter(w=>w.en!==correct).slice(0,3);
    const all=[correct,...distractors.map(x=>x.en)].filter(Boolean);
    if(!answer){
      $('#ta-listen-choices').innerHTML='<p>Listen for the key idea, then retell the story using three words from the lesson.</p>';
      return;
    }
    const ordered=all.map((v,i)=>({v,rank:(i+2)%all.length})).sort((a,b)=>a.rank-b.rank);
    $('#ta-listen-choices').innerHTML=ordered.map(x=>`<button class="btn small" data-ta="listen-answer" data-answer="${escape(x.v)}" data-correct="${escape(correct)}">${escape(x.v)}</button>`).join('');
  }
  function refreshScene(){
    if(!lesson)return;scene=((scene%sceneCount())+sceneCount())%sceneCount();
    $('#ta-photo-stage').innerHTML=img(photo(lesson,scene),lesson.title+' photograph '+(scene+1),'',true);
    $('#ta-photo-count').textContent=String(scene+1).padStart(2,'0');
    $('#ta-photo-title').textContent=showWord&&isDaily(lesson)?sceneWord(scene):'Look, think and speak.';
    $('#ta-photo-question').textContent=showWord&&isDaily(lesson)?lesson.words[scene].example:lesson.questions[scene%lesson.questions.length];
    $$('.ta-scene').forEach((b,i)=>b.classList.toggle('active',i===scene));
  }
  function refreshStory(){
    const box=$('#ta-story-strip');if(!box)return;
    box.innerHTML=story.length?story.map((n,i)=>`<div class="ta-story-card">${img(photo(lesson,n),'Story scene '+(i+1))}<div class="ta-story-actions"><strong>${i+1}. ${escape(sceneWord(n))}</strong><button data-ta="story-left" data-i="${i}" aria-label="Move left">←</button><button data-ta="story-right" data-i="${i}" aria-label="Move right">→</button><button data-ta="story-remove" data-i="${i}" aria-label="Remove">×</button></div></div>`).join(''):'<p class="ta-story-empty">Choose a photo above, then click “Add current photo”.</p>';
  }
  function download(name,content,type='text/html;charset=utf-8'){
    const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
  }
  async function exportStory(){
    if(!story.length){alert('Add a photo to your story first.');return;}
    let inlineImages;
    try{
      inlineImages=await Promise.all(story.map(async id=>{
        const response=await fetch(photo(lesson,id));if(!response.ok)throw new Error('Image not loaded');
        const blob=await response.blob();
        return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
      }));
    }catch(err){alert('Standalone export requires the hosted website (HTTP/HTTPS) so photos can be embedded. '+err.message);return;}
    const photos=story.map((id,i)=>`<section class="scene"><img src="${inlineImages[i]}" alt="Story scene ${i+1}"><div><h2>Scene ${i+1}</h2><p>${escape(lesson.questions[id%lesson.questions.length])}</p><p>Describe the image. What happened before and what happens next?</p></div></section>`).join('');
    const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(lesson.title)} picture story</title><style>body{font:18px/1.5 Arial;color:#233a2e;max-width:1080px;margin:auto;padding:25px}h1{font-size:44px}.scene{break-inside:avoid;display:grid;grid-template-columns:1fr 1fr;gap:30px;margin:24px 0;padding:16px;border:1px solid #dce8df;border-radius:20px}.scene img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px}@media(max-width:650px){.scene{grid-template-columns:1fr}}@media print{.scene{page-break-inside:avoid}}</style><h1>${escape(lesson.title)} · Photo Story</h1><p>${escape(lesson.level)} · Describe the scenes and create your own story.</p>${photos}</html>`;
    download(lesson.id+'-photo-story.html',html);
  }
  function enhanceSlides(){
    const host=$('#stage-card');if(!host||!lesson)return;
    let canvas=host.querySelector('.ta-canvas');
    if(!canvas){canvas=document.createElement('div');canvas.className='ta-canvas';while(host.firstChild)canvas.appendChild(host.firstChild);host.appendChild(canvas);}
    const slide=parseInt(($('#slide-count')?.textContent||'1').match(/\d+/)?.[0]||'1',10)-1;
    const art=canvas.querySelector('.slide-art');
    if(art){
      let existing=art.querySelector('.ta-deck-photo');
      if(mode==='photo'&&!existing){art.insertAdjacentHTML('beforeend',img(slide===0?heroPhoto(lesson):photo(lesson,slide),'Photo for '+lesson.title,'ta-deck-photo',true));}
      if(mode==='emoji'&&existing)existing.remove();
    }
    const minis=canvas.querySelectorAll('.mini-art');
    minis.forEach((box,i)=>{
      const current=box.querySelector('.ta-vocab-photo');
      if(mode==='photo'&&isDaily(lesson)){
        const photoIndex=slide===8?i+2:i;
        if(!current)box.insertAdjacentHTML('afterbegin',img(photo(lesson,photoIndex),lesson.words[photoIndex%lesson.words.length].en,'ta-vocab-photo'));
      }else if(current)current.remove();
    });
    canvas.classList.toggle('ta-photo-mode',mode==='photo');
    fitStage();
  }
  function enhanceFlash(){
    const card=$('#flash-card .flash-card');if(!card||!lesson)return;
    const i=parseInt(($('#flash-position')?.textContent||'1').match(/\d+/)?.[0]||'1',10)-1;
    const existing=card.querySelector('.ta-flash-photo');
    if(mode==='photo'&&isDaily(lesson)){
      if(!existing)card.insertAdjacentHTML('afterbegin',img(photo(lesson,i),lesson.words[i].en,'ta-flash-photo',true));
    }else if(existing)existing.remove();
    card.classList.toggle('ta-has-photo',mode==='photo'&&isDaily(lesson));
  }
  function refreshMode(){
    const b=$('#ta-photo-switch');if(b)b.textContent=mode==='photo'?'◫ Photo mode':'☺ Emoji mode';
    $$('[data-ta="mode-photo"],[data-ta="mode-emoji"]').forEach(b=>b.classList.toggle('primary',(b.dataset.ta==='mode-photo')===(mode==='photo')));
    enhanceSlides();enhanceFlash();
  }
  function fitStage(){
    const host=$('#stage-card'),canvas=host?.querySelector('.ta-canvas');if(!host||!canvas)return;
    const w=host.clientWidth,h=host.clientHeight;
    if(w<=0||h<=0)return;
    const scale=Math.min(w/1280,h/720);
    canvas.style.transform=`translate(-50%,-50%) scale(${Math.max(.05,scale)})`;
  }
  function fullscreen(){
    const stage=$('.lesson-stage');if(!stage)return;
    if(document.body.classList.contains('presenter')||document.fullscreenElement){
      document.body.classList.remove('presenter');
      if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});
    }else{
      const t=$('.tabs [data-tab="slides"]');t?.click();
      document.body.classList.add('presenter');
      if(stage.requestFullscreen)stage.requestFullscreen().catch(()=>{});
    }
    requestAnimationFrame(()=>requestAnimationFrame(fitStage));
  }
  function printSlideContent(index){
    const s=slideItems()[index], title=s.title;
    if(s.kind==='cover')return `<div class="ta-print-cover">${img(heroPhoto(lesson),title)}</div><p class="ta-print-intro">${escape(lesson.outcome)}</p>`;
    if(s.kind==='art')return `<div class="ta-print-cover">${img(photo(lesson,0),title)}</div>`;
    if(s.kind==='words'){
      return `<div class="ta-print-vocab">${s.items.map((w,i)=>`<div class="ta-print-word">${isDaily(lesson)?img(photo(lesson,index===9?i+2:i),w.en):`<div class="ta-print-icon">${escape(w.icon)}</div>`}<strong>${escape(w.en)}</strong></div>`).join('')}</div>`;
    }
    if(s.kind==='list')return `<div class="ta-print-list">${s.items.map((item,i)=>`<div class="ta-print-list-item"><em>${String(i+1).padStart(2,'0')}</em><span>${escape(item)}</span></div>`).join('')}</div>${s.text?`<p class="ta-print-hint">${escape(s.text)}</p>`:''}`;
    return `<div class="ta-print-quote">${escape(s.text||'')}</div>`;
  }
  function slideItems(){
    return [
      {kind:'cover',title:lesson.title,k:'WELCOME'},
      {kind:'list',title:'A quick warm-up',k:'01 · WARM-UP',items:lesson.warmup},
      {kind:'art',title:'Look & notice',k:'02 · PHOTO DISCOVERY'},
      {kind:'list',title:"Today’s goal",k:'03 · AIM',items:[lesson.outcome,'Use five new expressions.','Ask a partner a question.']},
      {kind:'words',title:'Our word bank',k:'04 · VOCABULARY',items:lesson.words.slice(0,10)},
      {kind:'list',title:lesson.grammar.title,k:'05 · LANGUAGE',items:lesson.grammar.models},
      {kind:'quote',title:'Read & notice',k:'06 · READING',text:lesson.story},
      {kind:'list',title:'Spot the pattern',k:'07 · GRAMMAR',items:lesson.grammar.models,text:lesson.grammar.rule},
      {kind:'list',title:'Conversation starters',k:'08 · SPEAKING',items:lesson.questions.slice(0,4)},
      {kind:'words',title:'Picture prompts',k:'09 · PICTURES',items:lesson.words.slice(2,12)},
      {kind:'list',title:'Role-play',k:'10 · REAL SITUATION',items:lesson.situations},
      {kind:'list',title:'Go deeper',k:'11 · DISCUSSION',items:lesson.questions.slice(3)},
      {kind:'list',title:'Exit ticket',k:'12 · REVIEW',items:['Use one new word.','Share one thing you learned.','Ask one final question.']},
      {kind:'quote',title:'Homework challenge',k:'13 · PRACTICE',text:lesson.homework}
    ];
  }
  function buildPrint(){
    const host=$('#print-root');if(!host||!lesson)return;
    host.classList.add('ta-print-root');
    host.innerHTML=slideItems().map((s,i)=>`<section class="ta-print-page"><header><div class="ta-print-brand">teaching<span>assets</span></div><small>${escape(lesson.level)} · ${escape(s.k)}</small></header><main><h2>${escape(s.title)}</h2>${printSlideContent(i)}</main><footer><span>${escape(lesson.title)}</span><span>${i+1} / 14</span></footer></section>`).join('');
  }
  function setupPrinting(){
    buildPrint();
    window.addEventListener('beforeprint',buildPrint);
  }
  function readClip(text,kind){
    if(!window.speechSynthesis){$('#ta-clip-info').textContent='Speech synthesis is unavailable in this browser.';return;}
    speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(text);const lang=$('#ta-locale').value;
    utterance.lang=lang;utterance.rate=Number($('#ta-speed').value)||.9;
    const match=voices.find(v=>v.lang.toLowerCase()===lang.toLowerCase())||voices.find(v=>v.lang.toLowerCase().startsWith(lang.slice(0,2).toLowerCase()));
    if(match)utterance.voice=match;
    utterance.onstart=()=>{$('#ta-clip-info').textContent=kind==='word'?'Playing vocabulary word '+((clipIndex-1+lesson.words.length)%lesson.words.length+1)+' / '+lesson.words.length:'Playing the story…';};
    utterance.onend=()=>{$('#ta-clip-info').textContent='Playback complete. Replay or check the transcript.';};
    utterance.onerror=()=>{$('#ta-clip-info').textContent='Could not play audio. Try a different browser voice.';};
    speechSynthesis.speak(utterance);
  }
  function setupAudio(){
    if(!window.speechSynthesis)return;
    voices=speechSynthesis.getVoices();
    speechSynthesis.addEventListener?.('voiceschanged',()=>{voices=speechSynthesis.getVoices();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)speechSynthesis.pause();});
  }
  function handle(e){
    const printButton=e.target.closest('[data-action="print"]');
    if(printButton){e.preventDefault();e.stopImmediatePropagation();buildPrint();window.print();return;}
    const focusButton=e.target.closest('[data-action="focus"]');
    if(focusButton){e.preventDefault();e.stopImmediatePropagation();fullscreen();return;}
    const b=e.target.closest('[data-ta]');if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();const action=b.dataset.ta;
    if(action==='scene'){scene=+b.dataset.i;showWord=false;refreshScene();}
    else if(action==='prev'||action==='next'){scene+=action==='next'?1:-1;showWord=false;refreshScene();}
    else if(action==='word'){showWord=!showWord;refreshScene();}
    else if(action==='download-photo'){const a=document.createElement('a');a.href=photo(lesson,scene);a.download=lesson.id+'-photo-'+String(scene+1).padStart(2,'0')+'.webp';document.body.append(a);a.click();a.remove();}
    else if(action==='mode-photo'||action==='mode-emoji'||action==='mode-toggle'){mode=action==='mode-photo'?'photo':action==='mode-emoji'?'emoji':mode==='photo'?'emoji':'photo';try{localStorage.setItem('ta:visual-mode',mode);}catch(_){}refreshMode();}
    else if(action==='photo-fullscreen'){
      const v=$('#ta-photo-viewer');if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});else v?.requestFullscreen?.().catch(()=>{});
    }
    else if(action==='add-story'){if(story.length>=6){alert('The story can contain up to six scenes.');return;}story.push(scene);refreshStory();}
    else if(action==='clear-story'){story=[];refreshStory();}
    else if(action==='story-left'||action==='story-right'){const i=+b.dataset.i,j=i+(action==='story-left'?-1:1);if(j<0||j>=story.length)return;[story[i],story[j]]=[story[j],story[i]];refreshStory();}
    else if(action==='story-remove'){story.splice(+b.dataset.i,1);refreshStory();}
    else if(action==='story-download')exportStory();
    else if(action==='listen-story'){listeningMode='story';readClip(lesson.story,'story');}
    else if(action==='listen-word'){listeningMode='word';readClip(lesson.words[clipIndex%lesson.words.length].en,'word');clipIndex++;}
    else if(action==='listen-pause'){if(window.speechSynthesis){if(speechSynthesis.paused)speechSynthesis.resume();else speechSynthesis.pause();}}
    else if(action==='listen-stop'){if(window.speechSynthesis){speechSynthesis.cancel();$('#ta-clip-info').textContent='Stopped.';}}
    else if(action==='transcript'){$('#ta-transcript').hidden=!$('#ta-transcript').hidden;}
    else if(action==='listen-answer'){
      const right=b.dataset.answer===b.dataset.correct;
      $('#ta-listen-feedback').textContent=right?'✓ Correct! Nice listening.':'Try again. Listen to the story one more time.';
      b.classList.add(right?'ta-correct':'ta-incorrect');
    }
    else if(action==='print-lesson'){buildPrint();window.print();}
  }
  const css=document.createElement('link');css.rel='stylesheet';css.href=root+'studio.css';document.head.append(css);
  document.addEventListener('click',handle,true);
  document.addEventListener('keydown',e=>{
    if(!lesson||e.target.closest('input,textarea,select,[contenteditable]'))return;
    if(e.key==='Escape'&&document.body.classList.contains('presenter')){e.preventDefault();e.stopImmediatePropagation();fullscreen();}
    else if(e.key.toLowerCase()==='f'&&($('.tabs [data-tab="slides"].active')||document.body.classList.contains('presenter'))){e.preventDefault();e.stopImmediatePropagation();fullscreen();}
  },true);
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)document.body.classList.remove('presenter');requestAnimationFrame(fitStage);});
  if(lesson){
    installTabs();
    const stage=$('#stage-card');if(stage){new MutationObserver(enhanceSlides).observe(stage,{childList:true,subtree:false});if(window.ResizeObserver)new ResizeObserver(fitStage).observe(stage);}
    const flash=$('#flash-card');if(flash)new MutationObserver(enhanceFlash).observe(flash,{childList:true});
    window.addEventListener('resize',fitStage);
    enhanceSlides();enhanceFlash();setupPrinting();setupAudio();
  }else catalog();
})();
