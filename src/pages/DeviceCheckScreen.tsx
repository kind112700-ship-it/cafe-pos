// src/pages/DeviceCheckScreen.tsx

import React from 'react';
import styled from 'styled-components';
import { useDeviceStatus, SystemStatus, DeviceStatus } from '../hooks/useDeviceStatus';
import { COLORS } from '../theme/colorPalette'; // ⭐️ 업데이트된 컬러 팔레트 임포트 ⭐️

// --- 스타일 컴포넌트 ---

const ScreenContainer = styled.div`
    // 배경색: AdminScreen 배경색(F5F5F5) 사용
    background-color: ${COLORS.BACKGROUND}; 
    padding: 30px;
    height: 100%;
    overflow-y: auto;
    
    // ⭐️ [반응형] 작은 화면에서 패딩 축소 ⭐️
    @media (max-width: 768px) {
        padding: 20px;
    }
`;

const Header = styled.div`
    display: flex;
    flex-wrap: wrap; /* 반응형 대응 */
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid ${COLORS.PRIMARY_DARK}; /* 진한 기본색으로 구분 */
`;

const Title = styled.h2`
    font-size: 2.5rem;
    font-weight: 700;
    color: ${COLORS.PRIMARY_DARK};
    margin-right: 20px;
    
    @media (max-width: 768px) {
        font-size: 2rem;
        margin-bottom: 15px;
        width: 100%; /* 모바일에서 전체 너비 차지 */
    }
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
    }
`;

const StatusInfo = styled.span`
    font-size: 1rem;
    color: ${COLORS.TEXT_MUTED};
    margin-right: 15px;

    @media (max-width: 768px) {
        margin: 5px 0 10px 0;
    }
`;

const ActionButton = styled.button`
    padding: 10px 20px;
    font-size: 1.2rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    margin-left: 10px;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
        width: 100%;
        margin: 5px 0;
    }
`;

// ⭐️PRIMARY 색상 사용 (새로고침) ⭐️
const ReloadButton = styled(ActionButton)`
    background-color: ${COLORS.PRIMARY}; 
    color: ${COLORS.TEXT_LIGHT};
    &:hover:not(:disabled) {
        background-color: ${COLORS.PRIMARY_DARK};
    }
    margin-left: 0; 
`;

// ⭐️ SECONDARY 색상 사용 (뒤로 가기) ⭐️
const BackButton = styled(ActionButton)`
    background-color: ${COLORS.SECONDARY};
    color: ${COLORS.TEXT_DARK};
    &:hover:not(:disabled) {
        background-color: ${COLORS.SECONDARY_DARK};
    }
`;

const SectionGrid = styled.div`
    display: grid;
    // ⭐️ [반응형 핵심] 기본: 2열 그리드 ⭐️
    grid-template-columns: repeat(2, 1fr); 
    gap: 30px;
    padding-top: 10px;

    // ⭐️ 1200px 이하일 때 1열로 변경 ⭐️
    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

const StatusSection = styled.div`
    // 배경색: 흰색 (BACKGROUND_LIGHT) 사용
    background-color: ${COLORS.BACKGROUND_LIGHT}; 
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); /* 그림자 강조 */
`;

const SectionTitle = styled.h3`
    font-size: 1.6rem;
    color: ${COLORS.TEXT_DARK};
    margin-bottom: 20px;
    border-bottom: 3px solid ${COLORS.PRIMARY_LIGHT}; /* 밝은 기본색으로 구분선 */
    padding-bottom: 10px;
    font-weight: 600;
`;

const StatusItem = styled.div<{ status: DeviceStatus }>`
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* 텍스트 정렬을 위해 수정 */
    padding: 15px 0;
    border-bottom: 1px solid ${COLORS.BACKGROUND_MEDIUM}; /* 중간 배경색으로 구분선 */

    &:last-child {
        border-bottom: none;
    }

    & > span:first-child {
        font-weight: 500;
        color: ${COLORS.TEXT_MUTED};
        width: 60%; /* 너비 조정 */
        line-height: 1.4;
    }

    & > span:last-child {
        font-weight: bold;
        width: 40%;
        text-align: right;

        // ⭐️ 컬러 팔레트의 액션 색상 사용 ⭐️
        color: ${({ status }) => {
            if (status === 'OK') return COLORS.ACCENT; // ACCENT 사용
            if (status === 'WARN') return COLORS.SECONDARY_DARK; // 진한 강조색 사용
            if (status === 'ERROR') return COLORS.DANGER_DARK; // 진한 위험색 사용
            return COLORS.TEXT_MUTED;
        }};
    }
`;

const DetailText = styled.p`
    font-size: 0.9rem;
    color: ${COLORS.TEXT_MUTED};
    margin-top: 2px;
    margin-bottom: 10px;
    padding-left: 10px;
`;

// --- 헬퍼 함수 및 인터페이스 (로직 유지) ---
const getStatusIcon = (status: DeviceStatus): string => {
    switch (status) {
        case 'OK': return '✅ 정상';
        case 'WARN': return '⚠️ 경고';
        case 'ERROR': return '❌ 오류';
        default: return '❓ 알 수 없음';
    }
};

interface DeviceCheckScreenProps {
    navigateTo: () => void; 
}

// --- 메인 컴포넌트 ---

export const DeviceCheckScreen: React.FC<DeviceCheckScreenProps> = ({ navigateTo }) => {
    const { statusData, isLoading, lastChecked, runDeviceCheck } = useDeviceStatus();

    // 단일 상태 항목을 렌더링하는 컴포넌트
    const StatusItemComponent: React.FC<{ item: SystemStatus }> = ({ item }) => (
        <>
            <StatusItem status={item.status}>
                <span>{item.label}</span>
                <span>{getStatusIcon(item.status)}</span>
            </StatusItem>
            <DetailText>{item.detail}</DetailText>
        </>
    );

    return (
        <ScreenContainer>
            <Header>
                <Title>⚙️ 장치 상태 확인 및 진단</Title>
                <HeaderActions>
                    <StatusInfo>
                        최근 진단: {lastChecked ? lastChecked.toLocaleTimeString() : 'N/A'}
                    </StatusInfo>
                    <ReloadButton onClick={runDeviceCheck} disabled={isLoading}>
                        {isLoading ? '진단 중...' : '상태 새로고침'}
                    </ReloadButton>
                    <BackButton onClick={navigateTo}>
                        관리자 메인으로
                    </BackButton>
                </HeaderActions>
            </Header>

            {isLoading && (
                <p style={{ textAlign: 'center', fontSize: '1.5rem', color: COLORS.PRIMARY, padding: '50px 0' }}>
                    장치 상태를 진단하는 중입니다... 잠시만 기다려주세요.
                </p>
            )}

            {!isLoading && (
                <SectionGrid>
                    <StatusSection>
                        <SectionTitle>🌐 네트워크 및 통신 상태</SectionTitle>
                        {statusData.network.map((item, index) => (
                            <StatusItemComponent key={index} item={item} />
                        ))}
                    </StatusSection>

                    <StatusSection>
                        <SectionTitle>💳 결제 장치 상태</SectionTitle>
                        {statusData.payment.map((item, index) => (
                            <StatusItemComponent key={index} item={item} />
                        ))}
                    </StatusSection>

                    <StatusSection>
                        <SectionTitle>🖨️ 출력 장치 상태</SectionTitle>
                        {statusData.printer.map((item, index) => (
                            <StatusItemComponent key={index} item={item} />
                        ))}
                    </StatusSection>

                    <StatusSection>
                        <SectionTitle>💻 시스템 리소스 및 앱</SectionTitle>
                        {statusData.system.map((item, index) => (
                            <StatusItemComponent key={index} item={item} />
                        ))}
                    </StatusSection>
                </SectionGrid>
            )}
        </ScreenContainer>
    );
};