(function TeachingExports(){
"use strict";
const encoder=new TextEncoder();
const xesc=s=>String(s??"").replace(/[<>&"']/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"}[c]));
const table=Array.from({length:256},(_,i)=>{let n=i;for(let j=0;j<8;j++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(data){let n=0xffffffff;for(const b of data)n=table[(n^b)&255]^(n>>>8);return(n^0xffffffff)>>>0;}
function combine(parts){const total=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(total);let off=0;for(const p of parts){out.set(p,off);off+=p.length;}return out;}
function zip(items){
 const locals=[],centrals=[];let offset=0;
 for(const [name,content] of items){
  const fn=encoder.encode(name),data=content instanceof Uint8Array?content:encoder.encode(content),crc=crc32(data);
  const local=new Uint8Array(30+fn.length),dv=new DataView(local.buffer);
  dv.setUint32(0,0x04034b50,true);dv.setUint16(4,20,true);dv.setUint16(6,0x800,true);dv.setUint16(8,0,true);dv.setUint32(14,crc,true);dv.setUint32(18,data.length,true);dv.setUint32(22,data.length,true);dv.setUint16(26,fn.length,true);local.set(fn,30);
  const central=new Uint8Array(46+fn.length),cv=new DataView(central.buffer);
  cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(10,0,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,fn.length,true);cv.setUint32(42,offset,true);central.set(fn,46);
  locals.push(local,data);centrals.push(central);offset+=local.length+data.length;
 }
 const centralData=combine(centrals),end=new Uint8Array(22),ed=new DataView(end.buffer);
 ed.setUint32(0,0x06054b50,true);ed.setUint16(8,items.length,true);ed.setUint16(10,items.length,true);ed.setUint32(12,centralData.length,true);ed.setUint32(16,offset,true);
 return new Blob([...locals,centralData,end],{type:"application/zip"});
}
function spreadsheet(l,download){
 const rows=[["English","Russian","Example","Level","Topic"],...l.words.map(w=>[w.en,w.ru,w.example,l.level,l.title])];
 const col=n=>String.fromCharCode(65+n);
 const sheet=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:E${rows.length}"/><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="17"/><cols><col min="1" max="1" width="25" customWidth="1"/><col min="2" max="2" width="29" customWidth="1"/><col min="3" max="3" width="53" customWidth="1"/></cols><sheetData>${rows.map((row,i)=>`<row r="${i+1}">${row.map((value,j)=>`<c r="${col(j)}${i+1}" t="inlineStr"><is><t xml:space="preserve">${xesc(value)}</t></is></c>`).join("")}</row>`).join("")}</sheetData></worksheet>`;
 const files=[
 ["[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
 ["_rels/.rels",`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
 ["xl/workbook.xml",`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Vocabulary" sheetId="1" r:id="rId1"/></sheets></workbook>`],
 ["xl/_rels/workbook.xml.rels",`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
 ["xl/styles.xml",`<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`],
 ["xl/worksheets/sheet1.xml",sheet]
 ];
 download(l.id+"-vocabulary.xlsx",zip(files),"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}
function zipCards(l,makeSvg,download){
 const entries=[["README.txt",`Teaching Assets — ${l.title}\n${l.level} · ${l.duration} min\nOriginal vector-style picture cards. Each SVG is editable and scalable.\n`]];
 l.words.forEach((w,i)=>{entries.push([`cards/${String(i+1).padStart(2,"0")}-${w.en.toLowerCase().replace(/[^a-z0-9]+/g,"-")}.svg`,makeSvg(l,w,false)]);});
 entries.push(["vocabulary.json",JSON.stringify(l.words,null,2)]);
 download(l.id+"-illustrations.zip",zip(entries),"application/zip");
}
function powerpoint(l,download){
  const nsP="http://schemas.openxmlformats.org/presentationml/2006/main";
  const nsA="http://schemas.openxmlformats.org/drawingml/2006/main";
  const nsR="http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const rel="http://schemas.openxmlformats.org/package/2006/relationships";
  const base="http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
  const style={mint:["EAF6EB","BCE2C8","3F7455"],peach:["FFF5EF","F3D7C7","9E6653"],lavender:["F7F6FF","DDD8F1","72699F"],sky:["F0FAFD","C6E6EF","4C7C91"],amber:["FFFAEF","F0DEB7","936D39"]}[l.style]||["F0F8F2","D6EADD","4A7558"];
  const W=12192000,H=6858000;
  const group=`<p:nvGrpSpPr><p:cNvPr id="1" name="Group"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>`;
  function shape(id,x,y,w,h,text,size=23,color="23382A",fill=null,bold=false){
    const bg=fill?`<a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>`:"<a:noFill/>";
    const textData=String(text||"").split("\n").map(t=>`<a:p><a:pPr algn="l"/><a:r><a:rPr lang="en-US" sz="${Math.round(size*100)}" ${bold?'b="1"':""}><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="Aptos"/></a:rPr><a:t>${xesc(t)}</a:t></a:r><a:endParaRPr lang="en-US"/></a:p>`).join("");
    return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Content ${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="${fill?"roundRect":"rect"}"><a:avLst/></a:prstGeom>${bg}<a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="${fill?180000:0}" tIns="${fill?100000:0}" rIns="${fill?130000:0}" bIns="0" anchor="ctr"/><a:lstStyle/>${textData}</p:txBody></p:sp>`;
  }
  const pages=[
    ["WELCOME",l.title,"cover",[l.subtitle,l.outcome]],
    ["01 · CHECK IN","A quick warm-up","list",l.warmup],
    ["02 · NOTICE & NAME","What can you see?","visual",l.words.slice(0,8)],
    ["03 · OUR GOAL","Today you will…","list",[l.outcome,"Use at least five new expressions.","Ask meaningful follow-up questions."]],
    ["04 · VISUAL VOCABULARY","Build your word bank","visual",l.words.slice(0,10)],
    ["05 · LANGUAGE MODEL",l.grammar.title,"list",l.grammar.models],
    ["06 · READ & NOTICE","A little story","quote",[l.story]],
    ["07 · LANGUAGE FOCUS","Spot the pattern","list",[l.grammar.rule,...l.grammar.models]],
    ["08 · TALK TOGETHER","Conversation starters","list",l.questions.slice(0,4)],
    ["09 · PICTURE TALK","Say it with pictures","visual",l.words.slice(2,12)],
    ["10 · ROLE-PLAY","Real-world challenge","list",l.situations],
    ["11 · GO DEEPER","Keep talking","list",l.questions.slice(3)],
    ["12 · EXIT TICKET","Your takeaway","list",["One new expression","One new idea","One thing to practise next time"]],
    ["13 · HOMEWORK","Your mini challenge","quote",[l.homework]]
  ];
  const slideFiles=pages.map(([k,title,kind,items],idx)=>{
    let shapes=shape(2,670000,370000,10800000,370000,k,14,style[2],null,true)+shape(3,670000,860000,10850000,860000,title,37,"263B2D",null,true);
    if(kind==="visual"){
      items.forEach((word,i)=>{
        const x=650000+(i%5)*2220000,y=1940000+Math.floor(i/5)*1940000;
        shapes+=shape(10+i,x,y,2070000,1740000,word.icon+"\n"+word.en,21,style[2],"FFFFFF",true);
      });
    }else if(kind==="list"){
      items.forEach((item,i)=>{
        const cols=items.length>4?2:1,rows=Math.ceil(items.length/cols);
        const x=670000+(i%cols)*(cols===2?5560000:0);
        const y=1970000+Math.floor(i/cols)*(Math.floor(4010000/rows));
        const w=cols===2?5370000:10840000;
        shapes+=shape(10+i,x,y,w,Math.max(630000,Math.floor(4010000/rows)-110000),String(item),items.length>5?19:23,style[2],"FFFFFF",false);
      });
    }else if(kind==="cover"){
      shapes+=shape(10,670000,1980000,10500000,1800000,items.join("\n"),25,style[2],"FFFFFF",false);
      shapes+=shape(11,8890000,4050000,1800000,1380000,l.icon,67,style[2],style[1],true);
    }else{
      shapes+=shape(10,690000,1950000,10800000,3020000,items[0],25,style[2],"FFFFFF");
    }
    shapes+=shape(99,690000,6270000,8500000,250000,"teaching assets  /  "+l.level+"  /  "+l.duration+" min",11,"81958A");
    shapes+=shape(100,11350000,6270000,400000,260000,`${idx+1} / ${pages.length}`,11,"81958A");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="${nsA}" xmlns:r="${nsR}" xmlns:p="${nsP}"><p:cSld name="${xesc(title)}"><p:bg><p:bgPr><a:solidFill><a:srgbClr val="${style[0]}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>${group}${shapes}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
  });
  const r=type=>base+type;
  const relation=(rows)=>`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${rel}">${rows.map(([id,type,target])=>`<Relationship Id="${id}" Type="${r(type)}" Target="${target}"/>`).join("")}</Relationships>`;
  const clrScheme=`<a:clrScheme name="Teaching Assets"><a:dk1><a:sysClr val="windowText" lastClr="202C22"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="23382A"/></a:dk2><a:lt2><a:srgbClr val="${style[0]}"/></a:lt2>${["3F7455","739F81","E4AD8E","8475AF","6B9FB5","C6A66D"].map((x,i)=>`<a:accent${i+1}><a:srgbClr val="${x}"/></a:accent${i+1}>`).join("")}<a:hlink><a:srgbClr val="0066CC"/></a:hlink><a:folHlink><a:srgbClr val="664499"/></a:folHlink></a:clrScheme>`;
  const fill=`<a:solidFill><a:schemeClr val="accent1"/></a:solidFill>`;
  const line=`<a:ln w="9525"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill><a:prstDash val="solid"/></a:ln>`;
  const effect="<a:effectStyle><a:effectLst/></a:effectStyle>";
  const theme=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="${nsA}" name="Teaching Assets"><a:themeElements>${clrScheme}<a:fontScheme name="Teaching Assets"><a:majorFont><a:latin typeface="Aptos Display"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Teaching Assets"><a:fillStyleLst>${fill.repeat(3)}</a:fillStyleLst><a:lnStyleLst>${line.repeat(3)}</a:lnStyleLst><a:effectStyleLst>${effect.repeat(3)}</a:effectStyleLst><a:bgFillStyleLst>${fill.repeat(3)}</a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>`;
  const cm=`accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" bg1="lt1" bg2="lt2" tx1="dk1" tx2="dk2" hlink="hlink" folHlink="folHlink"`;
  const master=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="${nsA}" xmlns:r="${nsR}" xmlns:p="${nsP}"><p:cSld name="Master"><p:spTree>${group}</p:spTree></p:cSld><p:clrMap ${cm}/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>`;
  const layout=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="${nsA}" xmlns:r="${nsR}" xmlns:p="${nsP}" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree>${group}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;
  const contentTypes=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${pages.map((_,i)=>`<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("")}</Types>`;
  const presentation=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="${nsA}" xmlns:r="${nsR}" xmlns:p="${nsP}"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${pages.map((_,i)=>`<p:sldId id="${256+i}" r:id="rId${i+2}"/>`).join("")}</p:sldIdLst><p:sldSz cx="${W}" cy="${H}" type="screen16x9"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle/></p:presentation>`;
  const files=[
    ["[Content_Types].xml",contentTypes],
    ["_rels/.rels",relation([["rId1","officeDocument","ppt/presentation.xml"]])],
    ["ppt/presentation.xml",presentation],
    ["ppt/_rels/presentation.xml.rels",relation([["rId1","slideMaster","slideMasters/slideMaster1.xml"],...pages.map((_,i)=>["rId"+(i+2),"slide","slides/slide"+(i+1)+".xml"])])],
    ["ppt/slideMasters/slideMaster1.xml",master],
    ["ppt/slideMasters/_rels/slideMaster1.xml.rels",relation([["rId1","slideLayout","../slideLayouts/slideLayout1.xml"],["rId2","theme","../theme/theme1.xml"]])],
    ["ppt/slideLayouts/slideLayout1.xml",layout],
    ["ppt/slideLayouts/_rels/slideLayout1.xml.rels",relation([["rId1","slideMaster","../slideMasters/slideMaster1.xml"]])],
    ["ppt/theme/theme1.xml",theme],
    ...slideFiles.flatMap((xml,i)=>[["ppt/slides/slide"+(i+1)+".xml",xml],["ppt/slides/_rels/slide"+(i+1)+".xml.rels",relation([["rId1","slideLayout","../slideLayouts/slideLayout1.xml"]])]])
  ];
  download(l.id+"-presentation.pptx",zip(files),"application/vnd.openxmlformats-officedocument.presentationml.presentation");
}
window.TAExports={xlsx:spreadsheet,zipCards,pptx:powerpoint,zip};
})();