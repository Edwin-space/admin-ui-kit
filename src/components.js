/* Dependency-free rendering primitives, usable without the preview app.
   Every string option and dataset value is escaped. Do not pass raw HTML. */
(function (root) {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    queue:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6m-6 4h4"/>',
    activity:'<path d="M3 12h4l3-6 4 12 3-6h4"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    alert:'<path d="M12 8v4m0 4h.01"/><circle cx="12" cy="12" r="9"/>',
    wifi:'<path d="M3 9a14 14 0 0 1 18 0M6 13a9 9 0 0 1 12 0m-9 4a4 4 0 0 1 6 0m-3 3h.01"/>',
    arrow:'<path d="M4 12h15m-5-5 5 5-5 5"/>',
    search:'<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>'
  };
  const icon = name => '<svg class="ak-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(Object.hasOwn(paths,name) ? paths[name] : paths.grid)+'</svg>';
  function badge(label, tone='neutral') {
    const t=['neutral','good','warn','bad','accent'].includes(tone)?tone:'neutral';
    return '<span class="ak-badge ak-badge--'+t+'"><span aria-hidden="true"></span>'+e(label)+'</span>';
  }
  function stat({label,value,detail,symbol='grid',tone='accent'}) {
    const t=['good','warn','bad','accent'].includes(tone)?tone:'accent';
    return '<article class="ak-card ak-stat"><div class="ak-stat-head"><span>'+e(label)+'</span><span class="ak-glyph ak-glyph--'+t+'">'+icon(symbol)+'</span></div><strong>'+e(value ?? '—')+'</strong><small>'+e(detail)+'</small></article>';
  }
  function empty({title,detail,symbol='check'}) {
    return '<div class="ak-empty"><span class="ak-glyph ak-glyph--accent">'+icon(symbol)+'</span><strong>'+e(title)+'</strong><p>'+e(detail)+'</p></div>';
  }
  function skeleton(lines=4) {
    return '<div class="ak-skeleton" role="status"><span class="sr-only">불러오는 중</span>'+Array.from({length:Math.max(1,Math.min(10,Number(lines)||4))},()=>'<span aria-hidden="true"></span>').join('')+'</div>';
  }
  function connection(state, checkedAt) {
    if(!['offline','reconnecting','recovered'].includes(state)) return '';
    const recovered=state==='recovered';
    const title=recovered?'연결 복구됨':state==='reconnecting'?'다시 연결하는 중':'연결이 끊겼습니다';
    const detail=recovered?(checkedAt?'최종 동기화 '+checkedAt:'연결이 복구됐습니다.'):'마지막 조회 결과를 표시하고 있어요. 연결이 끊긴 동안에는 처리할 수 없어요.';
    return '<aside class="ak-connection '+(recovered?'is-good':'')+'" aria-label="연결 안내"><span class="ak-glyph '+(recovered?'ak-glyph--good':'ak-glyph--warn')+'">'+icon(recovered?'check':'wifi')+'</span><div role="status"><strong>'+title+'</strong><small>'+e(detail)+'</small></div>'+(state==='offline'?'<button type="button" class="ak-button" data-retry>다시 시도</button>':'')+'</aside>';
  }
  function table({columns,rows}) {
    const head=columns.map(c=>'<th scope="col">'+e(c.label)+'</th>').join('');
    const cells=rows.map(row=>'<tr>'+columns.map(c=>'<td>'+(c.kind==='badge'?badge(row[c.key],row.tone):e(row[c.key]))+'</td>').join('')+'</tr>').join('');
    return '<div class="ak-table-scroll" tabindex="0" role="region" aria-label="활동 내역"><table class="ak-table"><thead><tr>'+head+'</tr></thead><tbody>'+cells+'</tbody></table></div>';
  }
  function safeHref(value) {
    const s=String(value ?? '').trim();
    return s && !/[\u0000-\u0020\\]/.test(s) && !s.startsWith('//') && (!/^[\w+.-]+:/.test(s)||/^https?:\/\//i.test(s)) ? e(s) : '#';
  }
  const safeId=value=>/^[a-zA-Z][\w:-]*$/.test(String(value ?? ''))?e(value):'ak-field';
  const flag = value => value ? ' disabled' : '';
  const act = value => value ? ' data-ak-action="'+e(value)+'"' : '';
  function button({label,tone='default',disabled=false,action,submit=false}) {
    const t=['primary','danger'].includes(tone)?' ak-button--'+tone:'';
    return '<button type="'+(submit?'submit':'button')+'" class="ak-button'+t+'"'+act(action)+flag(disabled)+'>'+e(label)+'</button>';
  }
  function sidebar({title,items,footer=''}) {
    return '<aside class="ak-side"><div class="ak-side-brand">'+icon('layers')+e(title)+'</div><nav aria-label="관리자 메뉴">'+items.map(item=>'<a href="'+safeHref(item.href)+'"'+(item.current?' aria-current="page"':'')+'>'+icon(item.symbol)+e(item.label)+'</a>').join('')+'</nav>'+(footer?'<small>'+e(footer)+'</small>':'')+'</aside>';
  }
  function pageHeader({title,detail='',context='',status='',actionLabel,action}) {
    return '<header class="ak-page-head"><div>'+(context?'<small>'+e(context)+'</small>':'')+'<h2>'+e(title)+'</h2>'+(detail?'<p>'+e(detail)+'</p>':'')+'</div><div class="ak-page-ops">'+(status?badge(status,'accent'):'')+(actionLabel?button({label:actionLabel,action,tone:'primary'}):'')+'</div></header>';
  }
  function search({id='ak-search',label='검색',value='',disabled=false}={}) {
    return '<label class="ak-search">'+icon('search')+'<span class="sr-only">'+e(label)+'</span><input class="ak-control" id="'+safeId(id)+'" type="search" placeholder="'+e(label)+'" value="'+e(value)+'"'+flag(disabled)+'></label>';
  }
  function workQueue({rows,disabled=false,actionLabel='검토'}) {
    return rows.length?'<ul class="ak-queue">'+rows.map(row=>'<li><div><span>'+e(row.id)+'</span><strong>'+e(row.name)+'</strong><small>'+e(row.detail)+'</small></div><div>'+badge(row.status,row.tone)+button({label:actionLabel,action:'review:'+row.id,disabled})+'</div></li>').join('')+'</ul>':empty({title:'처리할 일이 없습니다',detail:'새 요청이 들어오면 이곳에 표시됩니다.'});
  }
  function timeline({items,label='최근 활동'}) {
    return '<ol class="ak-timeline" aria-label="'+e(label)+'">'+items.map(item=>'<li><span class="ak-timeline-dot" aria-hidden="true"></span><div><strong>'+e(item.title)+'</strong><small>'+e(item.detail)+'</small></div><span class="ak-row-meta">'+e(item.time)+'</span></li>').join('')+'</ol>';
  }
  function upcoming({items,label='다음 예정 작업'}) {
    return '<ul class="ak-upcoming" aria-label="'+e(label)+'">'+items.map(item=>'<li><span class="ak-glyph ak-glyph--accent">'+icon(item.symbol||'clock')+'</span><div><strong>'+e(item.title)+'</strong><small>'+e(item.detail)+'</small></div><span class="ak-row-meta">'+e(item.when)+'</span></li>').join('')+'</ul>';
  }
  const bounded = n => Math.min(100,Math.max(0,Number(n)||0));
  function progress({label,value,detail=''}) {
    const n=bounded(value);
    return '<div class="ak-progress"><div><strong>'+e(label)+'</strong><span>'+n+'%</span></div><progress max="100" value="'+n+'" aria-label="'+e(label)+'"></progress>'+(detail?'<small>'+e(detail)+'</small>':'')+'</div>';
  }
  function barChart({label,values,summary=''}) {
    const nums=values.slice(0,30).map(n=>Math.max(0,Number(n)||0)).map(n=>Number.isFinite(n)?n:0);
    const scale=Math.max(1,...nums);
    return '<figure class="ak-chart"><figcaption>'+e(label)+'</figcaption><div class="ak-chart-bars" aria-hidden="true">'+nums.map(n=>'<i style="--bar-height:'+Math.round(n/scale*100)+'%"></i>').join('')+'</div>'+(summary?'<p>'+e(summary)+'</p>':'')+'<span class="sr-only">표시 순서별 값: '+e(nums.join(', ')||'없음')+'</span></figure>';
  }
  function textField({id,label,value='',placeholder='',required=false,disabled=false,error=''}) {
    const i=safeId(id);
    return '<div class="ak-field"><label for="'+i+'">'+e(label)+'</label><input class="ak-control" id="'+i+'" value="'+e(value)+'" placeholder="'+e(placeholder)+'"'+(required?' required':'')+flag(disabled)+(error?' aria-invalid="true" aria-describedby="'+i+'-error"':'')+'>'+(error?'<small class="ak-field-error" id="'+i+'-error">'+e(error)+'</small>':'')+'</div>';
  }
  function selectField({id,label,options,value,inline=false,disabled=false}) {
    const i=safeId(id);
    return '<label class="ak-field'+(inline?' ak-field--inline':'')+'" for="'+i+'"><span>'+e(label)+'</span><select class="ak-control" id="'+i+'"'+flag(disabled)+'>'+options.map(option=>'<option value="'+e(option.value)+'"'+(String(option.value)===String(value)?' selected':'')+'>'+e(option.label)+'</option>').join('')+'</select></label>';
  }
  function checkbox({id,label,checked=false,disabled=false}) {
    return '<label class="ak-check"><input type="checkbox" id="'+safeId(id)+'"'+(checked?' checked':'')+flag(disabled)+'>'+e(label)+'</label>';
  }
  function pagination({page,total,label='페이지 이동'}) {
    const max=Math.max(1,Math.floor(Number(total))||1), current=Math.max(1,Math.min(max,Math.floor(Number(page))||1));
    return '<nav class="ak-page-nav" aria-label="'+e(label)+'">'+button({label:'이전',disabled:current===1,action:'page:'+(current-1)})+'<span aria-live="polite">'+current+' / '+max+'</span>'+button({label:'다음',disabled:current===max,action:'page:'+(current+1)})+'</nav>';
  }
  function tabs({items,label='화면 전환'}) {
    return '<nav class="ak-link-tabs" aria-label="'+e(label)+'">'+items.map(item=>'<a href="'+safeHref(item.href)+'"'+(item.current?' aria-current="page"':'')+'>'+e(item.label)+'</a>').join('')+'</nav>';
  }
  function notice({title,detail,tone='warn'}) {
    const t=['good','warn','bad','accent'].includes(tone)?tone:'warn';
    return '<section class="ak-notice ak-notice--'+t+'" aria-label="'+e(title)+'">'+icon(t==='good'?'check':'alert')+'<div><strong>'+e(title)+'</strong><p>'+e(detail)+'</p></div></section>';
  }
  function confirmDialog({id,title,detail,confirmLabel='확인',cancelLabel='취소',action='confirm',detailId}) {
    const i=safeId(id);
    return '<dialog class="ak-dialog" id="'+i+'" aria-labelledby="'+i+'-title"><h2 id="'+i+'-title">'+e(title)+'</h2>'+(detailId?'<p id="'+safeId(detailId)+'"></p>':'')+'<p>'+e(detail)+'</p><div>'+button({label:cancelLabel,action:'cancel:'+i})+button({label:confirmLabel,tone:'primary',action})+'</div></dialog>';
  }
  root.AdminKit=Object.freeze({e,icon,badge,stat,empty,skeleton,connection,table,sidebar,pageHeader,search,workQueue,timeline,upcoming,progress,barChart,button,textField,selectField,checkbox,pagination,tabs,notice,confirmDialog});
})(globalThis);
