/*
 * 4단계 '실제 화면' — 병원 무인 접수기
 * 실제 병원 접수기에서 자주 보는 모습:
 *   - 접수·수납·처방전·서류·실손보험·주차 등 메뉴가 많은 첫 화면
 *   - 본인 확인 방법 고르기, 개인정보 수집·이용 동의(체크 후 다음)
 *   - 주민등록번호 입력(뒷자리는 첫 숫자만 보이고 나머지는 ●)
 *   - 가나다순 진료과, 의사 선택(대기 인원, 휴진 표시)
 *   - 접수증 출구, 남은 시간(90초)
 * 연습용 가짜 정보: 김튼튼, 520315-2
 */

const STEPBAR = (current) => ({ type: 'stepbar', items: ['본인 확인', '진료 선택', '접수 완료'], current });
const STAFF = [{ type: 'row', items: [
  { type: 'button', id: 'big-text', label: '가 큰 글씨', style: 'outline' },
  { type: 'button', id: 'call-staff', label: '🔔 직원 호출', style: 'outline' },
] }];

const AGREE_TEXT = `[개인정보 수집·이용 동의]
1. 수집 항목: 성명, 주민등록번호, 연락처, 진료 정보
2. 수집 목적: 진료 접수 및 진료비 수납, 진료 예약 안내
3. 보유 기간: 의료법에 따른 진료기록 보존 기간
※ 동의를 거부할 수 있으나, 거부 시 무인 접수가 제한되며 원무과 창구를 이용하셔야 합니다.
[고유식별정보 처리 동의]
주민등록번호는 본인 확인 및 건강보험 자격 조회를 위해서만 사용됩니다.`;

const agree = (checked) => ({
  layout: [
    STEPBAR(0),
    { type: 'title', text: '개인정보 수집·이용 동의' },
    { type: 'notice', text: AGREE_TEXT },
    { type: 'check', id: 'agree-check', label: '위 내용을 확인하였으며 동의합니다. (필수)', checked },
  ],
  footer: [{ type: 'row', items: [
    { type: 'button', id: 'agree-prev', label: '이전', style: 'outline' },
    { type: 'button', id: checked ? 'agree-next' : 'agree-next-off', label: '다음', style: 'primary', disabled: !checked },
  ] }],
});

export default {
  skin: 'real',
  kioskName: '튼튼병원 무인 접수·수납',
  timeLimit: 90,
  timeoutTitle: '입력 시간이 초과되었습니다',
  hardware: ['card', 'receipt'],
  mission: "개인정보 동의 후 주민등록번호(연습용 520315-2)로 본인 확인을 하고, '내과' 박건강 선생님께 진료를 접수한 뒤 접수증을 챙겨 보세요.",

  screens: {
    'h-main': {
      layout: [
        { type: 'banner', tag: '안내', icon: '💉', title: '독감 예방접종 시행 중', text: '접수 후 주사실로 오세요' },
        { type: 'title', text: '원하시는 업무를 선택해 주세요' },
        {
          type: 'menu', cols: 2, compact: true,
          items: [
            { id: 'pay', icon: '💰', label: '수납 (진료비 결제)' },
            { id: 'reception', icon: '📝', label: '진료 접수' },
            { id: 'prescription', icon: '💊', label: '처방전 발급' },
            { id: 'certificate', icon: '📄', label: '제증명 발급' },
            { id: 'insurance', icon: '🧾', label: '실손보험 청구' },
            { id: 'reservation', icon: '📅', label: '예약 확인' },
            { id: 'parking', icon: '🚗', label: '주차 정산' },
            { id: 'result', icon: '🔬', label: '검사 결과 출력' },
          ],
        },
      ],
      footer: STAFF,
    },
    'h-id': {
      layout: [
        STEPBAR(0),
        { type: 'title', text: '본인 확인 방법을 선택해 주세요' },
        {
          type: 'menu', cols: 2, compact: true,
          items: [
            { id: 'id-card', icon: '🪪', label: '신분증 스캔' },
            { id: 'id-mobile', icon: '📱', label: '모바일 신분증' },
            { id: 'id-rrn', icon: '🔢', label: '주민등록번호 입력' },
            { id: 'id-barcode', icon: '💳', label: '진료카드 (바코드)' },
          ],
        },
        { type: 'text', small: true, text: '처음 오신 분은 원무과 창구에서 등록해 주세요.' },
      ],
      footer: [{ type: 'button', id: 'id-prev', label: '이전', style: 'outline' }],
    },
    'h-agree': agree(false),
    'h-agree2': agree(true),
    'h-rrn': {
      layout: [
        STEPBAR(0),
        { type: 'title', text: '주민등록번호를 입력해 주세요' },
        { type: 'display', id: 'rrn', length: 7, dash: 6, mask: '●●●●●●' },
        { type: 'keypad' },
      ],
      footer: [{ type: 'row', items: [
        { type: 'button', id: 'rrn-prev', label: '이전', style: 'outline' },
        { type: 'button', id: 'rrn-ok', label: '확인', style: 'primary' },
      ] }],
    },
    'h-who': {
      layout: [
        STEPBAR(0),
        { type: 'title', text: '본인이 맞으십니까?' },
        { type: 'list', items: [
          { label: '성명', value: '김*튼' },
          { label: '생년월일', value: '1952.03.15' },
          { label: '최근 내원일', value: '2026.10.02 (내과)' },
        ] },
        { type: 'text', small: true, text: '본인이 아닌 경우 \'아니오\'를 누르고 직원에게 문의해 주세요.' },
      ],
      footer: [{ type: 'row', items: [
        { type: 'button', id: 'who-no', label: '아니오', style: 'outline' },
        { type: 'button', id: 'who-yes', label: '예', style: 'primary' },
      ] }],
    },
    'h-dept': {
      layout: [
        STEPBAR(1),
        { type: 'title', text: '진료받으실 과를 선택해 주세요' },
        {
          type: 'menu', cols: 3, compact: true,
          items: [
            { id: 'd-family', label: '가정의학과', sub: '대기 2명' },
            { id: 'dept-internal', label: '내과', sub: '대기 11명' },
            { id: 'd-uro', label: '비뇨의학과', sub: '대기 1명' },
            { id: 'd-obgy', label: '산부인과', sub: '대기 4명' },
            { id: 'd-ped', label: '소아청소년과', sub: '대기 9명' },
            { id: 'd-ns', label: '신경외과', sub: '대기 3명' },
            { id: 'd-eye', label: '안과', sub: '대기 5명' },
            { id: 'd-ent', label: '이비인후과', sub: '대기 7명' },
            { id: 'd-rehab', label: '재활의학과', sub: '대기 0명' },
            { id: 'd-ortho', label: '정형외과', sub: '대기 12명' },
            { id: 'd-derm', label: '피부과', sub: '휴진', soldout: '휴진' },
            { id: 'd-radio', label: '영상의학과', sub: '검사 전용' },
          ],
        },
      ],
      footer: [{ type: 'button', id: 'dept-prev', label: '이전', style: 'outline' }],
    },
    'h-doctor': {
      layout: [
        STEPBAR(1),
        { type: 'title', text: '진료의를 선택해 주세요 (내과)' },
        {
          type: 'menu', cols: 1, compact: true,
          items: [
            { id: 'doc-lee', icon: '👨‍⚕️', label: '이튼튼 (순환기내과)', sub: '진료 중 · 대기 8명' },
            { id: 'doc-park', icon: '👩‍⚕️', label: '박건강 (소화기내과)', sub: '진료 중 · 대기 3명' },
            { id: 'doc-choi', icon: '👨‍⚕️', label: '최보람 (호흡기내과)', sub: '오후 진료', soldout: '휴진' },
            { id: 'doc-any', icon: '⚡', label: '빠른 진료', sub: '대기가 가장 적은 선생님께 접수' },
          ],
        },
      ],
      footer: [{ type: 'button', id: 'doc-prev', label: '이전', style: 'outline' }],
    },
    'h-confirm': {
      layout: [
        STEPBAR(2),
        { type: 'title', text: '접수 내용을 확인해 주세요' },
        { type: 'list', items: [
          { label: '환자명', value: '김*튼' },
          { label: '진료과', value: '내과' },
          { label: '진료의', value: '박건강' },
          { label: '예상 대기', value: '약 15분' },
          { label: '진료실', value: '2층 내과 3진료실' },
        ] },
      ],
      footer: [{ type: 'row', items: [
        { type: 'button', id: 'confirm-prev', label: '이전', style: 'outline' },
        { type: 'button', id: 'submit', label: '접수하기', style: 'primary' },
      ] }],
    },
    'h-done': {
      layout: [
        { type: 'title', text: '접수가 완료되었습니다' },
        { type: 'ticket', title: '접수번호', number: '내과 12', text: '2층 내과 3진료실 앞에서 기다려 주세요.' },
        { type: 'arrowdown', text: '아래 출구에서 접수증을 받아 가세요' },
      ],
    },
  },

  steps: [
    {
      screen: 'h-main', target: 'reception',
      guide: "병원 접수기는 메뉴가 많아요. 진료를 받으러 왔으니 '진료 접수'를 찾아 눌러요.",
      voice: '첫째 줄 오른쪽에 있는 진료 접수를 누르세요.',
      hint: "“수납”은 진료가 끝나고 돈을 낼 때예요. 첫째 줄 오른쪽 '진료 접수'를 누르세요.",
    },
    {
      screen: 'h-id', target: 'id-rrn',
      guide: "본인 확인 방법을 골라요. 이번에는 '주민등록번호 입력'을 눌러요.",
      voice: '둘째 줄 왼쪽, 주민등록번호 입력을 누르세요.',
      hint: "숫자 그림이 있는 '주민등록번호 입력'은 둘째 줄 왼쪽에 있어요.",
    },
    {
      screen: 'h-agree', target: 'agree-check',
      guide: "개인정보 동의 화면이에요. 동의해야 접수할 수 있어요. 아래 '동의합니다' 네모 칸을 눌러 체크해요.",
      voice: '글 상자 아래에 있는 동의합니다 체크 칸을 누르세요.',
      hint: "체크하기 전에는 '다음'이 회색이라 눌리지 않아요. 먼저 네모 칸을 눌러요.",
    },
    {
      screen: 'h-agree2', target: 'agree-next',
      guide: "체크 표시(✓)가 생겼어요. 이제 '다음'을 눌러요.",
      voice: '화면 맨 아래 오른쪽 다음을 누르세요.',
      hint: "체크하니 '다음' 버튼이 진해졌어요. 오른쪽 아래 '다음'을 누르세요.",
    },
    {
      screen: 'h-rrn', input: { display: 'rrn', value: '5203152' },
      guide: '주민등록번호를 입력해요. 연습에서는 5 2 0 3 1 5 다음에 뒷자리 첫 숫자 2까지만 눌러요. 나머지는 ●로 가려져요.',
      voice: '숫자판에서 5, 2, 0, 3, 1, 5, 그리고 2를 차례로 누르세요.',
      hint: '앞자리 520315를 누르면 자동으로 뒷자리 칸으로 넘어가요. 그다음 2를 누르세요.',
    },
    {
      screen: 'h-rrn', target: 'rrn-ok',
      guide: "번호를 확인하고 '확인'을 눌러요.",
      voice: '화면 맨 아래 오른쪽 확인을 누르세요.',
      hint: "숫자판 아래 오른쪽 '확인'이에요.",
    },
    {
      screen: 'h-who', target: 'who-yes',
      guide: "이름 가운데가 *로 가려져 있어요. 생년월일이 맞으면 '예'를 눌러요.",
      voice: '본인이 맞으면 맨 아래 오른쪽 예를 누르세요.',
      hint: "개인정보 보호를 위해 이름 일부를 가려요. 오른쪽 '예'를 누르세요.",
    },
    {
      screen: 'h-dept', target: 'dept-internal',
      guide: "진료과는 가나다순이에요. '내과'를 찾아 눌러요.",
      voice: '첫째 줄 가운데, 내과를 누르세요.',
      hint: "가정의학과 바로 다음, 첫째 줄 가운데 '내과'예요.",
    },
    {
      screen: 'h-doctor', target: 'doc-park',
      guide: "진료받을 선생님을 골라요. 대기 인원이 적은 '박건강' 선생님을 눌러요.",
      voice: '위에서 두 번째, 박건강 선생님을 누르세요.',
      hint: "“휴진”은 오늘 진료하지 않는다는 뜻이에요. 위에서 두 번째 '박건강'을 누르세요.",
    },
    {
      screen: 'h-confirm', target: 'submit',
      guide: "진료과·의사·진료실을 확인하고 '접수하기'를 눌러요.",
      voice: '접수 내용을 확인하고 맨 아래 오른쪽 접수하기를 누르세요.',
      hint: "“이전” 말고 오른쪽 '접수하기'예요.",
    },
    {
      screen: 'h-done', target: 'receipt-slot', hardware: { paper: true },
      guide: '접수 완료! 접수증이 출구로 나왔어요. 출구를 눌러 접수증을 챙겨요.',
      voice: '접수가 끝났어요. 화면 아래 오른쪽 출구를 눌러 접수증을 받으세요.',
      hint: '기계 몸체 오른쪽, 종이가 나와 있는 출구를 누르세요.',
    },
  ],
};
