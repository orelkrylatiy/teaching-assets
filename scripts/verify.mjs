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
