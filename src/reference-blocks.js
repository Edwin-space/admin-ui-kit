/* Film-inspired dashboard artwork; data is illustrative, never connected to a backend. */
(function(root){
  'use strict';
  const {e,icon,badge,button,search,selectField,connection,empty,skeleton,workQueue,timeline,upcoming,notice}=root.AdminKit;
  const colors=['#69b1c5','#e0a658','#80b79c','#a499d6','#79c3bb','#e1b774'];
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  function rail(options={}){
    const {current='blocks',items,homeHref='#blocks',avatar='UI'}=typeof options==='string'?{current:options}:options;
    // Host destinations are explicit. Reject schemes other than http(s) and relative paths.
    const href=value=>{const v=String(value??'').trim();return v&&!/[\u0000-\u0020\\]/.test(v)&&!v.startsWith('//')&&(!/^[\w+.-]+:/.test(v)||/^https?:\/\//i.test(v))?e(v):'#';};
    const links=items??[['blocks','홈','grid','#blocks'],['queue','승인','queue','#queue'],['components','부품','layers','#components'],['overview','가이드','activity','#overview']];
    return '<nav class="rb-rail" aria-label="관리자 화면 탐색"><a class="rb-logo" href="'+href(homeHref)+'" aria-label="운영 홈">'+icon('layers')+'</a><div>'+links.map(([id,label,symbol,url])=>'<a href="'+href(url)+'"'+(id===current?' aria-current="page"':'')+'><span>'+icon(symbol)+'</span><small>'+e(label)+'</small></a>').join('')+'</div><span class="rb-rail-end" aria-label="사용자">'+e(avatar)+'</span></nav>';
  }
  function header({view='blocks',query='',searchId='query',headingLevel=1,title,detail,meta='· 가짜 데이터',actionHref,actionLabel,searchLabel='활동 검색'}={}){
    const isQueue=view==='queue', tag=headingLevel===1?'h1':'h3';
    const href=typeof actionHref==='string'&&/^(#|\/(?![\/\\])|https?:\/\/)[^\u0000-\u0020]*$/i.test(actionHref)?e(actionHref):(isQueue?'#blocks':'#queue');
    return '<div class="rb-head"><div><'+tag+'>'+e(title??(isQueue?'처리 대기열':'운영 대시보드'))+'</'+tag+'><p>'+e(detail??(isQueue?'검토할 요청과 최근 처리 내역':'오늘의 실행 현황과 확인이 필요한 작업'))+' <span>'+e(meta)+'</span></p></div><div class="rb-actions">'+(!isQueue?search({id:searchId,label:searchLabel,value:query}):'')+'<a class="ak-button rb-head-action" href="'+href+'">'+icon(isQueue?'grid':'queue')+e(actionLabel??(isQueue?'홈':'승인 보기'))+'</a></div></div>';
  }
  function activityFilter({id='filter',value='all'}={}){
    return '<div class="rb-view-tools">'+selectField({id,label:'상태',inline:true,value,options:[{value:'all',label:'모든 상태'},{value:'완료',label:'완료'},{value:'대기',label:'대기'},{value:'실패',label:'실패'}]})+'</div>';
  }
  function sectionHeader({name,desc,mark='',filter}={}){
    return '<div class="rb-section-head"><div><h3>'+e(name)+'</h3><p>'+e(desc)+'</p></div><div class="rb-section-tools">'+(filter?activityFilter(filter):'')+(mark?'<small>'+e(mark)+'</small>':'')+'</div></div>';
  }
  // Only trusted HTML rendered by kit functions is passed to panel().
  function panel({name,desc,mark,body=''}){return '<article class="rb-panel">'+sectionHeader({name,desc,mark})+body+'</article>';}
  function activityPanel({rows=[],view='normal',filter={},resultsId='activity-results'}={}){
    const id=/^[a-zA-Z][\w:-]*$/.test(resultsId)?resultsId:'activity-results';
    return '<article class="rb-panel rb-wide-panel">'+sectionHeader({name:'오늘의 활동',desc:'시간대별 실행과 주요 이벤트',mark:'오늘',filter})+'<div id="'+id+'">'+activityBody({rows,view})+'</div></article>';
  }
  function activityBody({rows=[],view='normal'}={}){
    if(view==='loading')return skeleton(5);
    if(view==='error')return empty({title:'활동을 불러오지 못했어요',detail:'지금은 최근 활동을 확인할 수 없습니다.',symbol:'alert'})+'<button type="button" class="ak-button" data-retry>다시 시도</button>';
    if(view==='empty')return empty({title:'새 활동이 없습니다',detail:'작업이 발생하면 최근 활동에 표시됩니다.'});
    return activity({rows,emptyState:empty({title:'조건에 맞는 활동이 없습니다',detail:'검색어나 상태 조건을 바꿔보세요.',symbol:'search'})});
  }
  function queueBody({rows=[],view='normal',dashboard=false}={}){
    if(view==='loading')return skeleton(4);
    if(view==='error')return empty({title:'대기열을 불러오지 못했어요',detail:'조회 오류이며, 처리할 일이 없다는 뜻은 아닙니다.',symbol:'alert'});
    if(view==='empty'||!rows.length)return empty({title:'처리할 일이 없습니다',detail:'새 요청이 들어오면 대기열에 표시됩니다.'});
    return (dashboard?requestList:workQueue)({rows,disabled:['offline','reconnecting'].includes(view)});
  }
  function requestPanel({rows=[],view='normal'}={}){
    return panel({name:'내가 처리할 일',desc:'검토할 요청',body:queueBody({rows,view,dashboard:true}),mark:['loading','error'].includes(view)?'':(view==='empty'?0:rows.length)+'건'});
  }
  function metricGrid({items,view='normal'}){
    const empty=view==='empty', error=view==='error';
    return '<div class="rb-metrics">'+items.map((item,index)=>view==='loading'?'<div class="rb-metric rb-metric-loading">'+skeleton(3)+'</div>':metric({...item,index,quiet:error||empty||item.quiet,value:error?'—':empty?0:item.value,detail:error?'조회 실패':empty?'표시할 항목 없음':item.detail})).join('')+'</div>';
  }
  function impactPanels({view='normal'}={}){
    const art=fn=>view==='loading'?'<div class="rb-art-loading">'+skeleton(5)+'</div>':view==='error'?empty({title:'보조 지표 조회 실패',detail:'다시 조회할 수 있습니다.',symbol:'alert'}):view==='empty'?empty({title:'표시할 지표 없음',detail:'기록이 생기면 표시됩니다.'}):fn();
    return '<div class="rb-bottom">'+panel({name:'목표와의 차이',desc:'기준선 대비 현재 상태',body:art(comparison),mark:'현재'})+panel({name:'다음 실행 임박',desc:'조건에 가까워지는 작업',body:art(thresholds),mark:'실시간'})+panel({name:'운영 효과',desc:'자동화 기여도 예시',body:art(impact)})+'</div>';
  }
  function approvalSummary({done='—',pending='—',next='—'}={}){
    return '<div class="rb-approval-summary">'+[['오늘 완료',done],['처리 대기',pending],['다음 예정',next]].map(([name,value])=>'<span>'+name+' <strong>'+e(value)+'</strong></span>').join('')+'</div>';
  }
  function queueContext({view='normal',events=[],schedule=[]}={}){
    const content=(kind,items,render)=>{
      if(view==='loading')return '<div class="rb-art-loading">'+skeleton(5)+'</div>';
      if(view==='error')return notice({title:kind+' 조회 실패',detail:'나중에 다시 확인할 수 있습니다.',tone:'bad'});
      if(view==='empty'||!items.length)return empty({title:kind+' 없음',detail:'새 항목이 생기면 여기에 표시됩니다.'});
      return render({items});
    };
    return '<div class="rb-stack">'+panel({name:'최근 처리',desc:'완료된 작업',body:content('처리 이력',events,timeline)})+panel({name:'다음 예정 작업',desc:'등록된 작업 일정',body:content('예정 작업',schedule,upcoming)})+'</div>';
  }
  function dashboardBody({view='normal',metrics=[],rows=[],requests=[],filter={},resultsId='activity-results'}={}){
    return metricGrid({items:metrics,view})+'<div class="rb-middle">'+activityPanel({rows,view,filter,resultsId})+requestPanel({rows:requests,view})+'</div>'+impactPanels({view});
  }
  function approvalBody({view='normal',requests=[],events=[],schedule=[],summary={},historyAction=false,historyId='approval-history'}={}){
    const id=/^[a-zA-Z][\w:-]*$/.test(historyId)?historyId:'approval-history';
    const showHistory=historyAction&&!requests.length&&!['loading','empty','error'].includes(view);
    return '<div class="rb-middle rb-approval"><article class="rb-panel rb-approval-main">'+sectionHeader({name:'승인 요청',desc:'검토할 항목이 이곳에 표시됩니다.'})+queueBody({rows:requests,view})+(showHistory?'<div class="rb-empty-action">'+button({label:'처리 이력 보기',action:'view-history'})+'</div>':'')+approvalSummary(summary)+'</article><div id="'+id+'" tabindex="-1">'+queueContext({view,events,schedule})+'</div></div>';
  }
  function connectionBar({view='offline',checkedAt}={}){return '<div class="rb-connection">'+connection(view,checkedAt)+'</div>';}
  function metric({label,value,detail,symbol,tone,index,quiet=false}){
    const series=[[4,6,4,8,5,7,5,9,4,11],[10,6,4],[5,3,6],[4,6,7,9,7,11,8]];
    if(!Number.isInteger(index)||index<0||index>3)index=0;
    return '<article class="rb-metric"><div class="rb-metric-top"><span class="ak-glyph ak-glyph--'+e(tone||'accent')+'">'+icon(symbol)+'</span><span>'+e(label)+'</span></div><div class="rb-metric-value"><div><strong>'+e(value)+'</strong><small>'+e(detail)+'</small></div>'+(quiet?'':'<div class="rb-spark rb-spark--'+index+'" aria-hidden="true">'+series[index].map(n=>'<i style="--n:'+n+'"></i>').join('')+'</div>')+'</div></article>';
  }
  function orbit(){
    const x=102,y=102, marks=[[77,294,0],[77,20,0],[77,142,0],[63,43,2],[63,182,2],[63,312,2],[49,119,1],[49,214,1],[49,275,1],[49,16,3],[77,224,0],[63,98,4]];
    const point=(r,d)=>[x+Math.cos(d*Math.PI/180)*r,y+Math.sin(d*Math.PI/180)*r].map(n=>n.toFixed(1));
    const ticks=Array.from({length:48},(_,i)=>{
      const a=point(i%4===0?83:86,i*7.5), b=point(90,i*7.5);
      return '<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="#acb4bd" stroke-width="'+(i%4===0?1.1:.52)+'"/>';
    }).join('');
    return '<figure class="rb-orbit" aria-label="예제 활동 시계"><svg viewBox="0 0 204 204" role="img" aria-label="오전 활동이 표시된 예시 원형 타임라인"><circle cx="102" cy="102" r="80" fill="#f5f7f8"/><circle cx="102" cy="102" r="78" fill="none" stroke="#bcdce4" stroke-width="4"/><circle cx="102" cy="102" r="63" fill="none" stroke="#d0e7df" stroke-width="4"/><circle cx="102" cy="102" r="49" fill="none" stroke="#f0dfc3" stroke-width="4"/><circle cx="102" cy="102" r="35" fill="none" stroke="#e9e0f3" stroke-width="4"/>'+ticks+marks.map(([r,d,c])=>{const [px,py]=point(r,d);return '<circle cx="'+px+'" cy="'+py+'" r="4.1" fill="'+colors[c]+'" stroke="#fff" stroke-width="1.7"/>';}).join('')+'<path d="M102 102L30 125" stroke="#23252b" stroke-width="1.4" stroke-linecap="round"/><circle cx="102" cy="102" r="25" fill="#fff" stroke="#edf0f1"/><text x="102" y="102" text-anchor="middle" font-size="15" font-weight="800" fill="#25272c">09:42</text><text x="102" y="114" text-anchor="middle" font-size="9" fill="#576168">지금</text><text x="102" y="10" text-anchor="middle" font-size="9" fill="#59636d">00:00</text><text x="102" y="202" text-anchor="middle" font-size="9" fill="#59636d">12:00</text></svg></figure>';
  }
  function activity({rows,emptyState}){
    if(!rows.length)return emptyState;
    return '<div class="rb-activity">'+orbit()+'<div class="rb-event-list"><div class="rb-legend"><span>● 완료</span><span>● 대기</span><span>● 확인 필요</span></div><ul aria-label="최근 활동">'+rows.map((row,i)=>'<li><time>'+e(row.time)+'</time><span class="rb-event-icon" style="--event:'+colors[i%colors.length]+'">'+icon(['activity','queue','alert','clock','layers'][i%5])+'</span><strong>'+e(row.group)+'</strong><span class="rb-event-detail">'+e(row.name)+'</span>'+badge(row.status,row.tone)+'</li>').join('')+'</ul></div></div>';
  }
  // The host owns all state transitions. This block only emits review:<id>.
  function requestList({rows,disabled=false}){
    return rows.length?'<ul class="rb-requests" aria-label="검토할 요청">'+rows.map((row,i)=>'<li><span class="ak-glyph ak-glyph--'+(['accent','warn','good'][i%3])+'">'+icon(['queue','alert','clock'][i%3])+'</span><div class="rb-request-copy"><strong>'+e(row.name)+'</strong><small>'+e(row.detail)+'</small>'+badge(row.status,row.tone)+'</div>'+button({label:'검토',tone:'primary',action:'review:'+row.id,disabled})+'</li>').join('')+'</ul>':root.AdminKit.empty({title:'처리할 일이 없습니다',detail:'새 요청이 들어오면 이곳에 표시됩니다.'});
  }
  function comparison(){
    return '<div class="rb-targets" aria-label="목표와의 차이 예시">'+[['보고서',63,'+1.8'],['권한 검토',41,'−1.2'],['환경 점검',51,'+0.2'],['문서 처리',58,'+0.8']].map(([label,pos,value],i)=>'<div><strong>'+label+'</strong><span class="rb-track"><i style="--pos:'+pos+'%;--dot:'+colors[i]+'"></i></span><small>'+value+'</small></div>').join('')+'</div>';
  }
  function thresholds(){
    return '<div class="rb-thresholds">'+[['정기 보고서 발행',86],['워크스페이스 점검',72],['처리 기한 접근',54],['월간 기록 정리',38]].map(([label,value],i)=>'<div><strong>'+label+'</strong><span>'+value+'%</span><progress max="100" value="'+clamp(value,0,100)+'" style="--meter:'+colors[(i+2)%colors.length]+'" aria-label="'+e(label)+'"></progress></div>').join('')+'</div>';
  }
  function impact(){
    return '<div class="rb-impact"><strong>+24%</strong><small>예제 처리 효율 · 최근 7일</small><svg viewBox="0 0 250 82" preserveAspectRatio="none" role="img" aria-label="예제 효율 기여도: 자동화 증가, 대기 정리 증가, 재작업 소폭 감소, 합계 증가"><path d="M0 75H250M0 25H250" stroke="#e7ebec" stroke-dasharray="3 3"/><path d="M45 49H68M110 31H133M175 43H198" stroke="#bac6cd" stroke-dasharray="2 2"/><rect x="4" y="49" width="41" height="26" rx="5" fill="#79bca4"/><rect x="68" y="31" width="42" height="18" rx="5" fill="#8fcfc8"/><rect x="133" y="31" width="42" height="12" rx="5" fill="#f2c89b"/><rect x="198" y="43" width="43" height="32" rx="5" fill="#292d34"/></svg><div><span>자동화</span><span>대기 정리</span><span>재작업</span><span>합계</span></div></div>';
  }
  root.AdminReference=Object.freeze({rail,header,activityFilter,sectionHeader,panel,activityPanel,activityBody,queueBody,requestPanel,metricGrid,impactPanels,approvalSummary,queueContext,dashboardBody,approvalBody,connectionBar,metric,orbit,activity,requestList,comparison,thresholds,impact});
})(globalThis);
