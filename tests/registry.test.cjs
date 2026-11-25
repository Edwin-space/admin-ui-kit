'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const manifest=JSON.parse(read('registry/index.json'));
assert.equal(manifest.components.length,22);
assert.equal(manifest.blocks.length,6);
for(const p of [manifest.entrypoint,manifest.layout,manifest.starter,manifest.blocksExample])assert.ok(read(p));
const ids=new Set();
for(const entry of [...manifest.components,...manifest.blocks]){
  assert.ok(!ids.has(entry.id));ids.add(entry.id);
  const context=vm.createContext({});
  for(const p of entry.requiredFiles){
    assert.ok(!manifest.import.exclude.includes(p));assert.ok(read(p));
    if(p.endsWith('.js'))vm.runInContext(read(p),context);
  }
  const html=vm.runInContext(entry.example.call,context);
  assert.match(html,/^</);assert.ok(!html.includes('undefined'));
}
const html=read(manifest.blocksExample);
const ctx=vm.createContext({document:{querySelector:id=>slots[id]}});
const slots=Object.fromEntries(['#events','#requests','#status'].map(k=>[k,{addEventListener:(event,fn)=>slots[k][event]=fn}]));
for(const match of html.matchAll(/<script(?: src="\.\.\/([^"]+)")?>([\s\S]*?)<\/script>/g))vm.runInContext(match[1]?read(match[1]):match[2],ctx);
assert.match(slots['#events'].innerHTML,/예제 보고서/);
assert.match(slots['#requests'].innerHTML,/data-ak-action="review:demo-1"/);
slots['#requests'].click({target:{closest:()=>({dataset:{akAction:'review:demo-1'}})}});
assert.match(slots['#status'].textContent,/호스트에서 검토 이벤트를 받았습니다/);
console.log('PASS: 22 independent components, six block/pattern entries, standalone host event.');
