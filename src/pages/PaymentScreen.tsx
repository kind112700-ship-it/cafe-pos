// src/pages/PaymentScreen.tsx

import React, { 
    useState, 
    useCallback, 
    useMemo, 
    // useEffect는 지금은 사용되지 않으므로 제거합니다.
} from 'react'; // 👈 1. React Hooks 가져오기

// 🚨 가정: OrderItem, ScreenState, PaymentScreenProps는 '../types/index.ts'에 정의되어 있습니다.
import { OrderItem, ScreenState, PaymentScreenProps, ScreenStates } from '../types';

// 🚨 가정: formatPrice 함수는 '../utils/helpers.ts'에 정의되어 있습니다.
import { formatPrice } from '../utils/helpers'; // 👈 3. 유틸리티 함수 가져오기
import '../styles/cheackout.css'; 

// 가상 데이터

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ 
    navigateTo, 
    orderItems,
    subTotal, 
    orderType 
}) => {
    // orderType이 PaymentScreenProps에서 OrderType ('STORE' | 'TAKEOUT')으로 정의되었다고 가정합니다.
    
    // ⭐️ 상태 Hooks (jQuery의 상태 및 DOM 상태를 React State로 변환)
    const [currentDiscount, setCurrentDiscount] = useState(0); // 적용된 할인/포인트
    const [pointToUse, setPointToUse] = useState(0); // 사용할 포인트
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'cash' | 'mobile' | 'split' | ''>('');
    const [cashReceived, setCashReceived] = useState<number | ''>(''); // 받은 금액
    const [isModalOpen, setIsModalOpen] = useState(false); // 결제 확인 모달 상태
    const [receiptType, setReceiptType] = useState<'paper' | 'none'>('paper'); // 영수증 타입
    // ⭐️ [추가] 멤버십 관련 상태 ⭐️
    const [phoneNumber, setPhoneNumber] = useState(''); // 입력된 휴대폰 번호
    const [memberPoints, setMemberPoints] = useState(0); // 조회된 잔여 포인트 (초기값 0)
    const [isMemberVerified, setIsMemberVerified] = useState(false); // 회원 인증 여부
    // ----------------------------------------------------
    // ⭐️ 금액 계산 로직 (useMemo로 효율화) ⭐️
    // ----------------------------------------------------
    const { finalGrandTotal, actualDiscount, changeAmount, isCashSufficient } = useMemo(() => {
        
        // 1. 포인트 적용 계산 (할인 금액)
        let actualDiscount = Math.min(pointToUse, memberPoints, subTotal);
        
        // 2. 최종 결제 금액 계산
        let finalGrandTotal = subTotal - actualDiscount;
        if (finalGrandTotal < 0) {
            finalGrandTotal = 0;
            actualDiscount = subTotal;
        }

        // 3. 거스름돈 계산 (현금 결제 시)
        const received = typeof cashReceived === 'number' ? cashReceived : 0;
        const changeAmount = received - finalGrandTotal;
        const isCashSufficient = selectedPaymentMethod !== 'cash' || received >= finalGrandTotal;

        // 상태 동기화 (할인 적용 시)
        // React에서는 useEffect로 분리하는 것이 더 깨끗하지만, 간단한 계산은 useMemo에서 처리하기도 합니다.
        // 여기서는 상태 변경은 핸들러에서만 처리하고, useMemo는 계산만 담당하도록 합니다.
        
        return { 
            finalGrandTotal, 
            actualDiscount, 
            changeAmount, 
            isCashSufficient 
        };
    }, [subTotal, pointToUse, memberPoints, cashReceived, selectedPaymentMethod]);


    // ----------------------------------------------------
    // ⭐️ 핸들러 함수 (jQuery 이벤트를 React 함수로 변환) ⭐️
    // ----------------------------------------------------

    // 포인트 입력 핸들러
    const handlePointInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value) || 0;
        const maxUse = Math.min(memberPoints, subTotal);

        // 최대 사용 금액 제한 로직
        if (value > maxUse) {
            value = maxUse;
        } else if (value < 0) {
            value = 0;
        }
        
        setPointToUse(value);
        setCurrentDiscount(value); // 할인 금액 업데이트
    }, [subTotal, memberPoints]);
    
    // '전액 사용' 버튼
    const handleUseAllPoint = useCallback(() => {
        const maxUse = Math.min(memberPoints, subTotal);
        setPointToUse(maxUse);
        setCurrentDiscount(maxUse);
    }, [subTotal, memberPoints]);

    // ⭐️ [필수 추가] 휴대폰 번호 입력 핸들러 ⭐️
const handlePhoneInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자 외의 문자는 제거 (선택 사항)
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setPhoneNumber(rawValue);
}, []);


// ⭐️ [필수 추가] 멤버십 조회 버튼 클릭 핸들러 (Mock API 연동) ⭐️
const handleMemberSearch = useCallback(async () => {
    const trimmedPhone = phoneNumber.replace(/[^0-9]/g, ''); // 숫자만 남기기

    if (trimmedPhone.length < 10) {
        alert("유효한 휴대폰 번호를 입력해 주세요.");
        return;
    }

    try {
        // Mock API (JSON Server on port 3001) 호출
        // 🚨 반드시 Mock 서버(npm run api)가 실행 중이어야 합니다.
        const response = await fetch(`http://localhost:3001/members?phone=${trimmedPhone}`);
        
        if (!response.ok) {
            throw new Error('API 호출 실패');
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
            alert("조회된 회원 정보가 없습니다.");
            setMemberPoints(0);
            setIsMemberVerified(false);
            return;
        }

        const memberInfo = data[0];
        setMemberPoints(memberInfo.points);
        setIsMemberVerified(true);
        alert(`멤버십 조회 성공! ${memberInfo.name}님, 잔여 포인트: ${formatPrice(memberInfo.points)} P`);

    } catch (error) {
        console.error("멤버십 조회 중 오류 발생:", error);
        alert("멤버십 서버 연결에 실패했거나 (API 서버 실행 확인 필요) 잘못된 응답입니다.");
        setMemberPoints(0);
        setIsMemberVerified(false);
    }
}, [phoneNumber]); // phoneNumber가 변경될 때마다 함수 재생성


    // 결제 수단 선택
    const handlePaymentMethodSelect = useCallback((method: typeof selectedPaymentMethod) => {
        setSelectedPaymentMethod(method);
        // 현금 외 결제 선택 시 현금 모듈 초기화
        if (method !== 'cash') {
            setCashReceived('');
        }
    }, []);

    const handleCheckoutConfirmation = () => {
    // ⭐️ [핵심] 모달을 띄우도록 상태를 변경합니다. ⭐️
    setIsModalOpen(true); 
    console.log("결제 확인 모달 호출됨");
};

    // 받은 금액 입력 (현금 결제)
    const handleCashReceivedInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const received = parseInt(e.target.value) || '';
        setCashReceived(received);
    }, []);
    
    // '결제 완료 및 주문 확정' 버튼
    const handleFinalCheckout = useCallback(() => {
        if (!selectedPaymentMethod) {
            alert('결제 수단을 먼저 선택해 주세요.');
            return;
        }

        if (selectedPaymentMethod === 'cash' && !isCashSufficient) {
            alert('받은 금액이 최종 결제 금액보다 부족합니다.');
            return;
        }
        
        setIsModalOpen(true); // 모달 팝업
    }, [selectedPaymentMethod, isCashSufficient]);

    // 모달 내 '결제 진행' 버튼
   const handleProceedPayment = useCallback(() => {
    // ⭐️ [추가] 결제 완료 후, 가상의 주문 ID를 생성했다고 가정합니다. ⭐️
    const DUMMY_ORDER_ID = "POS-20251103-001";
    // ...
    // 결제 완료 후, 'COMPLETE' 화면으로 전환
    setIsModalOpen(false);
   // ⭐️ [수정] navigateTo 호출 시 orderId와 orderType을 props로 전달 ⭐️
    navigateTo(ScreenStates.COMPLETE, { 
        orderId: DUMMY_ORDER_ID, 
        orderType: orderType 
    }); 
}, [navigateTo, orderType]); //

// '결제 취소 / 돌아가기' 버튼 (수정)
const handleCancelCheckout = useCallback(() => {
    alert('결제를 취소하고 이전 화면으로 돌아갑니다.');
    navigateTo(ScreenStates.MAIN); // 👈 ScreenStates 사용
}, [navigateTo]);

    // ----------------------------------------------------
    // ⭐️ JSX 마크업 (CSS 클래스 변환) ⭐️
    // ----------------------------------------------------

    // Tailwind CSS 클래스 (CSS 파일 대체)
    const KIOSK_BTN_CLASS = "func-btn px-4 py-3 font-bold rounded-lg transition duration-150";
    const BLUE_BTN_CLASS = `bg-[#0077cc] text-white hover:bg-[#005faa]`;
    const PAY_METHOD_ACTIVE = 'bg-[#0077cc] text-white shadow-lg';
    const PAY_METHOD_INACTIVE = 'bg-[#e9ecef] text-[#333] hover:bg-[#d0e7ff]';
    const FINAL_BTN_SUCCESS = 'bg-[#4CAF50] text-white hover:bg-[#388e3c]';
    const FINAL_BTN_CANCEL = 'bg-[#f44336] text-white hover:bg-[#d32f2f]';


    return (
        <div className="flex flex-col lg:flex-row max-w-[900px] mx-auto my-5 bg-white rounded-lg shadow-xl font-sans" id="checkout-container">
            
            {/* 1. 주문 상세 영역 (좌측) */}
            <div className="lg:w-[55%] w-full p-6 flex flex-col border-r border-[#eee]" id="order-details-area">
                <div className="flex justify-between items-center mb-5 pb-3 border-b-2 border-[#0077cc]">
                    <h2 className="text-xl font-bold text-[#333]">결제할 주문 내역 확인</h2>
                    <div className="text-lg font-bold text-[#cc0000]" id="ticket-number-display">주문 번호: <span>A-001</span></div>
                </div>

                {/* 매장/포장 확인 */}
                <div className="flex justify-center mb-4" id="dine-in-takeout-select">
                    <p className={`p-3 px-6 bg-[#0077cc] text-white font-bold rounded-md text-lg pointer-events-none`}>
                        {orderType === 'STORE' ? '매장 (For Here)' : '포장 (To Go)'}
                    </p>
                </div>

                {/* 최종 주문 목록 */}
                <ul className="list-none p-0 flex-grow overflow-y-auto max-h-[350px] mb-5 space-y-2" id="final-order-list">
                    {orderItems.map((item) => (
                        <li key={item.id} className="py-2 border-b border-dashed border-[#eee] flex flex-wrap justify-between">
                            <div className="flex w-full justify-between">
                                <span className="flex-4 font-semibold text-base">{item.name} ({item.temp}{item.modifiers.length > 0 ? ` / ${item.modifiers.join(', ')}` : ''})</span>
                                <span className="flex-1 text-center font-semibold text-base">x {item.qty}</span>
                                <span className="flex-2 text-right font-bold text-lg">{formatPrice(item.price * item.qty)} 원</span>
                            </div>
                            {item.memo && item.memo.length > 0 && (
                                <div className="text-sm text-[#f44336] pl-2 w-full mt-1">
                                    요청: {item.memo}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                {/* 금액 요약 상세 */}
                <div className="pt-4 border-t border-[#ddd]" id="summary-breakdown">
                    <div className="flex justify-between mb-2">
                        <span>상품 합계</span>
                        <span id="summary-subtotal" className="font-medium">{formatPrice(subTotal)} 원</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>할인 금액</span>
                        <span id="summary-discount" className="text-[#0077cc] font-medium">- {formatPrice(actualDiscount)} 원</span>
                    </div>

                    {/* ⭐️ [추가] 최종 결제 수단 정보 (유지) ⭐️ */}
                    <div className="flex justify-between mb-2 pt-2 border-t border-dashed border-[#ccc]">
                        <span className="font-semibold text-[#555]">선택된 결제 수단</span>
                        <span id="summary-payment-method" className="font-extrabold text-[#0077cc]">
                            {selectedPaymentMethod === 'card' ? '카드 결제' :
                             selectedPaymentMethod === 'cash' ? '현금 결제' :
                             selectedPaymentMethod === 'mobile' ? '간편 결제' :
                             selectedPaymentMethod === 'split' ? '부분 결제' : '미선택'}
                        </span>
                    </div>

                    {/* ⭐️ [추가] 영수증 발급 여부 정보 ⭐️ */}
                    <div className="flex justify-between mb-2">
                        <span className="font-semibold text-[#555]">영수증 발급 여부</span>
                        <span id="summary-receipt-type" className="font-bold text-[#0077cc]">
                            {receiptType === 'paper' ? '종이 발행' : '미발행'}
                        </span>
                    </div>


                    <div className="flex justify-between items-center text-2xl font-extrabold text-[#cc0000] pt-3 border-t-2 border-[#cc0000] mt-3" id="summary-total-row">
                        <span>최종 결제 금액</span>
                        <span id="final-grand-total">{formatPrice(finalGrandTotal)} 원</span>
                    </div>
                </div>
            </div>

            {/* 2. 결제 액션 영역 (우측) */}
            <div className="lg:w-[45%] w-full p-6 flex flex-col" id="payment-actions-area">

                {/* 멤버십 섹션 */}
                <div className="mb-5 pb-4 border-b border-[#eee]" id="member-section">
                    <h3 className="text-xl font-bold text-[#0077cc] mb-3">멤버십 / 포인트 사용</h3>
                    {/* 휴대폰 번호 입력 및 조회 버튼 */}
                        <div className="flex gap-2 mb-2">
                            <input 
                                type="tel" 
                                placeholder="휴대폰 번호 입력" 
                                id="member-phone" 
                                className="flex-grow p-2 border border-[#ddd] rounded-md focus:ring-1 focus:ring-[#0077cc]"
                                value={phoneNumber}       // 👈 1. 상태 연결
                                onChange={handlePhoneInput} // 👈 2. 입력 핸들러 연결
                            />
                            <button 
                                className={`p-2 px-4 rounded-md text-white font-bold text-sm bg-[#0077cc] hover:bg-[#005fa3] transition`} 
                                id="member-search-btn"
                                onClick={handleMemberSearch} // 👈 3. 조회 핸들러 연결
                                disabled={isMemberVerified}
                            >
                                {isMemberVerified ? '조회 완료' : '조회'}
                            </button>
                        </div>
                    {/* 멤버십 정보 (조회 성공 시 표시) */}
                    <div id="member-info" className=""> 
                        <p className="text-sm text-gray-600 mb-2">잔여 포인트: <span id="current-point" className="font-bold text-[#cc0000]">{formatPrice(memberPoints)} P</span></p>
                        <div className="flex gap-2 items-center">
                            <input 
                                type="number" 
                                placeholder="사용할 포인트" 
                                id="point-to-use" 
                                value={pointToUse}
                                onChange={handlePointInput}
                                disabled={!isMemberVerified}
                                className="flex-grow p-2 border border-[#ddd] rounded-md focus:ring-1 focus:ring-[#0077cc]"
                            />
                            <button 
                                className={`${KIOSK_BTN_CLASS} text-sm px-4 py-2 bg-gray-300 hover:bg-gray-400`} 
                                id="use-all-point-btn"
                                onClick={handleUseAllPoint}
                            >
                                전액 사용
                            </button>
                        </div>
                    </div>
                </div>

                {/* 결제 수단 선택 */}
                <div className="mb-5 pb-4 border-b border-[#eee]" id="method-section">
                    <h3 className="text-xl font-bold text-[#0077cc] mb-3">결제 수단 선택</h3>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-2" id="payment-method-grid">
                        
                        {(['card', 'cash', 'mobile', 'split'] as const).map(method => (
                            <button 
                                key={method}
                                className={`${KIOSK_BTN_CLASS} py-4 text-base ${selectedPaymentMethod === method ? PAY_METHOD_ACTIVE : PAY_METHOD_INACTIVE}`}
                                onClick={() => handlePaymentMethodSelect(method)}
                            >
                                {method === 'card' ? '카드 결제' : method === 'cash' ? '현금 결제' : method === 'mobile' ? '간편 결제' : '부분 결제'}
                            </button>
                        ))}
                    </div>

                    {/* 현금 모듈 */}
                    <div id="cash-module" className={`mt-4 p-3 border border-dashed border-[#ccc] rounded-md ${selectedPaymentMethod === 'cash' ? 'block' : 'hidden'}`}>
                        <label className="text-sm font-semibold block mb-1">받은 금액</label>
                        <input 
                            type="number" 
                            id="cash-received" 
                            placeholder="받은 금액 입력"
                            value={cashReceived}
                            onChange={handleCashReceivedInput}
                            className="w-full p-2 border border-[#ddd] rounded-md mb-2 focus:ring-1 focus:ring-[#0077cc]"
                        />
                        <div className="text-base font-bold" id="change-display" style={{ color: isCashSufficient ? '#0077cc' : '#f44336' }}>
                            거스름돈: 
                            <span id="cash-change" className="ml-1">
                                {formatPrice(changeAmount)} 원
                                {!isCashSufficient && selectedPaymentMethod === 'cash' && changeAmount < 0 && ' (부족)'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 최종 실행 버튼 */}
                <div className="mt-auto pt-4" id="final-action-section">
                    <div className="paper_box">
                        
                        <span className="font-semibold">영수증 발급:</span>
                        <button 
                            className={`${KIOSK_BTN_CLASS} text-sm px-3 py-1 ${receiptType === 'paper' ? BLUE_BTN_CLASS : 'bg-gray-300 hover:bg-gray-400'}`} 
                            onClick={() => setReceiptType('paper')}
                        >
                            종이
                        </button>
                        <button 
                            className={`${KIOSK_BTN_CLASS} text-sm px-3 py-1 ${receiptType === 'none' ? BLUE_BTN_CLASS : 'bg-gray-300 hover:bg-gray-400'}`}
                            onClick={() => setReceiptType('none')}
                        >
                            미발급
                        </button>
                    </div>

                    <button 
                        id="final-checkout-btn" 
                        className={`${KIOSK_BTN_CLASS} py-3 text-lg ${FINAL_BTN_SUCCESS}`}
                        onClick={handleFinalCheckout}
                    >
                        결제 완료 및 주문 확정
                    </button>
                    <button 
                        id="cancel-checkout-btn" 
                        className={`${KIOSK_BTN_CLASS} py-3 text-lg ${FINAL_BTN_CANCEL}`}
                        onClick={handleCancelCheckout}
                    >
                        결제 취소 / 돌아가기
                    </button>
                </div>
            </div>

            {/* 3. 결제 확인 모달 */}
            {isModalOpen && (
                <div id="confirm-modal" className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-50 ">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm text-center transform scale-100 transition duration-300" id="modal-content">
                        <h3 className="text-2xl font-bold text-[#cc0000] mb-5">결제 확인</h3>
                        <p className="text-xl mb-6">총 
                            <span id="modal-confirm-amount" className="text-[#cc0000] font-extrabold ml-2 mr-2">{formatPrice(finalGrandTotal)} 원</span>
                            을 결제하시겠습니까?
                        </p>
                        <div className="modal-footer" id="modal-footer">
                            <button 
                                id="modal-cancel-confirm" 
                                className="p-3 w-5/12 bg-gray-300 text-[#333] font-bold rounded-md hover:bg-gray-400"
                                onClick={() => setIsModalOpen(false)}
                            >
                                취소
                            </button>
                            <button 
                                id="modal-proceed-payment" 
                                className="p-3 w-5/12 bg-[#4CAF50] text-white font-bold rounded-md hover:bg-[#388e3c]"
                                onClick={handleProceedPayment}
                            >
                                결제 진행
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};