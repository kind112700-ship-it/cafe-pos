import React, { useState } from 'react';
import styled from 'styled-components';
import { COLORS } from '../theme/colorPalette';
import { AdminMenuItem, AdminCategoryItem } from '../types/admin';

// --- 스타일 컴포넌트 ---
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
    input[type="number"], input[type="text"] {
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
    background-color: ${COLORS.PRIMARY};
    color: ${COLORS.TEXT_LIGHT};
    &:hover { background-color: ${COLORS.PRIMARY_DARK}; }
`;

const CancelButton = styled.button`
    background-color: ${COLORS.DANGER};
    color: ${COLORS.TEXT_LIGHT};
    &:hover { background-color: ${COLORS.DANGER_DARK}; }
`;

// --- 컴포넌트 로직 ---

interface AdminItemEditModalProps {
    item: AdminMenuItem;
    categories: AdminCategoryItem[];
    onClose: () => void;
    onSave: (updatedItem: AdminMenuItem) => void;
}

export const AdminItemEditModal: React.FC<AdminItemEditModalProps> = ({ item, onClose, onSave }) => {
    // ⭐️ 전달받은 상품 정보를 초기 상태로 사용
    const [editedItem, setEditedItem] = useState(item);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        
        setEditedItem(prev => ({
            ...prev,
            // 숫자 타입 필드는 숫자로 변환
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = () => {
        // ⭐️ 유효성 검사 (예: 가격은 0 이상)
        if (editedItem.price < 0 || editedItem.prepTimeMinutes < 0) {
            alert('가격 및 준비 시간은 0 이상이어야 합니다.');
            return;
        }
        onSave(editedItem);
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <Title>상품 상세 정보 수정: {item.name}</Title>
                
                <form>
                    <FormRow>
                        <label>상품 ID</label>
                        <input type="text" value={editedItem.id} readOnly disabled />
                    </FormRow>
                    <FormRow>
                        <label htmlFor="name">상품명</label>
                        <input 
                            type="text" 
                            id="name"
                            name="name" 
                            value={editedItem.name} 
                            onChange={handleChange} 
                        />
                    </FormRow>
                    <FormRow>
                        <label htmlFor="price">가격 (원)</label>
                        <input 
                            type="number" 
                            id="price"
                            name="price" 
                            value={editedItem.price} 
                            onChange={handleChange} 
                            min="0"
                        />
                    </FormRow>
                    <FormRow>
                        <label htmlFor="prepTimeMinutes">준비 시간 (분)</label>
                        <input 
                            type="number" 
                            id="prepTimeMinutes"
                            name="prepTimeMinutes" 
                            value={editedItem.prepTimeMinutes} 
                            onChange={handleChange} 
                            min="1"
                        />
                    </FormRow>
                    <FormRow>
                        <label htmlFor="kioskOrder">키오스크 순서</label>
                        <input 
                            type="number" 
                            id="kioskOrder"
                            name="kioskOrder" 
                            value={editedItem.kioskOrder} 
                            onChange={handleChange} 
                            min="1"
                        />
                    </FormRow>
                    
                    {/* 추가 필드 (kitchenRoute, isBestSeller 등)는 필요 시 추가 */}

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                        <SaveButton type="button" onClick={handleSubmit}>저장</SaveButton>
                    </ButtonGroup>
                </form>

            </ModalContent>
        </ModalOverlay>
    );
};