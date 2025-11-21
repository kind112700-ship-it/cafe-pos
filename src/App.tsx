// src/App.tsx

// 📁 src/App.tsx (최종 수정 코드)

import React, { useState, useCallback } from 'react';
import { usePosSystem } from './hooks/usePosSystem';
import { StartScreen } from './pages/StartScreen'; 
import { LanguageProvider } from './components/LanguageContext';
import { MainScreen } from './pages/MainScreen';
import { PaymentScreen } from './pages/PaymentScreen';
import { CompleteScreen } from './pages/CompleteScreen'; // CompleteScreen 컴포넌트 import 확인
import { AdminScreen } from './pages/AdminScreen';

// ⭐️ [TS2304 오류 해결] 필요한 모든 타입을 types/index에서 가져옵니다.
import { 
    ScreenState, 
    ScreenStates, 
    CurrentOrder,
    PaymentScreenProps,
    OrderItem, 
    OrderType, // 👈 TS2304 오류 해결
    CompleteScreenProps, // 👈 TS2304 오류 해결
    AdminScreenProps
} from './types/index'; 


type MainScreenNavProps = {
    orderType: OrderType;
};

// ⭐️ [Props 타입 통합]
type ScreenSpecificProps = Omit<PaymentScreenProps, 'navigateTo'> | Omit<CompleteScreenProps, 'navigateTo'> | MainScreenNavProps | null;


const App: React.FC = () => {
    // ----------------------------------------------------
    // 1. 주문 상태 및 데이터 관리
    // ----------------------------------------------------
    const { 
        currentOrder, 
        grandTotal,
        orderType,
    } = usePosSystem(); 
    
    // ----------------------------------------------------
    // 2. 화면 상태 및 Props 관리
    // ----------------------------------------------------
    const [currentScreen, setCurrentScreen] = useState<ScreenState>(ScreenStates.START); 
    
    // ⭐️ [TS2552 오류 해결] screenProps 상태 선언 확인
    const [screenProps, setScreenProps] = useState<ScreenSpecificProps>(null); 

    // ----------------------------------------------------
    // 3. 화면 전환 함수 정의
    // ----------------------------------------------------
    const navigateTo = useCallback((screen: ScreenState, props?: any) => {
    
    if (screen === ScreenStates.PAYMENT) {
        // ... 기존 로직 (PAYMENT Props 저장) ...
        setScreenProps({
            orderItems: props?.orderItems || currentOrder.items, 
            subTotal: props?.subTotal || grandTotal, 
            orderType: props?.orderType || orderType,
        } as Omit<PaymentScreenProps, 'navigateTo'>);
    
    } else if (screen === ScreenStates.COMPLETE) {
        // ... 기존 로직 (COMPLETE Props 저장) ...
        setScreenProps(props as Omit<CompleteScreenProps, 'navigateTo'>);
    
    } else if (screen === ScreenStates.MAIN) { // 👈 MAIN 스크린 추가
        // StartScreen에서 넘어온 orderType을 screenProps에 저장합니다.
        // MainScreenProps 타입이 orderType을 포함해야 합니다.
        if (props && props.orderType) {
             setScreenProps({
                orderType: props.orderType
             } as { orderType: OrderType }); // 🚨 임시 타입 단언
        } else {
             setScreenProps(null);
        }
    } else {
        setScreenProps(null);
    }
    
    setCurrentScreen(screen);
    console.log(`[NAV] Navigating to ${screen} screen.`);
}, [/* dependencies */]); // MainScreen이 screenProps를 사용하는 경우, orderType 의존성은 제거 가능

    // ----------------------------------------------------
    // 4. 화면 렌더링 로직
    // ----------------------------------------------------
    const renderScreen = () => {
        switch (currentScreen) {

            case ScreenStates.ADMIN: // ⭐️ ADMIN 화면 라우팅 추가됨
                // AdminScreenProps는 navigateTo 함수 하나만 포함합니다.
                return <AdminScreen navigateTo={navigateTo} />;

                
            case ScreenStates.MAIN:
                // 🚨 [핵심 수정] screenProps에서 orderType을 가져옵니다.
            const mainOrderType = screenProps && (screenProps as { orderType: OrderType }).orderType 
                                ? (screenProps as { orderType: OrderType }).orderType 
                                : orderType; // props에 없으면 usePosSystem의 orderType 사용
                return (
                    <MainScreen 
                        navigateTo={navigateTo} 
                        currentOrder={currentOrder}
                        orderType={mainOrderType}
                        totalPrice={grandTotal}
                    />
                );

            case ScreenStates.PAYMENT: 
                // PaymentProps 구조 확인
                if (!screenProps || !(screenProps as PaymentScreenProps).orderItems) {
                    return <div>결제 정보를 불러올 수 없습니다.</div>;
                }
                
                const paymentProps = screenProps as Omit<PaymentScreenProps, 'navigateTo'>;

                return (
                    <PaymentScreen 
                        navigateTo={navigateTo} 
                        orderItems={paymentProps.orderItems as OrderItem[]} 
                        subTotal={paymentProps.subTotal} 
                        orderType={paymentProps.orderType as OrderType} // OrderType은 types에서 가져온 것을 사용
                    />
                ); 

            case ScreenStates.COMPLETE:
                // CompleteProps 구조 확인 (orderId와 orderType이 있는지)
                if (!screenProps || !(screenProps as Omit<CompleteScreenProps, 'navigateTo'>).orderId) { // 👈 오류 해결
                    return (
                        <div className="flex justify-center items-center h-screen text-xl font-bold">
                            주문 완료 정보를 불러올 수 없습니다. (ID 누락)
                            <button 
                                className="ml-4 p-2 bg-blue-500 text-white rounded"
                                onClick={() => navigateTo(ScreenStates.MAIN)}
                            >
                                메인으로
                            </button>
                        </div>
                    );
                    
                }
                
                // ⭐️ [TS2552, TS2304 해결] screenProps를 CompleteScreenProps로 단언
                const completeProps = screenProps as Omit<CompleteScreenProps, 'navigateTo'>;

                return (
                    <CompleteScreen 
                        navigateTo={navigateTo} 
                        orderId={completeProps.orderId}
                        orderType={completeProps.orderType as OrderType} 
                    />
                ); 

            case ScreenStates.START:
            default:
                return <StartScreen navigateTo={navigateTo} />;
        }
    };

    return (
        <LanguageProvider>
            <div className="app-root-container">
                {renderScreen()}
            </div>
        </LanguageProvider>
    );
};

export default App;