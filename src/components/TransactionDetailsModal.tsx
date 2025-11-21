// src/components/TransactionDetailsModal.tsx

import React from 'react';
import styled from 'styled-components';
import { OrderItem } from '../types'; // ⭐️ OrderItem 임포트 ⭐️
import { formatPrice } from '../utils/helpers';
import { COLORS } from '../theme/colorPalette';

interface TransactionDetailsModalProps {
    items: OrderItem[]; // OrderItem 배열을 받습니다.
    onClose: () => void;
}

// --- 스타일 컴포넌트 ---
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
    width: 90%;
    max-width: 550px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: ${COLORS.TEXT_MUTED};
`;

const ItemRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px dashed #ddd;
    
    &:last-child {
        border-bottom: none;
    }
`;
// --- 스타일 컴포넌트 끝 ---


export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ items, onClose }) => {
    return (
        <Overlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <CloseButton onClick={onClose}>×</CloseButton>
                <h3 style={{ marginBottom: '25px', color: COLORS.PRIMARY_DARK, fontSize: '1.5rem' }}>상세 계산 완료된 품목</h3>
                
                {items.map((item) => (
                    <ItemRow key={item.id}>
                        <div>
                            <strong style={{ fontSize: '1.1rem' }}>{item.name}</strong> 
                            <span style={{ marginLeft: '10px' }}>x {item.qty}</span>
                            <div style={{ fontSize: '0.85rem', color: COLORS.TEXT_MUTED, marginTop: '2px' }}>
                                ({item.temp}{item.modifiers.length > 0 ? `, ${item.modifiers.join(', ')}` : ''})
                            </div>
                            {item.memo && <div style={{ fontSize: '0.85rem', color: '#f44336', marginTop: '3px' }}>* 요청: {item.memo}</div>}
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: COLORS.PRIMARY_DARK }}>
                            {formatPrice(item.price * item.qty)} 원
                        </div>
                    </ItemRow>
                ))}
            </ModalContent>
        </Overlay>
    );
};