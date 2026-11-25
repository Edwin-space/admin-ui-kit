/* No browser dependency; verifies the real render and event code with DOM stubs. */
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const src = name => fs.readFileSync(path.join(__dirname,'..','src',name),'utf8');
const main={classList:{toggle(){}},innerHTML:'',focus(){},contains(){return true;},querySelector(){return {focus(){}};},querySelectorAll(){return [];}};
const results={innerHTML:''}, announcement={textContent:''}, dialog={shown:false,showModal(){this.shown=true;},close(){this.shown=false;}}, detail={};
const bindings={}, windowBindings={}, nav=['#overview','#components','#blocks'].map(hash=>({hash,setAttribute(){},removeAttribute(){}}));
const document={querySelector(selector){return ({'#main':main,'#announcement':announcement,'#activity-results':results,'#review':dialog,'#review-detail':detail,'.skip':{addEventListener(){}}})[selector];},querySelectorAll(){return nav;},activeElement:{}};
main.addEventListener=(type,fn)=>bindings[type]=fn;
const s={document, location:{hash:''}, Intl, Date, clearTimeout(){}, setTimeout(fn){fn();return 1;}};
s.window=s;s.addEventListener=(type,fn)=>windowBindings[type]=fn;
const sandbox=vm.createContext(s);
for(const file of ['components.js','fixtures.js','catalog.js','reference-blocks.js','app.js'])vm.runInContext(src(file),sandbox,{filename:file});
const render=view=>{s.location.hash='#'+view;windowBindings.hashchange();};
const change=(id,value)=>bindings.change({target:{id,value}});
const click=(attribute,dataset={})=>bindings.click({target:{closest:()=>({disabled:false,dataset,hasAttribute:name=>name===attribute})}});
(async()=>{
  assert.match(main.innerHTML,/운영 대시보드/); render('overview'); assert.match(main.innerHTML,/운영 화면을 위한/);
  assert.match(s.AdminKit.badge('<img>','bad'),/&lt;img&gt;/);
  assert.match(s.AdminKit.stat({label:'Zero',value:0}),/>0<\/strong>/);
  render('components');
  assert.equal((main.innerHTML.match(/data-item-id=/g)||[]).length,43);
  assert.equal(s.AdminDashboardCatalog.length,21);
  const kpiPreview=s.AdminDashboardCatalog.find(i=>i.id==='metricGrid');
  const kpiMarkup=s.AdminReference.metricGrid(...kpiPreview.args);
  assert.ok(main.innerHTML.includes(kpiMarkup));
  assert.ok(main.innerHTML.includes('#components/approvalBody'));
  assert.equal(new Set(s.AdminCatalog.map(i=>i[0])).size,22);
  assert.equal(s.AdminCatalog.filter(i=>i[2].startsWith('영상')).length,13);
  for(const [id,,, ,args] of s.AdminCatalog){assert.equal(typeof s.AdminKit[id],'function');assert.ok(s.AdminKit[id](...args).startsWith('<'));}
  assert.doesNotMatch(s.AdminKit.sidebar({title:'<bad>',items:[{label:'nav',href:'javascript:alert(1)'}]}),/javascript:|<bad>/);
  assert.match(s.AdminKit.progress({label:'진행',value:250}),/value="100"/);
  assert.match(s.AdminKit.textField({id:'field',label:'입력',error:'오류'}),/aria-invalid="true" aria-describedby="field-error"/);
  assert.match(s.AdminKit.pagination({page:1,total:3}),/page:0" disabled/);
  render('blocks'); assert.equal((main.innerHTML.match(/class="rb-metric"/g)||[]).length,4); assert.ok(main.innerHTML.includes(kpiMarkup));
  bindings.input({target:{id:'query',value:'내보내기'}});assert.match(results.innerHTML,/내보내기/);assert.doesNotMatch(results.innerHTML,/권한 변경/);
  change('filter','완료');assert.match(results.innerHTML,/조건에 맞는 활동이 없습니다/);
  change('scenario','loading');assert.match(main.innerHTML,/불러오는 중/);
  change('scenario','empty');assert.match(main.innerHTML,/처리할 일이 없습니다/);
  change('scenario','error');assert.match(main.innerHTML,/활동을 불러오지 못했어요/);
  await click('data-retry');assert.doesNotMatch(main.innerHTML,/활동을 불러오지 못했어요/);
  change('scenario','offline');assert.match(main.innerHTML,/연결이 끊겼습니다/);assert.match(main.innerHTML,/data-ak-action="review:RQ-101" disabled/);
  await click('data-retry');assert.match(main.innerHTML,/연결 복구됨/);assert.doesNotMatch(main.innerHTML,/data-ak-action="review:RQ-101" disabled/);
  render('queue');
  for(const id of ['RQ-101','RQ-102','RQ-103']){
    await click('',{akAction:'review:'+id});assert.equal(dialog.shown,true);assert.match(detail.textContent,new RegExp(id));
    await click('',{akAction:'review-confirm'});assert.equal(dialog.shown,false);
  }
  assert.match(main.innerHTML,/처리할 일이 없습니다/);
  console.log('PASS: component render, escaping, zero, catalog, filter, mock states and review workflow');
})().catch(err=>{console.error(err);process.exitCode=1;});
