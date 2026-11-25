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
const components=scope.AdminCatalog.map(([id,title,source,desc,args])=>({...entry(id,title,desc,args,'component',files,'AdminKit'),source,previewUrl:'https://edwin-space.github.io/admin-ui-kit/#components/'+id}));
const blocks=scope.AdminDashboardCatalog.map(item=>{
  const {id,title,description,args,section,variants=[],demoDataOnly,demoChart,hostBehavior}=item;
  const base=entry(id,title,description,args,demoDataOnly?'pattern':'block',ref,'AdminReference');
  return {...base,section,previewUrl:'https://edwin-space.github.io/admin-ui-kit/#components/'+id,
    ...(demoDataOnly?{demoDataOnly:true}:{}),...(demoChart?{containsDemoChart:true}:{}),
    hostBehavior:hostBehavior??(demoDataOnly?'Visual example only. Use your own data and calculation.':base.hostBehavior),
    variants:variants.map(v=>({title:v.title,call:entry(id,title,description,v.args,base.type,ref,'AdminReference').example.call}))};
});
const result={schemaVersion:1,kitVersion:'0.5.0',sourceRepository:'https://github.com/Edwin-space/admin-ui-kit',entrypoint:'AGENTS.md',layout:'docs/design/LAYOUT-SPEC.md',starter:'examples/starter.html',blocksExample:'examples/blocks-starter.html',import:{html:{scope:'.ak (add .rb-page for AdminReference blocks)',styles:files.slice(0,2),script:files[2]},framework:'Prefer mapping existing React/Vue components to these tokens and states. Not an npm package or a shadcn CLI registry.',exclude:['src/fixtures.js','src/catalog.js','src/app.js','src/kit.css']},components,blocks};
fs.writeFileSync(path.join(root,'registry/index.json'),JSON.stringify(result,null,2)+'\n');
