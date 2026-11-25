/*
 * 4단계 '실제 화면' — 햄버거 가게
 * 실제 패스트푸드 키오스크에서 자주 보는 모습을 그대로 넣었어요.
 *   - 대기 화면 광고, 언어 선택, 큰 글씨/낮은 화면/직원 호출 버튼
 *   - 왼쪽 세로 메뉴 분류, 작은 글씨의 빽빽한 메뉴판, BEST/NEW 표시, 품절(SOLD OUT)
 *   - 세트 → 사이드 → 음료를 차례로 고르는 창, 추가 메뉴를 권하는 창
 *   - 화면 아래 몸체의 카드 투입구, 영수증·번호표 출구
 *   - 남은 시간(60초). 아무 곳이나 누르면 다시 60초로 돌아가요.
 * (특정 회사의 화면이나 로고를 베끼지 않고, 여러 키오스크의 공통점을 모아 만들었어요)
 */

const CATS = [
  { id: 'cat-rec', label: '추천 메뉴' },
  { id: 'cat-burger', label: '버거 & 세트' },
  { id: 'cat-chicken', label: '치킨' },
  { id: 'cat-side', label: '디저트 사이드' },
  { id: 'cat-drink', label: '음료 커피' },
  { id: 'cat-ice', label: '아이스크림' },
];

const REC = [
  { id: 'rec-truffle', icon: '🍄', label: '트러플 머쉬룸 세트', price: '9,400원', badge: 'NEW' },
  { id: 'rec-double', icon: '🍔', label: '더블 불고기 세트', price: '8,200원', badge: 'BEST' },
  { id: 'rec-chicken', icon: '🍗', label: '치킨 3조각 팩', price: '9,900원' },
  { id: 'rec-fries', icon: '🍟', label: '양념감자', price: '2,500원' },
  { id: 'rec-shake', icon: '🍓', label: '딸기 쉐이크', price: '3,300원', badge: 'NEW' },
  { id: 'rec-cone', icon: '🍦', label: '소프트콘', price: '1,000원' },
  { id: 'rec-kids', icon: '🧒', label: '키즈 세트', price: '5,900원' },
  { id: 'rec-shrimp', icon: '🍤', label: '새우 세트', price: '7,400원', soldout: true },
  { id: 'rec-coffee', icon: '☕', label: '아메리카노', price: '2,000원' },
];

const BURGERS = [
  { id: 'b-truffle', icon: '🍄', label: '트러플 머쉬룸버거', price: '7,400원', badge: 'NEW' },
  { id: 'b-double', icon: '🍔', label: '더블 불고기버거', price: '6,200원', badge: 'BEST' },
  { id: 'item-bulgogi', icon: '🍔', label: '불고기버거', price: '4,500원' },
  { id: 'b-cheese', icon: '🧀', label: '치즈버거', price: '4,800원' },
  { id: 'b-shrimp', icon: '🍤', label: '새우버거', price: '5,000원', soldout: true },
  { id: 'b-chicken', icon: '🍗', label: '치킨버거', price: '5,200원' },
  { id: 'b-hanwoo', icon: '🥩', label: '한우 불고기버거', price: '8,900원' },
  { id: 'b-teri', icon: '🍔', label: '데리버거', price: '3,500원' },
  { id: 'b-hot', icon: '🌶️', label: '핫 크리스피버거', price: '5,900원' },
];

const BANNER = { type: 'banner', tag: 'EVENT', icon: '🍟', title: '세트 업그레이드 +500원', text: '오늘만! 라지 세트로 바꿔보세요' };
const menu = (active, items) => ({ type: 'split', side: { active, items: CATS }, main: [{ type: 'menu', cols: 3, items }] });

const cart = (items, total, payId, disabled = false) => ({
  type: 'cartpanel',
  place: '매장 식사',
  items,
  total,
  buttons: [
    { type: 'button', id: 'cart-clear', label: '전체 취소', style: 'outline' },
    { type: 'button', id: payId, label: '결제하기', style: 'primary', disabled },
  ],
});
const EMPTY_CART = cart([], '0원', 'pay-empty', true);
const FULL_CART = cart([{ id: 'c1', name: '불고기버거 세트', opts: '포테이토 · 콜라', qty: 1, price: '6,500원' }], '6,500원', 'pay');

const STEPBAR = (current) => ({ type: 'stepbar', items: ['식사 장소', '메뉴 선택', '결제'], current });
const SET_TOTAL = { type: 'total', label: '합계', value: '6,500원' };

export default {
  skin: 'real',
  kioskName: 'HAPPY BURGER',
  timeLimit: 60,
  timeoutTitle: '주문 시간이 초과되었습니다',
  hardware: ['card', 'receipt'],
  mission: "불고기버거 세트(사이드·음료는 기본)를 매장에서 먹고 가는 것으로 주문하고, 카드로 결제한 뒤 번호표까지 챙겨 보세요.",

  screens: {
    'r-attract': {
      noStatus: true,
      layout: [
        {
          type: 'attract', id: 'r-touch', tag: 'NEW',
          icon: '🍄🍔', title: '트러플 머쉬룸 버거 출시!', text: '진한 트러플 향을 지금 만나보세요',
          cta: '화면을 터치하여 주문을 시작하세요',
        },
      ],
      footer: [{ type: 'langbar' }],
    },
    'r-where': {
      layout: [
        STEPBAR(0),
        { type: 'title', text: '식사 장소를 선택해 주세요' },
        {
          type: 'row',
          items: [
            { type: 'button', id: 'eat-in', icon: '🍽️', label: '매장에서 식사', style: 'choice' },
            { type: 'button', id: 'take-out', icon: '🛍️', label: '포장 (테이크아웃)', style: 'choice' },
          ],
        },
        { type: 'text', small: true, text: '매장 식사 시 다회용기에 제공됩니다.' },
      ],
      footer: [{ type: 'langbar' }],
    },
    'r-menu-rec': { place: '매장 식사', layout: [BANNER, menu('cat-rec', REC)], footer: [EMPTY_CART] },
    'r-menu-burger': { place: '매장 식사', layout: [BANNER, menu('cat-burger', BURGERS)], footer: [EMPTY_CART] },
    'r-set': {
      base: 'r-menu-burger',
      title: '메뉴 선택',
      layout: [
        { type: 'itemhead', icon: '🍔', name: '불고기버거', desc: '달콤한 불고기 소스와 아삭한 양상추', price: '4,500원~' },
        {
          type: 'optgroup', title: '구성 선택', required: true, cols: 3,
          items: [
            { id: 'opt-single', icon: '🍔', label: '단품', sub: '4,500원' },
            { id: 'opt-set', icon: '🍔🍟🥤', label: '세트', sub: '6,500원' },
            { id: 'opt-large', icon: '🍔🍟🥤', label: '라지 세트', sub: '7,300원' },
          ],
        },
      ],
      footer: [{ type: 'button', id: 'set-cancel', label: '취소', style: 'outline' }],
    },
    'r-side': {
      base: 'r-menu-burger',
      title: '세트 구성 (1/2) 사이드 선택',
      layout: [
        {
          type: 'optgroup', title: '사이드', required: true, cols: 2,
          items: [
            { id: 'side-potato', icon: '🍟', label: '포테이토', sub: '기본', selected: true },
            { id: 'side-cheese', icon: '🧀', label: '치즈스틱', sub: '+1,000원' },
            { id: 'side-spicy', icon: '🌶️', label: '양념감자', sub: '+500원' },
            { id: 'side-salad', icon: '🥗', label: '콘샐러드', sub: '+0원' },
          ],
        },
      ],
      footer: [
        SET_TOTAL,
        { type: 'row', items: [
          { type: 'button', id: 'side-prev', label: '이전', style: 'outline' },
          { type: 'button', id: 'side-next', label: '다음', style: 'primary' },
        ] },
      ],
    },
    'r-drink': {
      base: 'r-menu-burger',
      title: '세트 구성 (2/2) 음료 선택',
      layout: [
        {
          type: 'optgroup', title: '음료', required: true, cols: 3,
          items: [
            { id: 'drink-cola', icon: '🥤', label: '콜라', sub: '기본', selected: true },
            { id: 'drink-zero', icon: '🥤', label: '제로콜라', sub: '+0원' },
            { id: 'drink-cider', icon: '🫧', label: '사이다', sub: '+0원' },
            { id: 'drink-coffee', icon: '☕', label: '아메리카노', sub: '+300원' },
            { id: 'drink-juice', icon: '🍊', label: '오렌지주스', sub: '+800원' },
            { id: 'drink-shake', icon: '🍓', label: '딸기쉐이크', sub: '+1,300원' },
          ],
        },
      ],
      footer: [
        SET_TOTAL,
        { type: 'row', items: [
          { type: 'button', id: 'drink-prev', label: '이전', style: 'outline' },
          { type: 'button', id: 'drink-done', label: '선택 완료', style: 'primary' },
        ] },
      ],
    },
    'r-upsell': {
      base: 'r-menu-burger',
      title: '함께 드시면 더 맛있어요!',
      layout: [
        { type: 'text', text: '디저트를 추가하시겠어요?' },
        {
          type: 'menu', cols: 3,
          items: [
            { id: 'up-cheese', icon: '🧀', label: '치즈스틱', price: '+2,000원', badge: 'BEST' },
            { id: 'up-cone', icon: '🍦', label: '소프트콘', price: '+1,000원' },
            { id: 'up-nugget', icon: '🍗', label: '너겟 4조각', price: '+2,500원' },
          ],
        },
      ],
      footer: [
        { type: 'row', items: [
          { type: 'button', id: 'upsell-skip', label: '추가 안 함', style: 'outline' },
          { type: 'button', id: 'upsell-add', label: '추가하기', style: 'primary', disabled: true },
        ] },
      ],
    },
    'r-menu-cart': { place: '매장 식사', layout: [BANNER, menu('cat-burger', BURGERS)], footer: [FULL_CART] },
    'r-pay-method': {
      place: '매장 식사',
      layout: [
        STEPBAR(2),
        { type: 'title', text: '결제 수단을 선택해 주세요' },
        { type: 'total', label: '결제 금액', value: '6,500원' },
        {
          type: 'menu', cols: 3, compact: true,
          items: [
            { id: 'pay-card', icon: '💳', label: '신용·체크카드' },
            { id: 'pay-samsung', icon: '📱', label: '삼성페이' },
            { id: 'pay-kakao', icon: '💬', label: '카카오페이' },
            { id: 'pay-naver', icon: '🟢', label: '네이버페이' },
            { id: 'pay-gift', icon: '🎁', label: '모바일 상품권' },
            { id: 'pay-coupon', icon: '🎟️', label: '쿠폰 사용' },
          ],
        },
        { type: 'text', small: true, text: '현금 결제는 카운터에서 가능합니다.' },
      ],
      footer: [{ type: 'button', id: 'pay-back', label: '이전', style: 'outline' }],
    },
    'r-insert': {
      place: '매장 식사',
      layout: [
        STEPBAR(2),
        { type: 'title', text: '카드를 투입구에 넣어주세요' },
        { type: 'icon', text: '💳' },
        { type: 'text', text: 'IC칩이 있는 쪽을 앞으로 하여 끝까지 넣어주세요.' },
        { type: 'total', label: '결제 금액', value: '6,500원' },
        { type: 'arrowdown', text: '아래 카드 투입구' },
      ],
      footer: [{ type: 'button', id: 'insert-cancel', label: '결제 취소', style: 'outline' }],
    },
    'r-paying': {
      place: '매장 식사',
      layout: [
        { type: 'spinner', text: '결제 중입니다' },
        { type: 'text', text: '카드를 빼지 마세요.' },
      ],
    },
    'r-remove': {
      place: '매장 식사',
      layout: [
        { type: 'icon', text: '✅' },
        { type: 'title', text: '결제가 완료되었습니다' },
        { type: 'text', text: '카드를 뽑아주세요.' },
        { type: 'arrowdown', text: '카드를 꼭 챙기세요' },
      ],
    },
    'r-receipt': {
      layout: [
        { type: 'title', text: '영수증을 출력하시겠습니까?' },
        { type: 'text', small: true, text: '주문번호표는 자동으로 출력됩니다.' },
        { type: 'row', items: [
          { type: 'button', id: 'receipt-yes', icon: '🧾', label: '영수증 출력', style: 'choice' },
          { type: 'button', id: 'receipt-no', icon: '🚫', label: '출력 안 함', style: 'choice' },
        ] },
      ],
    },
    'r-done': {
      layout: [
        { type: 'title', text: '주문이 완료되었습니다' },
        { type: 'ticket', title: '주문번호', number: '0105', text: '번호가 화면에 나오면 카운터에서 받아 가세요.' },
        { type: 'arrowdown', text: '아래 출구에서 번호표를 받아 가세요' },
      ],
    },
  },

  steps: [
    {
      screen: 'r-attract', target: 'r-touch',
      guide: '실제 기계는 처음에 광고가 나와요. 광고 그림을 아무 곳이나 누르면 주문이 시작돼요.',
      voice: '실제 기계는 처음에 광고가 나와요. 화면 가운데를 아무 곳이나 누르세요.',
      hint: '아래쪽 언어 버튼 말고, 위쪽 큰 광고 그림을 누르면 주문이 시작돼요.',
    },
    {
      screen: 'r-where', target: 'eat-in',
      guide: "어디서 먹을지 골라요. 이번에는 '매장에서 식사'를 눌러요.",
      voice: '왼쪽의 매장에서 식사를 누르세요.',
      hint: "접시 그림이 있는 왼쪽 '매장에서 식사'예요.",
    },
    {
      screen: 'r-menu-rec', target: 'cat-burger',
      guide: "메뉴 종류가 왼쪽에 세로로 있어요. 위에서 두 번째 '버거 & 세트'를 눌러요.",
      voice: '화면 왼쪽의 세로 메뉴에서 위에서 두 번째, 버거 앤 세트를 누르세요.',
      hint: "왼쪽 회색 줄의 위에서 두 번째 '버거 & 세트'예요.",
    },
    {
      screen: 'r-menu-burger', target: 'item-bulgogi',
      guide: "버거가 많아요. 천천히 '불고기버거'를 찾아 눌러요. 회색으로 “SOLD OUT”이라고 쓰인 것은 다 팔린 메뉴예요.",
      voice: '버거 목록 첫째 줄의 맨 오른쪽, 불고기버거를 누르세요.',
      hint: '4,500원짜리 불고기버거는 첫째 줄 세 번째에 있어요. 더블 불고기버거와 헷갈리지 마세요.',
    },
    {
      screen: 'r-set', target: 'opt-set',
      guide: "단품, 세트, 라지 세트 중에서 '세트'를 골라요.",
      voice: '창 가운데에 있는 세트를 누르세요.',
      hint: "가운데 6,500원짜리 '세트'예요. 라지 세트는 감자튀김과 음료가 더 커요.",
    },
    {
      screen: 'r-side', target: 'side-next',
      guide: "세트에 같이 나올 감자튀김 종류를 고르는 창이에요. 이미 골라져 있으니 그냥 '다음'을 눌러요.",
      voice: '감자튀김이 이미 골라져 있어요. 창 맨 아래 오른쪽 다음을 누르세요.',
      hint: "테두리가 진한 칸이 이미 고른 거예요. 바꾸지 않고 '다음'을 누르면 돼요.",
    },
    {
      screen: 'r-drink', target: 'drink-done',
      guide: "이번엔 음료예요. 콜라가 기본으로 골라져 있어요. '선택 완료'를 눌러요.",
      voice: '콜라가 이미 골라져 있어요. 창 맨 아래 오른쪽 선택 완료를 누르세요.',
      hint: "음료를 바꾸지 않을 거면 오른쪽 아래 '선택 완료'를 누르세요.",
    },
    {
      screen: 'r-upsell', target: 'upsell-skip',
      guide: "다른 메뉴를 더 사라고 권하는 창이 떴어요. 필요 없으면 '추가 안 함'을 눌러요.",
      voice: '추천 메뉴 창이에요. 필요 없으니 창 맨 아래 왼쪽, 추가 안 함을 누르세요.',
      hint: "실제 기계는 이런 추천 창이 자주 떠요. 그림을 누르면 추가되니, 왼쪽 아래 '추가 안 함'을 누르세요.",
    },
    {
      screen: 'r-menu-cart', target: 'pay',
      guide: "아래 주문 내역에 '불고기버거 세트'가 담겼어요. '결제하기'를 눌러요.",
      voice: '주문 내역에 불고기버거 세트가 담겼어요. 화면 맨 아래 오른쪽의 결제하기를 누르세요.',
      hint: "“전체 취소”를 누르면 다 지워져요. 오른쪽의 '결제하기'를 누르세요.",
    },
    {
      screen: 'r-pay-method', target: 'pay-card',
      guide: "결제 수단이 많아요. 카드로 낼 거니까 '신용·체크카드'를 눌러요.",
      voice: '결제 수단 중 왼쪽 위 첫 번째, 신용 체크카드를 누르세요.',
      hint: '카드 그림이 있는 첫 번째 칸이에요.',
    },
    {
      screen: 'r-insert', target: 'card-reader',
      guide: '진짜 기계는 카드를 화면 아래 몸체의 투입구에 꽂아요. 화면 아래 회색 몸체의 카드 투입구를 눌러요.',
      voice: '화면 아래쪽, 기계 몸체 왼쪽에 있는 카드 투입구를 누르세요.',
      hint: "화면 안이 아니라, 화면 아래 회색 부분의 'IC카드 투입구'를 누르세요.",
    },
    {
      screen: 'r-paying', wait: 2500, hardware: { card: true },
      guide: '결제하는 중이에요. 끝날 때까지 카드를 빼지 말고 기다려요.',
    },
    {
      screen: 'r-remove', target: 'card-reader', hardware: { card: true },
      guide: '결제가 끝났어요. 꽂혀 있는 카드를 꼭 빼야 해요. 카드 투입구를 눌러 카드를 뽑아요.',
      voice: '결제가 끝났어요. 카드를 두고 가지 않도록, 화면 아래 카드 투입구를 눌러 카드를 뽑으세요.',
      hint: '카드를 두고 가는 일이 많아요. 아래 카드 투입구를 눌러 카드를 챙기세요.',
    },
    {
      screen: 'r-receipt', target: 'receipt-no',
      guide: "영수증이 필요 없으면 '출력 안 함'을 눌러요. 주문번호표는 따로 나와요.",
      voice: '오른쪽의 출력 안 함을 누르세요.',
      hint: "종이 영수증이 필요하면 '영수증 출력', 아니면 오른쪽 '출력 안 함'이에요.",
    },
    {
      screen: 'r-done', target: 'receipt-slot', hardware: { paper: true },
      guide: '주문 완료! 화면 아래 오른쪽 출구로 주문번호표가 나왔어요. 출구를 눌러 번호표를 챙겨요.',
      voice: '주문이 끝났어요. 화면 아래 오른쪽 영수증 출구를 눌러 번호표를 받으세요.',
      hint: '기계 몸체 오른쪽, 종이가 나와 있는 출구를 누르세요.',
    },
  ],
};
