// src/utils/api.ts

// ⭐️ 1. types 폴더에서 필요한 타입을 가져옵니다. ⭐️
import { Category } from '../types'; 
import { AdminMenuItem, AdminCategoryItem } from '../types/admin';

// ⭐️ 2. data 파일에서 사용자가 제공한 원본 데이터만 가져옵니다. (data.ts는 수정하지 않습니다.) ⭐️
import { MENU_ITEMS_DATA, CATEGORIES } from './data'; 

// ⭐️ 3. API 호출 시 클라이언트가 보낼 새 상품 데이터 타입 정의 ⭐️
export type NewItemData = Omit<AdminMenuItem, 'id' | 'kioskOrder'>;

// ⭐️ 4. (추가) data.ts에서 가져온 원본 메뉴 항목의 타입 정의 ⭐️
type RawMenuItem = {
    id: string; 
    name: string; 
    price: number; 
    category: string;
};

// --- Mock 데이터베이스 (In-Memory State) ---

// ⭐️ 이 변수들이 In-Memory DB 역할을 하며 CRUD 함수들에 의해 변경됩니다. ⭐️
let mockMenuItems: { [key: string]: AdminMenuItem } = {};
let mockCategories: AdminCategoryItem[] = [];

/**
 * MENU_ITEMS_DATA와 CATEGORIES를 AdminMenuItem 및 AdminCategoryItem 타입으로 변환하고
 * kioskOrder 등의 관리자 필드를 추가하여 Mock DB를 초기화합니다.
 */
function initializeMockData() {
    let itemIndex = 0;

    // ⭐️ MENU_ITEMS_DATA의 키 접근 시 TypeScript 오류를 해결하기 위해 
    //    객체에 Record<string, RawMenuItem> 타입을 임시로 선언합니다. ⭐️
    const rawMenuItems = MENU_ITEMS_DATA as Record<string, RawMenuItem>;

    // 상품 데이터 변환
    Object.keys(rawMenuItems).forEach((key) => {
        const item = rawMenuItems[key]; // ⭐️ 이제 오류 없이 접근 가능 ⭐️
        itemIndex++;
        
        mockMenuItems[key] = {
            ...item,
            description: `${item.name} 메뉴 설명`,
            category: item.category as Category, 
            kioskOrder: itemIndex, // Mock 순서 할당
            isSoldOut: false,             
            isVisible: true,              
            prepTimeMinutes: item.category === 'COFFEE' ? 3 : 5,           
            kitchenRoute: item.category === 'COFFEE' ? 'BAR' : 'KITCHEN',
            isBestSeller: itemIndex < 5, 
        } as AdminMenuItem; 
    });

    // 카테고리 데이터 변환
    mockCategories = CATEGORIES.map((cat, index) => ({
        id: `CAT${index + 1}`,
        name: cat as Category, 
        kioskOrder: index + 1,
        isVisible: true,
    }));
}

// 스크립트 로드 시 Mock DB 초기화
initializeMockData();


// --- API Helper ---

// 비동기 통신을 시뮬레이션하기 위해 딜레이를 추가합니다.
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const BASE_DELAY = 500;

// --- 상품 (Menu Item) API 함수 ---

/**
 * GET: 상품 목록 및 카테고리 목록을 조회합니다.
 * Mock API에서는 메모리 내의 mockMenuItems와 mockCategories를 반환합니다.
 */
export const fetchAdminMenuItems = async (): Promise<{ menuItems: AdminMenuItem[], categories: AdminCategoryItem[] }> => {
    await delay(BASE_DELAY); // 통신 지연 시뮬레이션
    
    // Object.values()의 반환 타입 명시 및 순서 정렬
    const menuItemsArray = (Object.values(mockMenuItems) as AdminMenuItem[])
        .sort((a, b) => a.kioskOrder - b.kioskOrder);
        
    const categoriesArray = (mockCategories as AdminCategoryItem[])
        .sort((a, b) => a.kioskOrder - b.kioskOrder);
    
    return { 
        menuItems: menuItemsArray, 
        categories: categoriesArray 
    };
};

/**
 * POST: 새 상품을 추가합니다.
 */
export const createAdminMenuItem = async (newItemData: NewItemData): Promise<AdminMenuItem> => {
    await delay(BASE_DELAY);
    
    // Mock: 새 ID와 순서 할당 후 반환
    const newId = `ITEM_${Date.now()}`;
    
    // 현재 최대 순서를 찾습니다.
    const maxOrder = (Object.values(mockMenuItems) as AdminMenuItem[]).reduce((max, item) => Math.max(max, item.kioskOrder), 0);
    
    const newItem: AdminMenuItem = {
        ...newItemData,
        id: newId,
        kioskOrder: maxOrder + 1, 
    } as AdminMenuItem;
    
    // 메모리 상의 Mock 데이터에 반영
    mockMenuItems[newId] = newItem; 

    return newItem;
};

/**
 * PUT/PATCH: 상품 정보를 수정합니다. (품절, 노출 토글 포함)
 */
export const updateAdminMenuItem = async (updatedItem: AdminMenuItem): Promise<AdminMenuItem> => {
    await delay(BASE_DELAY);
    
    // Mock: 기존 데이터를 업데이트
    if (!mockMenuItems[updatedItem.id]) {
        throw new Error("상품을 찾을 수 없습니다.");
    }
    mockMenuItems[updatedItem.id] = updatedItem; 
    
    return updatedItem;
};

/**
 * DELETE: 상품을 삭제합니다.
 */
export const deleteAdminMenuItem = async (itemId: string): Promise<void> => {
    await delay(BASE_DELAY);
    
    // Mock: 데이터에서 삭제
    if (!mockMenuItems[itemId]) {
        throw new Error("상품을 찾을 수 없습니다.");
    }
    delete mockMenuItems[itemId]; 
};

// --- 카테고리 (Category) API 함수 ---

/**
 * POST: 새 카테고리를 추가합니다.
 */
export const createAdminCategory = async (newCategoryName: Category): Promise<AdminCategoryItem> => {
    await delay(BASE_DELAY);
    
    // Mock: 새 ID와 순서 할당 후 반환
    const newId = `CAT_${Date.now()}`;
    
    // reduce에 초기값 0을 명시하고, 콜백 함수의 cat 매개변수에 타입을 명시하여 TypeScript 오류를 해결합니다.
    const maxOrder = mockCategories.reduce((max: number, cat: AdminCategoryItem) => Math.max(max, cat.kioskOrder), 0);
    
    const newCategory: AdminCategoryItem = {
        id: newId,
        name: newCategoryName,
        kioskOrder: maxOrder + 1,
        isVisible: true,
    };
    
    // 메모리 상의 Mock 데이터에 반영
    mockCategories.push(newCategory);

    return newCategory;
};

/**
 * PUT/PATCH: 카테고리 정보를 수정합니다.
 */
export const updateAdminCategory = async (updatedCategory: AdminCategoryItem): Promise<AdminCategoryItem> => {
    await delay(BASE_DELAY);
    
    // Mock: 기존 데이터를 업데이트
    const index = mockCategories.findIndex((cat: AdminCategoryItem) => cat.id === updatedCategory.id);
    if (index === -1) {
        throw new Error("카테고리를 찾을 수 없습니다.");
    }
    mockCategories[index] = updatedCategory;
    
    return updatedCategory;
};

/**
 * DELETE: 카테고리를 삭제합니다.
 */
export const deleteAdminCategory = async (categoryId: string): Promise<void> => {
    await delay(BASE_DELAY);
    
    // Mock: 데이터에서 삭제
    const index = mockCategories.findIndex((cat: AdminCategoryItem) => cat.id === categoryId);
    if (index === -1) {
        throw new Error("카테고리를 찾을 수 없습니다.");
    }
    mockCategories.splice(index, 1);
};