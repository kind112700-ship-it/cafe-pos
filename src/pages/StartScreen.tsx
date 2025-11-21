// src/pages/StartScreen.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { KioskButton } from '../components/UI/KioskButton';
import { LanguageToggle } from '../components/UI/LanguageToggle';
import { COLORS } from '../theme/colorPalette';
// import { useScreenNav } from '../hooks/useScreenNav';
import { useLanguage } from '../components/LanguageContext';
import { useTime } from '../hooks/useTime';
import { OrderType, ScreenState, ScreenStates } from '../types';
import { renderTextWithBreaks } from '../utils/textUtils';
import { usePosSystem } from '../hooks/usePosSystem'; //
import { AdminAuthModal } from '../components/AdminAuthModal';




// ✅ 배경: #008080 (틸 블루) 적용
const StartScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${COLORS.PRIMARY};
  color: ${COLORS.TEXT_LIGHT};
  padding: 40px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 80px;
`;

const AdminButton = styled.button`
  background: none;
  border: 2px solid ${COLORS.TEXT_LIGHT};
  color: ${COLORS.TEXT_LIGHT};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const TimeDisplay = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  min-width: 150px;
  text-align: right;
`;

const MainContent = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const WelcomeMessage = styled.h1`
  font-size: 5rem;
  font-weight: 800;
  margin-bottom: 220px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.5;
  white-space: pre-wrap;
  text-align: center; /* ⭐️ 문법 오류 수정 ⭐️ */
`;

const Footer = styled.footer`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  width: 80%;
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom:60px;
`;


// ⭐️ StartScreenProps 타입 정의: navigateTo 함수를 받도록 명시 ⭐️
interface StartScreenProps {
    navigateTo: (screen: ScreenState, props?: any) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ navigateTo }) => {
//   const { navigateTo } = useScreenNav(); // 훅에서 navigateTo를 가져옴
  const { t } = useLanguage();
  const { formattedTime } = useTime();
  

   // ⭐️ [핵심 수정 1] usePosSystem에서 setOrderTypeState 함수를 가져옵니다. ⭐️
  const { setOrderTypeState } = usePosSystem();

  // ⭐️ [추가] 관리자 인증 모달 상태 ⭐️
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const handleAdminClick = () => {
    // 비밀번호 입력 등 인증 로직 후 관리자 모드로 이동
    setIsAdminModalOpen(true);
  };

  // ⭐️ [추가] 인증 성공 시 AdminScreen으로 이동하는 함수 ⭐️
    const handleAdminAuthSuccess = () => {
        setIsAdminModalOpen(false); // 모달 닫기
        console.log("[ADMIN] 관리자 인증 성공. 관리자 모드로 이동합니다.");
        // AdminScreen으로 이동 (아직 AdminScreen은 만들지 않았으므로 ScreenStates에 추가 필요)
        navigateTo(ScreenStates.ADMIN); 
    };

  const handleOrderTypeSelect = (type: OrderType) => {
    console.log(`[ORDER] 주문 유형 선택: ${type}`);
    // 주문 유형 상태 저장 로직 (useOrder 훅 등에서)
   // ⭐️ [핵심 수정 2] setOrderTypeState를 호출하여 전역 상태를 업데이트합니다. ⭐️
    setOrderTypeState(type);
    
    navigateTo(ScreenStates.MAIN, { orderType: type })
  };


  return (
    <StartScreenContainer>
      <Header>
        {/* 왼쪽 맨 위: 관리자 버튼 */}
        <AdminButton onClick={handleAdminClick}>
          {t('admin_mode')}
        </AdminButton>

        {/* 오른쪽 맨 위: 언어 토글 및 시간 */}
        <RightControls>
          <LanguageToggle />
          <TimeDisplay>{formattedTime}</TimeDisplay>
        </RightControls>
      </Header>

      <MainContent>
        {/* 중앙: 환영 메시지 */}
        <WelcomeMessage>
          {renderTextWithBreaks(t('welcome_message'))}
        </WelcomeMessage>
      </MainContent>

      <Footer>
        {/* 맨 밑: 매장 버튼 (Primary - 틸 색상 버튼) */}
        <KioskButton
          variant="accent"
          onClick={() => handleOrderTypeSelect('STORE')}
        >
          {t('store')}
        </KioskButton>

        {/* 맨 밑: 테이크아웃 버튼 (Accent - 강조색 버튼) */}
        <KioskButton
          variant="accent"
          onClick={() => handleOrderTypeSelect('TAKEOUT')}
        >
          {t('takeout')}
        </KioskButton>
      </Footer>

      {/* ⭐️ [정확한 위치] StartScreenContainer의 마지막 자식으로 추가 ⭐️ */}
            {isAdminModalOpen && (
                <AdminAuthModal
                    onClose={() => setIsAdminModalOpen(false)}
                    onAuthSuccess={handleAdminAuthSuccess}
                />
            )}
    </StartScreenContainer>
  );
};