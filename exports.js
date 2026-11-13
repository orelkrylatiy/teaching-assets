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
window.TAExports={xlsx:spreadsheet,zipCards,zip};
})();