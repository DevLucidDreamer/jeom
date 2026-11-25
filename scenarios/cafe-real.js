/*
 * 4단계 '실제 화면' — 카페
 * 실제 카페 키오스크에서 자주 보는 모습:
 *   - 가로로 긴 메뉴 분류 탭, 메뉴가 12개 넘게 빽빽한 화면
 *   - 옵션 창이 길어서 아래로 내려야 수량이 보여요 (온도·사이즈·샷·시럽·우유)
 *   - 매장/포장을 맨 마지막에 묻는 경우, 휴대폰 번호 스탬프 적립 화면
 *   - 카드 투입구, 영수증·번호표 출구, 남은 시간(60초)
 */

const TABS = {
  type: 'tabs',
  active: 'tab-coffee',
  items: [
    { id: 'tab-coffee', label: '커피' },
    { id: 'tab-decaf', label: '디카페인' },
    { id: 'tab-latte', label: '논커피' },
    { id: 'tab-tea', label: '티' },
    { id: 'tab-ade', label: '에이드' },
    { id: 'tab-smoothie', label: '스무디' },
    { id: 'tab-dessert', label: '디저트' },
  ],
};

const COFFEES = {
  type: 'menu',
  cols: 3,
  items: [
    { id: 'c-espresso', icon: '☕', label: '에스프레소', price: '1,800원' },
    { id: 'c-americano', icon: '☕', label: '아메리카노', price: '2,000원', badge: 'BEST' },
    { id: 'c-honey', icon: '🍯', label: '꿀 아메리카노', price: '2,800원' },
    { id: 'c-vanilla', icon: '🍦', label: '바닐라 라떼', price: '3,500원' },
    { id: 'item-latte', icon: '🥛', label: '카페라떼', price: '3,000원' },
    { id: 'c-cappuccino', icon: '☕', label: '카푸치노', price: '3,000원' },
    { id: 'c-caramel', icon: '🍮', label: '카라멜 마끼아또', price: '3,700원' },
    { id: 'c-mocha', icon: '🍫', label: '카페모카', price: '3,700원' },
    { id: 'c-condensed', icon: '🥛', label: '연유 라떼', price: '3,800원', badge: 'NEW' },
    { id: 'c-einspanner', icon: '☁️', label: '아인슈페너', price: '4,000원' },
    { id: 'c-coldbrew', icon: '🧊', label: '콜드브루', price: '3,300원', soldout: true },
    { id: 'c-dolce', icon: '🥤', label: '돌체 라떼', price: '3,900원' },
  ],
};

const BANNER = { type: 'banner', tag: '이벤트', icon: '🎂', title: '케이크 + 음료 세트 10% 할인', text: '오후 2시~5시 한정' };

const cart = (items, total, orderId, disabled = false) => ({
  type: 'cartpanel',
  items,
  total,
  buttons: [
    { type: 'button', id: 'cart-clear', label: '전체 삭제', style: 'outline' },
    { type: 'button', id: orderId, label: '주문하기', style: 'primary', disabled },
  ],
});

/** 카페라떼 옵션 창 (고른 상태에 따라 모양이 달라져요) */
function optionScreen({ temp, size, qty }) {
  const price = (3000 + (size === 'large' ? 500 : size === 'jumbo' ? 1000 : 0)) * qty;
  return {
    base: 'r-menu',
    title: '옵션 선택',
    layout: [
      { type: 'itemhead', icon: '🥛', name: '카페라떼', desc: '고소한 우유와 에스프레소', price: '3,000원' },
      { type: 'optgroup', title: '온도', required: true, cols: 2, items: [
        { id: 'opt-hot', label: 'HOT', icon: '🔥', selected: temp === 'hot' },
        { id: 'opt-ice', label: 'ICE', icon: '🧊', selected: temp === 'ice' },
      ] },
      { type: 'optgroup', title: '사이즈', required: true, cols: 3, items: [
        { id: 'size-regular', label: 'Regular', sub: '기본', selected: size === 'regular' },
        { id: 'size-large', label: 'Large', sub: '+500원', selected: size === 'large' },
        { id: 'size-jumbo', label: 'Jumbo', sub: '+1,000원', selected: size === 'jumbo' },
      ] },
      { type: 'optgroup', title: '샷 추가', cols: 3, items: [
        { id: 'shot-0', label: '추가 안 함', selected: true },
        { id: 'shot-1', label: '1샷', sub: '+500원' },
        { id: 'shot-2', label: '2샷', sub: '+1,000원' },
      ] },
      { type: 'optgroup', title: '시럽 추가', cols: 4, items: [
        { id: 'syrup-0', label: '없음', selected: true },
        { id: 'syrup-vanilla', label: '바닐라', sub: '+500원' },
        { id: 'syrup-hazel', label: '헤이즐넛', sub: '+500원' },
        { id: 'syrup-caramel', label: '카라멜', sub: '+500원' },
      ] },
      { type: 'optgroup', title: '우유 변경', cols: 4, items: [
        { id: 'milk-normal', label: '일반', selected: true },
        { id: 'milk-low', label: '저지방', sub: '+0원' },
        { id: 'milk-soy', label: '두유', sub: '+500원' },
        { id: 'milk-oat', label: '오트', sub: '+700원' },
      ] },
      { type: 'stepper', label: '수량', value: qty, minusId: 'qty-minus', plusId: 'qty-plus' },
    ],
    footer: [
      { type: 'total', label: '금액', value: `${price.toLocaleString('ko-KR')}원` },
      { type: 'row', items: [
        { type: 'button', id: 'opt-cancel', label: '취소', style: 'outline' },
        { type: 'button', id: 'add-cart', label: '주문 담기', style: 'primary' },
      ] },
    ],
  };
}

export default {
  skin: 'real',
  kioskName: 'CLOUD COFFEE',
  timeLimit: 60,
  timeoutTitle: '주문 시간이 초과되었습니다',
  hardware: ['card', 'receipt'],
  mission: '따뜻한(HOT) 카페라떼 Large 사이즈 2잔을 포장으로 주문하고, 스탬프 적립은 건너뛴 뒤 카드로 결제하고 번호표를 챙겨 보세요.',

  screens: {
    'r-menu': { layout: [BANNER, TABS, COFFEES], footer: [cart([], '0원', 'order-empty', true)] },
    'r-opt-a': optionScreen({ temp: null, size: 'regular', qty: 1 }),
    'r-opt-b': optionScreen({ temp: 'hot', size: 'regular', qty: 1 }),
    'r-opt-c': optionScreen({ temp: 'hot', size: 'large', qty: 1 }),
    'r-opt-d': optionScreen({ temp: 'hot', size: 'large', qty: 2 }),
    'r-cart': {
      layout: [BANNER, TABS, COFFEES],
      footer: [cart([{ id: 'c1', name: '카페라떼', opts: 'HOT · Large', qty: 2, price: '7,000원' }], '7,000원', 'order')],
    },
    'r-where': {
      base: 'r-cart',
      title: '이용 방법 선택',
      layout: [
        { type: 'text', text: '매장에서 드시고 가시나요?' },
        { type: 'row', items: [
          { type: 'button', id: 'eat-in', icon: '☕', label: '매장 이용', sub: '머그컵 제공', style: 'choice' },
          { type: 'button', id: 'take-out', icon: '🥤', label: '포장', sub: '일회용 컵', style: 'choice' },
        ] },
      ],
      footer: [{ type: 'button', id: 'where-cancel', label: '이전', style: 'outline' }],
    },
    'r-stamp': {
      place: '포장',
      layout: [
        { type: 'title', text: '스탬프 적립' },
        { type: 'text', small: true, text: '휴대폰 번호를 입력하시면 스탬프가 적립됩니다. (10개 모으면 음료 1잔 무료)' },
        { type: 'display', id: 'phone', length: 8, prefix: '010-', dash: 4 },
        { type: 'keypad' },
      ],
      footer: [
        { type: 'row', items: [
          { type: 'button', id: 'stamp-skip', label: '적립 안 함', style: 'outline' },
          { type: 'button', id: 'stamp-ok', label: '적립하기', style: 'primary' },
        ] },
      ],
    },
    'r-pay': {
      place: '포장',
      layout: [
        { type: 'title', text: '결제 수단을 선택해 주세요' },
        { type: 'total', label: '결제 금액', value: '7,000원' },
        {
          type: 'menu', cols: 2, compact: true,
          items: [
            { id: 'pay-card', icon: '💳', label: '신용카드' },
            { id: 'pay-samsung', icon: '📱', label: '삼성페이' },
            { id: 'pay-kakao', icon: '💬', label: '카카오페이' },
            { id: 'pay-naver', icon: '🟢', label: '네이버페이' },
            { id: 'pay-zero', icon: '🔵', label: '제로페이' },
            { id: 'pay-gifticon', icon: '🎁', label: '기프티콘(바코드)' },
          ],
        },
      ],
      footer: [{ type: 'button', id: 'pay-back', label: '이전', style: 'outline' }],
    },
    'r-insert': {
      place: '포장',
      layout: [
        { type: 'title', text: '카드를 넣어주세요' },
        { type: 'icon', text: '💳' },
        { type: 'text', text: 'IC칩이 있는 쪽을 앞으로 하여 끝까지 넣어주세요.' },
        { type: 'total', label: '결제 금액', value: '7,000원' },
        { type: 'arrowdown', text: '아래 카드 투입구' },
      ],
      footer: [{ type: 'button', id: 'insert-cancel', label: '결제 취소', style: 'outline' }],
    },
    'r-paying': { place: '포장', layout: [{ type: 'spinner', text: '결제 승인 중입니다' }, { type: 'text', text: '카드를 빼지 마세요.' }] },
    'r-remove': {
      place: '포장',
      layout: [
        { type: 'icon', text: '✅' },
        { type: 'title', text: '결제가 완료되었습니다' },
        { type: 'text', text: '카드를 뽑아주세요.' },
        { type: 'arrowdown', text: '카드를 꼭 챙기세요' },
      ],
    },
    'r-receipt': {
      layout: [
        { type: 'title', text: '영수증을 출력할까요?' },
        { type: 'row', items: [
          { type: 'button', id: 'receipt-yes', icon: '🧾', label: '출력', style: 'choice' },
          { type: 'button', id: 'receipt-no', icon: '🚫', label: '출력 안 함', style: 'choice' },
        ] },
      ],
    },
    'r-done': {
      layout: [
        { type: 'title', text: '주문이 접수되었습니다' },
        { type: 'ticket', title: '주문번호', number: 'A-27', text: '음료가 준비되면 번호를 불러드려요.' },
        { type: 'arrowdown', text: '아래 출구에서 번호표를 받아 가세요' },
      ],
    },
  },

  steps: [
    {
      screen: 'r-menu', target: 'item-latte',
      guide: "카페 기계는 바로 메뉴부터 나와요. 메뉴가 많으니 천천히 '카페라떼'를 찾아 눌러요.",
      voice: '메뉴가 많아요. 둘째 줄 가운데에 있는 카페라떼를 누르세요.',
      hint: "3,000원짜리 '카페라떼'는 둘째 줄 가운데에 있어요. 바닐라 라떼나 연유 라떼와 헷갈리지 마세요.",
    },
    {
      screen: 'r-opt-a', target: 'opt-hot',
      guide: "고르는 창이 떴어요. 빨간 “필수” 표시는 꼭 골라야 한다는 뜻이에요. 먼저 'HOT(따뜻하게)'을 눌러요.",
      voice: '고르는 창이에요. 온도 줄의 왼쪽, 핫을 누르세요.',
      hint: 'HOT은 따뜻하게, ICE는 차갑게예요. 불꽃 그림을 누르세요.',
    },
    {
      screen: 'r-opt-b', target: 'size-large',
      guide: "컵 크기를 골라요. 'Large(큰 컵)'를 눌러요. Regular는 보통 컵이에요.",
      voice: '사이즈 줄의 가운데, 라지를 누르세요.',
      hint: "사이즈 줄 가운데 '+500원' 적힌 'Large'예요.",
    },
    {
      screen: 'r-opt-c', target: 'qty-plus',
      guide: "샷·시럽·우유는 그대로 두고, 아래로 내려서 수량을 2로 바꿔요. '+'를 눌러요.",
      voice: '창을 아래로 내리면 수량이 있어요. 수량 오른쪽 더하기를 누르세요.',
      hint: "창 안을 손가락으로 위로 밀어 올리면 맨 아래 '수량'이 보여요. '+'를 누르세요.",
    },
    {
      screen: 'r-opt-d', target: 'add-cart',
      guide: "금액 7,000원을 확인하고 '주문 담기'를 눌러요.",
      voice: '창 맨 아래 오른쪽 주문 담기를 누르세요.',
      hint: "“취소” 말고 오른쪽 '주문 담기'예요.",
    },
    {
      screen: 'r-cart', target: 'order',
      guide: "아래 주문 내역에 카페라떼 2잔이 담겼어요. '주문하기'를 눌러요.",
      voice: '화면 맨 아래 오른쪽의 주문하기를 누르세요.',
      hint: "“전체 삭제”를 누르면 다 지워져요. 오른쪽 '주문하기'를 누르세요.",
    },
    {
      screen: 'r-where', target: 'take-out',
      guide: "카페는 주문 마지막에 매장/포장을 묻기도 해요. 가지고 갈 거니까 '포장'을 눌러요.",
      voice: '창 안의 오른쪽, 포장을 누르세요.',
      hint: "일회용 컵 그림이 있는 오른쪽 '포장'이에요.",
    },
    {
      screen: 'r-stamp', target: 'stamp-skip',
      guide: "도장(스탬프)을 모으는 화면이에요. 모으지 않을 거면 번호를 넣지 말고 '적립 안 함'을 눌러요.",
      voice: '적립하지 않으려면 화면 맨 아래 왼쪽, 적립 안 함을 누르세요.',
      hint: "숫자판은 누르지 않아도 돼요. 아래 왼쪽 '적립 안 함'을 누르세요.",
    },
    {
      screen: 'r-pay', target: 'pay-card',
      guide: "결제 수단에서 '신용카드'를 눌러요.",
      voice: '왼쪽 위 첫 번째, 신용카드를 누르세요.',
      hint: '카드 그림이 있는 첫 번째 칸이에요.',
    },
    {
      screen: 'r-insert', target: 'card-reader',
      guide: '화면 아래 기계 몸체의 카드 투입구를 눌러 카드를 꽂아요.',
      voice: '화면 아래쪽, 기계 몸체 왼쪽의 카드 투입구를 누르세요.',
      hint: "화면 안이 아니라, 화면 아래 회색 부분의 'IC카드 투입구'예요.",
    },
    {
      screen: 'r-paying', wait: 2500, hardware: { card: true },
      guide: '결제 승인 중이에요. 카드를 빼지 말고 기다려요.',
    },
    {
      screen: 'r-remove', target: 'card-reader', hardware: { card: true },
      guide: '결제 완료! 카드 투입구를 눌러 카드를 뽑아요.',
      voice: '결제가 끝났어요. 화면 아래 카드 투입구를 눌러 카드를 뽑으세요.',
      hint: '카드를 두고 가지 않도록 아래 카드 투입구를 누르세요.',
    },
    {
      screen: 'r-receipt', target: 'receipt-no',
      guide: "영수증이 필요 없으면 '출력 안 함'을 눌러요.",
      voice: '오른쪽의 출력 안 함을 누르세요.',
      hint: "오른쪽 '출력 안 함'이에요.",
    },
    {
      screen: 'r-done', target: 'receipt-slot', hardware: { paper: true },
      guide: '주문 완료! 번호표가 출구로 나왔어요. 출구를 눌러 번호표를 챙겨요.',
      voice: '주문이 끝났어요. 화면 아래 오른쪽 출구를 눌러 번호표를 받으세요.',
      hint: '기계 몸체 오른쪽, 종이가 나와 있는 출구를 누르세요.',
    },
  ],
};
