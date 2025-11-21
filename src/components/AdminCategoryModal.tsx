//src/components/AdminCategoryModal.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AdminCategoryItem } from '../types/admin';
import { Category } from '../types';
import { COLORS } from '../theme/colorPalette';


const initialNewCategory: Omit<AdminCategoryItem, 'id' | 'kioskOrder'> = {
    name: '새 카테고리' as Category, 
    isVisible: true,
};


// --- 스타일 컴포넌트 (AdminItemModal 재활용 및 수정) ---

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
    z-index: 1010; // 상품 모달보다 높게 설정
`;

const ModalContent = styled.div`
    background: ${COLORS.BACKGROUND_LIGHT};
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
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
        width: 100px;
        color: ${COLORS.TEXT_DARK};
    }
    input[type="text"] {
        flex-grow: 1;
        padding: 10px;
        border: 1px solid ${COLORS.TEXT_MUTED};
        border-radius: 6px;
        font-size: 1rem;
    }
    input[type="checkbox"] {
        width: auto;
        margin-left: 0;
        margin-right: 10px;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 30px;
    gap: 10px;
    button {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
    }
`;

const SaveButton = styled.button`
    background-color: ${COLORS.ACCENT};
    color: ${COLORS.TEXT_LIGHT};
    &:hover { background-color: ${COLORS.ACCENT_DARK}; }
`;

const CancelButton = styled.button`
    background-color: ${COLORS.TEXT_MUTED};
    color: ${COLORS.TEXT_DARK};
    &:hover { background-color: ${COLORS.BACKGROUND_DARK}; }
`;

const DeleteButton = styled.button`
    background-color: ${COLORS.DANGER};
    color: ${COLORS.TEXT_LIGHT};
    margin-right: auto; /* 왼쪽으로 보내기 */
    &:hover { background-color: ${COLORS.DANGER_DARK}; }
`;

// --- 컴포넌트 로직 ---

interface AdminCategoryModalProps {
    // item이 있으면 '수정' 모드, 없으면 '추가' 모드
    categoryToEdit: AdminCategoryItem | null; 
    onClose: () => void;
    
 // ⭐️ [중요] 타입 수정 ⭐️: onSave는 이제 수정 전용 핸들러이므로 AdminCategoryItem만 받습니다.
    onSave: (category: AdminCategoryItem) => void; 
    
    onAdd: (name: Category) => void; // 추가 전용 핸들러 (이름만 받음)
    onDelete: (categoryId: string) => void;
}

// ... (initialNewCategory, useState 정의 생략) ...


export const AdminCategoryModal: React.FC<AdminCategoryModalProps> = ({ 
    categoryToEdit, 
    onClose, 
    // ⭐️ onSave 대신 onAdd, onSaveToEdit로 분리 사용 ⭐️
    onSave, // 이 프롭스는 이제 수정 모드에서만 사용할 것을 염두에 둡니다.
    onDelete,
    onAdd // 새로 추가된 추가 전용 핸들러
}) => {
    // ... (isEditMode, categoryData, handleChange 정의는 동일) ...
    const isEditMode = categoryToEdit !== null;

    const [categoryData, setCategoryData] = useState<Omit<AdminCategoryItem, 'id' | 'kioskOrder'>>(
        isEditMode 
            ? { name: categoryToEdit.name, isVisible: categoryToEdit.isVisible }
            : initialNewCategory
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        
        setCategoryData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

   const handleSubmit = () => {
        if (!categoryData.name) {
            alert('카테고리 이름을 입력해주세요.');
            return;
        }

        if (isEditMode) {
            // ⭐️ 1. 수정 모드: AdminCategoryItem 전체를 onSave(수정 핸들러)에 전달 ⭐️
            const finalCategory: AdminCategoryItem = {
                ...categoryToEdit!, 
                name: categoryData.name,
                isVisible: categoryData.isVisible,
            };
            onSave(finalCategory); // 기존 onSave (이제 수정 전용)
            
        } else {
            // ⭐️ 2. 추가 모드: Category 이름(string)만 onAdd(추가 핸들러)에 전달 ⭐️
            // 이렇게 하면 useAdminData의 addCategory(name) 시그니처와 일치하여 안전합니다.
            onAdd(categoryData.name as Category);
        }
        
        onClose();
    };

    const handleDelete = () => {
        if (isEditMode && window.confirm(`정말로 카테고리 "${categoryToEdit!.name}"을(를) 삭제하시겠습니까? 해당 카테고리에 속한 모든 상품이 정리될 수 있습니다.`)) {
            onDelete(categoryToEdit!.id);
            onClose();
        }
    };
    
    // 모달 타이틀 설정
    const modalTitle = isEditMode ? '카테고리 정보 수정' : '새 카테고리 추가';
    const saveButtonLabel = isEditMode ? '저장' : '추가';
    
    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <Title>{modalTitle}</Title>
                
                <form onSubmit={e => e.preventDefault()}>
                    <FormRow>
                        <label htmlFor="name">카테고리 이름</label>
                        <input 
                            type="text" 
                            id="name"
                            name="name" 
                            value={categoryData.name} 
                            onChange={handleChange} 
                            // Category 타입이지만 사용자 입력을 받기 위해 string으로 처리
                            maxLength={20}
                        />
                    </FormRow>
                    
                    <FormRow>
                        <label htmlFor="isVisible">키오스크 노출</label>
                        <input 
                            type="checkbox" 
                            id="isVisible"
                            name="isVisible" 
                            checked={categoryData.isVisible} 
                            onChange={handleChange} 
                        />
                        <span>{categoryData.isVisible ? '노출 중' : '숨김'}</span>
                    </FormRow>

                    <ButtonGroup>
                        {isEditMode && <DeleteButton type="button" onClick={handleDelete}>카테고리 삭제</DeleteButton>}
                        <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                        {/* ⭐️ '추가' 모드 시 handleSubmit 로직 분리 필요 (다음 단계에서 처리) ⭐️ */}
                        <SaveButton type="button" onClick={handleSubmit}>{saveButtonLabel}</SaveButton>
                    </ButtonGroup>
                </form>

            </ModalContent>
        </ModalOverlay>
    );
};