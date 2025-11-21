import React, { useState, useMemo } from 'react';
import { formatPrice, calculateItemPrice } from '../utils/helpers';
import { MODIFIER_PRICES } from '../utils/data';
import { OrderItem, InitialItemData, Modifier } from '../types';

// Props 타입 정의
interface OptionModalProps {
    initialItem: InitialItemData;
    onClose: () => void;
    onConfirm: (item: InitialItemData) => void;
}

const MODIFIERS_GENERAL: Modifier[] = ['사이즈 UP', '샷 추가'];
const MODIFIERS_EXTRA: Modifier[] = ['시럽 추가 (+500)', '휘핑 추가 (+500)', '두유 변경 (+500)', '저지방 우유', '연하게', '진하게'];

// ⭐️ 추가된 헬퍼 함수 ⭐️
// MODIFIER_PRICES에서 안전하게 모디파이어 가격을 가져오는 함수
const getModifierPrice = (mod: Modifier): number => {
    const priceKeys = Object.keys(MODIFIER_PRICES);
    
    // 모디파이어 이름에서 가격 포맷팅 부분 (+숫자)을 제거합니다.
    const baseModifier = mod.replace(/\s?\(\+\d+?\)/g, '').trim(); 
    
    // 정확히 일치하거나 가격 정보가 포함된 키를 찾습니다.
    const priceKey = priceKeys.find(key => key === mod || key.includes(baseModifier));
    
    if (priceKey) {
        // 찾은 키가 MODIFIER_PRICES의 유효한 키임을 타입 단언을 통해 컴파일러에게 명시
        return MODIFIER_PRICES[priceKey as keyof typeof MODIFIER_PRICES];
    }
    
    return 0;
};


const OptionModal: React.FC<OptionModalProps> = ({ initialItem, onClose, onConfirm }) => {
    // InitialItemData는 id가 없으므로 OrderItem에서 id를 제외한 타입을 사용
    const [item, setItem] = useState<InitialItemData>(initialItem);

    // 모달 내 현재 항목의 옵션이 반영된 가격 계산
    const itemWithTempId: OrderItem = { ...item, id: 'temp' }; // 계산을 위한 임시 id
    const currentPricePerUnit = useMemo(() => calculateItemPrice(itemWithTempId), [item]);

    // 온도/사이즈 옵션 토글
    const handleOptionToggle = (type: 'temp' | 'modifier', value: string) => {
        setItem(prevItem => {
            if (type === 'temp' && (value === 'HOT' || value === 'ICE')) {
                return { ...prevItem, temp: value };
            } else if (type === 'modifier') {
                const isSelected = prevItem.modifiers.includes(value);
                const newModifiers = isSelected
                    ? prevItem.modifiers.filter(m => m !== value)
                    : [...prevItem.modifiers, value];
                return { ...prevItem, modifiers: newModifiers };
            }
            return prevItem;
        });
    };
    
    // 수량 변경
    const handleQtyChange = (change: number) => {
        setItem(prevItem => {
            const newQty = prevItem.qty + change;
            return newQty >= 1 ? { ...prevItem, qty: newQty } : prevItem;
        });
    };

    // 메모 변경
    const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setItem(prevItem => ({ ...prevItem, memo: e.target.value }));
    };

    // 주문 담기
    const handleConfirm = () => {
        onConfirm(item);
    };

    const isHotActive = item.temp === 'HOT';
    const isIceActive = item.temp === 'ICE';

    return (
        <div id="option-modal" className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 id="modal-item-name">{item.name}</h3>
                    <span id="modal-item-base-price">{formatPrice(item.price)}원</span>
                </div>

                <div className="modal-body">
                    <div className="modal-option-group">
                        <h4>온도 및 기본 옵션</h4>
                        <div className="option-row" id="modal-temp-size-options">
                            <button 
                                className={`modal-opt-btn ${isHotActive ? 'active' : ''}`}
                                onClick={() => handleOptionToggle('temp', 'HOT')}
                            >HOT</button>
                            <button 
                                className={`modal-opt-btn ${isIceActive ? 'active' : ''}`}
                                onClick={() => handleOptionToggle('temp', 'ICE')}
                            >ICE</button>

                            {MODIFIERS_GENERAL.map(mod => {
                                const modPrice = getModifierPrice(mod); // ⭐️ 헬퍼 함수 사용 ⭐️
                                return (
                                    <button
                                        key={mod}
                                        className={`modal-opt-btn ${item.modifiers.includes(mod) ? 'active' : ''}`}
                                        onClick={() => handleOptionToggle('modifier', mod)}
                                    >
                                        {mod} {modPrice > 0 ? `(+${formatPrice(modPrice)})` : ''}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="modal-option-group">
                        <h4>추가 선택 사항</h4>
                        <div className="modifier-grid" id="modal-modifier-options">
                            {MODIFIERS_EXTRA.map(mod => {
                                const modPrice = getModifierPrice(mod); // ⭐️ 헬퍼 함수 사용 ⭐️
                                return (
                                    <button
                                        key={mod}
                                        className={`modal-mod-btn ${item.modifiers.includes(mod) ? 'active' : ''}`}
                                        onClick={() => handleOptionToggle('modifier', mod)}
                                    >
                                        {mod.replace(/\s?\(\+\d+?\)/g, '')} {modPrice > 0 ? `(+${formatPrice(modPrice)})` : ''}
                                    </button>
                                );
                            })}
                        </div>
                        <div id="memo-options" className="option-content">
                            <textarea 
                                id="modal-memo-input" 
                                placeholder="요청 메모를 입력해 주세요" 
                                rows={3}
                                value={item.memo}
                                onChange={handleMemoChange}
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-qty-group">
                        <h4>수량</h4>
                        <div className="action-row modal-qty-controls">
                            <button 
                                id="modal-qty-minus" 
                                className="func-btn number"
                                disabled={item.qty <= 1}
                                onClick={() => handleQtyChange(-1)}
                            >-</button>
                            <span id="modal-qty-display" className="func-btn number count">{item.qty}</span>
                            <button 
                                id="modal-qty-plus" 
                                className="func-btn number"
                                onClick={() => handleQtyChange(1)}
                            >+</button>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button id="modal-cancel-btn" onClick={onClose}>취소</button>
                    <button id="modal-add-to-order-btn" onClick={handleConfirm}>
                        주문 담기 ({formatPrice(currentPricePerUnit * item.qty)}원)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OptionModal;