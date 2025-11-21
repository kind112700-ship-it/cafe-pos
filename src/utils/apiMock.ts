// src/utils/apiMock.ts

import { Transaction, OrderItem, Category } from '../types'; 
import { AdminMenuItem, AdminCategoryItem } from '../types/admin';

// ⭐️ Product 타입 정의 (기존 Mock 데이터 구조 유지) ⭐️
export interface Product {
    id: string; 
    name: string; 
    category: Category; 
    price: number; 
    cost: number; 
    isAvailable: boolean; 
    imageUrl: string; 
}

// ⭐️ [추가] Mock 카테고리 목록 정의 ⭐️
let DUMMY_CATEGORIES: AdminCategoryItem[] = [
    { id: 'CAT01', name: 'COFFEE' as Category, kioskOrder: 1, isVisible: true },
    { id: 'CAT02', name: 'BEVERAGE' as Category, kioskOrder: 2, isVisible: true },
    { id: 'CAT03', name: 'TEA' as Category, kioskOrder: 3, isVisible: true },
    { id: 'CAT04', name: 'FRAPPUCCINO' as Category, kioskOrder: 4, isVisible: true },
    { id: 'CAT05', name: 'AED' as Category, kioskOrder: 5, isVisible: true },
];

// ⭐️ [추가] Product 타입을 AdminMenuItem 타입으로 변환하는 헬퍼 함수 ⭐️
const mapProductToAdminMenuItem = (product: Product, index: number): AdminMenuItem => ({
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    
    // --- AdminMenuItem 전용 필드 매핑 및 Mock 데이터 추가 ---
    kioskOrder: index + 1,
    isSoldOut: !product.isAvailable, 
    isVisible: true,
    prepTimeMinutes: product.category === 'AED' ? 10 : (product.category === 'COFFEE' ? 3 : 5),
    kitchenRoute: product.category === 'AED' ? 'KITCHEN' : 'BAR', 
    isBestSeller: index < 2, 
});


// 거래 내역 목 데이터 (복구 및 유지)
const MOCK_ORDER_ITEMS: OrderItem[] = [
    { id: 'O001', baseId: 'M001', name: '아이스 아메리카노', price: 4500, qty: 2, temp: 'ICE', modifiers: ['사이즈 M'], memo: '' },
    { id: 'O002', baseId: 'M005', name: '블루베리 베이글', price: 6000, qty: 1, temp: 'HOT', modifiers: [], memo: '토스트 요청' },
    { id: 'O003', baseId: 'M007', name: '라떼', price: 5000, qty: 1, temp: 'HOT', modifiers: ['샷 추가'], memo: '' },
];

let DUMMY_TRANSACTIONS: Transaction[] = [
    { id: 'tx001', orderId: '24-101', orderType: 'STORE', status: 'COMPLETED', timestamp: new Date(2025, 10, 3, 14, 30), totalAmount: 12500, paymentMethod: 'CARD', items: MOCK_ORDER_ITEMS.slice(0, 2) },
    { id: 'tx002', orderId: '24-102', orderType: 'TAKEOUT', status: 'COMPLETED', timestamp: new Date(2025, 10, 3, 14, 35), totalAmount: 8000, paymentMethod: 'CASH', items: MOCK_ORDER_ITEMS.slice(1, 3) },
    { id: 'tx003', orderId: '24-103', orderType: 'STORE', status: 'COMPLETED', timestamp: new Date(2025, 10, 4, 14, 40), totalAmount: 15000, paymentMethod: 'CARD', items: MOCK_ORDER_ITEMS },
    { id: 'tx004', orderId: '24-104', orderType: 'TAKEOUT', status: 'REFUNDED', timestamp: new Date(2025, 10, 4, 14, 45), totalAmount: 5500, paymentMethod: 'CARD', items: MOCK_ORDER_ITEMS.slice(0, 1) },
    { id: 'tx005', orderId: '24-105', orderType: 'STORE', status: 'COMPLETED', timestamp: new Date(2025, 10, 4, 14, 50), totalAmount: 18000, paymentMethod: 'QR_PAY', items: MOCK_ORDER_ITEMS.slice(1) },
    { id: 'tx006', orderId: '24-106', orderType: 'STORE', status: 'COMPLETED', timestamp: new Date(2025, 10, 4, 15, 0), totalAmount: 6000, paymentMethod: 'CASH', items: MOCK_ORDER_ITEMS.slice(2) },
];

/**
 * 가상의 상품 마스터 데이터 (유지)
 */
let DUMMY_PRODUCTS: Product[] = [
    { id: 'M001', name: '아이스 아메리카노', category: 'COFFEE', price: 4500, cost: 1500, isAvailable: true, imageUrl: 'https://placehold.co/100x100/A0B2C4/FFFFFF?text=A' },
    { id: 'M002', name: '따뜻한 아메리카노', category: 'COFFEE', price: 4000, cost: 1400, isAvailable: true, imageUrl: 'https://placehold.co/100x100/A0B2C4/FFFFFF?text=H' },
    { id: 'M003', name: '딸기 요거트 스무디', category: 'BEVERAGE', price: 6500, cost: 2500, isAvailable: true, imageUrl: 'https://placehold.co/100x100/F59E0B/FFFFFF?text=S' },
    { id: 'M004', name: '얼그레이 티', category: 'TEA', price: 5000, cost: 1800, isAvailable: true, imageUrl: 'https://placehold.co/100x100/10B981/FFFFFF?text=T' },
    { id: 'M005', name: '블루베리 베이글', category: 'AED', price: 6000, cost: 2000, isAvailable: true, imageUrl: 'https://placehold.co/100x100/F97316/FFFFFF?text=B' },
    { id: 'M006', name: '콜드브루 라떼', category: 'COFFEE', price: 5500, cost: 2100, isAvailable: false, imageUrl: 'https://placehold.co/100x100/3B82F6/FFFFFF?text=C' },
];


// --- 거래 내역 API 함수 (복구) ---

export const fetchTransactions = async (startDate: string, endDate: string, paymentMethod: 'ALL' | Transaction['paymentMethod']): Promise<Transaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1); 

    const filtered = DUMMY_TRANSACTIONS.filter(tx => {
        const txTime = new Date(tx.timestamp);
        const isWithinDate = txTime >= start && txTime < end;
        const isPaymentMatch = paymentMethod === 'ALL' || tx.paymentMethod === paymentMethod;
        return isWithinDate && isPaymentMatch;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return filtered; 
};

export const refundTransaction = async (transactionId: string): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    const index = DUMMY_TRANSACTIONS.findIndex(tx => tx.id === transactionId);

    if (index === -1 || DUMMY_TRANSACTIONS[index].status !== 'COMPLETED') {
        throw new Error("Transaction not found or already refunded/cancelled.");
    }

    DUMMY_TRANSACTIONS[index] = { ...DUMMY_TRANSACTIONS[index], status: 'REFUNDED' };
    return DUMMY_TRANSACTIONS[index]; 
};

export const reprintReceipt = async (transactionId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`[MOCK API] 영수증 재출력 요청 완료: ${transactionId}`);
    return { success: true };
};


// --- 상품 관리 API 함수 (수정 및 추가) ---

/**
 * 상품 목록과 카테고리 목록을 함께 가져오는 API (useAdminData.ts가 호출)
 */
export const fetchAdminMenuItems = async (): Promise<{ menuItems: AdminMenuItem[], categories: AdminCategoryItem[] }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // DUMMY_PRODUCTS를 AdminMenuItem 배열로 변환
    const adminMenuItems = DUMMY_PRODUCTS
        .map(mapProductToAdminMenuItem)
        .sort((a, b) => a.kioskOrder - b.kioskOrder); 

    return { 
        menuItems: adminMenuItems, 
        categories: DUMMY_CATEGORIES, 
    };
};

/**
 * 상품 목록을 가져오는 가상 API (기존 fetchProducts 유지, AdminMenuItem 반환)
 */
export const fetchProducts = async (): Promise<AdminMenuItem[]> => {
    const { menuItems } = await fetchAdminMenuItems();
    return menuItems.sort((a, b) => (a.isSoldOut ? 1 : 0) - (b.isSoldOut ? 1 : 0));
};

/**
 * 새 상품을 추가하는 가상 API
 */
export const addProduct = async (productData: Omit<AdminMenuItem, 'id' | 'kioskOrder'>): Promise<AdminMenuItem> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock DB 업데이트 로직 (간소화)
    const newId = 'M' + String(DUMMY_PRODUCTS.length + 1).padStart(3, '0');
    const newOrder = DUMMY_PRODUCTS.length + 1;
    
    const newProduct: AdminMenuItem = { 
        ...productData, 
        id: newId, 
        kioskOrder: newOrder,
        // DUMMY_PRODUCTS에 맞춰 isAvailable 필드도 Mock으로 추가 (추가 상품은 품절 아님)
        isSoldOut: false, 
        isVisible: true,
        prepTimeMinutes: productData.prepTimeMinutes || 5,
        kitchenRoute: productData.kitchenRoute || 'BAR',
        isBestSeller: productData.isBestSeller || false,
    };

    // DUMMY_PRODUCTS (Product 타입)를 업데이트하는 대신, AdminMenuItem을 반환하는 것으로 Mocking을 단순화합니다.
    return newProduct;
};

/**
 * 상품 정보를 수정하는 가상 API
 */
export const updateProduct = async (updatedProduct: AdminMenuItem): Promise<AdminMenuItem> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mocking 단순화: 실제 DB 업데이트 대신 받은 객체를 반환
    return updatedProduct;
};

/**
 * 상품을 삭제(isAvailable=false) 처리하는 가상 API
 */
export const deleteProduct = async (productId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = DUMMY_PRODUCTS.findIndex(p => p.id === productId);
    
    if (index === -1) {
        throw new Error('상품을 찾을 수 없습니다.');
    }
    
    // isAvailable을 false로 업데이트하여 품절 처리
    DUMMY_PRODUCTS[index] = { ...DUMMY_PRODUCTS[index], isAvailable: false };
    
    return { success: true };
};

// --- 카테고리 관리 API (useAdminData에서 사용) ---

export const createAdminCategory = async (categoryName: Category): Promise<AdminCategoryItem> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newId = 'CAT' + String(DUMMY_CATEGORIES.length + 1).padStart(2, '0');
    const newCategory: AdminCategoryItem = {
        id: newId,
        name: categoryName,
        kioskOrder: DUMMY_CATEGORIES.length + 1,
        isVisible: true,
    };
    DUMMY_CATEGORIES.push(newCategory); // Mock DB 업데이트
    
    return newCategory;
};

export const updateAdminCategory = async (updatedCategory: AdminCategoryItem): Promise<AdminCategoryItem> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = DUMMY_CATEGORIES.findIndex(c => c.id === updatedCategory.id);
    if (index !== -1) {
        DUMMY_CATEGORIES[index] = updatedCategory; // Mock DB 업데이트
    }

    return updatedCategory;
};

export const deleteAdminCategory = async (categoryId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const initialLength = DUMMY_CATEGORIES.length;
    DUMMY_CATEGORIES = DUMMY_CATEGORIES.filter(c => c.id !== categoryId); // Mock DB 업데이트
    
    if (DUMMY_CATEGORIES.length === initialLength) {
        throw new Error('카테고리를 찾을 수 없습니다.');
    }
    
    return { success: true };
};