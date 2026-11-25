(function () {
  'use strict';
  const kit=window.AdminKit, data=window.AdminFixtures, {e,icon,badge,stat,empty,skeleton,connection,table}=kit;
  const main=document.querySelector('#main'), announcement=document.querySelector('#announcement');
  const columns=[{label:'시간',key:'time'},{label:'활동',key:'name'},{label:'분류',key:'group'},{label:'상태',key:'status',kind:'badge'}];
  let state='normal', query='', filter='all', queue=data.queue.slice(), activeId=null, timer=null, synced='';
  const choices={normal:'기본',loading:'로딩',empty:'빈 화면',error:'조회 오류',offline:'연결 끊김'};
  function route() {
    const value=location.hash.slice(1);
    return ['overview','components','blocks','queue'].includes(value)?value:'overview';
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
      '<div class="foundation"><div><strong>기본 색상</strong><small>src/tokens.css</small></div><div class="swatches">'+[['bg','배경'],['surface','카드'],['text','본문'],['primary','강조'],['good-bg','성공'],['warn-bg','주의']].map(([key,label])=>'<span><i style="--swatch:var(--ak-'+key+')"></i>'+label+'</span>').join('')+'</div></div><div class="ak filters catalog-filters">'+kit.search({id:'catalog-query',label:'컴포넌트 검색',value:catalogQuery})+kit.selectField({id:'catalog-kind',label:'출처',inline:true,value:catalogFilter,options:[{value:'all',label:'전체'},{value:'reference',label:'영상 참고'},{value:'common',label:'공통 확장'}]})+'<span id="catalog-count" class="muted" role="status"></span></div><div class="catalog ak">'+
      entries.map(([id,title,source,desc,args])=>{
        const isVideo=source.startsWith('영상'), snippet='AdminKit.'+id+'('+args.map(arg=>JSON.stringify(arg,null,2)).join(', ')+')';
        let preview=kit[id](...args);
        if(id==='confirmDialog')preview=kit.button({label:'확인 창 열기',action:'catalog-open'})+preview;
        if(id==='button')preview+=kit.button({label:'취소'})+kit.button({label:'삭제',tone:'danger'})+kit.button({label:'비활성',disabled:true});
        return '<article class="demo-card" data-kind="'+(isVideo?'reference':'common')+'" data-search="'+e(id+' '+title+' '+desc)+'"><header><div><h2>'+title+'</h2><p>'+desc+'</p></div>'+badge(source,isVideo?'accent':'neutral')+'</header><div class="demo-stage">'+preview+'</div><details><summary>사용 코드</summary><pre><code id="snippet-'+id+'">document.querySelector(\'#example\').innerHTML = '+e(snippet)+';</code></pre><button class="ak-button copy" type="button" data-copy="'+id+'">코드 복사</button></details></article>';
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
    return rows.length?table({columns,rows}):empty({title:'조건에 맞는 활동이 없습니다',detail:'검색어나 상태 조건을 바꿔보세요.',symbol:'search'});
  }
  function queueBody() {
    if(state==='loading')return skeleton(4);
    if(state==='error')return empty({title:'대기열을 불러오지 못했어요',detail:'조회 오류이며, 처리할 일이 없다는 뜻은 아닙니다.',symbol:'alert'});
    if(state==='empty'||!queue.length)return empty({title:'처리할 일이 없습니다',detail:'새 요청이 들어오면 대기열에 표시됩니다.'});
    return kit.workQueue({rows:queue,disabled:['offline','reconnecting'].includes(state)});
  }
  const title=(heading,desc)=>'<div class="ak-panel-head"><div><h3>'+heading+'</h3><p>'+desc+'</p></div></div>';
  function demoBlock(view) {
    const isQueue=view==='queue', busy=state==='loading', noData=state==='empty', error=state==='error';
    const completed=data.queue.length-queue.length;
    const metrics=[{...data.stats[0],value:queue.length},{...data.stats[1],value:queue.filter(row=>row.status==='기한 임박').length},{...data.stats[2],value:data.stats[2].value+completed},data.stats[3]];
    return intro('BLOCKS / 03','화면 예제','가짜 데이터로 운영 화면과 예외 상태를 직접 확인하세요.')+
      '<div class="ak demo-controls">'+kit.tabs({label:'화면 선택',items:[{label:'운영 대시보드',href:'#blocks',current:!isQueue},{label:'처리 대기열',href:'#queue',current:isQueue}]})+kit.selectField({id:'scenario',label:'시나리오',inline:true,value:['recovered','reconnecting'].includes(state)?'offline':state,options:Object.entries(choices).map(([value,label])=>({value,label}))})+'</div>'+
      '<section class="ak workspace" aria-label="관리자 실행 예제">'+kit.sidebar({title:'운영 워크스페이스',items:[{label:'운영 개요',href:'#blocks',symbol:'grid',current:!isQueue},{label:'처리 대기열',href:'#queue',symbol:'queue',current:isQueue}],footer:'DEMO · 데이터 미연결'})+
      '<div class="workspace-body">'+kit.pageHeader({context:'운영 워크스페이스 / '+(isQueue?'업무':'홈'),title:isQueue?'처리 대기열':'운영 대시보드',detail:isQueue?'검토할 요청과 상태를 확인합니다.':'운영 상태와 오늘 처리할 일을 한눈에 볼 수 있습니다.',status:'가짜 데이터'})+
      (!isQueue?'<div class="stat-grid">'+metrics.map(item=>busy?'<div class="ak-card stat-loading">'+skeleton(3)+'</div>':stat({...item,value:error?'—':noData?0:item.value,detail:error?'조회 실패':noData?'표시할 항목 없음':item.detail})).join('')+'</div>':'')+
      (isQueue?'<article class="ak-card ak-panel">'+title('검토할 요청','검토 버튼으로 예제 확인 창을 열 수 있습니다.')+queueBody()+'</article>':
        '<div class="panel-grid"><article class="ak-card ak-panel">'+title('최근 활동','업무 이벤트와 조회 결과')+
        '<div class="filters">'+kit.search({id:'query',label:'활동 검색',value:query})+kit.selectField({id:'filter',label:'상태',inline:true,value:filter,options:[{value:'all',label:'모든 상태'},{value:'완료',label:'완료'},{value:'대기',label:'대기'},{value:'실패',label:'실패'}]})+'</div><div id="activity-results">'+activities()+'</div></article><article class="ak-card ak-panel">'+title('내가 처리할 일','우선 확인할 요청입니다.')+queueBody()+'</article></div>')+
      (!busy&&!error&&!noData?'<div class="ak-extra"><article class="ak-card ak-panel">'+title('다음 예정 작업','일정이 있는 작업')+kit.upcoming({items:data.upcoming})+'</article><article class="ak-card ak-panel">'+title('처리 흐름','예제 지표')+kit.progress({label:'검토 진척',value:Math.round((3-queue.length)/3*100)})+kit.barChart({label:'시간대별 처리',values:[4,6,5,7,5,10,7,6],summary:'예제 8구간 · 최고 10건'})+'</article></div>':'')+
      '<div class="connection-wrap">'+connection(state,synced)+'</div></div></section>'+
      kit.confirmDialog({id:'review',title:'요청 검토',detailId:'review-detail',detail:'이 동작은 예제 안에서만 적용되며 실제 시스템에 전송하지 않습니다.',confirmLabel:'예제에서 완료 처리',action:'review-confirm'});

  }
  function render() {
    const r=route();
    document.querySelectorAll('#nav a').forEach(a=>{
      const selected=a.hash==='#'+(r==='queue'?'blocks':r);
      if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
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
      timer=setTimeout(()=>{state='recovered';synced=new Intl.DateTimeFormat('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());if(['blocks','queue'].includes(route()))render();announcement.textContent='예제 연결이 복구됐습니다.';},450);return;
    }
    if(action.startsWith('review:')&&route()!=='components'){
      const item=queue.find(row=>row.id===action.slice(7));
      if(!item)return;activeId=item.id;
      document.querySelector('#review-detail').textContent=item.id+' · '+item.name;
      document.querySelector('#review').showModal();focusSelector('[data-ak-action="cancel:review"]');return;
    }
    if(action==='cancel:review'){document.querySelector('#review').close();return;}
    if(action==='review-confirm'&&activeId){
      queue=queue.filter(row=>row.id!==activeId);activeId=null;document.querySelector('#review').close();render();focusSelector('[data-ak-action^="review:"]:not(:disabled)');if(!main.contains(document.activeElement))main.focus();announcement.textContent='예제 요청을 완료 처리했습니다.';return;
    }
    if(button.hasAttribute('data-copy')){
      const code=document.querySelector('#snippet-'+button.dataset.copy);
      try{await navigator.clipboard.writeText(code.textContent);announcement.textContent='코드를 복사했어요.';button.textContent='복사 완료';}
      catch{const range=document.createRange();range.selectNodeContents(code);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);announcement.textContent='코드를 선택했어요. Ctrl+C 또는 Cmd+C로 복사하세요.';button.textContent='선택됨 · 직접 복사';}
    }
  });
  render();
})();
