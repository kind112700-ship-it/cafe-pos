// src/pages/MainScreen.tsx

import React from 'react';
import MenuArea from '../components/MenuArea';
import OrderArea from '../components/OrderArea';
import OptionModal from '../components/OptionModal';
// 훅이 src/hooks/usePosSystem.ts에 있다고 가정하고 경로 설정
import { usePosSystem } from '../hooks/usePosSystem'; 
import '../styles/main.css'; 
import { MainScreenProps } from '../types';




// ⭐️ [핵심 수정] MainScreenProps 타입을 적용하여 Props를 받습니다. ⭐️
export const MainScreen: React.FC<MainScreenProps> = ({ 
    navigateTo, // App.tsx에서 전달된 함수
    orderType: orderType, // App.tsx에서 전달된 주문 타입
    // totalPrice는 현재 로직에서 사용하지 않으므로, 구조 분해 할당에서 생략해도 됩니다.
}) => {
    // usePosSystem 훅에서 POS 시스템의 모든 상태와 함수를 가져옵니다.
    const {
        currentOrder,
        selectedItemId,
        isModalOpen,
        modalItemData,
        grandTotal,
        handleItemClick,
        handleAddToOrder,
        handleQtyChange,
        handleDeleteItem,
        handleOrderItemSelect,
        setIsModalOpen
    } = usePosSystem(); 
    
    return (
        // POS 시스템의 전체 레이아웃 컨테이너
        <div id="pos-container"> 
            <MenuArea onItemClick={handleItemClick} />
            
            <OrderArea 
                currentOrder={currentOrder} 
                grandTotal={grandTotal} 
                selectedItemId={selectedItemId}
                onItemSelect={handleOrderItemSelect}
                onQtyChange={handleQtyChange}
                onDelete={handleDeleteItem}
                navigateTo={navigateTo}
                orderType={orderType}
            />
            
            {isModalOpen && modalItemData && (
                <OptionModal
                    initialItem={modalItemData}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleAddToOrder}
                />
            )}
        </div>
    );
};