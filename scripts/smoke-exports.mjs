import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
for(const file of ['data.js','exports.js','app.js','studio.js'])execFileSync(process.execPath,['--check',file]);
const browser={window:{},TextEncoder,Blob};
vm.runInNewContext(fs.readFileSync('data.js','utf8'),browser,{timeout:5000});
vm.runInNewContext(fs.readFileSync('exports.js','utf8'),browser,{timeout:5000});
const lesson=browser.window.LESSONS[0],exports=browser.window.TAExports;
const temp=mkdtempSync(path.join(os.tmpdir(),'teach-assets-'));
function capture(name,blob){writeFileSync(path.join(temp,name),Buffer.from(new Uint8Array(0)));return blob.arrayBuffer().then(data=>writeFileSync(path.join(temp,name),Buffer.from(data)));}
const tasks=[];
function download(name,blob){tasks.push(capture(name,blob));}
exports.xlsx(lesson,download);
exports.pptx(lesson,download);
exports.zipCards(lesson,(l,w)=>'<svg xmlns="http://www.w3.org/2000/svg"><text>'+w.en+'</text></svg>',download);
await Promise.all(tasks);
const paths=fs.readdirSync(temp).map(n=>path.join(temp,n));
assert.equal(paths.length,3,'Expected .xlsx, .pptx and .zip');
function entries(file){
 const buf=fs.readFileSync(file),names=[];let offset=0;
 while(offset+30<buf.length&&buf.readUInt32LE(offset)===0x04034b50){
  const n=buf.readUInt16LE(offset+26),e=buf.readUInt16LE(offset+28),data=buf.readUInt32LE(offset+18);
  names.push(buf.subarray(offset+30,offset+30+n).toString('utf8'));
  offset+=30+n+e+data;
 }
 return names;
}
const xlsx=paths.find(x=>x.endsWith('.xlsx')),pptx=paths.find(x=>x.endsWith('.pptx')),cards=paths.find(x=>x.endsWith('.zip'));
assert(entries(xlsx).includes('xl/worksheets/sheet1.xml'));
assert.equal(entries(pptx).filter(x=>/^ppt\/slides\/slide\d+\.xml$/.test(x)).length,14);
assert.equal(entries(cards).filter(x=>x.endsWith('.svg')).length,lesson.words.length);
execFileSync('python3',['-c',`import sys,zipfile,xml.etree.ElementTree as E
for path in sys.argv[1:]:
 with zipfile.ZipFile(path) as z:
  assert z.testzip() is None
  for name in z.namelist():
   if name.endswith('.xml') or name.endswith('.rels'):
    E.fromstring(z.read(name))
print('✓ ZIP container and XML well formed')`,xlsx,pptx,cards],{stdio:'inherit'});
console.log('✓ browser exporters: XLSX, PPTX (14 slides), SVG ZIP ('+lesson.words.length+' cards)');
if(fs.existsSync('dist')){
 const output=path.join('dist','examples');fs.mkdirSync(output,{recursive:true});
 for(const file of paths)fs.copyFileSync(file,path.join(output,path.basename(file)));
 console.log('✓ Sample exports copied to dist/examples for inspection');
}
rmSync(temp,{recursive:true,force:true});
