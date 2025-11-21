import React from 'react';
import { formatPrice, calculateItemPrice } from '../utils/helpers';
import { CurrentOrder, OrderItem, ScreenState, ScreenStates, OrderType } from '../types';


// Props 타입 정의
interface OrderAreaProps {
    currentOrder: CurrentOrder;
    grandTotal: number;
    selectedItemId: string | null;
    onItemSelect: (uniqueId: string) => void;
    onQtyChange: (uniqueId: string, change: number) => void;
    onDelete: (uniqueId: string) => void;
    // ⭐️ [추가] navigateTo와 orderType을 받도록 정의합니다. ⭐️
    navigateTo: (screen: ScreenState, props?: any) => void;
    orderType: OrderType;
}

const OrderArea: React.FC<OrderAreaProps> = ({ 
    currentOrder, 
    grandTotal, 
    selectedItemId, 
    onItemSelect, 
    onQtyChange, 
    onDelete,
    // ⭐️ navigateTo와 orderType을 인자로 받습니다. ⭐️
    navigateTo,
    orderType
}) => {
    // ... (기존 로직 동일)
    const orderItemsArray = Object.values(currentOrder).sort((a, b) => parseInt(a.id) - parseInt(b.id));
    const selectedItem: OrderItem | undefined = selectedItemId ? currentOrder[selectedItemId] : undefined;

    const handleDelete = () => {
        if (selectedItemId) {
            onDelete(selectedItemId);
        }
    };

    const handleQtyChangeClick = (change: number) => {
        if (selectedItemId) {
            onQtyChange(selectedItemId, change);
        }
    };

    // ⭐️ [추가] 결제 로직 함수 ⭐️
    const handleCheckout = () => {
        if (orderItemsArray.length === 0) {
            alert("주문 항목이 없습니다.");
            return;
        }

        // 🚨 [핵심] PaymentScreen으로 전환하며 데이터를 전달합니다.
        navigateTo(ScreenStates.PAYMENT, {
            orderItems: orderItemsArray, // 배열 형태로 변환된 주문 항목
            subTotal: grandTotal,        // 총 금액
            orderType: orderType,        // 주문 타입
        });
    };

    return (
        <div id="order-area">
            {/* ... (주문 목록 UI: order-header, order-list, action-row, total-row 동일) ... */}
            
            <div className="order-header">
                <h2>주문 목록</h2>
                <span className="order-count">총 {orderItemsArray.length}개 항목</span>
            </div>

            {/* ... (ul.order-list 전체 내용 동일) ... */}
            <ul className="order-list">
                {orderItemsArray.map(item => {
                    // ... (li 항목 내용 동일) ...
                    const itemPrice = calculateItemPrice(item);
                    const subtotal = itemPrice * item.qty;
                    const tempDisplay = item.temp ? ` (${item.temp.charAt(0)})` : '';
                    
                    const modifierDetailsHtml = item.modifiers.length > 0
                        ? <div className="modifier-list-line">⨽ {item.modifiers.join(', ')}</div>
                        : null;

                    const memoHtml = item.memo && item.memo.length > 0
                        ? <div className="modifier-list-line memo-line">📝 요청: {item.memo}</div>
                        : null;

                    return (
                        <li 
                            key={item.id} 
                            className={`order-item ${item.id === selectedItemId ? 'selected' : ''}`}
                            onClick={() => onItemSelect(item.id)}
                        >
                            <div className="main-info">
                                <span className="item-title">{item.name}{tempDisplay}</span>
                                <span className="item-qty">x {item.qty}</span>
                                <span className="item-subtotal">{formatPrice(subtotal)}</span>
                            </div>
                            {modifierDetailsHtml}
                            {memoHtml}
                        </li>
                    );
                })}
            </ul>
            
            {/* ... (action-row 동일) ... */}
            <div className="action-row">
                <button 
                    className="func-btn number" 
                    disabled={!selectedItem || selectedItem.qty <= 1}
                    onClick={() => handleQtyChangeClick(-1)}
                >-</button>
                <span className="func-btn number count">{selectedItem ? selectedItem.qty : 0}</span>
                <button 
                    className="func-btn number"
                    disabled={!selectedItem}
                    onClick={() => handleQtyChangeClick(1)}
                >+</button>
                <button 
                    className="func-btn delete"
                    disabled={!selectedItem}
                    onClick={handleDelete}
                >항목 삭제</button>
            </div>
            
            {/* ... (total-row 동일) ... */}
            <div className="total-row">
                <span>총 결제 금액 (Total)</span>
                <span id="grand-total-display">{formatPrice(grandTotal)}원</span>
            </div>
            
            {/* ⭐️ [핵심 수정] 기존 버튼 onClick에 handleCheckout 함수 연결 ⭐️ */}
            <button 
                id="checkout-btn" 
                onClick={handleCheckout} // 🚨 함수로직 전체를 handleCheckout으로 대체
            >
                주문하기 (Checkout)
            </button>
        </div>
    );
};

export default OrderArea;