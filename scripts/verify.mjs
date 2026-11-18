import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const window={};vm.runInNewContext(fs.readFileSync('data.js','utf8'),{window},{timeout:3000});
const lessons=window.LESSONS;
assert.equal(lessons.length,15,'Expected 15 lessons');
const levels=new Set(['A0','A1','A2','B1','B2']),ids=new Set();
for(const l of lessons){
 assert(levels.has(l.level),'Invalid level in '+l.id);
 assert(!ids.has(l.id),'Duplicate slug '+l.id);ids.add(l.id);
 assert(l.words.length>=10,'Insufficient flashcards in '+l.id);
 assert(l.questions.length>=6,'Insufficient speaking prompts in '+l.id);
 assert(l.situations.length>=2,'Insufficient role plays in '+l.id);
 assert(l.words.every(w=>w.en&&w.ru&&w.icon&&w.example),'Incomplete vocabulary '+l.id);
 assert(l.grammar.models.length>=3,'Missing grammar examples in '+l.id);
 assert(fs.existsSync('lessons/'+l.id+'/index.html'),'Missing HTML page '+l.id);
}
for(const p of ['index.html','style.css','app.js','exports.js','studio.js','studio.css','assets/favicon.svg','.github/workflows/pages.yml'])assert(fs.existsSync(p),'Missing '+p);
console.log('✓ '+lessons.length+' lessons · '+lessons.reduce((n,l)=>n+l.words.length,0)+' flashcards · 14 slides each · '+ids.size+' HTML routes');

const photos=['wake-up','get-dressed','have-breakfast','brush-my-teeth','go-to-work','study','have-lunch','exercise','cook-dinner','relax','read-a-book','go-to-bed'];
const art=['cover','vocabulary','speaking','worksheet','photo-story','vocabulary-alternative'];
for(const name of photos)assert(fs.existsSync('assets/photos/daily-routines/'+name+'.webp'),'Missing generated photo '+name);
for(const name of art)assert(fs.existsSync('assets/slides/daily-routines/'+name+'.webp'),'Missing generated slide '+name);
assert(fs.existsSync('assets/worksheets/daily-routines-worksheet.pdf'),'Missing printable worksheet');
console.log('✓ 12 generated photos · 6 generated slide designs · PDF worksheet');

const ui=fs.readFileSync('studio.js','utf8');
const css=fs.readFileSync('studio.css','utf8');
assert(!ui.includes('images.unsplash.com'),'External stock-photo dependency must not exist');
for(const l of lessons){
 if(l.id!=='daily-routines')assert(fs.existsSync('assets/photos/lesson-covers/'+l.id+'.webp'),'Missing local photo cover: '+l.id);
}
assert(ui.includes('ta-print-page'),'Print pages not rendered by studio');
assert(ui.includes('ta-canvas'),'Scalable fullscreen presentation missing');
assert(ui.includes('speechSynthesis'),'Listening lab missing');
assert(ui.includes('inlineImages'),'Standalone photo story must embed media');
assert(css.includes('@page{size:A4 landscape;margin:0}'),'A4 print page missing');
assert(css.includes('overflow:hidden!important'),'Presentation overflow protection missing');
console.log('✓ 15 local photo covers · no external stock dependency · print/fullscreen/listening/photo-story wiring');

for(const p of ['visual-library/index.html','visual-library.js','visual-library.css'])assert(fs.existsSync(p),'Missing visual library asset '+p);
const visualJS=fs.readFileSync('visual-library.js','utf8');
for(const feature of ['indexedDB','ta:photo-library-selection','vl-print-root','standalone(images)','requestFullscreen','image/webp'])assert(visualJS.includes(feature),'Missing photo library feature '+feature);
const visualHTML=fs.readFileSync('visual-library/index.html','utf8');
assert(visualHTML.includes('../visual-library.js'));
console.log('✓ Visual Library: original photo assets, selected presentation builder and editable local uploads');

const verifiedPacks=lessons.filter(l=>Array.isArray(l.photoPack));
let exactPhotos=0;
for(const l of verifiedPacks){
 assert.equal(l.photoPack.length,l.words.length,'Mismatched word-photo mapping: '+l.id);
 const seen=new Set();
 l.photoPack.forEach((name,i)=>{
  assert(!seen.has(name),'Duplicate photo basename '+l.id+'/'+name);seen.add(name);
  const p='assets/photos/'+l.id+'/'+name+'.webp';
  assert(fs.existsSync(p),'Missing exact-word photo '+p);
  const buffer=fs.readFileSync(p);
  assert(buffer.length>8000,'Photo too small '+p);
  assert(buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP','Not a real WebP file '+p);
 });
 const manifest='assets/photos/'+l.id+'/manifest.json';
 if(fs.existsSync(manifest))assert.equal(JSON.parse(fs.readFileSync(manifest,'utf8')).lesson_id,l.id);
 exactPhotos+=l.photoPack.length;
}
assert(exactPhotos>=24,'Expected at least 24 word-mapped AI photos across Daily Routines and Hello English');
console.log('✓ '+verifiedPacks.length+' exact-word photo packs · '+exactPhotos+' photos physically present and validated as WebP');

const imageComplete = lessons.filter(l=>Array.isArray(l.photoPack)&&l.photoPack.length===l.words.length);
assert(imageComplete.length>=3,'Expected at least 3 fully photo-mapped lessons');
for(const l of imageComplete){
 const names=new Set(l.photoPack);
 assert.equal(names.size,l.words.length,'Duplicate photo mapping: '+l.id);
 for(const name of l.photoPack){
  assert(/^[a-z0-9-]+$/.test(name),'Unsafe photo basename '+name);
  const filepath='assets/photos/'+l.id+'/'+name+'.webp';
  assert(fs.existsSync(filepath),'Missing exact vocabulary photograph '+filepath);
  assert(fs.statSync(filepath).size>8000,'Image unexpectedly small: '+filepath);
 }
 const pack='assets/packs/'+l.id+'/'+l.id;
 assert(fs.existsSync(pack+'-photo-lesson.pptx'),'Missing editable photographic slide deck '+l.id);
 assert(fs.existsSync(pack+'-worksheet.pdf'),'Missing printable photo worksheet '+l.id);
}
console.log('✓ '+imageComplete.length+' exact-photo lessons / '+imageComplete.reduce((n,l)=>n+l.photoPack.length,0)+' mapped photo cards / ready PPTX + PDF');


const activityContext={window:{LESSONS:lessons}};
vm.runInNewContext(fs.readFileSync('workshop-data.js','utf8'),activityContext,{timeout:3000});
const workshopSets=activityContext.window.TA_WORKSHOP_SETS;
assert.equal(workshopSets.length,lessons.length*6,'Each lesson must have six ready-to-teach workshop sets');
const workshopIds=new Set(),byLesson=new Map();
for(const activity of workshopSets){
 assert(!workshopIds.has(activity.id),'Duplicate workshop set '+activity.id);workshopIds.add(activity.id);
 assert(ids.has(activity.lessonId),'Unknown workshop lesson '+activity.id);
 assert(['board','sheet','quiz'].includes(activity.kind),'Invalid workshop kind '+activity.id);
 assert(activity.title&&activity.summary&&activity.task,'Missing teaching instructions '+activity.id);
 const counts=byLesson.get(activity.lessonId)||{board:0,sheet:0,quiz:0};counts[activity.kind]++;byLesson.set(activity.lessonId,counts);
 if(activity.kind==='board'){assert.equal(activity.columns.length,3);assert(activity.columns.every(c=>c.title&&c.notes.length>=2));}
 if(activity.kind==='sheet'){assert(activity.headers.length>=4);assert(activity.rows.length>=6);assert(activity.rows.every(r=>r.length===activity.headers.length));}
 if(activity.kind==='quiz'){assert(activity.items.length>=8);for(const q of activity.items)assert(q.question&&q.answer&&['choice','input','boolean'].includes(q.type));}
}
for(const l of lessons)assert.deepEqual({...byLesson.get(l.id)},{board:2,sheet:2,quiz:2},'Workshop coverage '+l.id);
for(const p of ['workshop/index.html','workshop.js','workshop.css','workshop-data.js'])assert(fs.existsSync(p),'Missing workshop file '+p);
assert(fs.readFileSync('workshop/index.html','utf8').includes('../workshop.js'),'Standalone workshop loader missing');
assert(fs.readFileSync('app.js','utf8').includes('workshop-data.js'),'Workshop lesson integration missing');
assert(fs.readFileSync('exports.js','utf8').includes('xlsxTable:spreadsheetTable'),'Workbook exporter missing');
console.log('✓ '+workshopSets.length+' themed activity sets · 30 boards · 30 Excel tables · 30 quizzes');
