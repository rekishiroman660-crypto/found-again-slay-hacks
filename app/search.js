export const seed=[
'Blue waterproof jacket with damaged zipper at library counter',
'Navy tote bag with orange patch by library stairs',
'Black metal water bottle with green lid near gym benches',
'Silver headphones with blue cord in music room',
'Red folding umbrella with wooden handle at east entrance',
'Yellow insulated lunch bag with floral print in cafeteria',
'Blue folding umbrella with plastic handle at west entrance',
'Green backpack with two padded shoulder straps at bus stop'];
const aliases={navy:'blue',raincoat:'jacket',coat:'jacket',zip:'zipper',broken:'damaged',headset:'headphones',canteen:'bottle',rucksack:'backpack',grey:'gray'};
const stop=new Set('a an the of with at by on from it lost left my i and to in near any had can was'.split(' '));
export function tokenize(s){return (s.toLowerCase().match(/[a-z0-9]+/g)||[]).filter(w=>!stop.has(w)).map(w=>aliases[w]||w)}
// Preserved original algorithm: same aliases, stop words, TF-IDF, cosine, >0 cutoff, top 3.
export function baseline(query,inventory){const docs=inventory.map(tokenize),freq=new Map;for(const words of docs)for(const w of new Set(words))freq.set(w,(freq.get(w)||0)+1);function vector(words){const v=new Map;for(const w of words)v.set(w,(v.get(w)||0)+1);let norm=0;for(const [w,n] of v){const val=(1+Math.log(n))*(1+Math.log((1+docs.length)/(1+(freq.get(w)||0))));v.set(w,val);norm+=val*val}return [v,Math.sqrt(norm)]}const [q,qn]=vector(tokenize(query));return docs.map((words,i)=>{const [v,vn]=vector(words),shared=[...v.keys()].filter(w=>q.has(w));const score=shared.reduce((a,w)=>a+q.get(w)*v.get(w),0)/(qn*vn||1);return {text:inventory[i],score,index:i,shared}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3)}
export const THRESHOLD=0.40; // Fixed before the first benchmark; heuristic, not calibrated probability.
const terms=['red','blue','navy','green','black','white','yellow','orange','silver','gray','grey','brown','purple','pink','jacket','coat','raincoat','umbrella','bottle','backpack','rucksack','bag','tote','headphones','headset','watch','phone','wallet','keys'];
const normal=w=>aliases[w]||w;
// Deliberately narrow rule layer. Model embeddings alone are unreliable at negation.
export function parseQuery(query){let excluded=[];let unsupported=false;
const positive=query.toLowerCase().replace(/\b(?:not|no|without)\s+(?:(?:a|an|the)\s+)?([a-z]+)\b/g,(all,word)=>{if(!terms.includes(word)){unsupported=true;return all}excluded.push(normal(word));return ' '});
if(/\b(?:not|no|without|isn't|isnt|wasn't|wasnt|neither|except|don't|doesn't|never)\b/.test(positive))unsupported=true;
// Do not pretend complex coordinated negation is understood.
if(excluded.length && /\b(?:or|nor)\b/.test(positive))unsupported=true;
return {positive:positive.replace(/\s+/g,' ').trim(),excluded:[...new Set(excluded)],unsupported};}
export function rankVectors(query,inventory,vectors,qvector){const parsed=parseQuery(query);if(parsed.unsupported)return {hits:[],parsed,blocked:0};let blocked=0;
const hits=inventory.map((text,index)=>{const words=tokenize(text);if(parsed.excluded.some(w=>words.includes(w))){blocked++;return null}return {text,index,score:vectors[index].reduce((s,x,j)=>s+x*qvector[j],0)}}).filter(x=>x&&x.score>=THRESHOLD).sort((a,b)=>b.score-a.score).slice(0,3);
return {hits,parsed,blocked};}
