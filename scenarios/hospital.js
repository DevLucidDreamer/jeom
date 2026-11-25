/*
 * 시나리오: 병원 무인 접수기
 * (병원 이름 '튼튼병원', 환자 '김튼튼'은 연습용으로 지어낸 이름이에요)
 * 숫자판으로 생년월일을 입력하는 연습이 들어 있어요.
 *
 * 숫자 입력 단계는 target 대신 input 을 써요.
 *   input: { display: '입력칸 id', value: '눌러야 할 숫자들' }
 */
import real from './hospital-real.js'; // 4단계 '실제 화면'

export default {
  id: 'hospital',
  title: '병원 접수 기계',
  summary: '생년월일을 입력하고 진료를 접수해요',
  icon: '🏥',
  theme: 'hospital',
  kioskName: '튼튼병원 무인 접수',
  kioskLogo: '🏥',
  mission: "전에 와본 적 있는 환자로 '내과' 진료를 접수해 보세요. (연습용 생년월일: 520315)",
  real,

  screens: {
    main: {
      layout: [
        { type: 'title', text: '무엇을 도와드릴까요?' },
        {
          type: 'grid',
          cols: 2,
          items: [
            { id: 'reception', icon: '📝', label: '진료 접수', sub: '진료를 받으러 왔어요' },
            { id: 'payment', icon: '💰', label: '수납', sub: '진료비를 계산해요' },
            { id: 'prescription', icon: '💊', label: '처방전 출력', sub: '약국에 낼 종이' },
            { id: 'certificate', icon: '📄', label: '서류 발급', sub: '진단서·영수증' },
          ],
        },
      ],
    },
    visit: {
      layout: [
        { type: 'title', text: '우리 병원에 처음 오셨나요?' },
        {
          type: 'row',
          items: [
            { type: 'button', id: 'first', icon: '🆕', label: '처음 왔어요', sub: '초진', style: 'choice' },
            { type: 'button', id: 'revisit', icon: '🔁', label: '전에 와봤어요', sub: '재진', style: 'choice' },
          ],
        },
      ],
      footer: [{ type: 'button', id: 'go-home', label: '처음으로', style: 'ghost' }],
    },
    birth: {
      header: '튼튼병원 · 본인 확인',
      layout: [
        { type: 'text', text: '생년월일 6자리를 입력하세요' },
        { type: 'display', id: 'birth', length: 6 },
        { type: 'keypad' },
      ],
      footer: [
        {
          type: 'row',
          items: [
            { type: 'button', id: 'back', label: '이전', style: 'outline' },
            { type: 'button', id: 'confirm', label: '확인', style: 'primary' },
          ],
        },
      ],
    },
    name: {
      layout: [
        { type: 'title', text: '본인이 맞으신가요?' },
        { type: 'icon', text: '🙂' },
        { type: 'list', items: [{ label: '이름', value: '김튼튼' }, { label: '생년월일', value: '1952년 3월 15일' }] },
      ],
      footer: [
        {
          type: 'row',
          items: [
            { type: 'button', id: 'no', label: '아니오', style: 'outline' },
            { type: 'button', id: 'yes', label: '예, 맞아요', style: 'primary' },
          ],
        },
      ],
    },
    dept: {
      layout: [
        { type: 'title', text: '진료과를 골라주세요' },
        {
          type: 'grid',
          cols: 2,
          items: [
            { id: 'dept-internal', icon: '🩺', label: '내과', sub: '감기·배탈·혈압' },
            { id: 'dept-ortho', icon: '🦴', label: '정형외과', sub: '뼈·관절·허리' },
            { id: 'dept-ent', icon: '👂', label: '이비인후과', sub: '귀·코·목' },
            { id: 'dept-eye', icon: '👁️', label: '안과', sub: '눈' },
            { id: 'dept-derm', icon: '🧴', label: '피부과', sub: '피부' },
            { id: 'dept-dental', icon: '🦷', label: '치과', sub: '이·잇몸' },
          ],
        },
      ],
      footer: [{ type: 'button', id: 'back', label: '이전', style: 'ghost' }],
    },
    check: {
      layout: [
        { type: 'title', text: '접수 내용을 확인해 주세요' },
        {
          type: 'list',
          items: [
            { label: '이름', value: '김튼튼' },
            { label: '진료과', value: '내과' },
            { label: '담당 의사', value: '박건강 선생님' },
            { label: '지금 기다리는 사람', value: '3명' },
          ],
        },
      ],
      footer: [
        {
          type: 'row',
          items: [
            { type: 'button', id: 'back', label: '이전', style: 'outline' },
            { type: 'button', id: 'submit', label: '접수하기', style: 'primary' },
          ],
        },
      ],
    },
    done: {
      layout: [
        { type: 'ticket', title: '대기번호', number: '12', text: '내과 앞 의자에 앉아 기다려 주세요. 이름을 부르면 진료실로 들어가요.' },
        { type: 'button', id: 'done-ok', label: '확인', style: 'primary' },
      ],
    },
  },

  steps: [
    {
      screen: 'main',
      target: 'reception',
      guide: "병원 접수 기계예요. 진료를 받으러 왔으니 '진료 접수'를 눌러요.",
      voice: '병원 접수 기계예요. 왼쪽 위 첫 번째, 진료 접수를 누르세요.',
      hint: '종이와 연필 그림이 있는 첫 번째 버튼이에요.',
    },
    {
      screen: 'visit',
      target: 'revisit',
      guide: "처음 온 병원이면 '처음 왔어요', 전에 와본 병원이면 '전에 와봤어요'를 눌러요. 이번엔 '전에 와봤어요'를 눌러요.",
      voice: '이 병원에 전에 와본 적이 있다고 해볼게요. 오른쪽의 전에 와봤어요 버튼을 누르세요.',
      hint: "“재진”은 다시 온 환자라는 뜻이에요. 오른쪽 버튼을 누르세요.",
    },
    {
      screen: 'birth',
      input: { display: 'birth', value: '520315' },
      guide: '숫자판으로 생년월일 6자리를 입력해요. 연습용 번호 5 2 0 3 1 5를 차례로 눌러보세요.',
      voice: '숫자판에서 5, 2, 0, 3, 1, 5를 차례로 누르세요. 숫자판은 전화기 숫자판과 같은 배열이에요.',
      hint: '1952년 3월 15일생이라서 52, 03, 15예요.',
    },
    {
      screen: 'birth',
      target: 'confirm',
      guide: "6자리를 다 입력했어요. 맞는지 확인하고 '확인'을 눌러요.",
      voice: '6자리를 다 입력했어요. 화면 맨 아래 오른쪽의 확인 버튼을 누르세요.',
      hint: "숫자판 아래, 오른쪽의 '확인' 버튼이에요.",
    },
    {
      screen: 'name',
      target: 'yes',
      guide: "화면에 나온 이름과 생년월일이 내 것이 맞으면 '예, 맞아요'를 눌러요.",
      voice: '화면에 나온 이름이 맞는지 확인해요. 맨 아래 오른쪽의 예, 맞아요를 누르세요.',
      hint: "오른쪽 '예, 맞아요' 버튼이에요.",
    },
    {
      screen: 'dept',
      target: 'dept-internal',
      guide: "어느 진료과에서 진료받을지 골라요. 감기나 배탈은 '내과'예요.",
      voice: '진료과를 골라요. 감기나 배탈은 내과예요. 왼쪽 위 첫 번째, 내과를 누르세요.',
      hint: '청진기 그림이 있는 첫 번째 버튼이에요.',
    },
    {
      screen: 'check',
      target: 'submit',
      guide: "접수 내용을 확인하고 '접수하기'를 눌러요.",
      voice: '접수 내용을 확인해요. 맨 아래 오른쪽의 접수하기를 누르세요.',
      hint: "“이전” 말고 오른쪽 '접수하기' 버튼이에요.",
    },
    {
      screen: 'done',
      target: 'done-ok',
      guide: "접수 완료! 대기번호 12번 종이가 나와요. 내과 앞에서 기다리면 돼요. '확인'을 눌러요.",
      voice: '접수 완료! 대기번호는 십이 번이에요. 내과 앞에서 기다리면 돼요. 맨 아래 확인을 누르세요.',
      hint: "대기번호 아래 '확인' 버튼을 누르세요.",
    },
  ],
};
