(function PhotoLibraryApp(){
'use strict';
const lessonData=window.LESSONS||[];
const root='../', $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9-]/g,'-');
const names=['wake-up','get-dressed','have-breakfast','brush-my-teeth','go-to-work','study','have-lunch','exercise','cook-dinner','relax','read-a-book','go-to-bed'];
const slideNames=['cover','vocabulary','speaking','worksheet','photo-story','vocabulary-alternative'];
const daily=lessonData.find(l=>l.id==='daily-routines');
const photoLessons=lessonData.filter(l=>Array.isArray(l.photoPack)&&l.photoPack.length===l.words.length);
const records=[
...photoLessons.flatMap(l=>l.words.map((w,i)=>({id:'vocabulary-'+l.id+'-'+i,title:w.en,alt:w.en+' (curated word photograph)',kind:'Vocabulary photos',level:l.level,topic:l.title,lessonId:l.id,prompt:w.example,translation:w.ru,src:root+'assets/photos/'+l.id+'/'+l.photoPack[i]+'.webp',exact:true}))),
...lessonData.filter(l=>l.id!=='daily-routines').map(l=>({id:'cover-'+l.id,title:l.title,alt:l.title+' topic cover',kind:'Topic photos',level:l.level,topic:l.title,lessonId:l.id,prompt:l.questions[0],src:root+'assets/photos/lesson-covers/'+l.id+'.webp',exact:false})),
...slideNames.map((name,i)=>({id:'slide-'+name,title:'Daily Routines · '+name.replace(/-/g,' '),alt:name+' prepared teaching slide',kind:'Ready slides',level:'A1',topic:'Daily Routines',lessonId:'daily-routines',prompt:daily.questions[i%daily.questions.length],src:root+'assets/slides/daily-routines/'+name+'.webp',exact:false})),
...['listening-lab','tutoring-online'].map(name=>({id:'photo-'+name,title:name.replace(/-/g,' '),kind:'Topic photos',level:'All',topic:'Teaching',lessonId:'hello-english',prompt:'Describe the situation and the people in the image.',src:root+'assets/photos/lesson-covers/'+name+'.webp',exact:false}))
];
let items=records.slice(),selected=[],tab='All',search='',activeId=items[0]?.id,deckIndex=0,reveal=true,customUrls=[],db=null;
try{selected=JSON.parse(localStorage.getItem('ta:photo-library-selection')||'[]');if(!Array.isArray(selected))selected=[];}catch(_){selected=[];}
const persist=()=>{try{localStorage.setItem('ta:photo-library-selection',JSON.stringify(selected));}catch(_){}};
const html=(r)=>`<article class="vl-card" data-kind="${esc(r.kind)}"><button class="vl-card-image" data-open="${esc(r.id)}" title="Preview ${esc(r.title)}"><img src="${esc(r.src)}" alt="${esc(r.alt||r.title)}" loading="lazy" decoding="async"></button><div class="vl-card-info"><div class="vl-tags"><span>${esc(r.level)}</span><span>${r.exact?'Exact word photo':esc(r.kind)}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.topic)}</p><div class="vl-card-actions"><button class="vl-add ${selected.includes(r.id)?'added':''}" data-select="${esc(r.id)}" aria-label="${selected.includes(r.id)?'Remove from':'Add to'} presentation">${selected.includes(r.id)?'✓ Added':'+ Add to deck'}</button><button class="vl-ghost" data-open="${esc(r.id)}">Preview ↗</button></div></div></article>`;
function draw(){
document.title='Photo Library · Teaching Assets';
const view=`<header class="vl-header"><div class="vl-container vl-header-inner"><a href="${root}index.html" class="vl-logo"><span>t.</span> teaching<span>assets</span></a><nav><a href="${root}index.html">Lessons</a><a class="active" href="index.html">Photo Library</a></nav><span class="vl-label">ENGLISH · VISUAL MATERIALS</span></div></header>
<main class="vl-container"><section class="vl-hero"><div><div class="vl-kicker">THE VISUAL TEACHING LIBRARY</div><h1>Teach with <i>pictures.</i></h1><p>Choose original lesson photographs, ready-made slide designs or your own images. Build a visual story and take it straight into the classroom.</p><div class="vl-actions"><a class="vl-button primary" href="#gallery">Explore images ↗</a><button class="vl-button" id="vl-upload">+ Upload my photos</button></div><div class="vl-stats"><b>${records.length}<small>curated assets</small></b><b>15<small>English lessons</small></b><b>16:9<small>presentation mode</small></b></div></div><div class="vl-hero-visual"><img src="${root}assets/photos/daily-routines/wake-up.webp" alt="Daily routines wake up photograph"><img src="${root}assets/photos/daily-routines/study.webp" alt="Daily routines studying photograph"><img src="${root}assets/photos/daily-routines/have-lunch.webp" alt="Daily routines lunch photograph"></div></section>
<section id="gallery" class="vl-section"><div class="vl-section-title"><div><span class="vl-kicker">PICK WHAT YOU NEED</span><h2>Visual assets library</h2><p>Individual vocabulary photos, contextual speaking scenes and finished slide layouts.</p></div><span id="vl-total" class="vl-total"></span></div>
<div class="vl-tools"><label class="vl-search"><span>⌕</span><input id="vl-search" placeholder="Search a word, lesson or topic…" type="search" aria-label="Search photos"></label><div class="vl-filter" id="vl-filter">${['All','Vocabulary photos','Topic photos','Ready slides','My uploads'].map(v=>`<button data-filter="${esc(v)}" class="${v==='All'?'active':''}">${esc(v)}</button>`).join('')}</div></div><div class="vl-grid" id="vl-grid"></div><p class="vl-note">The 12 Daily Routines photographs match individual vocabulary items. Other images are contextual scene prompts or cover artwork, not exact word-by-word photographs.</p></section></main>
<aside class="vl-selection vl-collapsed" id="vl-selection"><div class="vl-selection-head"><div><small>YOUR TEACHING DECK</small><h3><span id="vl-count">0</span> images selected</h3></div><button class="vl-icon" id="vl-collapse" title="Collapse / expand">▤</button></div><div id="vl-picked" class="vl-picked"></div><div class="vl-selection-foot"><button class="vl-button primary" data-action="present">▶ Present photos</button><button class="vl-button" data-action="export">↓ Offline HTML</button><button class="vl-button soft" data-action="print">⎙ Print / PDF</button><button class="vl-clear" data-action="clear">Clear selection</button></div></aside>
<div class="vl-modal" id="vl-preview" role="dialog" aria-modal="true" hidden><div class="vl-preview-content"><div class="vl-preview-photo"><img id="vl-preview-img" alt="Selected photograph"></div><div class="vl-preview-copy"><button class="vl-close" data-action="close-preview" aria-label="Close preview">×</button><div id="vl-preview-type" class="vl-kicker"></div><h2 id="vl-preview-title"></h2><p id="vl-preview-desc"></p><div class="vl-preview-prompt"><strong>Try this with your student</strong><p id="vl-preview-question"></p></div><div class="vl-actions"><button class="vl-button primary" id="vl-preview-add" data-action="preview-add">+ Add to deck</button><button class="vl-button" data-action="download-current">↓ Image</button></div></div></div></div>
<div class="vl-presenter" id="vl-presenter" role="dialog" aria-modal="true" hidden><div class="vl-presenter-bar"><span>teaching<span style="color:#9bcbb0">assets</span> · MY PHOTO LESSON</span><div class="vl-presenter-actions"><button data-action="toggle-captions">Aa Hide prompts</button><button data-action="exit">✕ Exit</button></div></div><div class="vl-presenter-space"><div class="vl-presenter-slide" id="vl-presenter-slide"></div></div><div class="vl-presenter-bar"><span id="vl-slide-index"></span><div class="vl-presenter-actions"><button data-action="prev">← Previous</button><button class="primary" data-action="next">Next →</button></div></div></div>
<div id="vl-print-root"></div><input id="vl-file-input" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden>
<footer class="vl-footer"><div class="vl-container">Original Teaching Assets photographs · Uploaded images remain in this browser · <a href="${root}index.html">Back to lesson catalogue ↗</a></div></footer>`;
document.getElementById('app').innerHTML=view;
filter();
}
function filter(){
const shown=items.filter(r=>(tab==='All'||r.kind===tab)&&[r.title,r.topic,r.level,r.prompt,r.translation].join(' ').toLowerCase().includes(search));
$('#vl-grid').innerHTML=shown.map(html).join('')||'<div class="vl-empty"><h3>No matching images</h3><p>Try another keyword or category, or upload your own photographs.</p></div>';
$('#vl-total').textContent=shown.length+' images';
}
function get(id){return items.find(x=>x.id===id);}
function select(id){
if(!get(id))return;
if(selected.includes(id))selected=selected.filter(x=>x!==id);
else{if(selected.length>=24){notice('Select up to 24 photos in one deck.');return;}selected.push(id);}
persist();filter();drawSelection();
if(selected.length)$('#vl-selection').classList.remove('vl-collapsed');else $('#vl-selection').classList.add('vl-collapsed');
if(activeId===id&&$('#vl-preview-add'))$('#vl-preview-add').textContent=selected.includes(id)?'✓ Remove from deck':'+ Add to deck';
}
function drawSelection(){
selected=selected.filter(id=>!!get(id));persist();
$('#vl-count').textContent=selected.length;
$('#vl-picked').innerHTML=selected.length?selected.map((id,i)=>{const r=get(id);return `<div class="vl-picked-item"><img src="${esc(r.src)}" alt=""><div><b>${esc(r.title)}</b><small>${esc(r.level)} · ${esc(r.kind)}</small></div><button data-move="${i}" data-direction="-1" aria-label="Move photo left">↑</button><button data-move="${i}" data-direction="1" aria-label="Move photo right">↓</button><button data-remove="${esc(r.id)}" aria-label="Remove image">×</button></div>`;}).join(''):'<div class="vl-no-selection">Select a few images to create your own photo-based lesson.</div>';
$$('[data-action="present"],[data-action="export"],[data-action="print"]').forEach(el=>el.disabled=selected.length===0);
}
function preview(id){
const r=get(id);if(!r)return;
activeId=id;$('#vl-preview-img').src=r.src;$('#vl-preview-img').alt=r.alt||r.title;
$('#vl-preview-type').textContent=r.level+' · '+r.kind;
$('#vl-preview-title').textContent=r.title;
$('#vl-preview-desc').textContent=r.exact?'A photograph explicitly mapped to the vocabulary item in '+r.topic+'.':`A contextual visual asset from ${r.topic}. Use it for speaking practice or as a scene illustration.`;
$('#vl-preview-question').textContent=r.prompt||'Describe the image. What can you see? What would happen next?';
$('#vl-preview-add').textContent=selected.includes(id)?'✓ Remove from deck':'+ Add to deck';
$('#vl-preview').hidden=false;document.body.classList.add('vl-no-scroll');
}
function closePreview(){$('#vl-preview').hidden=true;document.body.classList.remove('vl-no-scroll');}
function deckHTML(){
if(!selected.length)return;
const r=get(selected[deckIndex]);
$('#vl-presenter-slide').innerHTML=`<div class="vl-presenter-picture"><img src="${esc(r.src)}" alt="${esc(r.alt||r.title)}"></div><div class="vl-presenter-copy ${reveal?'':'vl-hide-prompts'}"><div class="vl-kicker">${esc(r.level)} · PHOTO ${deckIndex+1}</div><h2>${esc(r.exact?r.title:'What do you see?')}</h2><p>${esc(r.prompt||'Describe the image. Ask your partner two questions.')}</p><span>${esc(r.topic)}</span></div>`;
$('#vl-slide-index').textContent=`${deckIndex+1} / ${selected.length}`;
}
function present(){
if(!selected.length)return;deckIndex=0;reveal=true;$('#vl-presenter').hidden=false;document.body.classList.add('vl-no-scroll');deckHTML();
$('#vl-presenter').requestFullscreen?.().catch(()=>{});
}
function exit(){
$('#vl-presenter').hidden=true;document.body.classList.remove('vl-no-scroll');
if(document.fullscreenElement===$('#vl-presenter'))document.exitFullscreen?.().catch(()=>{});
}
function move(n){deckIndex=Math.max(0,Math.min(selected.length-1,deckIndex+n));deckHTML();}
function download(name,content,mime){
const blob=content instanceof Blob?content:new Blob([content],{type:mime||'text/html;charset=utf-8'});
const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function loadData(src){
return fetch(src).then(r=>{if(!r.ok)throw Error('Could not load '+src);return r.blob();}).then(blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);}));
}
function standalone(images){
const data=selected.map((id,i)=>{const r=get(id);return {title:r.title,kind:r.kind,level:r.level,topic:r.topic,prompt:r.prompt,src:images[i],exact:r.exact};});
const safe=JSON.stringify(data).replace(/</g,'\\u003c');
return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My Photo Lesson · Teaching Assets</title>
<style>*{box-sizing:border-box}html,body{margin:0;font-family:Arial,sans-serif;background:#17231c;color:#294132;overflow:hidden}#slide{height:100dvh;width:100vw;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:50px 20px}.scene{aspect-ratio:16/9;background:#f6faf5;border-radius:18px;width:min(calc(100vw - 35px),calc((100dvh - 115px)*16/9));max-height:calc(100dvh - 110px);overflow:hidden;display:grid;grid-template-columns:57% 43%}.scene img{display:block;width:100%;height:100%;object-fit:cover}.copy{padding:5%;min-width:0;display:flex;flex-direction:column;justify-content:center}.copy h1{font-size:clamp(23px,4vw,60px);line-height:1.15;letter-spacing:-.055em}.copy p{font-size:clamp(12px,1.5vw,24px);line-height:1.5}.label{font-size:13px;text-transform:uppercase;letter-spacing:.11em;color:#64876d}.nav{position:fixed;bottom:10px;right:10px;background:#25382be8;padding:10px 15px;border-radius:35px;color:white}button{border:0;border-radius:16px;background:white;color:#234330;padding:8px 13px;cursor:pointer;margin-left:6px}body.hide .copy{visibility:hidden}.print-container{display:none}@media(max-width:700px){.scene{grid-template-columns:1fr 1fr}.copy h1{font-size:22px}.copy p{font-size:12px}}@page{size:A4 landscape;margin:0}@media print{html,body{overflow:visible;background:white}#slide,.nav{display:none!important}.print-container{display:block!important}.print-page{display:grid;grid-template-columns:57% 43%;width:297mm;height:210mm;page-break-after:always;break-after:page;overflow:hidden;background:#f6faf5;break-inside:avoid}.print-page:last-child{break-after:auto}.print-page img{width:100%;height:100%;object-fit:cover}.print-page .copy h1{font-size:29pt}.print-page .copy p{font-size:17pt}}}</style>
<div id="slide"><div class="scene"><img id="photo" alt=""><div class="copy"><div class="label" id="level"></div><h1 id="title"></h1><p id="prompt"></p></div></div></div>
<div class="nav"><span id="counter"></span><button onclick="step(-1)">←</button><button onclick="step(1)">→</button><button onclick="document.body.classList.toggle('hide')">Aa</button><button onclick="window.print()">PDF</button></div><div class="print-container" id="print"></div>
<script>const photos=${safe};let at=0;const d=document;function step(n){at=Math.max(0,Math.min(photos.length-1,at+n));show()}function show(){const r=photos[at];d.getElementById('photo').src=r.src;d.getElementById('photo').alt=r.title;d.getElementById('level').textContent=r.level+' · '+r.kind;d.getElementById('title').textContent=r.exact?r.title:'What do you see?';d.getElementById('prompt').textContent=r.prompt||'Describe the scene.';d.getElementById('counter').textContent=(at+1)+' / '+photos.length}d.getElementById('print').innerHTML=photos.map(r=>'<article class="print-page"><img src="'+r.src+'"><div class="copy"><div class="label">'+r.level+'</div><h1>'+r.title.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</h1><p>'+String(r.prompt||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</p></div></article>').join('');d.addEventListener('keydown',e=>{if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1)});show();<\/script></html>`;
}
async function exportDeck(){
if(!selected.length)return;
notice('Preparing a self-contained presentation…');
try{const all=await Promise.all(selected.map(id=>loadData(get(id).src)));
download('my-english-photo-lesson.html',standalone(all),'text/html;charset=utf-8');notice('Downloaded complete offline HTML presentation.');}
catch(e){notice('Export failed. Open the deployed website over HTTPS and retry.');}
}
function buildPrintOnly(){
if(!selected.length)return;
const node=$('#vl-print-root');
node.innerHTML=selected.map((id,i)=>{const r=get(id);return `<section class="vl-print-page"><img src="${esc(r.src)}" alt=""><div class="vl-print-copy"><span>${esc(r.level)} · PHOTO ${i+1} / ${selected.length}</span><h2>${esc(r.title)}</h2><p>${esc(r.prompt||'Describe the image.')}</p><small>Teaching Assets · Photo Lesson</small></div></section>`;}).join('');
}
function print(){buildPrintOnly();window.print();}
function notice(message){let t=$('#vl-toast');if(!t){t=document.createElement('div');t.id='vl-toast';t.setAttribute('role','status');t.className='vl-toast';document.body.appendChild(t);}t.textContent=message;clearTimeout(window.__vlToast);window.__vlToast=setTimeout(()=>t.remove(),3500);}
function loadUploads(){
if(!window.indexedDB)return Promise.resolve();
return new Promise(resolve=>{
let r=indexedDB.open('teaching-assets-image-uploads',1);
r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('photos'))r.result.createObjectStore('photos',{keyPath:'id'});};
r.onerror=()=>resolve();
r.onsuccess=()=>{db=r.result;const x=db.transaction('photos','readonly').objectStore('photos').getAll();x.onsuccess=()=>{for(const upload of x.result){let objectUrl=URL.createObjectURL(upload.blob);customUrls.push(objectUrl);items.push({...upload,src:objectUrl,kind:'My uploads',exact:false});}resolve();};x.onerror=()=>resolve();};
});
}
function resizeImage(file){
return new Promise((resolve,reject)=>{
const url=URL.createObjectURL(file),im=new Image();
im.onload=()=>{URL.revokeObjectURL(url);const scale=Math.min(1,1700/Math.max(im.width,im.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(im.width*scale));canvas.height=Math.max(1,Math.round(im.height*scale));canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);canvas.toBlob(b=>b?resolve(b):reject(new Error('Cannot convert image')),'image/webp',.87);};
im.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Image invalid'));};im.src=url;
});
}
async function addFiles(fileList){
if(!fileList?.length)return;
let done=0;
for(const file of Array.from(fileList).slice(0,24)){
if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>20*1024*1024)continue;
try{const blob=await resizeImage(file),id='custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
const rec={id,title:file.name.replace(/\.[^.]+$/,'').slice(0,100),alt:file.name.slice(0,120),level:'Custom',topic:'My photos',prompt:'Describe the picture. What can you see, and what might happen next?',blob};
if(db){await new Promise((resolve,reject)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put(rec);tx.oncomplete=resolve;tx.onerror=reject;});}
const url=URL.createObjectURL(blob);customUrls.push(url);items.unshift({...rec,src:url,kind:'My uploads',exact:false});done++;
}catch(e){console.warn('Could not import',file.name,e);}
}
tab='My uploads';$$('[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter===tab));search='';$('#vl-search').value='';filter();notice(done+' personal photo(s) added. They stay in this browser.');
}
async function removeCustom(id){
const r=get(id);if(!r||r.kind!=='My uploads')return;
if(db){await new Promise(resolve=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').delete(id);tx.oncomplete=resolve;tx.onerror=resolve;});}
selected=selected.filter(x=>x!==id);items=items.filter(x=>x.id!==id);
URL.revokeObjectURL(r.src);persist();filter();drawSelection();notice('Your photo was removed from this browser.');
}
document.addEventListener('click',e=>{
const f=e.target.closest('[data-filter]');if(f){tab=f.dataset.filter;$$('[data-filter]').forEach(x=>x.classList.toggle('active',x===f));filter();return;}
const open=e.target.closest('[data-open]');if(open){preview(open.dataset.open);return;}
const sel=e.target.closest('[data-select]');if(sel){select(sel.dataset.select);return;}
const r=e.target.closest('[data-remove]');if(r){select(r.dataset.remove);return;}
const mv=e.target.closest('[data-move]');if(mv){const i=Number(mv.dataset.move),j=i+Number(mv.dataset.direction);if(j>=0&&j<selected.length){[selected[i],selected[j]]=[selected[j],selected[i]];persist();drawSelection();}return;}
const a=e.target.closest('[data-action]');if(a){
switch(a.dataset.action){
case 'preview-add':select(activeId);return;
case 'close-preview':closePreview();return;
case 'download-current':{const p=get(activeId);if(p){const link=document.createElement('a');link.href=p.src;link.download=p.id+'.'+(p.kind==='My uploads'?'webp':p.src.split('.').pop());link.click();}return;}
case 'present':present();return;
case 'exit':exit();return;
case 'prev':move(-1);return;
case 'next':move(1);return;
case 'toggle-captions':reveal=!reveal;deckHTML();return;
case 'export':exportDeck();return;
case 'print':print();return;
case 'clear':selected=[];persist();filter();drawSelection();return;
}
}
if(e.target.closest('#vl-upload')){$('#vl-file-input').click();return;}
if(e.target.closest('#vl-collapse')){$('#vl-selection').classList.toggle('vl-collapsed');return;}
if(e.target===$('#vl-preview'))closePreview();
});
document.addEventListener('keydown',e=>{
if(e.target.closest('input,textarea'))return;
if(e.key==='Escape'){$('#vl-preview')?.hidden===false&&closePreview();if($('#vl-presenter')?.hidden===false)exit();}
if($('#vl-presenter')?.hidden===false){if(e.key==='ArrowRight')move(1);if(e.key==='ArrowLeft')move(-1);}
});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&$('#vl-presenter')?.hidden===false){/* CSS dialog mode remains visible to allow exit */}});
document.addEventListener('DOMContentLoaded',async()=>{
draw();$('#vl-search').addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();filter();});
$('#vl-file-input').addEventListener('change',async e=>{await addFiles(e.target.files);e.target.value='';});
window.addEventListener('beforeprint',()=>{if(selected.length&&$('#vl-print-root').children.length===0)buildPrintOnly();});
await loadUploads();selected=selected.filter(id=>!!get(id));persist();filter();drawSelection();
});
})();
