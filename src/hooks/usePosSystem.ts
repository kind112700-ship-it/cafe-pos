// src/hoos/usePosSystem.ts
import { useState, useMemo } from 'react';
import { CurrentOrder, InitialItemData, OrderItem } from '../types';
import { MENU_ITEMS_DATA } from '../utils/data';
import { calculateItemPrice } from '../utils/helpers';

// POS 시스템의 모든 상태와 함수를 반환하는 커스텀 훅
export const usePosSystem = () => {
    // 1. ⭐️ 상태 정의 ⭐️
    const [currentOrder, setCurrentOrder] = useState<CurrentOrder>({});
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalItemData, setModalItemData] = useState<InitialItemData | null>(null);
    const [nextUniqueId, setNextUniqueId] = useState(1);
    
    // 🚨 [수정 사항 1] 주문 타입을 상태로 추가합니다. (기본값 'STORE')
    const [orderType, setOrderType] = useState<'STORE' | 'TAKEOUT'>('STORE'); 

    // 2. ⭐️ 총액 계산 ⭐️
    const grandTotal: number = useMemo(() => {
        return Object.values(currentOrder).reduce((total: number, item: OrderItem) => {
            const itemPrice = calculateItemPrice(item);
            return total + itemPrice * item.qty;
        }, 0);
    }, [currentOrder]);

    // 3. ⭐️ 핸들러 함수 로직 채우기 ⭐️
    // ... (기존 핸들러 함수 로직은 동일)

    // [메뉴 클릭] 모달 열기
    const handleItemClick = (itemId: string) => {
        const itemInfo = MENU_ITEMS_DATA[itemId as keyof typeof MENU_ITEMS_DATA];
        if (!itemInfo) return;
        
        setModalItemData({
            baseId: itemId,
            name: itemInfo.name,
            price: itemInfo.price,
            qty: 1,
            temp: itemInfo.category === 'COFFEE' ? 'ICE' : 'HOT', 
            modifiers: [],
            memo: ''
        });
        setIsModalOpen(true);
    };

    // [모달] 주문 담기 (새 항목 추가)
    const handleAddToOrder = (itemData: InitialItemData) => {
        const uniqueId = nextUniqueId.toString();
        const newItem: OrderItem = { ...itemData, id: uniqueId };

        setCurrentOrder(prevOrder => ({ ...prevOrder, [uniqueId]: newItem }));
        setSelectedItemId(uniqueId);
        setNextUniqueId(prevId => prevId + 1);
        setIsModalOpen(false);
    };

    // [주문 목록] 수량 변경
    const handleQtyChange = (uniqueId: string, change: number) => {
        if (!currentOrder[uniqueId]) return;
        setCurrentOrder(prevOrder => {
            const newQty = prevOrder[uniqueId].qty + change;
            if (newQty < 1) return prevOrder; 
            return {
                ...prevOrder,
                [uniqueId]: { ...prevOrder[uniqueId], qty: newQty }
            };
        });
    };

    // [주문 목록] 항목 삭제
    const handleDeleteItem = (uniqueId: string) => {
        setCurrentOrder(prevOrder => {
            const newOrder = { ...prevOrder };
            delete newOrder[uniqueId];
            return newOrder;
        });
        setSelectedItemId(null);
    };
    
    // [주문 목록] 항목 선택
    const handleOrderItemSelect = (uniqueId: string) => { 
        setSelectedItemId(uniqueId); 
    };
    
    // [주문 타입 변경]
    const setOrderTypeState = (type: 'STORE' | 'TAKEOUT') => {
        setOrderType(type);
    };

    // ⭐️ [핵심 추가] 주문 강제 초기화 함수 ⭐️
    const resetAllOrderStates = () => {
        // 모든 주문 관련 상태를 초기값으로 되돌립니다.
        setCurrentOrder({}); 
        setOrderType('STORE'); // 주문 유형 초기값으로 복원
        setSelectedItemId(null);
        setModalItemData(null);
        setNextUniqueId(1); // ID 카운터 초기화
        setIsModalOpen(false); // 혹시 열려있는 모달 닫기
        console.log("[POS SYSTEM] 클라이언트 주문 상태 강제 초기화 완료.");
    };

    // 4. ⭐️ 반환 (orderType 포함) ⭐️
    return {
        currentOrder,
        selectedItemId,
        isModalOpen,
        modalItemData,
        grandTotal,
        orderType, // 🚨 [수정 사항 1] orderType을 반환합니다.
        handleItemClick,
        handleAddToOrder,
        handleQtyChange,
        handleDeleteItem,
        handleOrderItemSelect,
        setIsModalOpen,
        setOrderTypeState, // 주문 타입 변경 함수도 노출
        resetAllOrderStates 
    };
    
};
