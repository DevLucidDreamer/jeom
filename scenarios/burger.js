/*
 * 시나리오: 햄버거 가게 키오스크
 * (가게 이름 '행복버거'는 연습용으로 지어낸 이름이에요)
 *
 * screens : 키오스크 화면 설계도. 이름표(id)를 붙인 버튼만 누를 수 있어요.
 * steps   : 연습 순서. 각 단계는
 *   screen : 보여줄 화면 이름
 *   target : 눌러야 하는 버튼 id
 *   guide  : 자막으로 보여줄 안내
 *   voice  : 목소리로 읽어줄 안내 (위치를 말로 설명. 없으면 guide 를 읽어요)
 *   hint   : 틀렸거나 힌트를 눌렀을 때 보여줄 말
 */

import real from './burger-real.js'; // 4단계 '실제 화면'

// 여러 화면에서 같이 쓰는 부분
const TABS = (active) => ({
  type: 'tabs',
  active,
  items: [
    { id: 'tab-rec', label: '추천' },
    { id: 'tab-burger', label: '버거' },
    { id: 'tab-drink', label: '음료' },
    { id: 'tab-dessert', label: '디저트' },
  ],
});

const BURGERS = {
  type: 'grid',
  cols: 2,
  items: [
    { id: 'item-bulgogi', icon: '🍔', label: '불고기버거', sub: '4,500원' },
    { id: 'item-cheese', icon: '🧀', label: '치즈버거', sub: '4,800원' },
    { id: 'item-shrimp', icon: '🍤', label: '새우버거', sub: '5,000원' },
    { id: 'item-chicken', icon: '🍗', label: '치킨버거', sub: '5,200원', badge: '인기' },
  ],
};

const EMPTY_CART = {
  type: 'cartbar',
  text: '담은 메뉴가 없어요',
  button: { id: 'order-empty', label: '주문하기', style: 'primary', disabled: true },
};

export default {
  id: 'burger',
  title: '햄버거 가게 주문 기계',
  summary: '버거 세트를 고르고 카드로 결제해요',
  icon: '🍔',
  theme: 'burger',
  kioskName: '행복버거',
  kioskLogo: '🍔',
  mission: "불고기버거 세트 1개를 '먹고 가기'로 주문하고 카드로 결제해 보세요.",
  real,

  screens: {
    attract: {
      layout: [
        { type: 'icon', text: '🍔🍟🥤' },
        { type: 'title', text: '어서 오세요!' },
        { type: 'text', text: '행복버거에 오신 것을 환영합니다' },
        { type: 'spacer' },
        { type: 'button', id: 'touch-start', icon: '👆', label: '주문하려면 여기를 누르세요', style: 'big' },
      ],
    },
    where: {
      layout: [
        { type: 'title', text: '어디에서 드시나요?' },
        {
          type: 'row',
          items: [
            { type: 'button', id: 'eat-in', icon: '🍽️', label: '먹고 가기', sub: '매장에서 먹어요', style: 'choice' },
            { type: 'button', id: 'take-out', icon: '🛍️', label: '포장하기', sub: '가지고 가요', style: 'choice' },
          ],
        },
      ],
      footer: [{ type: 'button', id: 'go-home', label: '처음으로', style: 'ghost' }],
    },
    'menu-rec': {
      layout: [
        TABS('tab-rec'),
        {
          type: 'grid',
          cols: 2,
          items: [
            { id: 'rec-double', icon: '🍔', label: '더블치즈 세트', sub: '8,900원', badge: '인기' },
            { id: 'rec-kids', icon: '🧒', label: '어린이 세트', sub: '5,500원' },
            { id: 'rec-shake', icon: '🥤', label: '딸기 쉐이크', sub: '3,000원', badge: '신메뉴' },
            { id: 'rec-fries', icon: '🍟', label: '감자튀김(큰 것)', sub: '2,800원' },
          ],
        },
      ],
      footer: [EMPTY_CART],
    },
    'menu-burger': {
      layout: [TABS('tab-burger'), BURGERS],
      footer: [EMPTY_CART],
    },
    'set-choice': {
      base: 'menu-burger',
      title: '불고기버거',
      layout: [
        { type: 'text', text: '단품으로 드릴까요, 세트로 드릴까요?' },
        {
          type: 'row',
          items: [
            { type: 'button', id: 'opt-single', icon: '🍔', label: '단품', sub: '4,500원', style: 'choice' },
            { type: 'button', id: 'opt-set', icon: '🍔🍟🥤', label: '세트', sub: '6,500원', style: 'choice' },
          ],
        },
        { type: 'text', text: '세트: 버거 + 감자튀김 + 콜라', small: true },
      ],
      footer: [{ type: 'button', id: 'modal-cancel', label: '취소', style: 'outline' }],
    },
    'set-side': {
      base: 'menu-burger',
      title: '세트 구성 확인',
      layout: [
        {
          type: 'list',
          items: [
            { label: '🍔 버거', value: '불고기버거' },
            { label: '🍟 사이드', value: '감자튀김' },
            { label: '🥤 음료', value: '콜라' },
          ],
        },
        { type: 'total', label: '금액', value: '6,500원' },
        { type: 'text', text: "사이드나 음료를 바꾸려면 '변경하기'를 누르세요.", small: true },
      ],
      footer: [
        {
          type: 'row',
          items: [
            { type: 'button', id: 'change-side', label: '변경하기', style: 'outline' },
            { type: 'button', id: 'add-cart', label: '담기', style: 'primary' },
          ],
        },
      ],
    },
    'menu-cart': {
      layout: [TABS('tab-burger'), BURGERS],
      footer: [
        {
          type: 'cartbar',
          text: '불고기버거 세트 1개 · 6,500원',
          button: { id: 'order', label: '주문하기', style: 'primary' },
        },
      ],
    },
    confirm: {
      layout: [
        { type: 'title', text: '주문 내역을 확인해 주세요' },
        { type: 'list', items: [{ label: '불고기버거 세트 × 1', value: '6,500원' }, { label: '먹는 곳', value: '매장(먹고 가기)' }] },
        { type: 'total', label: '총 결제 금액', value: '6,500원' },
      ],
      footer: [
        {
          type: 'row',
          items: [
            { type: 'button', id: 'back', label: '이전으로', style: 'outline' },
            { type: 'button', id: 'pay', label: '결제하기', style: 'primary' },
          ],
        },
      ],
    },
    'pay-method': {
      layout: [
        { type: 'title', text: '결제 방법을 골라주세요' },
        {
          type: 'grid',
          cols: 2,
          items: [
            { id: 'pay-card', icon: '💳', label: '신용·체크카드' },
            { id: 'pay-mobile', icon: '📱', label: '간편결제(QR)' },
            { id: 'pay-coupon', icon: '🎟️', label: '쿠폰·기프티콘' },
            { id: 'pay-point', icon: '⭐', label: '포인트' },
          ],
        },
      ],
      footer: [{ type: 'button', id: 'back', label: '이전으로', style: 'ghost' }],
    },
    'insert-card': {
      layout: [
        { type: 'title', text: '카드를 넣어주세요' },
        { type: 'text', text: 'IC칩이 위로 가도록 카드를 투입구에 꽂아주세요.' },
        { type: 'slot', id: 'card-slot', label: '여기를 눌러 카드 꽂기 (연습)' },
        { type: 'total', label: '결제 금액', value: '6,500원' },
      ],
      footer: [{ type: 'button', id: 'cancel-pay', label: '결제 취소', style: 'ghost' }],
    },
    receipt: {
      layout: [
        { type: 'icon', text: '✅' },
        { type: 'title', text: '결제가 완료되었어요' },
        { type: 'text', text: '카드를 뽑아주세요. 영수증을 출력할까요?' },
        {
          type: 'row',
          items: [
            { type: 'button', id: 'receipt-yes', icon: '🧾', label: '출력', style: 'choice' },
            { type: 'button', id: 'receipt-no', icon: '🚫', label: '출력 안 함', style: 'choice' },
          ],
        },
      ],
    },
    done: {
      layout: [
        { type: 'ticket', title: '주문번호', number: '105', text: '화면에 번호가 나오면 카운터에서 받아가세요.' },
        { type: 'button', id: 'done-ok', label: '확인', style: 'primary' },
      ],
    },
  },

  steps: [
    {
      screen: 'attract',
      target: 'touch-start',
      guide: "주문 기계의 첫 화면이에요. 아래쪽 큰 버튼 '주문하려면 여기를 누르세요'를 눌러요.",
      voice: '주문 기계의 첫 화면이에요. 화면 가운데 아래쪽의 큰 버튼을 눌러 주문을 시작하세요.',
      hint: '손가락 그림이 있는 큰 버튼을 눌러보세요.',
    },
    {
      screen: 'where',
      target: 'eat-in',
      guide: "가게에서 먹고 갈지, 포장해 갈지 골라요. 이번에는 '먹고 가기'를 눌러보세요.",
      voice: '가게에서 먹고 갈지, 포장할지 골라요. 왼쪽에 있는 먹고 가기 버튼을 누르세요.',
      hint: "접시 그림이 있는 왼쪽 '먹고 가기' 버튼이에요.",
    },
    {
      screen: 'menu-rec',
      target: 'tab-burger',
      guide: "메뉴 화면이에요. 맨 위 줄에서 '버거'를 눌러요.",
      voice: '메뉴 화면이에요. 화면 맨 위, 왼쪽에서 두 번째에 있는 버거를 누르세요.',
      hint: "맨 위에 '추천, 버거, 음료, 디저트'가 나란히 있어요. 그중 '버거'를 누르세요.",
    },
    {
      screen: 'menu-burger',
      target: 'item-bulgogi',
      guide: "버거 메뉴가 나왔어요. '불고기버거'를 눌러보세요.",
      voice: '버거 메뉴가 나왔어요. 왼쪽 위 첫 번째 메뉴인 불고기버거를 누르세요.',
      hint: '4,500원짜리 첫 번째 메뉴, 불고기버거를 누르세요.',
    },
    {
      screen: 'set-choice',
      target: 'opt-set',
      guide: "작은 창이 떴어요. 감자튀김과 음료가 함께 나오는 '세트'를 골라요.",
      voice: '작은 창이 떴어요. 창 안의 오른쪽 버튼, 세트를 누르세요.',
      hint: "“단품”은 버거만, “세트”는 버거와 감자튀김과 음료예요. 오른쪽 '세트'를 누르세요.",
    },
    {
      screen: 'set-side',
      target: 'add-cart',
      guide: "세트 구성을 확인해요. 바꿀 것이 없으면 '담기'를 눌러 장바구니에 넣어요.",
      voice: '세트 구성을 확인해요. 바꿀 것이 없으면 창 아래 오른쪽의 담기 버튼을 누르세요.',
      hint: "“변경하기”가 아니라 그 옆의 '담기' 버튼이에요.",
    },
    {
      screen: 'menu-cart',
      target: 'order',
      guide: "화면 아래에 담은 메뉴가 보여요. 다 골랐으니 '주문하기'를 눌러요.",
      voice: '담은 메뉴가 화면 아래에 보여요. 화면 맨 아래 오른쪽 주문하기 버튼을 누르세요.',
      hint: "아래쪽 띠에 '불고기버거 세트 1개'가 보이죠? 그 오른쪽 '주문하기' 버튼이에요.",
    },
    {
      screen: 'confirm',
      target: 'pay',
      guide: "주문한 메뉴와 금액이 맞는지 확인하고 '결제하기'를 눌러요.",
      voice: '주문 내역을 확인해요. 6500원이 맞으면 화면 맨 아래 오른쪽 결제하기를 누르세요.',
      hint: "“이전으로”는 메뉴로 돌아가요. 오른쪽 '결제하기'를 누르세요.",
    },
    {
      screen: 'pay-method',
      target: 'pay-card',
      guide: "결제 방법을 골라요. 카드로 낼 거니까 '신용·체크카드'를 눌러요.",
      voice: '결제 방법을 골라요. 왼쪽 위 첫 번째, 신용 체크카드를 누르세요.',
      hint: '카드 그림이 있는 첫 번째 버튼이에요.',
    },
    {
      screen: 'insert-card',
      target: 'card-slot',
      guide: '실제 기계에서는 화면 아래 투입구에 카드를 꽂아요. 여기서는 카드 투입구 그림을 눌러보세요.',
      voice: '실제 기계에서는 카드를 투입구에 꽂아요. 연습에서는 화면 가운데의 카드 투입구 그림을 누르세요.',
      hint: '검은 줄이 있는 카드 투입구 그림을 누르면 카드를 꽂은 것으로 해요.',
    },
    {
      screen: 'receipt',
      target: 'receipt-no',
      guide: "결제가 끝났어요! 카드를 꼭 챙기세요. 영수증이 필요 없으면 '출력 안 함'을 눌러요.",
      voice: '결제가 끝났어요. 카드를 꼭 챙기세요. 영수증이 필요 없으니 오른쪽 출력 안 함을 누르세요.',
      hint: "종이 영수증이 필요하면 '출력', 필요 없으면 오른쪽 '출력 안 함'이에요.",
    },
    {
      screen: 'done',
      target: 'done-ok',
      guide: "주문 완료! 주문번호 105번이 화면에 나오면 받으러 가요. '확인'을 눌러 마쳐요.",
      voice: '주문 완료! 주문번호는 백오 번이에요. 번호가 화면에 나오면 받으러 가요. 맨 아래 확인을 누르세요.',
      hint: "주문번호 아래 '확인' 버튼을 누르세요.",
    },
  ],
};
