(function () {
  'use strict';
  const kit=window.AdminKit, data=window.AdminFixtures, rb=window.AdminReference, {e,icon,badge,stat,empty,skeleton,connection,table}=kit;
  const main=document.querySelector('#main'), announcement=document.querySelector('#announcement');
  const columns=[{label:'시간',key:'time'},{label:'활동',key:'name'},{label:'분류',key:'group'},{label:'상태',key:'status',kind:'badge'}];
  let state='normal', query='', filter='all', queue=data.queue.slice(), activeId=null, timer=null, synced='', decisions=[];
  const choices={normal:'기본',loading:'로딩',empty:'빈 화면',error:'조회 오류',offline:'연결 끊김'};
  function route() {
    const value=location.hash.slice(1);
    return ['overview','components','blocks','queue'].includes(value)?value:'blocks';
  }
  const intro=(label,title,detail)=>'<div class="intro"><span class="eyebrow">'+label+'</span><h1>'+title+'</h1><p>'+detail+'</p></div>';
  const link=(to,label,primary=false)=>'<a href="#'+to+'" class="ak-button '+(primary?'ak-button--primary':'')+'">'+label+icon('arrow')+'</a>';
  function overview() {
    return '<section class="hero"><div>'+intro('DESIGN SYSTEM / 01','운영 화면을 위한<br>관리자 UI 키트','레이아웃부터 로딩·빈 화면까지, 프로젝트마다 다시 설계하지 않아도 되는 관리자 화면의 출발점입니다.')+'<div class="hero-actions">'+link('blocks','대시보드 보기',true)+link('components','컴포넌트 탐색')+'</div></div><div class="teaser ak"><div class="teaser-top"><span>'+icon('layers')+' 운영 개요</span>'+badge('미리보기','accent')+'</div><div class="teaser-grid">'+stat(data.stats[0])+stat(data.stats[2])+'</div><div class="teaser-line"><span class="teaser-dot"></span><div><strong>정기 보고서 생성</strong><small>오늘 09:41 · 보고서</small></div>'+badge('완료','good')+'</div><div class="teaser-line"><span class="teaser-dot purple"></span><div><strong>권한 변경 요청</strong><small>오늘 09:28 · 권한</small></div>'+badge('대기','warn')+'</div></div></section><div class="tiles">'+[['01','공통 규칙','색상·여백·타이포그래피를 한 곳에 두고 프로젝트에 맞춰 조정합니다.','components'],['02','컴포넌트','카드, 배지, 활동 표, 빈 상태처럼 한 가지 역할에 집중하는 부품을 골라 씁니다.','components'],['03','화면 예제','운영 대시보드와 처리 대기열을 실행하고 조회 상태를 직접 바꿔봅니다.','blocks']].map(([n,t,d,r])=>'<a class="tile" href="#'+r+'"><span>'+n+'</span><strong>'+t+'</strong><p>'+d+'</p>'+icon('arrow')+'</a>').join('')+'</div>';
  }
  const entries=window.AdminCatalog;
  let catalogFilter='all', catalogQuery='';
  function components() {
    return intro('CATALOG / 02','컴포넌트','영상에서 참고한 화면 요소와 여러 프로젝트에 공통으로 쓸 부품을 구분해 정리했습니다.')+
      '<p class="ak"><a class="ak-button" href="./registry/index.json">AI용 소스 목록</a> <a class="ak-button" href="./examples/blocks-starter.html">독립 블록 예제</a></p>'+
      '<div class="foundation"><div><strong>기본 색상</strong><small>src/tokens.css</small></div><div class="swatches">'+[['bg','배경'],['surface','카드'],['text','본문'],['primary','강조'],['good-bg','성공'],['warn-bg','주의']].map(([key,label])=>'<span><i style="--swatch:var(--ak-'+key+')"></i>'+label+'</span>').join('')+'</div></div><div class="ak filters catalog-filters">'+kit.search({id:'catalog-query',label:'컴포넌트 검색',value:catalogQuery})+kit.selectField({id:'catalog-kind',label:'출처',inline:true,value:catalogFilter,options:[{value:'all',label:'전체'},{value:'reference',label:'영상 참고'},{value:'common',label:'공통 확장'}]})+'<span id="catalog-count" class="muted" role="status"></span></div><div class="catalog ak">'+
      entries.map(([id,title,source,desc,args])=>{
        const isVideo=source.startsWith('영상'), snippet='AdminKit.'+id+'('+args.map(arg=>JSON.stringify(arg,null,2)).join(', ')+')';
        let preview=kit[id](...args);
        if(id==='confirmDialog')preview=kit.button({label:'확인 창 열기',action:'catalog-open'})+preview;
        if(id==='button')preview+=kit.button({label:'취소'})+kit.button({label:'삭제',tone:'danger'})+kit.button({label:'비활성',disabled:true});
        return '<article class="demo-card" data-kind="'+(isVideo?'reference':'common')+'" data-search="'+e(id+' '+title+' '+desc)+'"><header><div><h2 id="component-'+id+'">'+title+'</h2><p>'+desc+'</p></div>'+badge(source,isVideo?'accent':'neutral')+'</header><div class="demo-stage">'+preview+'</div><details><summary>사용 코드</summary><pre><code id="snippet-'+id+'">document.querySelector(\'#example\').innerHTML = '+e(snippet)+';</code></pre><button class="ak-button copy" type="button" data-copy="'+id+'">코드 복사</button> <button class="ak-button" type="button" data-copy-ai="'+id+'">AI 지시문 복사</button></details></article>';
      }).join('')+'</div>';
  }
  function filterCatalog(){
    let count=0;
    main.querySelectorAll('.demo-card').forEach(el=>{
      el.hidden=(catalogFilter!=='all'&&el.dataset.kind!==catalogFilter)||!el.dataset.search.toLowerCase().includes(catalogQuery.trim().toLowerCase());
      if(!el.hidden)count++;
    });
    const label=main.querySelector('#catalog-count');
    if(label)label.textContent=count?'부품 '+count+'개':'검색 결과가 없습니다.';
  }
  function activities() {
    if(state==='loading')return skeleton(5);
    if(state==='error')return empty({title:'활동을 불러오지 못했어요',detail:'지금은 최근 활동을 확인할 수 없습니다.',symbol:'alert'})+'<button type="button" class="ak-button" data-retry>다시 시도</button>';
    if(state==='empty')return empty({title:'새 활동이 없습니다',detail:'작업이 발생하면 최근 활동에 표시됩니다.'});
    const rows=data.activity.filter(row=>(filter==='all'||row.status===filter)&&(!query.trim()||(row.name+' '+row.group+' '+row.status).includes(query.trim())));
    return rb.activity({rows,emptyState:empty({title:'조건에 맞는 활동이 없습니다',detail:'검색어나 상태 조건을 바꿔보세요.',symbol:'search'})});
  }
  function queueBody(dashboard=false) {
    if(state==='loading')return skeleton(4);
    if(state==='error')return empty({title:'대기열을 불러오지 못했어요',detail:'조회 오류이며, 처리할 일이 없다는 뜻은 아닙니다.',symbol:'alert'});
    if(state==='empty'||!queue.length)return empty({title:'처리할 일이 없습니다',detail:'새 요청이 들어오면 대기열에 표시됩니다.'});
    return (dashboard?rb.requestList:kit.workQueue)({rows:queue,disabled:['offline','reconnecting'].includes(state)});
  }
  const titled=(name,desc,mark='',controls='')=>'<div class="rb-section-head"><div><h3>'+name+'</h3><p>'+desc+'</p></div>'+'<div class="rb-section-tools">'+controls+(mark?'<small>'+mark+'</small>':'')+'</div></div>';
  const panel=(name,desc,body,mark='')=>'<article class="rb-panel">'+titled(name,desc,mark)+body+'</article>';
  function demoBlock(view) {
    const isQueue=view==='queue', busy=state==='loading', noData=state==='empty', error=state==='error';
    const done=data.queue.length-queue.length;
    const metrics=[
      {label:'오늘 처리',value:data.stats[2].value+done,detail:'완료된 예제 작업',symbol:'activity',tone:'accent'},
      {label:'승인 대기',value:queue.length,detail:'내가 확인할 요청',symbol:'clock',tone:'warn'},
      {label:'확인 필요',value:data.stats[3].value,detail:'실패한 작업',symbol:'alert',tone:'bad'},
      {label:'운영 지표',value:'+24%',detail:'예제 효율 변화',symbol:'check',tone:'good'}
    ];
    const itemCount=queue.length;
    const filterBar='<div class="rb-view-tools">'+kit.selectField({id:'filter',label:'상태',inline:true,value:filter,options:[{value:'all',label:'모든 상태'},{value:'완료',label:'완료'},{value:'대기',label:'대기'},{value:'실패',label:'실패'}]})+'</div>';
    const context='<div class="rb-toolbar"><div><span class="rb-context">화면 예제</span>'+kit.tabs({label:'화면 선택',items:[{label:'운영 대시보드',href:'#blocks',current:!isQueue},{label:'처리 대기열',href:'#queue',current:isQueue}]})+'</div>'+kit.selectField({id:'scenario',label:'시나리오',inline:true,value:['recovered','reconnecting'].includes(state)?'offline':state,options:Object.entries(choices).map(([value,label])=>({value,label}))})+'</div>';
    const header='<div class="rb-head"><div><h1>'+(isQueue?'처리 대기열':'운영 대시보드')+'</h1><p>'+(isQueue?'검토할 요청과 최근 처리 내역':'오늘의 실행 현황과 확인이 필요한 작업')+' <span>· 가짜 데이터</span></p></div><div class="rb-actions">'+(!isQueue?kit.search({id:'query',label:'활동 검색',value:query}):'')+'<a class="ak-button rb-head-action" href="'+(isQueue?'#blocks':'#queue')+'">'+icon(isQueue?'grid':'queue')+(isQueue?'홈':'승인 보기')+'</a></div></div>';
    const sk=()=>'<div class="rb-art-loading">'+skeleton(5)+'</div>';
    const schedule=()=>busy?sk():error?kit.notice({title:'일정 조회 실패',detail:'지금은 예정 작업을 표시할 수 없습니다.',tone:'bad'}):noData?empty({title:'예정 작업 없음',detail:'새 일정이 생기면 표시됩니다.'}):kit.upcoming({items:data.upcoming});
    const history=()=>busy?sk():error?kit.notice({title:'처리 이력 조회 실패',detail:'나중에 다시 확인할 수 있습니다.',tone:'bad'}):noData?empty({title:'최근 이력 없음',detail:'처리한 작업이 이곳에 표시됩니다.'}):kit.timeline({items:[...decisions,...data.activity.filter(item=>item.status==='완료').map(item=>({title:item.name,time:item.time,detail:item.group}))].slice(0,5)});
    const historyAction=(!busy&&!noData&&!error&&!itemCount)?'<div class="rb-empty-action">'+kit.button({label:'처리 이력 보기',action:'view-history'})+'</div>':'';
    const art=(renderArt)=>busy?sk():error?empty({title:'보조 지표 조회 실패',detail:'다시 조회할 수 있습니다.',symbol:'alert'}):noData?empty({title:'표시할 지표 없음',detail:'기록이 생기면 표시됩니다.'}):renderArt();
    const dashboard='<div class="rb-metrics">'+metrics.map((item,index)=>busy?'<div class="rb-metric rb-metric-loading">'+skeleton(3)+'</div>':rb.metric({...item,index,quiet:error||noData,value:error?'—':noData?0:item.value,detail:error?'조회 실패':noData?'표시할 항목 없음':item.detail})).join('')+'</div>'+
      '<div class="rb-middle"><article class="rb-panel rb-wide-panel">'+titled('오늘의 활동','시간대별 실행과 주요 이벤트','오늘',filterBar)+'<div id="activity-results">'+activities()+'</div></article>'+panel('내가 처리할 일','검토할 요청',queueBody(true),busy||error?'':noData?'0건':itemCount+'건')+'</div>'+
      '<div class="rb-bottom">'+panel('목표와의 차이','기준선 대비 현재 상태',art(rb.comparison),'현재')+panel('다음 실행 임박','조건에 가까워지는 작업',art(rb.thresholds),'실시간')+panel('운영 효과','자동화 기여도 예시',art(rb.impact))+'</div>';
    const approval='<div class="rb-middle rb-approval"><article class="rb-panel rb-approval-main">'+titled('승인 요청','검토할 항목이 이곳에 표시됩니다.')+queueBody()+historyAction+'<div class="rb-approval-summary"><span>오늘 완료 <strong>'+e(error||busy?'—':noData?0:data.stats[2].value+done)+'</strong></span><span>처리 대기 <strong>'+e(error||busy?'—':noData?0:itemCount)+'</strong></span><span>다음 예정 <strong>'+e(error||busy||noData?'—':'16:00')+'</strong></span></div></article><div class="rb-stack" id="approval-history" tabindex="-1">'+panel('최근 처리','완료된 작업',history())+panel('다음 예정 작업','등록된 작업 일정',schedule())+'</div></div>';
    return '<div class="ak rb-page">'+context+'<section class="rb-shell" aria-label="영상 참고 관리자 예제">'+rb.rail(view)+'<div class="rb-body">'+header+(isQueue?approval:dashboard)+'<div class="rb-connection">'+connection(state,synced)+'</div></div></section></div>'+
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
    if(event.target.id==='catalog-query'){catalogQuery=event.target.value;filterCatalog();}
    if(event.target.id==='query'){query=event.target.value;document.querySelector('#activity-results').innerHTML=activities();}
  });
  main.addEventListener('change',event=>{
    if(event.target.id==='catalog-kind'){catalogFilter=event.target.value;filterCatalog();}
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
      const instruction=source+'의 AGENTS.md와 registry/index.json을 읽고, '+button.dataset.copyAi+' 부품만 현재 프로젝트의 대상 화면에 적용해. 기존 권한, API, 동작 및 프레임워크를 유지하고, fixtures.js 및 데모 앱은 가져오지 마.';
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
