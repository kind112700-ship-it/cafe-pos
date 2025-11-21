// src/pages/AdminSalesReport.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { AdminScreenProps, ScreenStates, Transaction, OrderItem } from '../types'; 
import { COLORS } from '../theme/colorPalette'; 
import { ReportCard } from '../components/ReportCard'; 
import { TransactionTable } from '../components/TransactionTable'; 
import { TransactionDetailsModal } from '../components/TransactionDetailsModal';
// ⭐️ API Mock 함수 임포트 ⭐️
import { fetchTransactions, refundTransaction, reprintReceipt } from '../utils/apiMock';

// --- 타입 및 상수 ---

interface SaleSummary {
    totalSales: number;
    totalOrders: number;
    averageCheck: number;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- 스타일 컴포넌트 (이전과 동일) ---

const ReportContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: ${COLORS.BACKGROUND};
    color: ${COLORS.TEXT_DARK};
    padding: 30px;
`;

const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 1px solid ${COLORS.BACKGROUND_DARK}; 
    padding-bottom: 15px;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    font-weight: bold;
    color: ${COLORS.PRIMARY};
`;

const BackButton = styled.button`
    background-color: ${COLORS.PRIMARY_DARK}; 
    color: ${COLORS.TEXT_LIGHT};
    padding: 10px 20px;
    font-size: 1.2rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: ${COLORS.PRIMARY};
    }
`;

const ContentWrapper = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 20px;
`;

const FilterBar = styled.div`
    display: flex;
    flex-wrap: wrap; 
    gap: 15px;
    padding: 15px;
    align-items: center;
    background-color: ${COLORS.BACKGROUND_LIGHT};
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FilterButton = styled.button<{ $isActive: boolean }>`
    padding: 10px 20px;
    font-size: 1.1rem;
    border: 1px solid ${props => props.$isActive ? COLORS.PRIMARY : COLORS.BACKGROUND_DARK};
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
    background-color: ${props => props.$isActive ? COLORS.PRIMARY : COLORS.TEXT_LIGHT};
    color: ${props => props.$isActive ? COLORS.TEXT_LIGHT : COLORS.TEXT_DARK};

    &:hover {
        background-color: ${props => props.$isActive ? COLORS.PRIMARY_DARK : COLORS.BACKGROUND};
    }
`;

const DateInput = styled.input`
    padding: 10px;
    font-size: 1.1rem;
    border: 1px solid ${COLORS.BACKGROUND_DARK}; 
    border-radius: 6px;
    width: 150px;
    text-align: center;
`;

const TableContainer = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    background-color: ${COLORS.TEXT_LIGHT};
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
`;

// Modal Style Component 재사용을 위한 임시 정의
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000; 
`;

const ModalContent = styled.div`
    background-color: ${COLORS.TEXT_LIGHT};
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    text-align: center;
`;

const ActionButton = styled.button<{ $type: 'refund' | 'reprint' }>`
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1.1rem;
    transition: background-color 0.2s;

    background-color: ${props => 
        props.$type === 'refund' ? COLORS.DANGER : COLORS.SECONDARY};
    color: ${COLORS.TEXT_LIGHT};
    
    &:hover {
        background-color: ${props => 
            props.$type === 'refund' ? COLORS.DANGER_DARK : COLORS.SECONDARY_DARK};
    }
`;

// --- 컴포넌트 로직 (API 연동 변경) ---

export const AdminSalesReport: React.FC<AdminScreenProps> = ({ navigateTo }) => {
    
    // ⭐️ API로부터 가져온 데이터 저장 ⭐️
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const [selectedTransactionItems, setSelectedTransactionItems] = useState<OrderItem[] | null>(null);
    const [refundConfirmationTxId, setRefundConfirmationTxId] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null); // 상태 메시지 표시용
    
    const [startDate, setStartDate] = useState<string>(getTodayDateString());
    const [endDate, setEndDate] = useState<string>(getTodayDateString());
    const [paymentFilter, setPaymentFilter] = useState<'ALL' | Transaction['paymentMethod']>('ALL');

    // ⭐️ API 데이터 Fetch 로직 ⭐️
    const loadTransactions = useCallback(async () => {
        setIsLoading(true);
        setStatusMessage(null);
        try {
            // API 호출 (startDate, endDate, paymentFilter를 파라미터로 전달)
            const data = await fetchTransactions(startDate, endDate, paymentFilter);
            setTransactions(data);
        } catch (error) {
            console.error("거래 내역 로드 중 오류 발생:", error);
            setStatusMessage("거래 내역을 불러오는 데 실패했습니다.");
            setTransactions([]);
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate, paymentFilter]);
    
    // 필터 조건(날짜, 결제 수단)이 변경될 때마다 데이터 재로드
    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);
    
    // [로직] 영수증 재출력 함수 (API 호출 반영)
    const handleReprintReceipt = useCallback(async (transactionId: string) => {
        try {
            await reprintReceipt(transactionId);
            setStatusMessage(`주문 ${transactionId}의 영수증 재출력을 요청했습니다.`); 
        } catch (error) {
            console.error("영수증 재출력 실패:", error);
            setStatusMessage(`주문 ${transactionId} 영수증 재출력에 실패했습니다.`); 
        }
    }, []);
    
    // [로직] 관리자 메인 메뉴 복귀
    const handleBack = useCallback(() => {
        navigateTo(ScreenStates.ADMIN); 
    }, [navigateTo]);

    // [로직] 모달 관련 로직 (이전과 동일)
    const handleTransactionClick = useCallback((transaction: Transaction) => {
        setSelectedTransactionItems(transaction.items); 
    }, []);

    const handleCloseDetails = useCallback(() => {
        setSelectedTransactionItems(null);
    }, []);

    // [로직] 날짜 프리셋 설정 함수 (이전과 동일)
    const setDateRange = useCallback((months: number) => {
        const today = new Date();
        const start = new Date(today);
        
        if (months > 0) { 
            start.setMonth(today.getMonth() - months);
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
    }, []);
    
    const isPresetActive = useCallback((months: number): boolean => {
        const todayStr = getTodayDateString();
        
        if (months === 0) { 
            return startDate === todayStr && endDate === todayStr;
        }

        const checkStart = new Date();
        checkStart.setMonth(checkStart.getMonth() - months);
        const checkStartStr = checkStart.toISOString().split('T')[0];

        return startDate === checkStartStr && endDate === todayStr;

    }, [startDate, endDate]);


    // [로직] 매출 요약 정보 계산 (API로부터 받은 transactions 사용)
    const summary: SaleSummary = useMemo(() => {
        // COMPLETED 상태의 거래만 매출로 계산
        const completedTransactions = transactions.filter(tx => tx.status === 'COMPLETED');
        
        const totalSales = completedTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
        const totalOrders = completedTransactions.length;
        const averageCheck = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
        
        return { totalSales, totalOrders, averageCheck };
    }, [transactions]);


    // 1. 환불 확인 요청 (모달 표시)
    const handleRequestRefund = useCallback((transactionId: string) => {
        setRefundConfirmationTxId(transactionId);
    }, []);

    // 2. ⭐️ 환불 실행 로직 (API 호출 반영) ⭐️
    const handleConfirmRefund = useCallback(async () => {
        if (!refundConfirmationTxId) return;

        const transactionId = refundConfirmationTxId;
        setRefundConfirmationTxId(null); // 모달 즉시 닫기
        setIsLoading(true); // 로딩 시작

        try {
            // API 호출: 환불 요청
            const updatedTx = await refundTransaction(transactionId); 
            
            // 상태 업데이트: API 응답을 반영하여 transactions 배열 업데이트
            setTransactions(prev => prev.map(tx => 
                tx.id === updatedTx.id ? updatedTx : tx
            ));
            
            setStatusMessage(`주문 ${transactionId} 환불 처리가 완료되었습니다.`);

        } catch (error) {
            console.error("환불 처리 실패:", error);
            setStatusMessage(`주문 ${transactionId} 환불 처리에 실패했습니다.`);
        } finally {
            setIsLoading(false); // 로딩 종료
        }

    }, [refundConfirmationTxId]);
    
    // 3. 환불 취소
    const handleCancelRefund = useCallback(() => {
        setRefundConfirmationTxId(null);
    }, []);
    
    // [로직] 모달 대체용 임시 Confirm UI 
    const RefundConfirmationModal = () => {
        if (!refundConfirmationTxId) return null;
        
        return (
            <ModalOverlay>
                <ModalContent style={{ maxWidth: '400px' }}>
                    <h3 style={{ color: COLORS.DANGER, marginBottom: '20px' }}>환불 확인</h3>
                    <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
                        정말로 주문 **{refundConfirmationTxId}**에 대한 환불 처리를 진행하시겠습니까?
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <ActionButton $type="reprint" onClick={handleCancelRefund}>
                            아니오 (취소)
                        </ActionButton>
                        <ActionButton $type="refund" onClick={handleConfirmRefund}>
                            예 (환불 진행)
                        </ActionButton>
                    </div>
                </ModalContent>
            </ModalOverlay>
        );
    }
    
    const StatusOverlay = () => {
        if (statusMessage) {
            // 일정 시간 후 메시지 자동 제거
            setTimeout(() => setStatusMessage(null), 3000); 
        }
        
        return (
            <ModalOverlay style={{ 
                backgroundColor: 'transparent', 
                pointerEvents: 'none',
                alignItems: 'flex-start',
                paddingTop: '20px'
            }}>
                <div style={{
                    backgroundColor: statusMessage ? COLORS.PRIMARY_DARK : 'transparent',
                    color: COLORS.TEXT_LIGHT,
                    padding: '15px 30px',
                    borderRadius: '8px',
                    boxShadow: statusMessage ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                    opacity: statusMessage ? 1 : 0,
                    transition: 'opacity 0.3s, background-color 0.3s',
                    fontWeight: 'bold',
                }}>
                    {statusMessage}
                </div>
            </ModalOverlay>
        );
    }

    return (
        <ReportContainer>
            <Header>
                <Title>📊 매출/거래 내역 (API 연동)</Title>
                <BackButton onClick={handleBack} disabled={isLoading}>
                    관리자 메뉴로 돌아가기
                </BackButton>
            </Header>

            <ContentWrapper>
                <SummaryGrid>
                    <ReportCard title="총 매출액" value={summary.totalSales.toLocaleString('ko-KR') + '원'} />
                    <ReportCard title="총 주문 건수" value={summary.totalOrders.toLocaleString('ko-KR') + '건'} />
                    <ReportCard title="평균 객단가" value={summary.averageCheck.toLocaleString('ko-KR') + '원'} />
                </SummaryGrid>

                <FilterBar>
                    <label style={{ fontWeight: 'bold', minWidth: '80px' }}>기간 설정:</label>
                    <FilterButton $isActive={isPresetActive(0)} onClick={() => setDateRange(0)} disabled={isLoading}>오늘</FilterButton>
                    <FilterButton $isActive={isPresetActive(1)} onClick={() => setDateRange(1)} disabled={isLoading}>1개월</FilterButton>
                    <FilterButton $isActive={isPresetActive(3)} onClick={() => setDateRange(3)} disabled={isLoading}>3개월</FilterButton>
                    <FilterButton $isActive={isPresetActive(6)} onClick={() => setDateRange(6)} disabled={isLoading}>6개월</FilterButton>
                    <FilterButton $isActive={isPresetActive(12)} onClick={() => setDateRange(12)} disabled={isLoading}>1년</FilterButton>

                    <label style={{ marginLeft: '20px' }}>시작일:</label>
                    <DateInput 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        disabled={isLoading}
                    />
                    <label>~ 종료일:</label>
                    <DateInput 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        disabled={isLoading}
                    />
                </FilterBar>

                <FilterBar>
                     <label style={{ fontWeight: 'bold', minWidth: '80px' }}>결제 수단:</label>
                    <FilterButton $isActive={paymentFilter === 'ALL'} onClick={() => setPaymentFilter('ALL')} disabled={isLoading}>전체</FilterButton>
                    <FilterButton $isActive={paymentFilter === 'CARD'} onClick={() => setPaymentFilter('CARD')} disabled={isLoading}>카드</FilterButton>
                    <FilterButton $isActive={paymentFilter === 'CASH'} onClick={() => setPaymentFilter('CASH')} disabled={isLoading}>현금</FilterButton>
                    <FilterButton $isActive={paymentFilter === 'QR_PAY'} onClick={() => setPaymentFilter('QR_PAY')} disabled={isLoading}>QR페이</FilterButton>
                </FilterBar>


                <TableContainer>
                    {/* ⭐️ 로딩 상태 표시 ⭐️ */}
                    {isLoading && (
                        <p style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: COLORS.PRIMARY }}>
                            데이터를 로드 중입니다... 잠시만 기다려주세요.
                        </p>
                    )}
                    
                    {/* ⭐️ 데이터 테이블 표시 ⭐️ */}
                    {!isLoading && (
                        <TransactionTable
                            transactions={transactions}
                            onRefund={handleRequestRefund} 
                            onTransactionClick={handleTransactionClick} 
                            onReprintReceipt={handleReprintReceipt} 
                        />
                    )}
                </TableContainer>
                
            </ContentWrapper>
            
            {/* 상세 내역 모달 렌더링 */}
            {selectedTransactionItems && (
                <TransactionDetailsModal 
                    items={selectedTransactionItems} 
                    onClose={handleCloseDetails} 
                />
            )}
            
            {/* 환불 확인 커스텀 모달 */}
            <RefundConfirmationModal />
            
            {/* 상태 메시지 오버레이 */}
            <StatusOverlay />
            
        </ReportContainer>
    );
};