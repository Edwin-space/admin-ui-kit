/* Regenerate: node scripts/build-registry.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'), scope=vm.createContext({});
scope.window=scope;
for(const name of ['components','fixtures','catalog','reference-blocks'])
  vm.runInContext(fs.readFileSync(path.join(root,'src',name+'.js'),'utf8'),scope);
const files=['src/tokens.css','src/components.css','src/components.js'];
const ref=[...files,'src/reference-blocks.css','src/reference-blocks.js'];
const actions={
  connection:'data-retry: host decides whether and how to retry, then supplies actual connection state.',
  pageHeader:'data-ak-action: bind the supplied action in the host.',
  workQueue:'review:<id>: open the real review flow; set disabled while writes are unavailable.',
  button:'data-ak-action: bind to existing host behavior.',
  pagination:'page:<n>: update host pagination and query.',
  confirmDialog:'Use showModal/close and bind the confirm action; restore focus to the trigger.'
};
function entry(id,title,description,args,type,requiredFiles,namespace){
  if(typeof scope[namespace][id]!=='function')throw Error(id+' is not exported');
  return {id,title,type,description,requiredFiles,example:{call:namespace+'.'+id+'('+args.map(a=>JSON.stringify(a)).join(', ')+')'},hostBehavior:actions[id]??'Display only or native HTML input/navigation. Bind host state and events as needed.'};
}
const components=scope.AdminCatalog.map(([id,title,source,desc,args])=>({...entry(id,title,desc,args,'component',files,'AdminKit'),source}));
const {activity,queue}=scope.AdminFixtures;
const blocks=[
  entry('activity','활동 시계와 이벤트 목록','시간·유형·설명·상태를 나란히 보여준다.',[{rows:activity.slice(0,2),emptyState:''}],'block',ref,'AdminReference'),
  {...entry('requestList','승인 요청 카드 목록','제목, 설명, 배지와 우측 중앙 검토 버튼. 승인 가능한 데이터는 호스트가 정한다.',[{rows:queue.slice(0,2),disabled:false}],'block',ref,'AdminReference'),hostBehavior:actions.workQueue},
  entry('metric','KPI 카드와 미니 차트','요약 카드에 예시 스파크 차트 표시. 실데이터에서 quiet:true로 예시 차트를 끈다.',[{label:'처리 대기',value:3,detail:'예제',symbol:'queue',tone:'warn',index:1,quiet:true}],'block',ref,'AdminReference'),
  ...[['comparison','목표 대비 편차'],['thresholds','실행 임박 예시'],['impact','자동화 효과 예시']].map(([id,title])=>({...entry(id,title,'시각 패턴 전용. 값이 내장된 데모이므로 실서비스에는 그대로 호출하지 않는다.',[],'pattern',ref,'AdminReference'),demoDataOnly:true}))
];
const result={schemaVersion:1,kitVersion:'0.4.0',sourceRepository:'https://github.com/Edwin-space/admin-ui-kit',entrypoint:'AGENTS.md',layout:'docs/design/LAYOUT-SPEC.md',starter:'examples/starter.html',blocksExample:'examples/blocks-starter.html',import:{html:{scope:'.ak',styles:files.slice(0,2),script:files[2]},framework:'Prefer mapping existing React/Vue components to these tokens and states. Not an npm package or a shadcn CLI registry.',exclude:['src/fixtures.js','src/catalog.js','src/app.js','src/kit.css']},components,blocks};
fs.writeFileSync(path.join(root,'registry/index.json'),JSON.stringify(result,null,2)+'\n');
