// src/components/TransactionTable.tsx

import React from 'react';
import styled from 'styled-components';
import { COLORS } from '../theme/colorPalette';
// types/index.ts의 Transaction 타입을 사용합니다. (실제 프로젝트에서는 경로에 맞게 import 필요)
import { Transaction, TransactionTableProps } from '../types';
import { formatPrice } from '../utils/helpers';


// --- 스타일 컴포넌트 ---
const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 1rem;
    table-layout: fixed; 
`;

const Thead = styled.thead`
    background-color: ${COLORS.PRIMARY_DARK};
    color: ${COLORS.TEXT_LIGHT};
    position: sticky; 
    top: 0;
    z-index: 10;
`;

const Th = styled.th`
    padding: 15px 10px;
    text-align: left;
    font-weight: 700;
    border-bottom: 2px solid ${COLORS.PRIMARY};
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
    border-bottom: 1px solid ${COLORS.BACKGROUND_DARK}; 

    &:nth-child(even) {
        background-color: ${COLORS.BACKGROUND}; // F5F5F5
    }
    &:hover {
        background-color: ${COLORS.BACKGROUND_DARK}20; // 살짝 어둡게
    }
    cursor: pointer; /* ⭐️ 클릭 가능하도록 커서 추가 ⭐️ */
    border-bottom: 1px solid ${COLORS.BACKGROUND_DARK};
`;

const Td = styled.td`
    padding: 15px 10px;
    vertical-align: middle;
`;

const RefundButton = styled.button`
    background-color: ${COLORS.DANGER}; // DANGER 색상 사용
    color: ${COLORS.TEXT_LIGHT};
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${COLORS.DANGER_DARK};
    }
    &:disabled {
        background-color: ${COLORS.BACKGROUND_DARK}; // 비활성화 색상
        cursor: not-allowed;
    }
        
`;

const ReceiptButton = styled.button`
    background-color: ${COLORS.SECONDARY}; /* 강조색 (노란색 계열) */
    color: ${COLORS.TEXT_DARK};
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
    margin-right: 10px; /* 환불 버튼과의 간격 */
    
    &:hover {
        background-color: ${COLORS.SECONDARY_DARK};
    }
    &:disabled {
        background-color: ${COLORS.BACKGROUND_DARK};
        cursor: not-allowed;
        color: ${COLORS.TEXT_MUTED};
    }
`;

// --- 컴포넌트 로직 ---
export const TransactionTable: React.FC<any> = ({ 
    transactions, 
    onRefund,
    onTransactionClick,
    onReprintReceipt // 👈 새로운 Prop을 받을 수 있도록 <any>를 사용했습니다.
}) => {

    // 환불 버튼 클릭 시 행 클릭 이벤트 전파를 막는 헬퍼 함수
    const handleRefundClick = (e: React.MouseEvent, transactionId: string) => {
        e.stopPropagation(); // ⭐️ 환불 버튼 클릭이 행 클릭 이벤트로 번지는 것을 막습니다. ⭐️
        onRefund(transactionId);
    };

    // ⭐️ 영수증 재출력 버튼 클릭 핸들러 (이 코드가 누락되어 에러가 났습니다!) ⭐️
    const handleReprintClick = (e: React.MouseEvent, transactionId: string) => {
        e.stopPropagation(); // 행 클릭 이벤트 전파 차단
        onReprintReceipt(transactionId);
    };

    // 거래 상태별 폰트 스타일링을 위한 헬퍼 함수
    const getStatusStyle = (status: Transaction['status']) => {
        switch (status) {
            case 'REFUNDED': return { color: COLORS.DANGER, fontWeight: 'bold' };
            case 'COMPLETED': return { color: COLORS.PRIMARY, fontWeight: 'bold' };
            case 'CANCELED': return { color: COLORS.TEXT_DARK };
            default: return {};
        }
    };
    
    // 타임스탬프 (Date 객체)를 보기 좋게 포맷합니다.
    const formatTime = (timestamp: Date): string => {
        return timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Table>
            <Thead>
                <Tr style={{ backgroundColor: COLORS.PRIMARY }}>
                    <Th style={{ width: '10%' }}>주문번호</Th>
                    <Th style={{ width: '15%' }}>시간</Th>
                    <Th style={{ width: '20%' }}>결제 금액</Th>
                    <Th style={{ width: '15%' }}>결제 수단</Th>
                    <Th style={{ width: '15%' }}>상태</Th>
                    <Th style={{ width: '25%', textAlign: 'center' }}>처리</Th>
                </Tr>
            </Thead>
            <Tbody>
                {transactions.map((tx: Transaction) => (
                    <Tr 
                        key={tx.id} 
                        onClick={() => onTransactionClick(tx)}
                    >
                        <Td>{tx.orderId}</Td>
                        <Td>{formatTime(tx.timestamp)}</Td>
                        <Td>{formatPrice(tx.totalAmount)}원</Td>
                        <Td>{tx.paymentMethod}</Td>
                        <Td>
                            <span style={getStatusStyle(tx.status)}>{tx.status}</span>
                        </Td>
                        <Td style={{ textAlign: 'center' }}>                            
                          {/* ⭐️ 1. 영수증 재출력 버튼 ⭐️ */}
                            <ReceiptButton 
                                onClick={(e) => handleReprintClick(e, tx.id)}
                                // 환불이 아닌 상태일 때만 활성화 (필요에 따라 로직 조정)
                                disabled={tx.status === 'REFUNDED'} 
                            >
                                영수증 재출력
                            </ReceiptButton>

                            {/* ⭐️ 2. 환불/취소 버튼 ⭐️ */}
                            <RefundButton 
                                onClick={(e) => handleRefundClick(e, tx.id)}
                                disabled={tx.status !== 'COMPLETED'} 
                            >
                                {tx.status === 'COMPLETED' ? '환불/취소' : '처리 완료'}
                            </RefundButton>
                        </Td>
                    </Tr>
                ))}
            </Tbody>
        </Table>
    );
};