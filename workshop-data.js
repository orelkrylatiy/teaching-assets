(function TeachingWorkshopSets(){
  "use strict";
  const lessons=window.LESSONS||[];
  const sets=[];
  const distinct=a=>[...new Set(a.filter(Boolean))];
  for(const l of lessons){
    const words=l.words||[];
    const wordList=words.slice(0,8).map(w=>`${w.en} — ${w.ru}`);
    const boards=[
      {suffix:"idea-wall",title:"Idea wall · Think / Ask / Create",summary:"Collect ideas, questions and examples before the discussion.",columns:[
        {title:"Notice · Что уже знаю",notes:distinct([...l.warmup.slice(0,2),...wordList.slice(0,2)])},
        {title:"Ask · Что обсудить",notes:distinct(l.questions.slice(0,4))},
        {title:"Create · Попробуем",notes:distinct([l.outcome,...l.grammar.models.slice(0,2)])}
      ],task:`Ask learners to move at least three notes and add their own examples about “${l.title}”.`},
      {suffix:"roleplay-board",title:"Role-play board · Plan / Speak / Reflect",summary:"Prepare a real dialogue, share useful language and give feedback.",columns:[
        {title:"Situation",notes:distinct([...l.situations.slice(0,2),l.questions[0]])},
        {title:"Useful language",notes:distinct([...l.grammar.models.slice(0,3),...words.slice(0,3).map(w=>w.example)])},
        {title:"Reflection",notes:distinct([l.teacherTip,"What went well?","What will I try next time?"])}
      ],task:"Work in pairs: plan a dialogue, move successful expressions into Reflection and add one improvement."}
    ];
    for(const b of boards)sets.push({id:l.id+"-"+b.suffix,lessonId:l.id,language:l.language||"en",level:l.level,kind:"board",title:b.title,summary:b.summary,task:b.task,minutes:15,columns:b.columns});
    const sheetRows=words.map(w=>[w.en,w.ru,w.example,"",""]);
    const checkRows=l.questions.slice(0,6).map((q,i)=>[q,String((i%3)+2),String((i%4)+1),String((i%2)+3),`=SUM(B${i+2}:D${i+2})`]);
    sets.push({
      id:l.id+"-word-workbook",lessonId:l.id,language:l.language||"en",level:l.level,kind:"sheet",title:(l.language==="sk"?"Slovak vocabulary · My examples":"Vocabulary workbook · My examples"),
      summary:"An editable language notebook with a personal example and confidence rating.",task:`Add your own ${l.language==="sk"?"Slovak":"English"} example in column D and rate confidence in column E from 1 to 5.`,
      minutes:12,headers:[l.language==="sk"?"Slovak expression":"English expression","Перевод","Model sentence","My sentence","Confidence 1–5"],rows:sheetRows
    });
    sets.push({
      id:l.id+"-class-survey",lessonId:l.id,language:l.language||"en",level:l.level,kind:"sheet",title:"Class survey · Scores & formulas",
      summary:"A miniature Excel-style classroom survey with live SUM formulas.",task:"Ask three learners to rate each prompt from 1 to 5; compare totals and update formulas.",
      minutes:15,headers:["Speaking prompt","Learner A","Learner B","Learner C","Total"],rows:checkRows
    });
    const vocabulary=words.slice(0,Math.min(10,words.length)).map((w,i)=>{
      const answers=distinct([w.ru,...words.filter(x=>x.ru!==w.ru).map(x=>x.ru).slice(i+1),...words.filter(x=>x.ru!==w.ru).map(x=>x.ru)]).slice(0,4);
      return {type:"choice",question:`Как переводится “${w.en}” на русский?`,options:answers,answer:w.ru,explanation:w.example};
    });
    const context=words.slice(0,10).map((w,i)=>{
      const other=words.find((x,j)=>j!==i&&x.ru!==w.ru)||w;
      if(i%3===2)return {type:"boolean",question:`“${w.en}” means “${i%2===0?w.ru:other.ru}”.`,answer:i%2===0?"True":"False",explanation:`${w.en} — ${w.ru}. ${w.example}`};
      const text=w.example.toLowerCase().includes(w.en.toLowerCase())?
        w.example.replace(new RegExp(w.en.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i"),"_____"):
        `Translate into ${l.language==="sk"?"Slovak":"English"}: ${w.ru}`;
      return {type:"input",question:text,answer:w.en,explanation:`${w.en} — ${w.ru}. ${w.example}`};
    });
    sets.push({id:l.id+"-vocabulary-quiz",lessonId:l.id,language:l.language||"en",level:l.level,kind:"quiz",title:"Vocabulary challenge · 10 questions",summary:"Choose the correct translation and receive instant feedback.",task:"Complete the round, review mistakes and try to improve your score.",minutes:8,items:vocabulary});
    sets.push({id:l.id+"-context-quiz",lessonId:l.id,language:l.language||"en",level:l.level,kind:"quiz",title:"Context challenge · Fill in & True/False",summary:"Write missing expressions and check statements in context.",task:"Complete the expressions without looking at the word bank.",minutes:10,items:context});
  }
  window.TA_WORKSHOP_SETS=sets;
  window.TA_WORKSHOP_KINDS={board:"Interactive board",sheet:"Editable spreadsheet",quiz:"Interactive quiz"};
})();
