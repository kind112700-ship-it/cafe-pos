// src/hooks/useAdminData.ts

import { useState, useEffect, useCallback, useMemo } from 'react'; // useEffect, useCallback, useMemo 추가
import { Category } from '../types'; 
import { AdminMenuItem, AdminCategoryItem } from '../types/admin'; 
// ⭐️ data 파일에서 직접 가져오는 대신, api.ts를 통해 간접적으로 가져오도록 변경 ⭐️
import * as api from '../utils/api'; 


// 🚨 초기 데이터 Mock은 api.ts로 이동시키고, 여기서는 빈 배열/객체로 초기화합니다.
// 이 코드는 initializeAdminData 함수를 제거하고 외부에서 데이터를 불러오는 구조로 변경합니다.
// MENU_ITEMS_DATA, CATEGORIES 직접 임포트 제거.

// --- Custom Hook ---

export const useAdminData = () => {
    // ⭐️ 1. 로컬 상태를 제거하고 API 응답을 저장할 상태만 남깁니다. ⭐️
    const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
    const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ⭐️ 상품 목록 및 카테고리 목록을 API를 통해 가져오는 함수 ⭐️
    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // R: Read (API 호출)
            const { menuItems: fetchedItems, categories: fetchedCategories } = await api.fetchAdminMenuItems();
            
            // ⭐️ 객체 대신 배열로 바로 상태에 저장합니다. ⭐️
            setMenuItems(fetchedItems);
            setCategories(fetchedCategories);
        } catch (err) {
            console.error("데이터 로드 실패:", err);
            setError("관리자 데이터를 불러오는 데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);


    // 1. 관리자 액션: 실시간 품절 상태 토글 (비동기 처리)
    const toggleSoldOut = useCallback(async (itemId: string) => {
        const itemToUpdate = menuItems.find(item => item.id === itemId);
        if (!itemToUpdate) return;
        
        try {
            // U: Update (API 호출)
            const updatedItem: AdminMenuItem = { ...itemToUpdate, isSoldOut: !itemToUpdate.isSoldOut };
            await api.updateAdminMenuItem(updatedItem); 

            // 성공 시, 로컬 상태 업데이트 (React Query 사용 시는 invalidateQueries로 대체)
            setMenuItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
        } catch (err) {
            console.error("품절 토글 실패:", err);
            alert("품절 상태 변경에 실패했습니다.");
        }
    }, [menuItems]);
    
    // 2. 관리자 액션: 키오스크 노출 상태 토글 (비동기 처리)
    const toggleVisibility = useCallback(async (itemId: string) => {
        const itemToUpdate = menuItems.find(item => item.id === itemId);
        if (!itemToUpdate) return;

        try {
            // U: Update (API 호출)
            const updatedItem: AdminMenuItem = { ...itemToUpdate, isVisible: !itemToUpdate.isVisible };
            await api.updateAdminMenuItem(updatedItem);

            // 성공 시, 로컬 상태 업데이트
            setMenuItems(prev => prev.map(item => item.id === itemId ? updatedItem : item));
        } catch (err) {
            console.error("노출 토글 실패:", err);
            alert("노출 상태 변경에 실패했습니다.");
        }
    }, [menuItems]);

    // 3. 관리자 액션: 상품 정보 수정 (모달에서 사용) (비동기 처리)
    const updateItem = useCallback(async (updatedItem: AdminMenuItem) => {
        try {
            // U: Update (API 호출)
            await api.updateAdminMenuItem(updatedItem);

            // 성공 시, 로컬 상태 업데이트
            setMenuItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        } catch (err) {
            console.error("상품 수정 실패:", err);
            alert("상품 수정에 실패했습니다.");
        }
    }, []);
    
    // 4. 관리자 액션: 새 상품 추가 (비동기 처리)
    const addItem = useCallback(async (newItemData: Omit<AdminMenuItem, 'id' | 'kioskOrder'>) => {
        try {
            // C: Create (API 호출)
            const newItem = await api.createAdminMenuItem(newItemData);

            // 성공 시, 로컬 상태 업데이트 (가장 마지막 순서에 추가)
            setMenuItems(prev => [...prev, newItem].sort((a, b) => a.kioskOrder - b.kioskOrder)); 
        } catch (err) {
            console.error("상품 추가 실패:", err);
            alert("상품 추가에 실패했습니다.");
        }
    }, []);

    // 5. 관리자 액션: 상품 삭제 (비동기 처리)
    const deleteItem = useCallback(async (itemId: string) => {
        try {
            // D: Delete (API 호출)
            await api.deleteAdminMenuItem(itemId);

            // 성공 시, 로컬 상태 업데이트
            setMenuItems(prev => prev.filter(item => item.id !== itemId));
        } catch (err) {
            console.error("상품 삭제 실패:", err);
            alert("상품 삭제에 실패했습니다.");
        }
    }, []);

    // 6. 관리자 액션: 새 카테고리 추가 (비동기 처리)
const addCategory = useCallback(async (newCategoryName: Category) => {
    try {
        // Mock API를 호출하여 데이터베이스에 새 카테고리를 추가합니다.
        await api.createAdminCategory(newCategoryName);

        // ⭐️ [핵심 수정] 성공 시, 전체 데이터를 다시 불러와 상태를 갱신하여 중복을 막습니다. ⭐️
        await fetchAllData();
        
    } catch (err) {
        console.error("카테고리 추가 실패:", err);
        alert("카테고리 추가에 실패했습니다.");
    }
}, [fetchAllData]);


// 7. 관리자 액션: 카테고리 삭제 (비동기 처리)
const deleteCategory = useCallback(async (categoryId: string) => {
    try {
        await api.deleteAdminCategory(categoryId);

        // ⭐️ [핵심 수정] 성공 시, 전체 데이터를 다시 불러와 상태를 갱신합니다. ⭐️
        await fetchAllData();
        
        // 🚨 이전에 있던 수동 업데이트 로직 (setCategories(prev => prev.filter(...)))은 제거됩니다.
        
    } catch (err) {
        console.error("카테고리 삭제 실패:", err);
        alert("카테고리 삭제에 실패했습니다.");
    }
}, [fetchAllData]);


// 8. 관리자 액션: 카테고리 정보 수정 (비동기 처리)
const updateCategory = useCallback(async (updatedCategory: AdminCategoryItem) => {
    try {
        await api.updateAdminCategory(updatedCategory);

        // ⭐️ [핵심 수정] 성공 시, 전체 데이터를 다시 불러와 상태를 갱신합니다. ⭐️
        await fetchAllData();
        
        // 🚨 이전에 있던 수동 업데이트 로직 (setCategories(prev => prev.map(...)))은 제거됩니다.

    } catch (err) {
        console.error("카테고리 수정 실패:", err);
        alert("카테고리 수정에 실패했습니다.");
    }
}, [fetchAllData]);

    // 9. 관리자 액션: 카테고리 순서 변경 (비동기 처리)
    const updateCategoryOrder = useCallback(async (newCategories: AdminCategoryItem[]) => {
        // 순서가 변경된 배열을 받아와 kioskOrder 값을 재정렬합니다.
        const reorderedCategories = newCategories.map((cat, index) => ({
            ...cat,
            kioskOrder: index + 1, // 배열 순서(index + 1)를 새로운 kioskOrder로 설정
        }));

        try {
            // U: Update (API 호출) - 순서 배열을 통째로 보내서 업데이트하도록 가정
            // 🚨 실제 API: 이 로직은 백엔드에서 배열 순서를 받고 일괄 업데이트하는 엔드포인트가 필요합니다.
            // 여기서는 모든 카테고리를 개별적으로 업데이트하는 Mock 로직을 사용합니다.
            await Promise.all(reorderedCategories.map(cat => api.updateAdminCategory(cat)));

            // 성공 시, 로컬 상태 업데이트
            setCategories(reorderedCategories); 
        } catch (err) {
            console.error("카테고리 순서 변경 실패:", err);
            alert("카테고리 순서 변경에 실패했습니다.");
        }
    }, []);


    return {
        isLoading, // 로딩 상태 반환
        error, // 에러 상태 반환
        // 순서에 따라 정렬된 배열 반환 (이미 API에서 정렬된 데이터를 가져왔다고 가정)
        menuItems, 
        categories,
        
        // ⭐️ 모든 액션 함수가 비동기(async)로 변경됨 ⭐️
        toggleSoldOut,
        toggleVisibility,
        updateItem, 
        addItem,        
        deleteItem,     
        
        addCategory,
        deleteCategory,
        updateCategory,
        updateCategoryOrder,
    };
};