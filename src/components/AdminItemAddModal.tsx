//src/components/AdminItemAddModal.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { AdminMenuItem } from '../types/admin';
import { Category } from '../types';
import { COLORS } from '../theme/colorPalette';
import { AdminCategoryItem } from '../types/admin';

// --- 스타일 컴포넌트 (AdminItemEditModal과 동일하게 구성) ---
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: ${COLORS.BACKGROUND_LIGHT};
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h3`
    color: ${COLORS.PRIMARY_DARK};
    margin-bottom: 25px;
    font-size: 1.5rem;
    border-bottom: 2px solid ${COLORS.TEXT_MUTED};
    padding-bottom: 10px;
`;

const FormRow = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    label {
        font-weight: bold;
        width: 120px;
        color: ${COLORS.TEXT_DARK};
    }
    input[type="number"], input[type="text"], select {
        flex-grow: 1;
        padding: 10px;
        border: 1px solid ${COLORS.TEXT_MUTED};
        border-radius: 6px;
        font-size: 1rem;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 30px;
    button {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        margin-left: 10px;
    }
`;

const SaveButton = styled.button`
    background-color: ${COLORS.ACCENT};
    color: ${COLORS.TEXT_LIGHT};
    &:hover { background-color: ${COLORS.ACCENT_DARK}; }
`;

const CancelButton = styled.button`
    background-color: ${COLORS.DANGER};
    color: ${COLORS.TEXT_LIGHT};
    &:hover { background-color: ${COLORS.DANGER_DARK}; }
`;

// 임시: 모든 카테고리 목록 (Category 타입에 따라 변경될 수 있습니다)
const CATEGORY_OPTIONS: Category[] = ["COFFEE", "BEVERAGE", "TEA", "FRAPPUCCINO", "AED"];
const KITCHEN_OPTIONS = ["BAR", "KITCHEN", "SERVICE"];

// --- 컴포넌트 로직 ---

// 새 상품 데이터는 ID와 kioskOrder를 제외한 AdminMenuItem의 속성을 가집니다.
type NewItemData = Omit<AdminMenuItem, 'id' | 'kioskOrder'>;

interface AdminItemAddModalProps {
    onClose: () => void;
    // 부모 컴포넌트(AdminProductManagement)에서 addItem 함수를 연결할 예정
    onSave: (newItemData: NewItemData) => void;
    categories: AdminCategoryItem[];
}

const initialNewItem: NewItemData = {
    name: '',
    price: 0,
    category: CATEGORY_OPTIONS[0], // 기본값 설정
    isSoldOut: false,
    isVisible: true,
    prepTimeMinutes: 3,
    kitchenRoute: KITCHEN_OPTIONS[0], // 기본값 설정
    isBestSeller: false,
};

export const AdminItemAddModal: React.FC<AdminItemAddModalProps> = ({ onClose, onSave, categories }) => {
    const [newItem, setNewItem] = useState<NewItemData>(initialNewItem);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setNewItem(prev => ({
            ...prev,
            // 숫자, 불리언, 문자열 타입에 따라 값 처리
            [name]: (type === 'number' || name === 'prepTimeMinutes' || name === 'price') 
                ? Number(value) 
                : (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value),
        }));
    };

    const handleSubmit = () => {
        if (!newItem.name || newItem.price <= 0 || newItem.prepTimeMinutes <= 0) {
            alert('상품명, 가격, 준비 시간은 필수 입력값이며 0보다 커야 합니다.');
            return;
        }
        
        // ⭐️ ID와 kioskOrder를 제외한 데이터만 onSave로 전달
        onSave(newItem);
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <Title>🚀 새로운 상품 등록</Title>
                
                <form>
                    <FormRow>
                        <label htmlFor="category">카테고리</label>
                        <select 
                            id="category"
                            name="category" 
                            value={newItem.category} 
                            onChange={handleChange} 
                        >
                           {/* ⭐️ categories 배열을 사용하여 옵션 렌더링 ⭐️ */}
                            {categories.map((cat) => (
                                <option 
                                    key={cat.id} 
                                    value={cat.name}
                                >
                                    {cat.name} {cat.isVisible ? '' : '(숨김)'}
                                </option>
                            ))}
                        </select>
                    </FormRow>
                    <FormRow>
                        <label htmlFor="name">상품명</label>
                        <input 
                            type="text" 
                            id="name"
                            name="name" 
                            value={newItem.name} 
                            onChange={handleChange} 
                        />
                    </FormRow>
                    <FormRow>
                        <label htmlFor="price">가격 (원)</label>
                        <input 
                            type="number" 
                            id="price"
                            name="price" 
                            value={newItem.price} 
                            onChange={handleChange} 
                            min="1"
                        />
                    </FormRow>
                    <FormRow>
                        <label htmlFor="prepTimeMinutes">준비 시간 (분)</label>
                        <input 
                            type="number" 
                            id="prepTimeMinutes"
                            name="prepTimeMinutes" 
                            value={newItem.prepTimeMinutes} 
                            onChange={handleChange} 
                            min="1"
                        />
                    </FormRow>
                    <FormRow>
                        <label htmlFor="kitchenRoute">키친 라우팅</label>
                        <select 
                            id="kitchenRoute"
                            name="kitchenRoute" 
                            value={newItem.kitchenRoute} 
                            onChange={handleChange} 
                        >
                            {KITCHEN_OPTIONS.map(route => (
                                <option key={route} value={route}>{route}</option>
                            ))}
                        </select>
                    </FormRow>
                    
                    <FormRow>
                        <label htmlFor="isBestSeller">인기 상품</label>
                        <input 
                            type="checkbox" 
                            id="isBestSeller"
                            name="isBestSeller" 
                            checked={newItem.isBestSeller} 
                            onChange={handleChange} 
                            style={{ width: 'auto' }}
                        />
                    </FormRow>

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                        <SaveButton type="button" onClick={handleSubmit}>상품 등록</SaveButton>
                    </ButtonGroup>
                </form>

            </ModalContent>
        </ModalOverlay>
    );
};