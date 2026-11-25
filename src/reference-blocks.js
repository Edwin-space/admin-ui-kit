/* Film-inspired dashboard artwork; data is illustrative, never connected to a backend. */
(function(root){
  'use strict';
  const {e,icon,badge,button}=root.AdminKit;
  const colors=['#69b1c5','#e0a658','#80b79c','#a499d6','#79c3bb','#e1b774'];
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
  function rail(current){
    const items=[['blocks','홈','grid'],['queue','승인','queue'],['components','부품','layers'],['overview','가이드','activity']];
    return '<nav class="rb-rail" aria-label="관리자 화면 탐색"><a class="rb-logo" href="#blocks" aria-label="운영 홈">'+icon('layers')+'</a><div>'+items.map(([id,label,symbol])=>'<a href="#'+id+'"'+(id===current?' aria-current="page"':'')+'><span>'+icon(symbol)+'</span><small>'+label+'</small></a>').join('')+'</div><span class="rb-rail-end" aria-label="예제 사용자">UI</span></nav>';
  }
  function metric({label,value,detail,symbol,tone,index,quiet=false}){
    const series=[[4,6,4,8,5,7,5,9,4,11],[10,6,4],[5,3,6],[4,6,7,9,7,11,8]];
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
    return '<div class="rb-impact"><strong>+24%</strong><small>예제 처리 효율 · 최근 7일</small><svg viewBox="0 0 250 82" preserveAspectRatio="none" role="img" aria-label="예제 효율 기여도: 자동화 증가, 대기 정리 증가, 재작업 소폭 감소, 합계 증가"><defs><linearGradient id="rb-pos" x2="0" y2="1"><stop stop-color="#a8dec4"/><stop offset="1" stop-color="#519d85"/></linearGradient></defs><path d="M0 75H250M0 25H250" stroke="#e7ebec" stroke-dasharray="3 3"/><path d="M45 49H68M110 31H133M175 43H198" stroke="#bac6cd" stroke-dasharray="2 2"/><rect x="4" y="49" width="41" height="26" rx="5" fill="url(#rb-pos)"/><rect x="68" y="31" width="42" height="18" rx="5" fill="#8fcfc8"/><rect x="133" y="31" width="42" height="12" rx="5" fill="#f2c89b"/><rect x="198" y="43" width="43" height="32" rx="5" fill="#292d34"/></svg><div><span>자동화</span><span>대기 정리</span><span>재작업</span><span>합계</span></div></div>';
  }
  root.AdminReference=Object.freeze({rail,metric,orbit,activity,requestList,comparison,thresholds,impact});
})(globalThis);
