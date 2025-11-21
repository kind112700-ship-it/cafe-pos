//src/types/admin.ts

import { Category } from './index'; // 👈 기존 index.ts 파일에서 Category 타입 임포트

// 1. 관리자용 카테고리 항목 구조
export interface AdminCategoryItem {
    id: string;
    name: Category;
    kioskOrder: number;
    isVisible: boolean;
}

// 2. 관리자용 메뉴 데이터 항목 구조
export interface AdminMenuItem {
    id: string;
    name: string;
    price: number;
    category: Category;
    
    // --- 관리자 전용 필드 ---
    kioskOrder: number;     
    isSoldOut: boolean;     
    isVisible: boolean;     
    prepTimeMinutes: number; 
    kitchenRoute: string;   
    isBestSeller: boolean;  
}

// 3. 직원 권한 역할 (Role) 정의
/**
 * @description 직원이 시스템에서 가질 수 있는 권한 수준을 정의합니다.
 */
export type PermissionRole = 'Admin' | 'Manager' | 'Staff';

// 4. 신규 직원 등록 시 입력 폼 데이터 구조
/**
 * @description 신규 직원 등록 시 API로 전송되는 데이터 구조입니다.
 */
export interface StaffForm {
    name: string;
    employeeId: string; // 사번 등 고유 식별자 (로그인 ID로 사용 가능)
    password: string;   // 초기 비밀번호
    role: PermissionRole;
}

// 5. 직원 사용자 정보 구조 (DB 저장 및 조회용)
/**
 * @description 시스템에 등록된 직원 정보와 현재 상태를 정의합니다.
 */
export interface StaffUser {
    id: string;             // DB 고유 ID
    name: string;
    employeeId: string;
    role: PermissionRole;
    lastLogin: string;      // 최종 로그인 시간 (날짜 문자열)
    isLoginLocked: boolean; // 계정 잠금 여부
    isActive: boolean;      // 현재 근무 상태 (퇴사 시 false)
     createdAt: string; 

}

/**
 * 일별/월별 매출 보고서 데이터 타입
 */
export interface SalesReport {
    date: string; // YYYY-MM-DD 또는 YYYY-MM
    totalRevenue: number; // 총 매출액
    totalOrders: number;   // 총 주문 건수
    averageOrderValue: number; // 평균 주문 단가
}

/**
 * 개별 거래(주문) 기록 상세 데이터 타입
 */
export interface TransactionRecord {
    id: string; // 거래 ID
    orderTime: string; // 주문 시간 (ISO 8601 형식)
    itemsCount: number; // 상품 종류 수
    totalAmount: number; // 최종 결제 금액
    paymentMethod: 'Card' | 'Cash' | 'Mobile'; // 결제 수단
    staffName: string; // 처리 직원 이름 (선택 사항)
}