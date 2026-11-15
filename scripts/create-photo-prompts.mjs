#!/usr/bin/env node
// Generate editable AI-image shot briefs from the existing 15 English lesson datasets.
// Does NOT call an API or claim photographs have been generated.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const context={window:{}};
vm.runInNewContext(fs.readFileSync('data.js','utf8'),context);
const l=context.window.LESSONS;
const style='Realistic high-end editorial lifestyle photograph. Contemporary natural-light environment, truthful proportions, soft muted colors, quiet confidence. Authentic human moments where useful, no typography, no visible text labels, no logos, no watermark, no vector art, no emojis. Original illustration for an English teacher’s flashcard; central subject large and unambiguous.';
const entries=l.map(lesson=>({
  lesson:lesson.id,title:lesson.title,level:lesson.level,
  cards:lesson.words.map((word,i)=>({
    index:i+1,
    expression:word.en,
    example:word.example,
    translation:word.ru,
    prompt:style+' Theme: '+lesson.title+'. Teach the word/phrase "'+word.en+'". A concrete photograph depicting: '+word.example+' Keep the focus tightly tied to the learning objective and do not invent signage or English words inside the photo.',
    review_required:true
  }))
}));
const count=entries.reduce((n,l)=>n+l.cards.length,0);
const out=process.argv[2]||'prompts/english-photo-shotlist.json';
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify({version:1,style,lessons:entries,cardCount:count},null,2)+'\n');
console.log('✓ '+count+' prompts across '+entries.length+' lessons → '+out);
