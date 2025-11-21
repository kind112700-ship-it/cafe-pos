// src/api/admin/salesApi.ts
import { SalesReport, TransactionRecord } from '../../types/admin';

// 더미 데이터를 생성하는 함수
const generateDummyReport = (date: string, baseRevenue: number): SalesReport => ({
    date,
    totalRevenue: Math.floor(baseRevenue * (0.9 + Math.random() * 0.2)), // ±10% 변동
    totalOrders: Math.floor(baseRevenue / 15000 * (0.9 + Math.random() * 0.2)),
    averageOrderValue: 0 
});

// 더미 거래 기록을 생성하는 함수
const generateDummyTransactions = (count: number): TransactionRecord[] => {
    const transactions: TransactionRecord[] = [];
    for (let i = 0; i < count; i++) {
        const totalAmount = Math.floor(10000 + Math.random() * 50000);
        transactions.push({
            id: `TX-${Date.now() + i}`,
            orderTime: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
            itemsCount: Math.floor(1 + Math.random() * 5),
            totalAmount: totalAmount,
            paymentMethod: ['Card', 'Cash', 'Mobile'][Math.floor(Math.random() * 3)] as 'Card' | 'Cash' | 'Mobile',
            staffName: ['직원A', '직원B', '직원C'][Math.floor(Math.random() * 3)],
        });
    }
    return transactions;
};


/**
 * [API Mock] 특정 기간의 매출 보고서 데이터를 조회합니다.
 * @param startDate 조회 시작일 (YYYY-MM-DD)
 * @param endDate 조회 종료일 (YYYY-MM-DD)
 * @returns SalesReport 배열 (일별 보고서)
 */
export const fetchSalesReportData = async (
    startDate: string, 
    endDate: string
): Promise<SalesReport[]> => {
    console.log(`[API Call] 매출 보고서 조회: ${startDate} ~ ${endDate}`);
    
    // 실제 API 호출 로직 대신 더미 데이터 반환
    return new Promise((resolve) => {
        setTimeout(() => {
            const report: SalesReport[] = [
                generateDummyReport('2024-11-01', 500000),
                generateDummyReport('2024-11-02', 650000),
                generateDummyReport('2024-11-03', 480000),
                generateDummyReport('2024-11-04', 720000),
                generateDummyReport('2024-11-05', 810000),
            ].map(r => ({
                ...r,
                averageOrderValue: Math.round(r.totalRevenue / r.totalOrders)
            }));
            
            resolve(report);
        }, 800);
    });
};

/**
 * [API Mock] 특정 날짜의 상세 거래 내역을 조회합니다.
 * @param date 조회 날짜 (YYYY-MM-DD)
 * @returns TransactionRecord 배열
 */
export const fetchTransactionRecords = async (date: string): Promise<TransactionRecord[]> => {
    console.log(`[API Call] 상세 거래 내역 조회: ${date}`);
    
    // 실제 API 호출 로직 대신 더미 데이터 반환
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(generateDummyTransactions(Math.floor(5 + Math.random() * 15)));
        }, 500);
    });
};
