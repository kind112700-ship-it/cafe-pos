// src/components/admin/staff/StaffEditModal.tsx - 수정 모달 컴포넌트 파일 생성

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../theme/colorPalette';
import { StaffUser, PermissionRole } from '../../../types/admin';

// --- 스타일 컴포넌트 (StaffAddModal.tsx에서 복사하여 재정의) ---
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
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: ${COLORS.BACKGROUND_LIGHT};
    padding: 30px;
    border-radius: 12px;
    width: 450px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h2`
    color: ${COLORS.PRIMARY_DARK};
    margin-bottom: 25px;
    border-bottom: 2px solid ${COLORS.BACKGROUND_MEDIUM};
    padding-bottom: 10px;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    display: block;
    color: ${COLORS.TEXT_DARK};
    font-weight: bold;
    margin-bottom: 8px;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid ${COLORS.BACKGROUND_DARK};
    border-radius: 6px;
    font-size: 1rem;
    color: ${COLORS.TEXT_DARK};
    background-color: ${COLORS.BACKGROUND};
    &:focus {
        border-color: ${COLORS.ACCENT};
        outline: none;
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 10px;
    border: 1px solid ${COLORS.BACKGROUND_DARK};
    border-radius: 6px;
    font-size: 1rem;
    color: ${COLORS.TEXT_DARK};
    background-color: ${COLORS.BACKGROUND_LIGHT};
    cursor: pointer;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 30px;
`;

const CancelButton = styled.button`
    padding: 10px 20px;
    background-color: ${COLORS.TEXT_MUTED};
    color: ${COLORS.TEXT_LIGHT};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    &:hover {
        background-color: ${COLORS.TEXT_DARK};
    }
`;

const SaveButton = styled.button`
    padding: 10px 20px;
    background-color: ${COLORS.ACCENT};
    color: ${COLORS.TEXT_LIGHT};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    &:disabled {
        background-color: ${COLORS.BACKGROUND_DARK};
        cursor: not-allowed;
    }
    &:hover:not(:disabled) {
        background-color: ${COLORS.ACCENT_DARK};
    }
`;

// --- 컴포넌트 로직 ---

const permissionRoles: PermissionRole[] = ['Admin', 'Manager', 'Staff'];

interface StaffEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: StaffUser | null; // 수정할 StaffUser 객체
    onSave: (updatedUser: StaffUser) => void;
    onToggleActive: (userId: string, isActive: boolean) => void; // 활성/비활성화 전용 핸들러
}

export const StaffEditModal: React.FC<StaffEditModalProps> = ({ isOpen, onClose, staff, onSave, onToggleActive }) => {
    
    const [formData, setFormData] = useState<StaffUser | null>(staff);

    useEffect(() => {
        setFormData(staff);
    }, [staff]);

    // 이벤트 객체에 명시적 타입 지정 (TS7006 해결)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        setFormData(prev => prev ? {
            ...prev,
            [name]: value,
        } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
            // 모달을 닫는 것은 onSave 핸들러 내부에서 처리하는 것이 일반적입니다.
            // onClose(); // AdminStaffPage에서 onSave 성공 후 닫도록 유도
        }
    };

    const handleToggle = () => {
        if (!formData) return;
        const newActiveState = !formData.isActive;
        
        if (window.confirm(`${formData.name} 직원을 ${newActiveState ? '활성화' : '비활성화'} 하시겠습니까?`)) {
            onToggleActive(formData.id, newActiveState);
            // 모달 상태만 임시 업데이트 (API 성공은 상위에서 처리)
            setFormData(prev => prev ? { ...prev, isActive: newActiveState } : null); 
        }
    };

    if (!isOpen || !formData) {
        return null;
    }

    return (
        <ModalOverlay onClick={onClose}>
            {/* 이벤트 객체에 명시적 타입 지정 (TS7006 해결) */}
            <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}> 
                <ModalTitle>직원 정보 수정 및 권한 관리 ({formData.name})</ModalTitle>
                <form onSubmit={handleSubmit}>
                    
                    {/* 1. 이름 수정 */}
                    <FormGroup>
                        <Label htmlFor="name">직원 이름</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </FormGroup>
                    
                    {/* 2. 사번 (읽기 전용) */}
                    <FormGroup>
                        <Label htmlFor="employeeId">사번 (로그인 ID) [읽기 전용]</Label>
                        <Input
                            id="employeeId"
                            name="employeeId"
                            type="text"
                            value={formData.employeeId}
                            readOnly
                            style={{ backgroundColor: COLORS.BACKGROUND_MEDIUM }}
                        />
                    </FormGroup>

                    {/* 3. 권한 역할 수정 */}
                    <FormGroup>
                        <Label htmlFor="role">권한 역할</Label>
                        <Select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            {permissionRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </Select>
                    </FormGroup>
                    
                    {/* 4. 계정 활성/비활성 토글 버튼 */}
                    <FormGroup style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${COLORS.BACKGROUND_MEDIUM}`, paddingTop: '15px' }}>
                        <Label style={{ margin: 0, fontWeight: 'normal' }}>
                            현재 상태: <span style={{ color: formData.isActive ? COLORS.ACCENT_DARK : COLORS.TEXT_MUTED }}>{formData.isActive ? '활성' : '비활성'}</span>
                        </Label>
                        <SaveButton 
                            type="button" 
                            onClick={handleToggle}
                            style={{ backgroundColor: formData.isActive ? COLORS.DANGER : COLORS.ACCENT }}
                        >
                            {formData.isActive ? '계정 비활성화' : '계정 활성화'}
                        </SaveButton>
                    </FormGroup>

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onClose}>닫기</CancelButton>
                        <SaveButton type="submit">정보 저장</SaveButton>
                    </ButtonGroup>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
};