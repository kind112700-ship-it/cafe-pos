// src/components/SystemControlModal.tsx
import React from 'react';
import styled from 'styled-components';
import { COLORS } from '../theme/colorPalette';

// ⭐️ 액션 타입 정의 (부모 컴포넌트로 전달될 값) ⭐️
export type SystemActionType = 'RESTART' | 'SHUTDOWN' | 'CANCEL';

// ⭐️ Prop 타입 정의: 부모에게 액션을 전달하는 함수 ⭐️
interface SystemControlModalProps {
    onAction: (action: SystemActionType) => void;
}

// --- 스타일 컴포넌트 ---

const ModalBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: ${COLORS.BACKGROUND_LIGHT};
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 480px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    text-align: center;
`;

const ModalTitle = styled.h3`
    color: ${COLORS.PRIMARY_DARK};
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 25px;
`;

const ModalButtonGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 재시작, 종료 버튼 */
    gap: 15px;
    margin-top: 20px;
`;

const ModalActionButton = styled.button`
    padding: 20px 10px;
    font-size: 1.2rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: opacity 0.2s;
    color: ${COLORS.TEXT_LIGHT};

    &:hover {
        opacity: 0.9;
    }
`;

// 버튼 스타일 정의
const RestartButton = styled(ModalActionButton)`
    background-color: ${COLORS.ACCENT};
`;

const ShutdownButton = styled(ModalActionButton)`
    background-color: ${COLORS.DANGER};
`;

const CancelButton = styled(ModalActionButton)`
    background-color: ${COLORS.TEXT_MUTED};    
    padding:20px 90px;
    font-size: 1.3rem;
    margin-top: 15px;
`;


// --- SystemControlModal 컴포넌트 ---

export const SystemControlModal: React.FC<SystemControlModalProps> = ({ onAction }) => {

    // 배경 클릭 시 자동으로 CANCEL 액션을 전달합니다.
    const handleBackdropClick = (e: React.MouseEvent) => {
        // 모달 콘텐츠 내부를 클릭했을 때는 닫히지 않도록 방지
        if (e.target === e.currentTarget) {
            onAction('CANCEL');
        }
    };

    return (
        <ModalBackdrop onClick={handleBackdropClick}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>키오스크 시스템 제어</ModalTitle>
                <p style={{ color: COLORS.TEXT_MUTED, marginBottom: '25px', fontSize: '1.1rem' }}>
                    **주의:** 원하는 작업을 선택하세요.
                </p>
                
                <ModalButtonGrid>
                    {/* 1. 시스템 재시작 버튼 */}
                    <RestartButton onClick={() => onAction('RESTART')}>
                        🔄 시스템 재시작
                    </RestartButton>
                    
                    {/* 2. 앱 종료 버튼 */}
                    <ShutdownButton onClick={() => onAction('SHUTDOWN')}>
                        🛑 앱 종료
                    </ShutdownButton>
                </ModalButtonGrid>
                
                {/* 3. 취소 버튼 (모달 닫기) */}
                <CancelButton onClick={() => onAction('CANCEL')}>
                    ❌ 취소 (관리자 모드 유지)
                </CancelButton>
                
                <p style={{ fontSize: '0.9rem', color: COLORS.TEXT_MUTED, marginTop: '20px' }}>
                    * 시스템 재시작/종료 시 현재 주문 상태는 초기화됩니다.
                </p>
            </ModalContent>
        </ModalBackdrop>
    );
};