(function () {
  'use strict';
  const kit=window.AdminKit, data=window.AdminFixtures, rb=window.AdminReference, {e,icon,badge,stat}=kit;
  const main=document.querySelector('#main'), announcement=document.querySelector('#announcement');
  let state='normal', query='', filter='all', queue=data.queue.slice(), activeId=null, timer=null, synced='', decisions=[];
  const choices={normal:'기본',loading:'로딩',empty:'빈 화면',error:'조회 오류',offline:'연결 끊김'};
  function route() {
    const value=location.hash.slice(1);
    if(value.startsWith('components/'))return 'components';
    return ['overview','components','blocks','queue'].includes(value)?value:'blocks';
  }
  const intro=(label,title,detail)=>'<div class="intro"><span class="eyebrow">'+label+'</span><h1>'+title+'</h1><p>'+detail+'</p></div>';
  const link=(to,label,primary=false)=>'<a href="#'+to+'" class="ak-button '+(primary?'ak-button--primary':'')+'">'+label+icon('arrow')+'</a>';
  function overview() {
    return '<section class="hero"><div>'+intro('DESIGN SYSTEM / 01','운영 화면을 위한<br>관리자 UI 키트','레이아웃부터 로딩·빈 화면까지, 프로젝트마다 다시 설계하지 않아도 되는 관리자 화면의 출발점입니다.')+'<div class="hero-actions">'+link('blocks','대시보드 보기',true)+link('components','컴포넌트 탐색')+'</div></div><div class="teaser ak"><div class="teaser-top"><span>'+icon('layers')+' 운영 개요</span>'+badge('미리보기','accent')+'</div><div class="teaser-grid">'+stat(data.stats[0])+stat(data.stats[2])+'</div><div class="teaser-line"><span class="teaser-dot"></span><div><strong>정기 보고서 생성</strong><small>오늘 09:41 · 보고서</small></div>'+badge('완료','good')+'</div><div class="teaser-line"><span class="teaser-dot purple"></span><div><strong>권한 변경 요청</strong><small>오늘 09:28 · 권한</small></div>'+badge('대기','warn')+'</div></div></section><div class="tiles">'+[['01','공통 규칙','색상·여백·타이포그래피를 한 곳에 두고 프로젝트에 맞춰 조정합니다.','components'],['02','컴포넌트','카드, 배지, 활동 표, 빈 상태처럼 한 가지 역할에 집중하는 부품을 골라 씁니다.','components'],['03','화면 예제','운영 대시보드와 처리 대기열을 실행하고 조회 상태를 직접 바꿔봅니다.','blocks']].map(([n,t,d,r])=>'<a class="tile" href="#'+r+'"><span>'+n+'</span><strong>'+t+'</strong><p>'+d+'</p>'+icon('arrow')+'</a>').join('')+'</div>';
  }
  const entries=window.AdminCatalog, dashboardEntries=window.AdminDashboardCatalog;
  const catalogSections=['화면 뼈대','요약 지표','활동·승인','차트·연결','조합 레이아웃','범용 부품'];
  const sourceMap=Object.fromEntries(dashboardEntries.map(item=>[item.id,item]));
  const generalEntries=entries.map(([id,title,source,description,args])=>({id,title,description,args,section:'범용 부품',source}));
  let catalogFilter='dashboard', catalogQuery='';
  const highlightedId=()=>location.hash.startsWith('#components/')?location.hash.slice(12):'';
  const snippet=(item,args=item.args)=>'document.querySelector("#example").innerHTML = '+(item.section==='범용 부품'?'AdminKit.':'AdminReference.')+item.id+'('+args.map(arg=>JSON.stringify(arg,null,2)).join(', ')+');';
  function stage(item,args=item.args){
    if(item.section!=='범용 부품')return rb[item.id](...args);
    let preview=kit[item.id](...args);
    if(item.id==='confirmDialog')preview=kit.button({label:'확인 창 열기',action:'catalog-open'})+preview;
    if(item.id==='button')preview+=kit.button({label:'취소'})+kit.button({label:'삭제',tone:'danger'})+kit.button({label:'비활성',disabled:true});
    return preview;
  }
  function card(item){
    const {id,title,description,section,previewLayout,variants=[],demoDataOnly,hostBehavior}=item, dashboard=section!=='범용 부품';
    return '<article class="demo-card'+(previewLayout==='wide'?' demo-wide':'')+'" id="component-'+id+'" data-item-id="'+id+'" data-kind="'+(dashboard?'dashboard':'general')+'" data-search="'+e(id+' '+title+' '+description+' '+section)+'"><header><div><h3><a href="#components/'+id+'">'+e(title)+'</a></h3><p>'+e(description)+'</p></div>'+badge(dashboard?(demoDataOnly?'차트 패턴':'실제 화면과 동일'):'범용 부품',dashboard?'accent':'neutral')+'</header>'+
      (variants.length?'<label class="catalog-variant">미리보기 상태 <select class="ak-control" data-preview="'+id+'"><option value="0">기본</option>'+variants.map((v,i)=>'<option value="'+(i+1)+'">'+e(v.title)+'</option>').join('')+'</select></label>':'')+
      '<div class="demo-stage'+(dashboard?' rb-page rb-preview-stage rb-preview-'+(previewLayout||'standard'):'')+'">'+stage(item)+'</div>'+
      '<details><summary>사용 코드</summary>'+(dashboard?'<p>'+e(hostBehavior??'실제 데이터는 호스트에서 연결하세요. 이 항목은 예시입니다.')+'</p>':'')+
      '<pre><code id="snippet-'+id+'">'+e(snippet(item))+'</code></pre><button class="ak-button copy" type="button" data-copy="'+id+'">코드 복사</button> <button class="ak-button" type="button" data-copy-ai="'+id+'">AI 지시문 복사</button></details></article>';
  }
  function components() {
    return intro('CATALOG / 02','컴포넌트','실제 대시보드와 처리 대기열에서 쓰는 컴포넌트를 먼저 보여줍니다. 범용 부품은 별도로 골라 볼 수 있습니다.')+
      '<p class="ak"><a class="ak-button" href="#blocks">완성 화면 보기</a> <a class="ak-button" href="./registry/index.json">AI용 소스 목록</a> <a class="ak-button" href="./examples/blocks-starter.html">독립 블록 예제</a></p>'+
      (highlightedId()?'<p class="catalog-reset"><a href="#components">컴포넌트 목록으로 돌아가기</a></p>':'')+
      '<div class="ak filters catalog-filters">'+kit.search({id:'catalog-query',label:'컴포넌트 검색',value:catalogQuery})+kit.selectField({id:'catalog-kind',label:'구분',inline:true,value:catalogFilter,options:[{value:'dashboard',label:'화면 사용 부품'},{value:'general',label:'범용 부품'},{value:'all',label:'모두 보기'}]})+'<span id="catalog-count" class="muted" role="status"></span></div>'+
      catalogSections.map(section=>'<section class="catalog-group ak"><h2>'+section+'</h2><div class="catalog">'+[...dashboardEntries,...generalEntries].filter(item=>item.section===section).map(card).join('')+'</div></section>').join('');
  }
  function filterCatalog(){
    let count=0;
    const selected=highlightedId();
    main.querySelectorAll('.demo-card').forEach(el=>{
      el.hidden=selected?el.dataset.itemId!==selected:(catalogFilter!=='all'&&el.dataset.kind!==catalogFilter)||!el.dataset.search.toLowerCase().includes(catalogQuery.trim().toLowerCase());
      if(!el.hidden)count++;
    });
    main.querySelectorAll('.catalog-group').forEach(group=>group.hidden=!group.querySelector('.demo-card:not([hidden])'));
    const label=main.querySelector('#catalog-count');
    if(label)label.textContent=count?'부품 '+count+'개':'검색 결과가 없습니다.';
  }
  function activityRows(){
    return data.activity.filter(row=>(filter==='all'||row.status===filter)&&(!query.trim()||(row.name+' '+row.group+' '+row.status).includes(query.trim())));
  }
  const activities=()=>rb.activityBody({rows:activityRows(),view:state});
  function demoBlock(view) {
    const isQueue=view==='queue', busy=state==='loading', noData=state==='empty', error=state==='error';
    const done=data.queue.length-queue.length;
    const metrics=data.dashboardMetrics(queue,done);
    const itemCount=queue.length;
    const context='<div class="rb-toolbar"><div><span class="rb-context">화면 예제</span>'+kit.tabs({label:'화면 선택',items:[{label:'운영 대시보드',href:'#blocks',current:!isQueue},{label:'처리 대기열',href:'#queue',current:isQueue}]})+'</div>'+kit.selectField({id:'scenario',label:'시나리오',inline:true,value:['recovered','reconnecting'].includes(state)?'offline':state,options:Object.entries(choices).map(([value,label])=>({value,label}))})+'</div>';
    const header=rb.header({view,query});
    const dashboard=isQueue?'':rb.dashboardBody({view:state,metrics,rows:activityRows(),requests:queue,filter:{value:filter}});
    const summary={done:error||busy?'—':noData?0:data.stats[2].value+done,pending:error||busy?'—':noData?0:itemCount,next:error||busy||noData?'—':'16:00'};
    const approval=isQueue?rb.approvalBody({view:state,requests:queue,events:data.reviewHistory(decisions),schedule:data.upcoming,summary,historyAction:true}):'';
    return '<div class="ak rb-page">'+context+'<section class="rb-shell" aria-label="영상 참고 관리자 예제">'+rb.rail({current:view})+'<div class="rb-body">'+header+(isQueue?approval:dashboard)+rb.connectionBar({view:state,checkedAt:synced})+'</div></section></div>'+
      kit.confirmDialog({id:'review',title:'요청 검토',detailId:'review-detail',detail:'이 동작은 예제 안에서만 적용되며 실제 시스템에 전송하지 않습니다.',confirmLabel:'예제에서 완료 처리',action:'review-confirm'});
  }
  function render() {
    const r=route();
    document.querySelectorAll('#nav a').forEach(a=>{
      const selected=a.hash==='#'+(r==='queue'?'blocks':r);
      if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    main.classList.toggle('wide-preview',r==='blocks'||r==='queue');
    main.innerHTML=r==='components'?components():r==='overview'?overview():demoBlock(r);
    if(r==='components')filterCatalog();
  }
  function focusSelector(s){main.querySelector(s)?.focus();}
  window.addEventListener('hashchange',()=>{render();main.focus();});
  document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();main.focus();main.scrollIntoView({block:'start'});});
  main.addEventListener('input',event=>{
    if(event.target.id==='catalog-query'){catalogQuery=event.target.value;if(highlightedId())history.replaceState(null,'','#components');main.querySelector('.catalog-reset')?.remove();filterCatalog();}
    if(event.target.id==='query'){query=event.target.value;document.querySelector('#activity-results').innerHTML=activities();}
  });
  main.addEventListener('change',event=>{
    if(event.target.id==='catalog-kind'){catalogFilter=event.target.value;if(highlightedId())history.replaceState(null,'','#components');main.querySelector('.catalog-reset')?.remove();filterCatalog();}
    if(route()==='components'&&event.target.dataset?.preview){
      const item=sourceMap[event.target.dataset.preview], card=event.target.closest('.demo-card');
      if(!item||!card)return;
      const args=item.variants[Number(event.target.value)-1]?.args??item.args;
      card.querySelector('.demo-stage').innerHTML=stage(item,args);
      card.querySelector('code').textContent=snippet(item,args);
    }
    if(['catalog-activity-status','catalog-complete-status'].includes(event.target.id)){
      const area=main.querySelector(event.target.id==='catalog-activity-status'?'#catalog-activity-results':'#catalog-complete-results');
      if(area&&area.querySelector('.rb-event-list'))area.innerHTML=rb.activityBody({rows:data.activity.filter(row=>event.target.value==='all'||row.status===event.target.value)});
    }
    if(event.target.id==='scenario'){clearTimeout(timer);state=event.target.value;render();focusSelector('#scenario');announcement.textContent=choices[state]+' 상태를 표시합니다.';}
    if(event.target.id==='filter'){filter=event.target.value;document.querySelector('#activity-results').innerHTML=activities();}
  });
  main.addEventListener('click',async event=>{
    const button=event.target.closest('button');
    if(!button||button.disabled)return;
    const action=button.dataset.akAction||'';
    if(action==='view-history'){focusSelector('#approval-history');document.querySelector('#approval-history')?.scrollIntoView({block:'nearest'});return;}
    if(action==='catalog-open'){document.querySelector('#catalog-dialog')?.showModal();focusSelector('[data-ak-action="cancel:catalog-dialog"]');return;}
    if(action==='catalog-confirm'||action==='cancel:catalog-dialog'){document.querySelector('#catalog-dialog')?.close();focusSelector('[data-ak-action="catalog-open"]');return;}
    if(route()==='components'&&action.startsWith('page:')){
      const current=Number(action.slice(5));
      button.closest('.ak-page-nav').outerHTML=kit.pagination({page:current,total:5});
      main.querySelector('.demo-stage .ak-page-nav button:not(:disabled)')?.focus();return;
    }
    if(route()==='components'&&(button.hasAttribute('data-retry')||action.startsWith('review:'))&&button.closest?.('.rb-preview-stage')){
      announcement.textContent='모양과 상태를 확인하는 미리보기입니다. 실제 동작은 프로젝트에서 연결합니다.';return;
    }
    if(button.hasAttribute('data-retry')){
      if(state==='error'){state='normal';render();focusSelector('#scenario');announcement.textContent='예제 조회를 다시 완료했습니다.';return;}
      state='reconnecting';render();focusSelector('#scenario');
      timer=setTimeout(()=>{state='recovered';synced=new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());if(['blocks','queue'].includes(route())){const id=document.activeElement?.id;render();if(id)focusSelector('#'+CSS.escape(id));}announcement.textContent='예제 연결이 복구됐습니다.';},450);return;
    }
    if(action.startsWith('review:')&&route()!=='components'){
      const item=queue.find(row=>row.id===action.slice(7));
      if(!item)return;activeId=item.id;
      document.querySelector('#review-detail').textContent=item.id+' · '+item.name;
      document.querySelector('#review').showModal();focusSelector('[data-ak-action="cancel:review"]');return;
    }
    if(action==='cancel:review'){document.querySelector('#review').close();return;}
    if(action==='review-confirm'&&activeId){
      const item=queue.find(row=>row.id===activeId);if(item)decisions.unshift({title:item.name,detail:'예제에서 검토 완료',time:'방금'});queue=queue.filter(row=>row.id!==activeId);activeId=null;document.querySelector('#review').close();render();focusSelector('[data-ak-action^="review:"]:not(:disabled)');if(!main.contains(document.activeElement))main.focus();announcement.textContent='예제 요청을 완료 처리했습니다.';return;
    }
    if(button.hasAttribute('data-copy-ai')){
      const source='https://github.com/Edwin-space/admin-ui-kit';
      const instruction=source+'의 AGENTS.md와 registry/index.json을 읽고, '+button.dataset.copyAi+' (미리보기: https://edwin-space.github.io/admin-ui-kit/#components/'+button.dataset.copyAi+') 부품만 현재 프로젝트의 대상 화면에 적용해. 기존 권한, API, 동작 및 프레임워크를 유지하고, fixtures.js 및 데모 앱은 가져오지 마.';
      try{await navigator.clipboard.writeText(instruction);button.textContent='AI 지시문 복사 완료';announcement.textContent='AI 지시문을 복사했어요.';}
      catch{let field=button.parentElement.querySelector('.ai-copy-fallback');if(!field){field=document.createElement('textarea');field.className='ai-copy-fallback';field.setAttribute('aria-label','복사용 AI 지시문');field.readOnly=true;button.after(field);}field.value=instruction;field.focus();field.select();announcement.textContent='AI 지시문을 선택했어요. Ctrl+C 또는 Cmd+C로 복사하세요.';}
      return;
    }
    if(button.hasAttribute('data-copy')){
      const code=document.querySelector('#snippet-'+button.dataset.copy);
      try{await navigator.clipboard.writeText(code.textContent);announcement.textContent='코드를 복사했어요.';button.textContent='복사 완료';}
      catch{const range=document.createRange();range.selectNodeContents(code);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);announcement.textContent='코드를 선택했어요. Ctrl+C 또는 Cmd+C로 복사하세요.';button.textContent='선택됨 · 직접 복사';}
    }
  });
  render();
})();
