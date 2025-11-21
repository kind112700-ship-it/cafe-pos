import { OrderItem } from '../types';
import { MODIFIER_PRICES } from './data';
import { MODIFIER_PRICES as ModifierPricesType } from './data';

// 가격 포맷팅
export const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR');
};

// 단일 주문 항목의 총 가격 계산
export const calculateItemPrice = (item: OrderItem): number => {
    let price: number = item.price;
    if (item.modifiers && Array.isArray(item.modifiers)) {
        item.modifiers.forEach(modifier => {
            
            // 1. 모디파이어 이름에서 가격 포맷팅 부분 (+숫자)을 제거합니다.
            const baseModifier = modifier.replace(/\s?\(\+\d+?\)/g, '').trim(); 
            
            // 2. MODIFIER_PRICES 객체의 키 배열을 가져옵니다.
            const priceKeys = Object.keys(MODIFIER_PRICES);
            
            // 3. 정확히 일치하거나 (예: '저지방 우유'), 가격 정보가 포함된 키 (예: '시럽 추가 (+500)')를 찾습니다.
            const priceKey = priceKeys.find(key => key === baseModifier || key.includes(baseModifier));
            
            // 4. 찾은 키를 사용하여 안전하게 가격에 접근합니다.
            if (priceKey) {
                // ⭐️ 에러 해결: 타입 단언(Type Assertion) 사용 ⭐️
                // priceKey가 MODIFIER_PRICES의 유효한 키임을 명시적으로 알립니다.
                price += MODIFIER_PRICES[priceKey as keyof typeof MODIFIER_PRICES] || 0;
            }

        });
    }
    return price;
};