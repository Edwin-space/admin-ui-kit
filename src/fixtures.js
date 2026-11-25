/* Fabricated, domain-neutral UI preview data. No account or operating records. */
window.AdminFixtures={
  stats:[
    {label:'처리 대기',value:3,detail:'검토가 필요한 요청',symbol:'queue'},
    {label:'기한 임박',value:1,detail:'오늘 중 확인 필요',symbol:'clock',tone:'warn'},
    {label:'오늘 완료',value:12,detail:'처리 내역에서 확인',symbol:'check',tone:'good'},
    {label:'처리 실패',value:1,detail:'원인 확인이 필요한 항목',symbol:'alert',tone:'bad'}
  ],
  activity:[
    {time:'09:41',name:'정기 보고서 생성 완료',group:'보고서',status:'완료',tone:'good'},
    {time:'09:28',name:'워크스페이스 권한 변경 요청',group:'권한',status:'대기',tone:'warn'},
    {time:'09:14',name:'문서 내보내기 재시도 필요',group:'문서',status:'실패',tone:'bad'},
    {time:'08:57',name:'월간 점검 일정 등록',group:'운영',status:'완료',tone:'good'},
    {time:'08:40',name:'팀 설정 변경 요청',group:'설정',status:'대기',tone:'warn'}
  ],
  upcoming:[{title:"주간 보고서 확인",detail:"정기 검토",when:"16:00"},{title:"설정 점검",detail:"운영 체크리스트",when:"내일"}],
  queue:[
    {id:'RQ-101',name:'워크스페이스 권한 검토',detail:'접근 범위 변경 요청',tone:'warn',status:'기한 임박'},
    {id:'RQ-102',name:'보고서 발행 검토',detail:'월간 운영 요약',tone:'accent',status:'검토 대기'},
    {id:'RQ-103',name:'팀 설정 변경 검토',detail:'알림 수신 대상 변경',tone:'accent',status:'검토 대기'}
  ]
};
window.AdminFixtures.dashboardMetrics=function(queue=this.queue,done=0){
 return [
  {label:'오늘 처리',value:this.stats[2].value+done,detail:'완료된 예제 작업',symbol:'activity',tone:'accent'},
  {label:'승인 대기',value:queue.length,detail:'내가 확인할 요청',symbol:'clock',tone:'warn'},
  {label:'확인 필요',value:this.stats[3].value,detail:'실패한 작업',symbol:'alert',tone:'bad'},
  {label:'운영 지표',value:'+24%',detail:'예제 효율 변화',symbol:'check',tone:'good'}
 ];
};
window.AdminFixtures.reviewHistory=function(decisions=[]){
 return [...decisions,...this.activity.filter(item=>item.status==='완료').map(item=>({title:item.name,time:item.time,detail:item.group}))].slice(0,5);
};
