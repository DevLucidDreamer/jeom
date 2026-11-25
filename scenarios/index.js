/*
 * 연습 목록. 새 시나리오를 만들면 여기에 추가하세요.
 * (sw.js 의 FILES 목록에도 파일 이름을 넣어야 인터넷 없이도 열려요)
 */
import burger from './burger.js';
import cafe from './cafe.js';
import hospital from './hospital.js';

export const SCENARIOS = [burger, cafe, hospital];

export function getScenario(id) {
  return SCENARIOS.find((s) => s.id === id);
}
