//src/components/AdminCategoryReorderModal.tsx - 카데고리 순서변경

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { AdminCategoryItem } from '../types/admin';
import { COLORS } from '../theme/colorPalette'; 
// ⭐️ @hello-pangea/dnd로 임포트 변경 ⭐️
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'; 

// 🚨 임시 해결책: COLORS 팔레트에 PRIMARY_LIGHT가 없으므로 임시 값 사용
const PRIMARY_LIGHT = '#e0f7fa'; 

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
    z-index: 1020;
`;

const ModalContent = styled.div`
    background: ${COLORS.BACKGROUND_LIGHT};
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h3`
    color: ${COLORS.PRIMARY_DARK};
    margin-bottom: 20px;
    font-size: 1.5rem;
`;

// DragItem 정의
const DragItem = styled.div<{ $isDragging: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin-bottom: 8px;
    /* PRIMARY_LIGHT 대신 임시 값 사용 */
    background-color: ${props => props.$isDragging ? PRIMARY_LIGHT : COLORS.TEXT_LIGHT};
    color: ${props => props.$isDragging ? COLORS.PRIMARY_DARK : COLORS.TEXT_DARK};
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    cursor: grab;
    font-weight: bold;
    font-size: 1.1rem;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: ${COLORS.BACKGROUND_DARK};
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

const reorder = (list: AdminCategoryItem[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

// --- 컴포넌트 로직 ---

interface AdminCategoryReorderModalProps {
    categories: AdminCategoryItem[];
    onClose: () => void;
    onSaveOrder: (newOrder: AdminCategoryItem[]) => void; 
}


export const AdminCategoryReorderModal: React.FC<AdminCategoryReorderModalProps> = ({ 
    categories, 
    onClose, 
    onSaveOrder 
}) => {
    const [items, setItems] = useState(categories);

    // DND 라이브러리의 DropResult 타입을 사용
    const onDragEnd = useCallback((result: DropResult) => {
        const { destination, source } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const newItems = reorder(items, source.index, destination.index);
        setItems(newItems);
    }, [items]);
    
    const handleSave = () => {
        onSaveOrder(items);
        onClose();
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <Title>✨ 카테고리 순서 변경</Title>
                <p style={{ marginBottom: '20px', color: COLORS.TEXT_MUTED, fontSize: '0.9rem' }}>
                    목록을 드래그하여 원하는 순서로 이동시키세요. (1이 가장 왼쪽)
                </p>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="category-list">
                        {(provided) => ( 
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {items.map((cat, index) => (
                                    <Draggable 
                                        key={cat.id} 
                                        draggableId={cat.id} 
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <DragItem
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                $isDragging={snapshot.isDragging}
                                            >
                                                <span>{index + 1}. {cat.name}</span>
                                                <span style={{ color: COLORS.PRIMARY_DARK, fontSize: '0.9rem' }}>
                                                    (현재 순서: {cat.kioskOrder})
                                                </span>
                                            </DragItem>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder} 
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <ButtonGroup>
                    <CancelButton onClick={onClose}>취소</CancelButton>
                    <SaveButton onClick={handleSave}>순서 저장</SaveButton>
                </ButtonGroup>

            </ModalContent>
        </ModalOverlay>
    );
};