// src/pages/AdminScreen.tsx

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { AdminScreenProps, ScreenStates } from '../types';
import { COLORS } from '../theme/colorPalette'; 
import { AdminSalesReport } from './AdminSalesReport';
// ⭐️ 1. AdminProductManagement 컴포넌트 임포트
import { AdminProductManagement } from './AdminProductManagement'; 
// ⭐️ 2. AdminStaffPage 컴포넌트 임포트 추가 ⭐️
import AdminStaffPage from './AdminStaffPage'; 
import { usePosSystem } from '../hooks/usePosSystem';
import { DeviceCheckScreen } from './DeviceCheckScreen';
import { SystemControlModal, SystemActionType } from '../components/SystemControlModal';

// 3. ⭐️ AdminSubScreen 타입에 STAFF_MANAGEMENT를 포함한 모든 메뉴 추가 ⭐️
type AdminSubScreen = 'MAIN_MENU' | 'SALES_REPORT' | 'PRODUCT_MANAGEMENT' | 'STAFF_MANAGEMENT' | 'ORDER_RESET' | 'DEVICE_CHECK' | 'KIOSK_RESTART';

// --- 스타일 컴포넌트 ---

const AdminContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: ${COLORS.BACKGROUND};
    color: ${COLORS.TEXT_DARK};
    padding: 30px;
`;

const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    border-bottom: 2px solid ${COLORS.PRIMARY};
    padding-bottom: 20px;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    font-weight: bold;
    color: ${COLORS.PRIMARY_DARK || COLORS.PRIMARY}; 
`;

const MenuGrid = styled.main`
    flex-grow: 1;
    display: grid;
    // 3열 그리드 구성
    grid-template-columns: repeat(3, 1fr); 
    gap: 30px;
    padding: 20px 0;
`;

const AdminMenuButton = styled.button`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
    border: none;
    border-radius: 15px;
    font-size: 1.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    background-color: ${COLORS.TEXT_LIGHT}; // 흰색 배경
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    color: ${COLORS.TEXT_DARK};
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
`;

const BackButton = styled.button`
    background-color: ${COLORS.DANGER || '#CC0000'};
    color: ${COLORS.TEXT_LIGHT};
    padding: 15px 30px;
    font-size: 1.4rem;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: ${COLORS.DANGER_DARK || '#A30000'};
    }
`;

// --- 컴포넌트 로직 ---

export const AdminScreen: React.FC<AdminScreenProps> = ({ navigateTo }) => {

    const [subScreen, setSubScreen] = useState<AdminSubScreen>('MAIN_MENU'); 
    const [showSystemModal, setShowSystemModal] = useState(false); // ⭐️ 모달 상태
    // ⭐️ [핵심] 모달 띄우기 함수: KIOGK_RESTART 메뉴와 연결 ⭐️
    const handleShowSystemModal = () => {
        setShowSystemModal(true);
    };

    // ⭐️ [핵심] 모달에서 선택된 액션을 처리하는 함수 ⭐️
    const handleSystemAction = async (actionType: SystemActionType) => { // ⭐️ async 추가
        setShowSystemModal(false); // 모달 닫기

        // 3. 취소 (CANCEL)는 모달 닫기 외에 특별한 액션 없음
        if (actionType === 'CANCEL') {
            console.log("시스템 제어 취소됨.");
            return;
        }

        // 1. 재시작 (RESTART) 로직
       if (actionType === 'RESTART') {
            const isConfirmed = window.confirm("🚨 경고: 장치 재시작을 진행합니다. 계속하시겠습니까?");
            if (isConfirmed) {
                try {
                    console.log("✅ [KIOSK RESTART] 재시작 명령 실행 (Mock API).");
                    
                    // ⭐️⭐️⭐️ Mock API 시뮬레이션 시작 ⭐️⭐️⭐️
                    await new Promise((resolve, reject) => {
                        setTimeout(() => {
                            // 5% 확률로 실패 시뮬레이션 (API 통신 오류 상황 재현)
                            if (Math.random() < 0.05) { 
                                reject(new Error("장치 재시작 명령 실패 (Mock).")); 
                            } else {
                                resolve(true);
                            }
                        }, 1500); // 1.5초간 통신 지연 시뮬레이션
                    });
                    // ⭐️⭐️⭐️ Mock API 시뮬레이션 끝 ⭐️⭐️⭐️
                    
                    resetAllOrderStates(); 
                    navigateTo(ScreenStates.START);
                    alert("✅ 키오스크가 재시작됩니다.");
                } catch (error) {
                    // Mock 실패 또는 실제 API 연결 실패 시 처리
                    console.error("재시작 중 오류 발생:", error);
                    alert(`❌ 재시작에 실패했습니다. 관리자에게 문의하세요.`);
                    handleSubNavigate('MAIN_MENU'); 
                }
            }
        }
        // 2. 앱 종료 (SHUTDOWN) 로직
       else if (actionType === 'SHUTDOWN') {
            const isConfirmed = window.confirm("🛑 최종 경고: 키오스크 애플리케이션을 완전히 종료합니다. 계속하시겠습니까?");
            if (isConfirmed) {
                try {
                    console.log("✅ [KIOSK SHUTDOWN] 앱 종료 명령 실행 (Mock API).");

                    // ⭐️⭐️⭐️ Mock API 시뮬레이션 시작 ⭐️⭐️⭐️
                    await new Promise((resolve, reject) => {
                        setTimeout(() => {
                             // 종료는 중요한 액션이므로 실패 확률을 낮게 가정 (0%)
                             resolve(true);
                        }, 1000); // 1초간 통신 지연 시뮬레이션
                    });
                    // ⭐️⭐️⭐️ Mock API 시뮬레이션 끝 ⭐️⭐️⭐️
                    
                    resetAllOrderStates(); 
                    navigateTo(ScreenStates.START); // 실제 종료 시뮬레이션
                    alert("✅ 키오스크 앱을 종료합니다.");

                } catch (error) {
                    console.error("앱 종료 중 오류 발생:", error);
                    alert(`❌ 앱 종료 명령에 실패했습니다. 관리자에게 문의하세요.`);
                }
            }
        }
    };

    const handleSubNavigate = useCallback((targetScreen: AdminSubScreen) => {
        setSubScreen(targetScreen);
    }, []);

    const handleBackToMain = useCallback(() => {
        // 관리자 모드 종료 시 시작 화면으로 돌아갑니다.
        navigateTo(ScreenStates.START); 
    }, [navigateTo]);

    // ⭐️ [핵심] usePosSystem에서 초기화 함수 가져오기 ⭐️
    const { resetAllOrderStates } = usePosSystem();

    // ⭐️ [핵심] 주문 강제 초기화 로직 ⭐️
    const handleOrderReset = useCallback(async () => {
        // 1. window.confirm을 사용한 간결한 2차 안전 확인
        const isConfirmed = window.confirm(
            "🚨 경고: 현재 진행 중인 모든 주문 정보(장바구니, 주문 유형 등)가 삭제됩니다. 이 작업은 되돌릴 수 없습니다. 계속 진행하시겠습니까?"
        );

       if (isConfirmed) {
        try {
            // ⭐️ [API 연결 지점] 서버에 주문 강제 초기화 요청 ⭐️
            // 실제 구현 시: await PosApi.forceResetOrders(); 
            
            // Mock API를 사용한 시뮬레이션
            const apiResponse = await fetch('http://localhost:3001/transactions', { 
                method: 'DELETE' // DELETE 요청으로 서버 데이터 초기화 시도 가정
            });

            if (!apiResponse.ok && apiResponse.status !== 404) {
                 // 404는 리소스가 없다는 의미로 성공으로 간주하고, 다른 오류(500 등)만 처리
                 throw new Error("서버에서 주문 초기화에 실패했습니다.");
            }
            
            // 2. 로컬 상태 초기화
            resetAllOrderStates(); 
            
            console.log("✅ [ORDER RESET] 서버 및 로컬 주문 초기화 완료.");
            alert("✅ 진행 중인 모든 주문이 강제로 초기화되었습니다.");

        } catch (error) {
            console.error("주문 초기화 중 API 오류 발생:", error);
            alert(`❌ 주문 초기화에 실패했습니다. 관리자에게 문의하세요.`);
        }
    }
}, [resetAllOrderStates]);// resetAllOrderStates는 usePosSystem 훅에서 가져온다고 가정
 

    // ⭐️ 관리자 메뉴 목록: '직원 및 권한 관리'에 handleSubNavigate 연결 ⭐️
    const adminMenus = [
       { key: 'SALES_REPORT', label: '매출/거래 내역 ', action: () => handleSubNavigate('SALES_REPORT') },
       { 
           key: 'PRODUCT_MANAGEMENT', 
           label: '메뉴/상품 관리 ', 
           action: () => handleSubNavigate('PRODUCT_MANAGEMENT') 
       },
       { 
           key: 'STAFF_MANAGEMENT', 
           label: '직원 및 권한 관리', 
           // ⭐️ 'STAFF_MANAGEMENT' 상태로 전환 ⭐️
           action: () => handleSubNavigate('STAFF_MANAGEMENT') 
        }, 
        
       { key: 'DEVICE_CHECK', label: '장치 상태 확인', action: () => handleSubNavigate('DEVICE_CHECK') },
       { key: 'ORDER_RESET', label: '주문 강제 초기화', action: handleOrderReset },
       
       { key: 'KIOSK_RESTART', label: '시스템 제어 (재시작/종료)', action: handleShowSystemModal },
    ];
    
    // ⭐️ 4. 서브 스크린 렌더링 로직 추가 ⭐️
    
    // 매출 보고서 화면 전환
    if (subScreen === 'SALES_REPORT') {
        return (
            <AdminSalesReport 
                navigateTo={() => handleSubNavigate('MAIN_MENU')} 
            />
        );
    }
    
    // 상품 관리 화면 전환
    if (subScreen === 'PRODUCT_MANAGEMENT') {
        return (
            <AdminProductManagement 
                navigateTo={() => handleSubNavigate('MAIN_MENU')} 
            />
        );
    }
    
    // ⭐️ 직원 관리 화면 전환 ⭐️
    if (subScreen === 'STAFF_MANAGEMENT') {
        return (
            <AdminStaffPage 
                // AdminStaffPage가 'navigateTo' prop을 받는다고 가정하고, 메인 메뉴 복귀 기능을 연결합니다.
                navigateTo={() => handleSubNavigate('MAIN_MENU')} 
            />
        );
    }
        // ⭐️ 장치 상태 확인 화면 전환 (추가) ⭐️
    if (subScreen === 'DEVICE_CHECK') {
        return (
        <DeviceCheckScreen 
            navigateTo={() => handleSubNavigate('MAIN_MENU')} 
        />
    );
    }
    
    // 나머지 서브 스크린 (구현 예정)은 현재 MAIN_MENU로 폴백합니다.

    // 5. 메인 관리자 메뉴 화면 렌더링
    return (
        <AdminContainer>
            <Header>
                <Title>키오스크 관리자 모드</Title>
                <BackButton onClick={handleBackToMain}>
                    관리자 모드 종료 및 시작화면
                </BackButton>
            </Header>

            <MenuGrid>
                {adminMenus.map(menu => (
                    <AdminMenuButton key={menu.key} onClick={menu.action}>
                        {menu.label}
                    </AdminMenuButton>
                ))}
            </MenuGrid>

            {/* ⭐️ 분리된 모달 컴포넌트 렌더링 및 액션 연결 ⭐️ */}
            {showSystemModal && <SystemControlModal onAction={handleSystemAction} />}
            
        </AdminContainer>
    );
};