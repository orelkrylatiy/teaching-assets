import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
execFileSync('node',['scripts/verify.mjs'],{stdio:'inherit'});
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist',{recursive:true});
for(const file of ['index.html','data.js','exports.js','app.js','style.css'])fs.copyFileSync(file,path.join('dist',file));
fs.cpSync('lessons','dist/lessons',{recursive:true});fs.cpSync('assets','dist/assets',{recursive:true});
fs.writeFileSync('dist/.nojekyll','');
console.log('✓ Production-ready static site written to dist/');
