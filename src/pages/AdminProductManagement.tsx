// src/pages/AdminProductManagement.tsx

import React, { useState } from 'react';
import '../styles/adminproduct.css'; 
import { useAdminData } from '../hooks/useAdminData'; 
import { COLORS } from '../theme/colorPalette';
import { Category } from '../types'; 
// ⭐️ AdminCategoryItem 타입 임포트 추가 ⭐️
import { AdminMenuItem, AdminCategoryItem } from '../types/admin'; 
import { AdminItemEditModal } from '../components/AdminItemEditModal';
import { AdminItemAddModal } from '../components/AdminItemAddModal'; 
import { AdminCategoryModal } from '../components/AdminCategoryModal'; 
import { AdminCategoryReorderModal } from '../components/AdminCategoryReorderModal';
import styled, { css } from 'styled-components';


// --- 반응형 디자인을 위한 미디어 쿼리 정의 ---
const MEDIA_MOBILE = '@media (max-width: 768px)';
// MEDIA_TABLET은 768px 이상, 데스크톱 포함
const MEDIA_TABLET = '@media (min-width: 768px)';

// --- 스타일 컴포넌트 (반응형 적용) ---

const Container = styled.div`
    padding: 30px;
    background: ${COLORS.BACKGROUND};
    min-height: 100vh;
    width:100%;

    ${MEDIA_MOBILE} {
        padding:15px;
        max-width: 100%;        
    }
`;

const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    ${MEDIA_MOBILE} {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 15px;        
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;

    ${MEDIA_MOBILE} {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }
`;

const Title = styled.h2`
    color: ${COLORS.TEXT_DARK};
    font-size: 1.8rem;
    
    ${MEDIA_MOBILE} {
        text-alin
        font-size: 1.5rem;
    }
`;

const BaseButton = styled.button`
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-weight: bold;
    white-space: nowrap;

    ${MEDIA_MOBILE} {
        padding: 12px 10px;
        font-size: 0.9rem;
        width: 100%; /* 모바일에서 전체 폭 사용 */
    }
`;

const BackButton = styled(BaseButton)`
    padding: 10px 20px;
    background-color: ${COLORS.DANGER};
    color: ${COLORS.TEXT_LIGHT};
    font-size: 1rem;
    &:hover { background-color: ${COLORS.DANGER_DARK}; }
`;

const AddButton = styled(BaseButton)`
    padding: 10px 15px;
    background-color: ${COLORS.ACCENT};
    color: ${COLORS.TEXT_LIGHT};
    font-size: 1rem;
    &:hover { background-color: ${COLORS.ACCENT_DARK}; }
`;

const CategoryManageButton = styled(BaseButton)`
    background-color: ${COLORS.PRIMARY};
    font-size: 0.95rem;
    padding: 8px 15px;
    margin-bottom: 5px; 
    color: ${COLORS.TEXT_LIGHT};
    &:hover { background-color: ${COLORS.PRIMARY_DARK}; }

    ${MEDIA_MOBILE} {
        padding: 10px 10px;
        font-size: 0.8rem;
        flex-grow: 1;
        width: auto; /* ButtonContainer 내부에서 유연하게 조정 */
    }
`;

// 탭 Wrapper (Tabs와 관리 버튼을 포함)
const TabWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end; 
    margin-bottom: 20px;
    border-bottom: 3px solid ${COLORS.TEXT_MUTED};

    ${MEDIA_MOBILE} {
        flex-direction: column;
        align-items: stretch;
    }
`;

const TabContainer = styled.div`
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
    margin-bottom: -3px; 
    /* 스크롤바 숨기기 (선택적) */
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
    }
`;

const Tab = styled.button<{ $isActive: boolean }>`
    padding: 10px 20px;
    font-size: 1.1rem;
    border: none;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    border-right: 1px solid ${COLORS.BACKGROUND};
    transition: background-color 0.2s;
    flex-shrink: 0;

    background-color: ${props => props.$isActive ? COLORS.PRIMARY : COLORS.BACKGROUND_DARK};
    color: ${props => props.$isActive ? COLORS.TEXT_LIGHT : COLORS.TEXT_DARK};

    ${MEDIA_MOBILE} {
        padding: 8px 12px;
        font-size: 0.9rem;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 5px; 

    ${MEDIA_MOBILE} {
        width: 100%;
        margin-top: 10px;
        gap: 5px;
        justify-content: stretch;
    }
`;


// --- 테이블/카드 스타일 (반응형 처리) ---

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    background: ${COLORS.BACKGROUND_LIGHT};
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);

    ${MEDIA_MOBILE} {
        display: block; 
        background: none;         
        box-shadow: none;
        width: 100%;        
    }
`;

const Th = styled.th`
    background-color: ${COLORS.PRIMARY_DARK};
    color: ${COLORS.TEXT_LIGHT};
    padding: 12px 15px;
    text-align: center;

    ${MEDIA_MOBILE} {
        display: none;         
    }
`;

const Tr = styled.tr`
    /* 데스크톱/태블릿 스타일 */
    display: table-row; 
    border-bottom: 1px solid ${COLORS.BACKGROUND_MEDIUM};
    &:nth-child(even) {
        background-color: ${COLORS.BACKGROUND_MEDIUM};
    }
    &:hover {
        background-color: ${COLORS.PRIMARY_LIGHT};
    }

    ${MEDIA_MOBILE} {
        /* 모바일 카드 뷰 적용 */
        display: block; 
        margin-bottom: 15px;
        border: 1px solid ${COLORS.TEXT_MUTED};
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        background-color: ${COLORS.BACKGROUND_LIGHT};
        width: 90vw; 
        box-sizing: border-box;     
        margin: 10px auto;

       
        
        
        /* 모바일에서 짝수 행 배경색 제거 */
        &:nth-child(even) {
            background-color: ${COLORS.BACKGROUND_LIGHT}; 
        }
        &:hover {
            background-color: ${COLORS.PRIMARY_LIGHT};
        }
    }
`;

const Td = styled.td`
    padding: 10px 15px;
    border-bottom: 1px solid ${COLORS.BACKGROUND};
    color: ${COLORS.TEXT_DARK};
    text-align: center;

    ${MEDIA_MOBILE} {
        /* 모바일 카드 뷰 적용 */
        display: block;
        width: 100%;
        padding: 8px 15px;
        border-bottom: none;
        text-align: right;
        display: flex;
        justify-content: space-between;        

        /* 모바일 카드 뷰에서 데이터 레이블 표시 */
        &:before {
            content: attr(data-label);
            font-weight: bold;
            display: inline-block;
            width: 120px; /* 레이블 너비 고정 */
            text-align: left;
            color: ${COLORS.PRIMARY_DARK};
            margin-right: 10px;
        }
        
        /* 액션 버튼 셀 레이아웃 조정 */
        &.actions-cell {
            padding-top: 15px;
            padding-bottom: 15px;
            text-align: right;
            border-top: 1px solid ${COLORS.BACKGROUND_MEDIUM};
            justify-content: flex-end; /* 버튼들을 오른쪽으로 정렬 */
            

            &:before {
                display: none;
            }

            & > div {
                display: flex;
                flex-wrap: wrap; /* 버튼이 넘칠 경우 다음 줄로 */
                gap: 5px; /* 버튼 간격 조정 */
                justify-content: flex-end;
            }
        }
        /* 품절 관리 셀 레이아웃 조정 */
        &.soldout-cell {
            /* 품절 토글 버튼을 오른쪽으로 */
            justify-content: space-between;
        }
    }
`;

// 품절 토글 버튼 스타일
const SoldOutToggle = styled.button<{ $isSoldOut: boolean }>`
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;

    background-color: ${props => props.$isSoldOut ? COLORS.DANGER : COLORS.ACCENT};
    color: ${COLORS.TEXT_LIGHT};
    flex-shrink: 0;

    ${MEDIA_MOBILE} {
        padding: 8px 12px;
        font-size: 0.85rem;        
    }
`;

const ActionButtonStyles = css`
    padding: 6px 10px;
    border: 1px solid ${COLORS.PRIMARY};
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { opacity: 0.8; }
    margin-left: 8px;
    flex-shrink: 0;
    white-space: nowrap;

    ${MEDIA_MOBILE} {
        padding: 8px 10px;
        font-size: 0.8rem;
        margin-left: 0; /* 모바일에서 버튼 컨테이너가 간격을 관리하도록 함 */
    }
`;

const ActionButton = styled.button<{ $isPrimary?: boolean; $isVisible?: boolean }>`
    ${ActionButtonStyles}
    
    /* 기본 색상 */
    background-color: ${props => props.$isPrimary ? COLORS.PRIMARY : COLORS.BACKGROUND_LIGHT};
    color: ${props => props.$isPrimary ? COLORS.TEXT_LIGHT : COLORS.PRIMARY};
    border-color: ${props => props.$isPrimary ? COLORS.PRIMARY : COLORS.PRIMARY};

    /* 노출 상태에 따른 오버라이드 (노출 중일 때 ACCENT 사용) */
    ${props => props.$isVisible !== undefined && css`
        background-color: ${props.$isVisible ? COLORS.ACCENT : COLORS.BACKGROUND_DARK};
        color: ${props.$isVisible ? COLORS.TEXT_LIGHT : COLORS.TEXT_DARK};
        border-color: ${props.$isVisible ? COLORS.ACCENT : COLORS.BACKGROUND_DARK};
        border: none;
    `}
`;

const DeleteButton = styled(ActionButton)`
    background-color: ${COLORS.DANGER};
    color: ${COLORS.TEXT_LIGHT};
    border: none;
    margin-left: 8px;
    ${MEDIA_MOBILE}{
        margin-left: 0; 
    }
`;

// --- 컴포넌트 로직 ---

interface AdminProductManagementProps {
    navigateTo: () => void; 
}

type NewItemData = Omit<AdminMenuItem, 'id' | 'kioskOrder'>; 

export const AdminProductManagement: React.FC<AdminProductManagementProps> = ({ navigateTo }) => {
    
    // 카테고리 관리 함수 임포트
    const { menuItems, categories, toggleSoldOut, toggleVisibility, updateItem, addItem, deleteItem, 
            addCategory, deleteCategory, updateCategory, updateCategoryOrder } = useAdminData();
    
    // 모달 상태 관리
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // 카테고리 관리 모달 상태
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<AdminCategoryItem | null>(null);

    const [itemToEdit, setItemToEdit] = useState<AdminMenuItem | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>(categories[0]?.name || 'ALL');
    
    const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
    
    const filteredItems = menuItems.filter(item => 
        selectedCategory === 'ALL' || item.category === selectedCategory
    );

    // 상품 수정 클릭
    const handleEditClick = (item: AdminMenuItem) => { 
        setItemToEdit(item);
        setIsEditModalOpen(true);
    };

    // 모달 닫기 핸들러 (수정/추가/카테고리 공용)
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setIsAddModalOpen(false);
        setIsCategoryModalOpen(false);
        setCategoryToEdit(null);
        setItemToEdit(null);
        setIsReorderModalOpen(false);
    };
    
    // 상품 수정 저장 핸들러
    const handleSaveItem = (updatedItem: AdminMenuItem) => {
        updateItem(updatedItem);
        handleCloseModal();
    };

    // 상품 추가 저장 핸들러
    const handleAddItem = (newItemData: NewItemData) => {
        addItem(newItemData);
        handleCloseModal();
    };

    // 상품 삭제 핸들러
    const handleDeleteItem = (itemId: string, itemName: string) => {
        if (window.confirm(`정말로 상품 "${itemName}"을(를) 삭제하시겠습니까?`)) {
            deleteItem(itemId);
        }
    };
    
    // --- 카테고리 관리 핸들러 ---
    
    // 카테고리 수정 버튼 클릭 (탭 목록에서 클릭)
    const handleEditCategoryClick = (category: AdminCategoryItem) => {
        setCategoryToEdit(category);
        setIsCategoryModalOpen(true);
    };
    
    // 새 카테고리 추가 (모달 내부에서 호출)
    const handleAddCategory = (newCategoryName: Category) => {
        addCategory(newCategoryName);
        handleCloseModal();
    };
    
    // 카테고리 수정 저장 (모달 내부에서 호출)
    const handleUpdateCategory = (updatedCategory: AdminCategoryItem) => {
        updateCategory(updatedCategory);
        handleCloseModal();
    };

    // 카테고리 삭제 (모달 내부에서 호출)
    const handleDeleteCategory = (categoryId: string) => {
        deleteCategory(categoryId);
        // 삭제 후 현재 선택된 카테고리가 삭제된 경우 'ALL'로 재설정
        if (selectedCategory === categories.find(c => c.id === categoryId)?.name) {
            setSelectedCategory('ALL' as Category);
        }
        handleCloseModal();
    };
    
    // 새 카테고리 추가/관리 모달 열기
    const handleOpenCategoryAddModal = () => {
        setCategoryToEdit(null); // 추가 모드임을 명시
        setIsCategoryModalOpen(true);
    };

    // 카테고리 순서 저장 핸들러
    const handleSaveCategoryOrder = (newOrder: AdminCategoryItem[]) => {
        updateCategoryOrder(newOrder);
        handleCloseModal();
    };
    
    // 카테고리 순서 변경 모달 열기
    const handleOpenCategoryReorderModal = () => {
        setIsReorderModalOpen(true);
    };


    return (
        <Container>
            <HeaderContainer>
                <Title>🍔 메뉴/상품 관리</Title>
                <HeaderActions>
                    <AddButton onClick={() => setIsAddModalOpen(true)}>+ 새 상품 추가</AddButton>
                    <BackButton onClick={navigateTo}>관리자 메뉴로 돌아가기</BackButton>
                </HeaderActions>
            </HeaderContainer>

            <TabWrapper>
                <TabContainer>
                    {/* 전체 탭 */}
                    <Tab 
                        $isActive={selectedCategory === 'ALL'}
                        onClick={() => setSelectedCategory('ALL' as Category)}
                    >
                        전체
                    </Tab>
                    {/* 카테고리 탭 */}
                    {categories.map(cat => (
                        <Tab 
                            key={cat.id} 
                            $isActive={selectedCategory === cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            // 탭 우클릭 시 수정 모달 열기 (편의상)
                            onContextMenu={(e) => { 
                                e.preventDefault();
                                handleEditCategoryClick(cat);
                            }}
                            title="우클릭하여 카테고리 수정"
                        >
                            {cat.name}
                        </Tab>
                    ))}
                </TabContainer>

                <ButtonContainer>
                    <CategoryManageButton onClick={handleOpenCategoryAddModal}>
                        ✨ 카테고리 추가/수정
                    </CategoryManageButton>

                    <CategoryManageButton onClick={handleOpenCategoryReorderModal}>
                        ✨ 카테고리 순서 변경
                    </CategoryManageButton>
                </ButtonContainer>

            </TabWrapper>

            <Table>
                <thead>
                    <tr>
                        <Th style={{ width: '5%' }}>순서</Th>
                        <Th style={{ width: '5%' }}>상품 ID</Th>
                        <Th style={{ width: '20%' }}>상품명</Th>
                        <Th style={{ width: '10%' }}>가격</Th>
                        <Th style={{ width: '10%' }}>준비 시간</Th>
                        <Th style={{ width: '15%' }}>품절 관리</Th>
                        <Th style={{ width: '30%' }}>액션</Th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map((item) => (
                        <Tr key={item.id}>
                            {/* 데스크톱/태블릿: 일반 테이블 셀 / 모바일: 레이블 있는 카드 셀 */}
                            <Td data-label="순서">{item.kioskOrder}</Td>
                            <Td data-label="상품 ID">{item.id}</Td>
                            <Td data-label="상품명">{item.name}</Td>
                            <Td data-label="가격">{item.price.toLocaleString()}원</Td>
                            <Td data-label="준비 시간">{item.prepTimeMinutes}분</Td>
                            
                            <Td data-label="품절 관리" className="soldout-cell">
                                <SoldOutToggle 
                                    $isSoldOut={item.isSoldOut}
                                    onClick={() => toggleSoldOut(item.id)}
                                >
                                    {item.isSoldOut ? '🔴 품절' : '🟢 판매 중'}
                                </SoldOutToggle>
                            </Td>
                            
                            <Td data-label="액션" className="actions-cell"> 
                                <div> 
                                    {/* 노출/숨김 토글 버튼 */}
                                    <ActionButton 
                                        onClick={() => toggleVisibility(item.id)} 
                                        $isVisible={item.isVisible} 
                                    >
                                        {item.isVisible ? '👁️ 노출 중' : '🙈 숨김'}
                                    </ActionButton>
                                    
                                    <ActionButton onClick={() => handleEditClick(item)} $isPrimary>수정</ActionButton>
                                    <DeleteButton onClick={() => handleDeleteItem(item.id, item.name)}>삭제</DeleteButton>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </tbody>
            </Table>

            {/* 상품 수정 모달 */}
            {isEditModalOpen && itemToEdit && (
                <AdminItemEditModal
                    item={itemToEdit}
                    categories={categories}
                    onClose={handleCloseModal}
                    onSave={handleSaveItem}
                />
            )}
            
            {/* 상품 추가 모달 */}
            {isAddModalOpen && (
                <AdminItemAddModal
                    onClose={handleCloseModal}
                    onSave={handleAddItem}
                    categories={categories}
                />
            )} 
            
            {/* 카테고리 순서 변경 모달 */}
            {isReorderModalOpen && (
                <AdminCategoryReorderModal
                    categories={categories}
                    onClose={handleCloseModal}
                    onSaveOrder={handleSaveCategoryOrder}
                />
            )}
            
            {/* 카테고리 추가/수정/삭제 모달 (탭 우클릭 또는 '추가/수정' 버튼 클릭 시) */}
            {isCategoryModalOpen && (
                <AdminCategoryModal
                    categoryToEdit={categoryToEdit} 
                    onClose={handleCloseModal}
                    onSave={handleUpdateCategory} 
                    onAdd={handleAddCategory} 
                    onDelete={handleDeleteCategory}
                />
            )}
        </Container>
    );
};