import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const target=path.join(root,'dist');
fs.rmSync(target,{recursive:true,force:true});
fs.mkdirSync(target,{recursive:true});
for(const item of ['index.html','css','js','data','assets'])fs.cpSync(path.join(root,item),path.join(target,item),{recursive:true});
fs.writeFileSync(path.join(target,'.nojekyll'),'');
console.log('AtC/OS static build ready:',target);
