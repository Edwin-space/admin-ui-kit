/* Plain data powers both the demos and the copyable API usage. */
(function(root){
  'use strict';
  const f=root.AdminFixtures;
  const items=[
    ['stat','요약 카드','영상 · R01','데이터 0과 미확인을 구별하는 요약입니다.',[f.stats[0]]],
    ['badge','상태 배지','영상 · R01','색뿐 아니라 텍스트로 상태를 구분합니다.',['검토 대기','warn']],
    ['table','활동 표','공통 확장','열과 행을 넘겨 관리 목록을 구성합니다.',[{columns:[{key:'name',label:'활동'},{key:'status',label:'상태',kind:'badge'}],rows:f.activity.slice(0,2)}]],
    ['empty','빈 상태','영상 · R03–04','결과가 비었을 때 이유와 다음 흐름을 설명합니다.',[{title:'처리할 일이 없습니다',detail:'새 요청이 들어오면 이곳에 표시됩니다.'}]],
    ['skeleton','로딩 스켈레톤','영상 · R02','로딩 중에도 화면의 자리를 유지합니다.',[4]],
    ['connection','연결 상태 바','영상 · R05','연결 끊김과 복구를 구분합니다.',['recovered','09:42']],
    ['sidebar','사이드바','영상 · R01','현재 위치가 강조되는 왼쪽 메뉴입니다.',[{title:'운영 워크스페이스',items:[{label:'운영 개요',href:'#blocks',symbol:'grid',current:true},{label:'처리 대기열',href:'#queue',symbol:'queue'}]}]],
    ['pageHeader','페이지 헤더','영상 · R01','경로, 제목, 설명, 우측 액션을 정렬합니다.',[{context:'워크스페이스 / 홈',title:'운영 개요',detail:'오늘 처리할 일을 확인합니다.',actionLabel:'새 요청',action:'create'}]],
    ['search','검색 입력','영상 · R01','검색어를 입력할 수 있는 필드입니다.',[{id:'catalog-search-input',label:'업무 검색'}]],
    ['workQueue','처리 대기열','영상 · R01·R03','검토할 요청, 상태, 대상별 액션을 묶습니다.',[{rows:f.queue.slice(0,1)}]],
    ['timeline','이벤트 타임라인','영상 · R01','최근 이벤트의 시각과 내용을 비교합니다.',[{items:[{title:'보고서 생성',detail:'정기 작업',time:'09:41'},{title:'검토 요청 접수',detail:'운영 이벤트',time:'09:28'}]}]],
    ['upcoming','예정 작업 목록','영상 · R03','다음 작업과 예정 시각을 안내합니다.',[{items:f.upcoming}]],
    ['progress','진행 막대','영상 · R01','진행률이나 한도에 가까운 정도를 표시합니다.',[{label:'검토 완료율',value:72,detail:'예제 데이터'}]],
    ['barChart','미니 막대 차트','영상 · R01·R04','짧은 추이를 보여주는 보조 차트입니다.',[{label:'시간대별 처리 건수',values:[4,6,5,7,5,10,7,6,9,8],summary:'예제 10구간 · 최고 10건'}]],
    ['button','버튼','공통 확장','기본·강조·위험 선택과 비활성 상태를 지원합니다.',[{label:'저장',tone:'primary',action:'save'}]],
    ['textField','텍스트 필드','공통 확장','레이블, 입력값, 필수 여부, 검증 메시지를 연결합니다.',[{id:'catalog-name',label:'프로젝트 이름',placeholder:'예: 월간 운영',required:true}]],
    ['selectField','선택 메뉴','공통 확장','기본 선택과 옵션을 주입합니다.',[{id:'catalog-status',label:'상태 필터',value:'all',options:[{value:'all',label:'모든 상태'},{value:'pending',label:'대기'}]}]],
    ['checkbox','체크박스','공통 확장','선택 여부를 키보드로 바꿀 수 있습니다.',[{id:'catalog-check',label:'완료 항목 숨기기',checked:true}]],
    ['pagination','페이지 이동','공통 확장','현재 위치와 이전·다음 버튼을 표시합니다.',[{page:2,total:5}]],
    ['tabs','탭 내비게이션','공통 확장','URL로 이동하는 섹션 탭입니다. ARIA tab 위젯은 아닙니다.',[{items:[{label:'대시보드',href:'#blocks',current:true},{label:'대기열',href:'#queue'}]}]],
    ['notice','인라인 안내','공통 확장','문제가 생긴 영역 가까이에 설명을 표시합니다.',[{title:'가짜 데이터 예제',detail:'운영 시스템에는 전송하지 않습니다.',tone:'accent'}]],
    ['confirmDialog','확인 대화상자','공통 확장','변경이 발생하는 작업 전에 대상을 확인합니다.',[{id:'catalog-dialog',title:'변경을 적용할까요?',detail:'예제에서는 실제 저장하지 않습니다.',action:'catalog-confirm'}]]
  ];
  root.AdminCatalog=items;
})(globalThis);

/* Both the browser catalogue and the generated AI registry consume these descriptors. */
(function(root){
  'use strict';
  const f=root.AdminFixtures, metrics=f.dashboardMetrics(), history=f.reviewHistory();
  const entry=(id,title,section,description,args,options={})=>({id,title,section,description,args,...options});
  const states=(args,...values)=>values.map(([title,view])=>({title,args:[{...args,view}]}));
  const activity={rows:f.activity,filter:{id:'catalog-activity-status'},resultsId:'catalog-activity-results'};
  const requests={rows:f.queue};
  const queue={rows:f.queue,dashboard:false};
  const charts=[['comparison','목표 대비 편차'],['thresholds','다음 실행 임박'],['impact','운영 효과']];
  const mock={demoDataOnly:true};
  const complete={metrics,rows:f.activity,requests:f.queue,filter:{id:'catalog-complete-status'},resultsId:'catalog-complete-results'};
  const approval={requests:f.queue,events:history,schedule:f.upcoming,summary:{done:f.stats[2].value,pending:f.queue.length,next:'16:00'},historyId:'catalog-approval-history'};
  root.AdminDashboardCatalog=[
    entry('dashboardBody','대시보드 본문 레이아웃','조합 레이아웃','KPI 4열, 활동과 승인 2열, 하단 차트 3열을 실제 예제와 동일하게 조합.',[complete],{previewLayout:'wide',variants:states(complete,['오프라인','offline'],['로딩','loading'],['빈 상태','empty'],['조회 오류','error']),demoChart:true,hostBehavior:'정렬 규칙과 상태 조합을 재사용한다. 예시 차트를 호스트 데이터로 바꾸고 검색·검토 이벤트를 연결한다.'}),
    entry('approvalBody','처리 대기열 레이아웃','조합 레이아웃','처리 목록과 하단 집계, 이력 및 일정 패널을 실제 화면과 동일하게 배치.',[approval],{previewLayout:'wide',variants:states(approval,['오프라인','offline'],['로딩','loading'],['빈 상태','empty'],['조회 오류','error']),hostBehavior:'각 목록과 집계를 호스트 데이터로 넘긴다. 검토와 이력 보기 동작은 호스트가 연결한다.'}),
    entry('rail','둥근 왼쪽 메뉴','화면 뼈대','실제 예제의 여백과 둥근 모서리, 현재 위치와 사용자 표시.',[{current:'blocks'}],{previewLayout:'rail',variants:[{title:'처리 대기열 선택',args:[{current:'queue'}]}],hostBehavior:'items와 homeHref에 대상 프로젝트 경로를 넣고, 호스트에서 현재 메뉴를 넘긴다.'}),
    entry('header','대시보드 상단 헤더','화면 뼈대','제목·설명, 활동 검색, 승인 보기 버튼의 실제 정렬.',[{searchId:'catalog-head-search',headingLevel:3}],{previewLayout:'wide',variants:[{title:'처리 대기열 헤더',args:[{view:'queue',headingLevel:3}]}],hostBehavior:'제목·안내·검색·액션 경로를 넘긴다. 검색 입력은 호스트의 조회 상태와 연결한다.'}),
    entry('sectionHeader','패널 제목과 상태 표시','화면 뼈대','제목·설명과 오른쪽 필터·상태 표시를 나란히 배치.',[{name:'오늘의 활동',desc:'시간대별 실행과 주요 이벤트',mark:'오늘',filter:{id:'catalog-section-status'}}],{previewLayout:'wide',hostBehavior:'filter는 선택 사항이다. 변경 이벤트는 호스트가 처리한다.'}),
    entry('activityFilter','활동 상태 필터','화면 뼈대','활동 헤더에 들어가는 실제 상태 선택 메뉴.',[{id:'catalog-filter',value:'all'}],{hostBehavior:'필터 결과와 선택값은 호스트가 관리한다.'}),
    entry('metricGrid','KPI 카드 4열','요약 지표','대시보드의 네 카드와 미니 차트. 창이 좁아지면 카드가 줄을 바꾼다.',[{items:metrics}],{previewLayout:'wide',variants:states({items:metrics},['로딩','loading'],['빈 상태','empty'],['조회 오류','error']),demoChart:true,hostBehavior:'숫자와 설명을 items에 주입한다. 내장 스파크 모양은 예시다. 운영에서는 실제 데이터로 대체하거나 숨긴다.'}),
    entry('metric','KPI 카드와 미니 차트','요약 지표','한 장만 가져갈 때 사용. 세로 막대, 가로 막대, 색 구간, 추이 막대.',[{...metrics[0],index:0}],{demoChart:true,variants:metrics.slice(1).map((item,i)=>({title:item.label,args:[{...item,index:i+1}]})),hostBehavior:'실제 스파크 데이터가 없으면 quiet:true로 내장 예시를 숨긴다.'}),
    entry('activityPanel','오늘의 활동 패널','활동·승인','제목, 필터, 활동 시계와 이벤트 목록을 조합한 실제 화면.',[activity],{previewLayout:'wide',variants:states(activity,['로딩','loading'],['빈 상태','empty'],['조회 오류','error']),hostBehavior:'검색·필터·재시도는 호스트에서 처리한다. 시계 기호는 예시이고 목록 rows는 실제 데이터에 매핑할 수 있다.'}),
    entry('orbit','원형 활동 시계','활동·승인','대시보드 활동 패널 왼쪽의 원형 타임라인.',[],mock),
    entry('activity','활동 시계와 이벤트 목록','활동·승인','시간·아이콘·유형·설명·상태를 공유 열에 둔 실제 활동 본문.',[{rows:f.activity,emptyState:''}],{previewLayout:'wide',hostBehavior:'rows는 호스트에서 받는다. 원형 시각화는 정적 예제이므로 실제 시각과 점을 연결하지 않는다.'}),
    entry('requestPanel','내가 처리할 일 패널','활동·승인','제목과 건수, 상태 배지와 우측 검토 버튼의 실제 조합.',[requests],{variants:states(requests,['오프라인','offline'],['로딩','loading'],['빈 상태','empty'],['조회 오류','error']),hostBehavior:'review:<id>는 호스트가 기존 검토 화면에 연결한다. 오프라인에는 쓰기 버튼이 비활성화된다.'}),
    entry('requestList','승인 요청 카드 목록','활동·승인','아이콘·요청 제목·설명·배지와 세로 중앙 검토 버튼.',[requests],{variants:[{title:'버튼 비활성',args:[{...requests,disabled:true}]}],hostBehavior:'review:<id>는 기존 검토 흐름에 연결한다. 서버 권한을 별도로 확인한다.'}),
    entry('queueBody','처리 대기열 본문','활동·승인','별도 처리 대기열 화면의 검토 목록. 대시보드 요청 카드와 다른 레이아웃이다.',[queue],{variants:states(queue,['오프라인','offline'],['로딩','loading'],['빈 상태','empty'],['조회 오류','error']),hostBehavior:'review:<id>는 호스트의 실제 검토 흐름에 연결한다.'}),
    entry('queueContext','최근 처리와 다음 예정','활동·승인','처리 대기열 옆에 놓인 이력과 일정 패널.',[{events:history,schedule:f.upcoming}],{variants:states({events:history,schedule:f.upcoming},['로딩','loading'],['빈 상태','empty'],['조회 오류','error']),hostBehavior:'events와 schedule은 확인된 실제 데이터에 매핑한다.'}),
    entry('approvalSummary','대기열 하단 요약','활동·승인','오늘 완료·처리 대기·다음 예정 세 항목의 실제 요약.',[{done:f.stats[2].value,pending:f.queue.length,next:'16:00'}]),
    entry('impactPanels','하단 차트 3열','차트·연결','편차, 실행 임박, 운영 효과를 나란히 놓은 실제 배치.',[{}],{previewLayout:'wide',variants:states({},['로딩','loading'],['빈 상태','empty'],['조회 오류','error']),...mock}),
    ...charts.map(([id,title])=>entry(id,title,'차트·연결','대시보드에 사용한 차트 모양. 수치는 설명용이며 실데이터와 연결되지 않는다.',[],{previewLayout:'panel',...mock})),
    entry('connectionBar','하단 연결 상태 바','차트·연결','차트를 덮지 않는 하단 연결 영역. 실제 연결 상태와 재시도 버튼 모양.',[{view:'offline'}],{previewLayout:'wide',variants:[{title:'다시 연결하는 중',args:[{view:'reconnecting'}]},{title:'연결 복구됨',args:[{view:'recovered',checkedAt:'09:42'}]}],hostBehavior:'data-retry는 호스트가 실제 재시도에 연결하고 성공 여부를 다시 렌더링한다.'})
  ];
})(globalThis);
