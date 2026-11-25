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
