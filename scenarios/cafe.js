/*
 * 시나리오: 카페 키오스크
 * (가게 이름 '구름카페'는 연습용으로 지어낸 이름이에요)
 * 옵션(온도·크기·수량)을 고르고, 포인트 적립 창을 건너뛰는 연습을 해요.
 */

import real from './cafe-real.js'; // 4단계 '실제 화면'

const TABS = {
  type: 'tabs',
  active: 'tab-coffee',
  items: [
    { id: 'tab-coffee', label: '커피' },
    { id: 'tab-tea', label: '차·음료' },
    { id: 'tab-dessert', label: '디저트' },
  ],
};

const COFFEES = {
  type: 'grid',
  cols: 2,
  items: [
    { id: 'item-americano', icon: '☕', label: '아메리카노', sub: '3,000원', badge: '인기' },
    { id: 'item-latte', icon: '🥛', label: '카페라떼', sub: '3,500원' },
    { id: 'item-vanilla', icon: '🍦', label: '바닐라라떼', sub: '4,000원' },
    { id: 'item-cappuccino', icon: '☕', label: '카푸치노', sub: '3,800원' },
    { id: 'item-mocha', icon: '🍫', label: '카페모카', sub: '4,200원' },
    { id: 'item-decaf', icon: '🌙', label: '디카페인 아메리카노', sub: '3,500원' },
  ],
};

/**
 * 카페라떼 옵션 창. 고른 상태에 따라 모양이 달라져서 함수로 만들었어요.
 * temp: null | 'hot' | 'ice', size: 'regular' | 'large', qty: 숫자
 */
function optionScreen({ temp, size, qty }) {
  const price = (3500 + (size === 'large' ? 500 : 0)) * qty;
  return {
    base: 'menu',
    title: '카페라떼 옵션 선택',
    layout: [
      { type: 'label', text: '① 온도' },
      {
        type: 'row',
        items: [
          { type: 'button', id: 'opt-hot', icon: '🔥', label: 'HOT', sub: '따뜻하게', style: 'choice', selected: temp === 'hot' },
          { type: 'button', id: 'opt-ice', icon: '🧊', label: 'ICE', sub: '차갑게', style: 'choice', selected: temp === 'ice' },
        ],
      },
      { type: 'label', text: '② 크기' },
      {
        type: 'row',
        items: [
          { type: 'button', id: 'size-regular', label: '보통', sub: '+0원', style: 'choice', selected: size === 'regular' },
          { type: 'button', id: 'size-large', label: '크게', sub: '+500원', style: 'choice', selected: size === 'large' },
        ],
      },
      { type: 'stepper', label: '③ 수량', value: qty, minusId: 'qty-minus', plusId: 'qty-plus' },
    ],
    footer: [
      { type: 'total', label: '금액', value: `${price.toLocaleString('ko-KR')}원` },
      {
        type: 'row',
        items: [
          { type: 'button', id: 'modal-cancel', label: '취소', style: 'outline' },
          { type: 'button', id: 'add-cart', label: '담기', style: 'primary' },
        ],
      },
    ],
  };
}

export default {
  id: 'cafe',
  title: '카페 주문 기계',
  summary: '온도·크기·잔 수를 고르고 포장 주문해요',
  icon: '☕',
  theme: 'cafe',
  kioskName: '구름카페',
  kioskLogo: '☁️',
  mission: '따뜻한(HOT) 카페라떼 큰 사이즈 2잔을 포장 주문하고 카드로 결제해 보세요.',
  real,

  screens: {
    attract: {
      layout: [
        { type: 'icon', text: '☕🍰' },
        { type: 'title', text: '구름카페' },
        { type: 'text', text: '맛있는 커피 한 잔 어떠세요?' },
        { type: 'spacer' },
        { type: 'button', id: 'touch-start', icon: '👆', label: '주문하기', style: 'big' },
      ],
    },
    where: {
      layout: [
        { type: 'title', text: '드시고 가시나요?' },
        {
          type: 'row',
          items: [
            { type: 'button', id: 'eat-in', icon: '🪑', label: '매장에서', sub: '여기서 마셔요', style: 'choice' },
            { type: 'button', id: 'take-out', icon: '🥤', label: '포장(테이크아웃)', sub: '가지고 가요', style: 'choice' },
          ],
        },
      ],
      footer: [{ type: 'button', id: 'go-home', label: '처음으로', style: 'ghost' }],
    },
    menu: {
      layout: [TABS, COFFEES],
      footer: [
        { type: 'cartbar', text: '담은 메뉴가 없어요', button: { id: 'checkout-empty', label: '결제하기', style: 'primary', disabled: true } },
      ],
    },
    'opt-a': optionScreen({ temp: null, size: 'regular', qty: 1 }),
    'opt-b': optionScreen({ temp: 'hot', size: 'regular', qty: 1 }),
    'opt-c': optionScreen({ temp: 'hot', size: 'large', qty: 1 }),
    'opt-d': optionScreen({ temp: 'hot', size: 'large', qty: 2 }),
    cart: {
      layout: [TABS, COFFEES],
      footer: [
        { type: 'cartbar', text: '카페라떼(HOT·크게) 2잔 · 8,000원', button: { id: 'checkout', label: '결제하기', style: 'primary' } },
      ],
    },
    point: {
      base: 'cart',
      title: '포인트 적립',
      layout: [
        { type: 'icon', text: '⭐' },
        { type: 'text', text: '휴대폰 번호로 포인트를 적립하시겠어요?' },
      ],
      footer: [
        {
          type: 'row',
          items: [
            { type: 'button', id: 'point-yes', label: '적립하기', style: 'primary' },
            { type: 'button', id: 'point-skip', label: '건너뛰기', style: 'outline' },
          ],
        },
      ],
    },
    'pay-method': {
      layout: [
        { type: 'title', text: '결제 수단을 골라주세요' },
        { type: 'total', label: '결제 금액', value: '8,000원' },
        {
          type: 'grid',
          cols: 2,
          items: [
            { id: 'pay-card', icon: '💳', label: '카드결제' },
            { id: 'pay-mobile', icon: '📱', label: '모바일 페이' },
            { id: 'pay-gift', icon: '🎁', label: '기프트카드' },
            { id: 'pay-coupon', icon: '🎟️', label: '쿠폰' },
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
        { type: 'total', label: '결제 금액', value: '8,000원' },
      ],
      footer: [{ type: 'button', id: 'cancel-pay', label: '결제 취소', style: 'ghost' }],
    },
    done: {
      layout: [
        { type: 'ticket', title: '주문번호', number: 'A-27', text: '음료가 준비되면 번호를 불러드려요. 영수증은 아래에서 가져가세요.' },
        { type: 'button', id: 'done-ok', label: '확인', style: 'primary' },
      ],
    },
  },

  steps: [
    {
      screen: 'attract',
      target: 'touch-start',
      guide: "카페 주문 기계예요. 화면 가운데 '주문하기'를 눌러요.",
      voice: '카페 주문 기계예요. 화면 가운데 아래쪽의 큰 주문하기 버튼을 누르세요.',
      hint: '손가락 그림이 있는 큰 버튼이에요.',
    },
    {
      screen: 'where',
      target: 'take-out',
      guide: "이번에는 커피를 가지고 갈 거예요. '포장(테이크아웃)'을 눌러요.",
      voice: '이번에는 커피를 가지고 갈 거예요. 오른쪽의 포장 버튼을 누르세요.',
      hint: "“테이크아웃”은 가지고 간다는 뜻이에요. 오른쪽 버튼을 누르세요.",
    },
    {
      screen: 'menu',
      target: 'item-latte',
      guide: "커피 메뉴예요. '카페라떼'를 찾아 눌러보세요.",
      voice: '커피 메뉴예요. 첫째 줄 오른쪽에 있는 카페라떼를 누르세요.',
      hint: '우유 그림이 있는 3,500원짜리 메뉴예요. 첫째 줄 오른쪽에 있어요.',
    },
    {
      screen: 'opt-a',
      target: 'opt-hot',
      guide: "커피를 어떻게 마실지 고르는 창이에요. 먼저 온도를 골라요. 따뜻한 커피니까 'HOT(따뜻하게)'을 눌러요.",
      voice: '커피를 어떻게 마실지 고르는 창이에요. 따뜻한 커피니까 온도 줄의 왼쪽, 핫 버튼을 누르세요.',
      hint: "HOT은 따뜻하게, ICE는 차갑게라는 뜻이에요. 불꽃 그림이 있는 'HOT'을 누르세요.",
    },
    {
      screen: 'opt-b',
      target: 'size-large',
      guide: "다음은 크기예요. 큰 사이즈로 바꾸려면 '크게'를 눌러요.",
      voice: '다음은 크기예요. 크기 줄의 오른쪽, 크게 버튼을 누르세요.',
      hint: "“보통”이 이미 골라져 있어요. 그 옆의 '크게(+500원)'를 누르세요.",
    },
    {
      screen: 'opt-c',
      target: 'qty-plus',
      guide: "두 잔을 주문할 거예요. 수량 옆의 '+' 버튼을 눌러 1을 2로 바꿔요.",
      voice: '두 잔을 주문할 거예요. 수량 줄의 오른쪽, 더하기 버튼을 누르세요.',
      hint: "“−”는 줄이기, “+”는 늘리기예요. 숫자 오른쪽의 '+'를 누르세요.",
    },
    {
      screen: 'opt-d',
      target: 'add-cart',
      guide: "온도·크기·수량을 다 골랐어요. 금액 8,000원을 확인하고 '담기'를 눌러요.",
      voice: '온도, 크기, 수량을 다 골랐어요. 창 맨 아래 오른쪽의 담기 버튼을 누르세요.',
      hint: "“취소” 말고 오른쪽 '담기' 버튼이에요.",
    },
    {
      screen: 'cart',
      target: 'checkout',
      guide: "아래에 담은 메뉴가 보여요. '결제하기'를 눌러요.",
      voice: '담은 메뉴가 화면 아래에 보여요. 화면 맨 아래 오른쪽의 결제하기를 누르세요.',
      hint: "아래쪽 띠 오른쪽의 '결제하기' 버튼이에요.",
    },
    {
      screen: 'point',
      target: 'point-skip',
      guide: "포인트 적립을 묻는 창이 떴어요. 회원이 아니면 '건너뛰기'를 누르면 돼요.",
      voice: '포인트 적립을 묻는 창이 떴어요. 적립하지 않으려면 창 아래 오른쪽의 건너뛰기를 누르세요.',
      hint: "적립을 안 해도 주문할 수 있어요. 오른쪽 '건너뛰기'를 누르세요.",
    },
    {
      screen: 'pay-method',
      target: 'pay-card',
      guide: "결제 수단을 골라요. '카드결제'를 눌러요.",
      voice: '결제 수단을 골라요. 왼쪽 위 첫 번째, 카드결제를 누르세요.',
      hint: '카드 그림이 있는 첫 번째 버튼이에요.',
    },
    {
      screen: 'insert-card',
      target: 'card-slot',
      guide: '카드를 꽂을 차례예요. 여기서는 카드 투입구 그림을 눌러보세요.',
      voice: '카드를 꽂을 차례예요. 화면 가운데의 카드 투입구 그림을 누르세요.',
      hint: '검은 줄이 있는 카드 투입구 그림을 누르면 카드를 꽂은 것으로 해요.',
    },
    {
      screen: 'done',
      target: 'done-ok',
      guide: "주문 완료! 번호 A-27을 불러주면 음료를 받으러 가요. '확인'을 눌러요.",
      voice: '주문 완료! 주문번호는 에이 이십칠 번이에요. 번호를 부르면 음료를 받으러 가요. 맨 아래 확인을 누르세요.',
      hint: "주문번호 아래 '확인' 버튼을 누르세요.",
    },
  ],
};
