'use strict';
const fs=require('fs');
const path=require('path');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]).filter(f=>f.endsWith('.js'))}
for(const file of walk(path.join(root,'js')))execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
console.log('syntax: all JavaScript files OK');
