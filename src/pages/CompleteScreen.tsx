// 📁 src/pages/CompleteScreen.tsx (오류 해결 버전)

import React, { useCallback, useMemo } from 'react';
// ⭐️ [수정] ScreenState 타입과 CompleteScreenProps를 가져옵니다.
import { 
    ScreenStates, 
    CompleteScreenProps, // types 파일에서 가져옴
    OrderType,
    ScreenState          // ScreenStates 대신 ScreenState 타입을 사용
} from '../types'; 
// 🚨 이제 'CompleteScreenProps'를 따로 정의하거나, 기존 임시 정의를 남겨두면 안됩니다.
// 🚨 임시 정의를 삭제했는지 확인하세요.
import '../styles/complete.css';
// 가상 데이터
const DUMMY_ORDER_ID = "A-007"; 

export const CompleteScreen: React.FC<CompleteScreenProps> = ({ 
    navigateTo, 
    // CompleteScreenProps가 types 파일에 아래와 같이 정의되었다고 가정합니다.
    // orderType: 'STORE' | 'TAKEOUT';
    // orderId: string;
    orderType = 'STORE', 
    orderId = DUMMY_ORDER_ID 
}) => {

    // ----------------------------------------------------
    // ⭐️ 핸들러 함수
    // ----------------------------------------------------

    // 메인 화면으로 돌아가기 버튼
   const handleGoToStart = useCallback(() => {
        // ScreenStates는 값(value)이므로 여기서 사용합니다.
        navigateTo(ScreenStates.START);
    }, [navigateTo]);


    // ----------------------------------------------------
    // ⭐️ 표시 정보 계산
    // ----------------------------------------------------

    const displayInfo = useMemo(() => {
        const isStore = orderType === 'STORE';
        return {
            title: isStore ? '매장 식사' : '포장 주문',
            message: isStore 
                ? '곧 메뉴가 준비되면 주문 번호로 호출해 드립니다.' 
                : '음료 제조가 완료되면 진동벨(혹은 주문 번호)로 알려드립니다.',
            icon: isStore ? '☕️' : '🛍️'
        };
    }, [orderType]);


    // Tailwind CSS 클래스
    const KIOSK_BTN_CLASS = "func-btn px-4 py-3 font-bold rounded-lg transition duration-150";
    const GREEN_BTN_CLASS = `bg-[#4CAF50] text-white hover:bg-[#388e3c]`;

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] max-w-lg mx-auto my-10 p-8 bg-white rounded-2xl shadow-2xl font-sans" id="complete-container">
            
            <div className="text-8xl mb-6">🎉</div>
            <h1 className="text-4xl font-extrabold text-[#333] mb-3">주문이 성공적으로 완료되었습니다!</h1>
            
            <p className="text-xl text-gray-700 mb-6">
                선택하신 {displayInfo.title} ({orderType === 'STORE' ? '매장' : '포장'}) 주문입니다.
            </p>

            <div className="w-full p-6 bg-[#fff3cd] border-4 border-[#ffc107] rounded-xl mb-8 text-center" id="order-id-box">
                <p className="text-xl font-bold text-[#856404] mb-2">
                    고객님의 주문 번호
                </p>
                <div className="text-7xl font-black text-[#cc0000] leading-none">
                    {orderId}
                </div>
            </div>

            <div className="text-center mb-10">
                <p className="text-lg font-semibold text-[#0077cc] mb-2">
                    {displayInfo.icon} 안내 사항 {displayInfo.icon}
                </p>
                <p className="text-base text-gray-600">
                    {displayInfo.message}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    화면이 자동으로 초기화될 수 있습니다.
                </p>
            </div>


            <button 
                id="go-to-main-btn" 
                className={`${KIOSK_BTN_CLASS} py-4 text-xl w-full ${GREEN_BTN_CLASS}`}
                onClick={handleGoToStart}
            >
                다음 고객을 위해 초기 화면으로 돌아가기
            </button>
        </div>
    );
};