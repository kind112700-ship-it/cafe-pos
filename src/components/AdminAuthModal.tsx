// src/components/AdminAuthModal.tsx

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { COLORS } from '../theme/colorPalette';

// ⭐️ Props 타입 정의
interface AdminAuthModalProps {
    onClose: () => void; // 모달 닫기 함수
    onAuthSuccess: () => void; // 인증 성공 시 호출될 함수 (AdminScreen으로 이동)
}

// 🔑 임시 비밀번호 설정 (실제 앱에서는 환경 변수나 API를 통해 관리)
const ADMIN_PASSWORD = '1234'; 
const MAX_PASSWORD_LENGTH = 4;

// --- 스타일 컴포넌트 ---

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: ${COLORS.BACKGROUND_LIGHT};
    padding: 30px;
    border-radius: 12px;
    width: 450px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Title = styled.h2`
    font-size: 2rem;
    color: ${COLORS.PRIMARY_DARK};
    margin-bottom: 20px;
`;

const PasswordDisplay = styled.div`
    width: 80%;
    height: 50px;
    background: ${COLORS.BACKGROUND_DARK};
    border-radius: 8px;
    margin-bottom: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    letter-spacing: 10px;
    color: ${COLORS.TEXT_LIGHT};
    font-family: monospace;
    padding: 0 15px;
`;

const KeypadGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    width: 100%;
`;

const KeypadButton = styled.button<{ $variant?: 'action' | 'number' | 'clear' }>`
    padding: 20px 0;
    font-size: 1.8rem;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.1s;
    
    // 숫자 키 스타일
    background-color: ${props => props.$variant === 'number' ? COLORS.SECONDARY : COLORS.SECONDARY_DARK};
    color: ${COLORS.TEXT_LIGHT};

    // 액션 키 (확인) 스타일
    ${props => props.$variant === 'action' && `
        background-color: ${COLORS.ACCENT};
        &:hover { background-color: ${COLORS.ACCENT_DARK}; }
    `}

    // 지우기 키 (취소) 스타일
    ${props => props.$variant === 'clear' && `
        background-color: ${COLORS.DANGER};
        &:hover { background-color: ${COLORS.DANGER_DARK}; }
    `}

    &:active {
        opacity: 0.8;
    }
`;


// --- 컴포넌트 로직 ---

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onClose, onAuthSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleKeypadClick = useCallback((digit: string) => {
        setError(''); // 에러 메시지 초기화
        
        if (password.length < MAX_PASSWORD_LENGTH) {
            const newPassword = password + digit;
            setPassword(newPassword);

            // 비밀번호가 가득 찼을 때 자동 확인
            if (newPassword.length === MAX_PASSWORD_LENGTH) {
                if (newPassword === ADMIN_PASSWORD) {
                    onAuthSuccess();
                } else {
                    setError('비밀번호가 일치하지 않습니다.');
                    // 틀린 후 잠시 대기 후 초기화 (UX 개선)
                    setTimeout(() => setPassword(''), 500); 
                }
            }
        }
    }, [password, onAuthSuccess]);

    const handleClear = useCallback(() => {
        setPassword('');
        setError('');
    }, []);

    const handleBackspace = useCallback(() => {
        setPassword(prev => prev.slice(0, -1));
        setError('');
    }, []);

    const handleConfirm = useCallback(() => {
        if (password.length !== MAX_PASSWORD_LENGTH) {
            setError(`비밀번호는 ${MAX_PASSWORD_LENGTH}자리입니다.`);
            return;
        }

        if (password === ADMIN_PASSWORD) {
            onAuthSuccess();
        } else {
            setError('비밀번호가 일치하지 않습니다.');
            setTimeout(() => setPassword(''), 500); 
        }
    }, [password, onAuthSuccess]);

    // 마스킹된 비밀번호 표시 (예: ****)
    const maskedPassword = '*'.repeat(password.length);

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <Title>관리자 인증</Title>
                
                <PasswordDisplay>{maskedPassword || "비밀번호 입력"}</PasswordDisplay>

                {error && <p style={{ color: COLORS.DANGER, marginBottom: '15px' }}>{error}</p>}

                <KeypadGrid>
                    {/* 숫자 키패드 1-9 */}
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                        <KeypadButton 
                            key={digit} 
                            $variant="number"
                            onClick={() => handleKeypadClick(digit)}
                        >
                            {digit}
                        </KeypadButton>
                    ))}
                    
                    {/* 지우기 / 0 / 백스페이스 */}
                    <KeypadButton 
                        $variant="clear" 
                        onClick={onClose} // 취소 버튼은 모달을 닫도록 연결
                    >
                        취소
                    </KeypadButton>
                    <KeypadButton 
                        $variant="number"
                        onClick={() => handleKeypadClick('0')}
                    >
                        0
                    </KeypadButton>
                    <KeypadButton 
                        $variant="action"
                        onClick={password.length > 0 ? handleBackspace : handleConfirm} // 입력 있으면 백스페이스, 없으면 확인
                    >
                        {password.length > 0 ? '←' : '확인'}
                    </KeypadButton>
                </KeypadGrid>
            </ModalContent>
        </ModalOverlay>
    );
};