//src/components/admin/staff/StaffList.tsx

import React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../theme/colorPalette';
import { StaffUser, PermissionRole } from '../../../types/admin';

// --- 스타일 컴포넌트 ---
const MEDIA_MOBILE = '@media (max-width: 768px)';
const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    background-color: ${COLORS.BACKGROUND_DARK};
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
    background-color: ${COLORS.PRIMARY};
    color: ${COLORS.TEXT_LIGHT};
    padding: 12px 15px;
    text-align: center;
    font-size: 0.95rem;
`;

const Td = styled.td`
    padding: 12px 15px;
    border-bottom: 1px solid ${COLORS.BACKGROUND_MEDIUM};
    color: ${COLORS.TEXT_DARK};
    font-size: 0.9rem;
    text-align: center;
    
`;

const Tr = styled.tr`
    &:nth-child(even) {
        background-color: ${COLORS.BACKGROUND_MEDIUM};
    }
    &:hover {
        background-color: #e0f7fa; /* PRIMARY_LIGHT 색상 대신 임시 사용 */
    }
`;

const RoleSelect = styled.select`
    padding: 6px;
    border-radius: 4px;
    border: 1px solid ${COLORS.TEXT_MUTED};
    background-color: ${COLORS.TEXT_LIGHT};
    cursor: pointer;
`;

const StatusChip = styled.span<{ $isActive: boolean }>`
    padding: 5px 10px;
    display:block;
    min-width: 20px; 
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: bold;
    color: ${COLORS.TEXT_LIGHT};
    background-color: ${props => props.$isActive ? COLORS.ACCENT : COLORS.TEXT_MUTED};
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
     min-width: 70px;
    &:hover {
        opacity: 0.8;
    }
`;

const ToggleActionButton = styled.button`
    padding: 5px 10px;
    margin-left: 5px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: ${COLORS.TEXT_LIGHT};
    font-size: 0.8rem;
    font-weight: bold; /* 텍스트 강조 */
    min-width: 70px; /* 버튼 크기 일정하게 유지 */
    transition: background-color 0.2s; 

    &:hover {
        opacity: 0.9;
    }
        ${MEDIA_MOBILE} {
        margin-top:5px;
`;


// --- 컴포넌트 로직 ---

interface StaffListProps {
    staffs: StaffUser[];
    onUpdateRole: (userId: string, newRole: PermissionRole) => void;
    onEditStaff: (staff: StaffUser) => void;
    // ⭐️⭐️ 활성/비활성 토글 핸들러 추가 ⭐️⭐️
    onToggleActive: (userId: string, isActive: boolean) => void; 
}

export const StaffList: React.FC<StaffListProps> = ({ 
    staffs, 
    onUpdateRole, 
    onEditStaff, 
    onToggleActive // ⭐️ 컴포넌트 Props에 추가
}) => {
    
    const permissionRoles: PermissionRole[] = ['Admin', 'Manager', 'Staff'];

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>, userId: string) => {
        // e.target.value는 string이지만, PermissionRole 타입으로 단언
        const newRole = e.target.value as PermissionRole; 
        onUpdateRole(userId, newRole);
    };
    
    return (
        <Table>
            <thead>
                <Tr>
                    <Th style={{ width: '5%' }}>No.</Th>
                    <Th style={{ width: '20%'}}>이름</Th>
                    <Th style={{ width: '10%' }}>사번</Th>
                    <Th style={{ width: '10%' }}>권한</Th>
                    <Th style={{ width: '10%' }}>최종 로그인</Th>
                    <Th style={{ width: '10%' }}>상태</Th>
                    <Th style={{ width: '20%' }}>관리</Th>
                </Tr>
            </thead>
            <tbody>
                {staffs.map((user, index) => (
                    <Tr key={user.id}>
                        <Td>{index + 1}</Td>
                        <Td>{user.name}</Td>
                        <Td>{user.employeeId}</Td>
                        <Td>
                            {/* ⭐️ 권한 수정 드롭다운 ⭐️ */}
                            <RoleSelect 
                                value={user.role} 
                                onChange={(e) => handleRoleChange(e, user.id)}
                            >
                                {permissionRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </RoleSelect>
                        </Td>
                        <Td>{user.lastLogin}</Td>
                        <Td>
                            <StatusChip $isActive={user.isActive}>
                                {user.isActive ? '활성' : '비활성'}
                            </StatusChip>
                        </Td>
                        <Td>
                           <ActionButton onClick={() => onEditStaff(user)}>수정</ActionButton>
                            
                            <ToggleActionButton 
                                
                                style={{ 
                                    backgroundColor: user.isActive ? COLORS.DANGER : COLORS.ACCENT 
                                }}
                                onClick={() => onToggleActive(user.id, !user.isActive)} 
                            >
                                {user.isActive ? '비활성화' : '활성화'}
                            </ToggleActionButton>
                        </Td>
                    </Tr>
                ))}
            </tbody>
        </Table>
    );
};