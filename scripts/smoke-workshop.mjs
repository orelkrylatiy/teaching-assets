import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const window={};
const context={window,TextEncoder,Blob,Uint8Array,DataView,URL,console,setTimeout};
for(const file of ['data.js','slovak-lessons.js','english-extension.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{timeout:5000});
vm.runInNewContext(fs.readFileSync('workshop-data.js','utf8'),context,{timeout:5000});
vm.runInNewContext(fs.readFileSync('exports.js','utf8'),context,{timeout:5000});
for(const file of ['app.js','workshop.js','workshop-data.js','exports.js']){
 new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
}
const sets=window.TA_WORKSHOP_SETS;
assert.equal(sets.length,210);
assert.equal(sets.filter(s=>s.language==='sk').length,90);
assert.equal(new Set(sets.map(s=>s.id)).size,90);
const source=sets.find(s=>s.id==='hello-english-class-survey');
assert(source&&source.rows[0][4]==='=SUM(B2:D2)');
const table={...source,calculate:(row,col)=>{
 if(col!==4)return NaN;
 return source.rows[row].slice(1,4).reduce((sum,v)=>sum+Number(v),0);
}};
let saved=null;
window.TAExports.xlsxTable(table,(name,blob,type)=>{saved={name,blob,type};});
assert(saved&&saved.name==='hello-english-class-survey.xlsx','Custom workbook missing');
assert.equal(saved.type,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
const xlsx=Buffer.from(await saved.blob.arrayBuffer());
assert.equal(xlsx.readUInt32LE(0),0x04034b50,'Export is not a ZIP archive');
assert(xlsx.includes(Buffer.from('xl/worksheets/sheet1.xml')),'Worksheet XML file missing');
assert(xlsx.includes(Buffer.from('<f>SUM(B2:D2)</f><v>6</v>')),'Excel SUM formula lost');
assert(xlsx.includes(Buffer.from('Speaking prompt')),'Worksheet heading missing');
assert(xlsx.includes(Buffer.from('xlsx'))===false||xlsx.length>1000);
const book=sets.find(s=>s.id==='hello-english-word-workbook');
assert.equal(book.rows.length,12,'Vocabulary workbook coverage reduced');
console.log('✓ Workshop smoke: 210 sets, syntax, valid XLSX ZIP, editable formula cells and vocabulary workbook');
