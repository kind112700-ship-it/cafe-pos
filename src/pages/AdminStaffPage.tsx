// src/pages/AdminStaffPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { COLORS } from '../theme/colorPalette';
import { StaffUser, PermissionRole, StaffForm } from '../types/admin'; // 👈 PermissionRole 및 StaffUser 임포트 확인
import { StaffList } from '../components/admin/staff/StaffList';
import { StaffAddModal } from '../components/admin/staff/StaffAddModal';
import { StaffEditModal } from '../components/admin/staff/StaffEditModal'; // 👈 누락된 StaffEditModal 임포트 추가

// ⭐️ API 임포트 ⭐️
import { fetchStaffList, addStaffUser, updateStaffInfo, toggleStaffActive } from '../api/admin/staffApi'; 
// 🚨 오류 해결: 이제 이 임포트와 충돌되는 로컬 더미 함수는 없습니다.


// --- 스타일 컴포넌트 ---
const PageContainer = styled.div`
    padding: 40px;
    background-color: ${COLORS.BACKGROUND_LIGHT};
    min-height: 100vh;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 2px solid ${COLORS.BACKGROUND_DARK};
    padding-bottom: 15px;
`;

const Title = styled.h1`
    color: ${COLORS.PRIMARY_DARK};
    font-size: 2rem;
`;

const AddButton = styled.button`
    padding: 10px 20px;
    background-color: ${COLORS.ACCENT};
    color: ${COLORS.TEXT_LIGHT};
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;    
    &:hover {
        background-color: ${COLORS.ACCENT_DARK};
    }
`;

const BackButton = styled.button`
    padding: 10px 20px;
    background-color: ${COLORS.DANGER};
    color: ${COLORS.TEXT_LIGHT};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    &:hover { background-color: ${COLORS.DANGER_DARK}; }
`;

const ActionButton = styled.button`
    padding: 5px 10px;
    margin-left: 5px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: ${COLORS.PRIMARY_DARK}; 
    color: ${COLORS.TEXT_LIGHT};
    font-size: 0.8rem;

    &:hover {
        opacity: 0.8;
    }
`;
interface AdminStaffPageProps {
    navigateTo: () => void; // AdminScreen으로 돌아가는 함수를 받습니다.
}

// --- 컴포넌트 로직 ---
const AdminStaffPage: React.FC<AdminStaffPageProps> = ({ navigateTo }) => {
    const [staffList, setStaffList] = useState<StaffUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

    // ⭐️ 데이터 로딩 함수 (API 사용) ⭐️
    const loadStaffs = useCallback(async () => {
        setIsLoading(true);
        try {
            // 외부 API 파일의 fetchStaffList 함수 사용
            const data = await fetchStaffList(); 
            setStaffList(data);
        } catch (error) {
            console.error("직원 목록 로딩 실패:", error);
            alert("직원 목록을 불러오는 데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStaffs();
    }, [loadStaffs]);

    // 직원 권한 수정 핸들러 (StaffList에서 바로 권한 드롭다운 변경 시 호출)
    const handleUpdateRole = useCallback(async (userId: string, newRole: PermissionRole) => {
        const userToUpdate = staffList.find(u => u.id === userId);
        if (!userToUpdate) return;
        
        try {
            // 이름과 Role을 포함하여 업데이트 (API updateStaffInfo 재사용)
            const updatedUser = { ...userToUpdate, role: newRole };
            await updateStaffInfo(updatedUser); 
            
            setStaffList(prevList => prevList.map(user => 
                user.id === userId ? updatedUser : user
            ));
            
        } catch (error) {
            console.error("권한 수정 실패:", error);
            alert("권한 수정에 실패했습니다.");
        }
    }, [staffList]);


    // ⭐️ 신규 직원 추가 핸들러 (API 사용) ⭐️
    const handleSaveNewStaff = useCallback(async (formData: StaffForm) => {
        try {
            const newUser = await addStaffUser(formData);
            setStaffList(prevList => [...prevList, newUser]);
            setIsAddModalOpen(false);
            alert(`${newUser.name} 직원이 성공적으로 등록되었습니다.`);
        } catch (error) {
            console.error("직원 등록 실패:", error);
            alert("신규 직원 등록에 실패했습니다.");
        }
    }, []);


    // 직원 정보 수정 모달 열기
    const handleOpenEditModal = useCallback((staff: StaffUser) => {
        setSelectedStaff(staff);
        setIsEditModalOpen(true);
    }, []);

    // 직원 정보 수정 저장 핸들러
    const handleSaveEditedStaff = useCallback(async (updatedUser: StaffUser) => {
        try {
            await updateStaffInfo(updatedUser);
            
            setStaffList(prevList => prevList.map(user => 
                user.id === updatedUser.id ? updatedUser : user
            ));
            setIsEditModalOpen(false);
            alert(`${updatedUser.name} 직원의 정보가 수정되었습니다.`);
            
        } catch (error) {
            console.error("정보 수정 실패:", error);
            alert("정보 수정에 실패했습니다.");
        }
    }, []);
    
    // ⭐️ 직원 활성/비활성화 핸들러 (API 사용) ⭐️
    const handleToggleActive = useCallback(async (userId: string, isActive: boolean) => {
        try {
            await toggleStaffActive(userId, isActive);
            
            setStaffList(prevList => prevList.map(user => 
                user.id === userId ? { ...user, isActive: isActive } : user
            ));
            
        } catch (error) {
            console.error("상태 토글 실패:", error);
            alert("계정 상태 변경에 실패했습니다.");
        }
    }, []);


    if (isLoading) {
        return <PageContainer><p>직원 목록을 불러오는 중입니다...</p></PageContainer>;
    }

    return (
        <PageContainer>
            <Header>
                <Title>🧑‍💼 직원 및 권한 관리</Title>
                {/* 2. ⭐️ 두 버튼을 묶어 오른쪽 끝에 배치할 그룹 생성 ⭐️ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    
                    {/* AddButton */}
                    <AddButton onClick={() => setIsAddModalOpen(true)}>
                        + 신규 직원 등록
                    </AddButton>

                    {/* BackButton */}
                    <BackButton onClick={navigateTo}>
                        관리자 메뉴로 돌아가기
                    </BackButton>
                </div>

            </Header>

            <StaffList 
                staffs={staffList} 
                onUpdateRole={handleUpdateRole}
                onEditStaff={handleOpenEditModal}
                // ⭐️⭐️ onToggleActive prop 전달 추가 ⭐️⭐️
                onToggleActive={handleToggleActive} 
            />
            <StaffAddModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSave={handleSaveNewStaff} 
            />
            
            <StaffEditModal // 👈 StaffEditModal 임포트 문제 해결
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                staff={selectedStaff} 
                onSave={handleSaveEditedStaff}
                onToggleActive={handleToggleActive}
            />
        </PageContainer>
    );
};

export default AdminStaffPage;