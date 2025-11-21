// src/hooks/useScreenNav.ts
import { ScreenState } from '../types'

export const useScreenNav = () => {
  // 실제 로직: useState 등을 이용해 현재 화면 상태를 관리해야 합니다.
  const navigateTo = (screen: ScreenState) => {
    console.log(`[NAV] ${screen} 화면으로 전환`);
    // setScreenState(screen);
  };
  // return { currentScreenState, navigateTo };
  return { navigateTo };
};