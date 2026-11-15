import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';import {baseline,seed,parseQuery,rankVectors} from '../app/search.js';
const old=fs.readFileSync(new URL('../reference/original-index.html',import.meta.url),'utf8');const src=old.split('<script>')[1].split("const items=document")[0];const context=vm.createContext({});vm.runInContext(src,context);
for(const q of ['navy raincoat broken zip','folding umbrella not red','orange pill box','']){
 const expected=vm.runInContext(`rank(${JSON.stringify(q)},${JSON.stringify(seed)})`,context);const got=baseline(q,seed).map(({text,score,shared})=>({text,score,shared}));assert.equal(JSON.stringify(got),JSON.stringify(expected));}
assert.deepEqual(parseQuery('umbrella not red').excluded,['red']);assert.deepEqual(parseQuery('not a raincoat').excluded,['jacket']);assert.equal(parseQuery('neither red nor blue').unsupported,true);assert.equal(parseQuery('without a pattern').unsupported,true);
assert.equal(rankVectors('not red umbrella',['Red umbrella','Blue umbrella'],[[1,0],[1,0]],[1,0]).hits[0].index,1);
console.log('PASS: baseline parity 4; simple exclusions 2; clarification 2; exclusion before ranking 1.');
