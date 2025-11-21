import React, { useState } from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../theme/colorPalette'; // 👈 경로 수정: 한 단계 위로 올라가야 함 (../theme -> ../../theme)
import { StaffForm, PermissionRole } from '../../../types/admin'; // 👈 경로 수정: 한 단계 위로 올라가야 함 (../types -> ../../types)

// --- 스타일 컴포넌트 (모달 및 폼 스타일) ---
// *Note: 이 스타일들은 StaffEditModal에서도 재사용하기 위해 별도의 파일로 분리하는 것이 가장 좋지만, 
// 현재는 임시로 여기에 정의합니다.*

// 모달 외부 영역
export const ModalOverlay = styled.div`
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

// 모달 본체
export const ModalContent = styled.div`
    background-color: ${COLORS.BACKGROUND_LIGHT};
    padding: 30px;
    border-radius: 12px;
    width: 450px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

export const ModalTitle = styled.h2`
    color: ${COLORS.PRIMARY_DARK};
    margin-bottom: 25px;
    border-bottom: 2px solid ${COLORS.BACKGROUND_MEDIUM};
    padding-bottom: 10px;
`;

// 폼 그룹
export const FormGroup = styled.div`
    margin-bottom: 20px;
`;

export const Label = styled.label`
    display: block;
    color: ${COLORS.TEXT_DARK};
    font-weight: bold;
    margin-bottom: 8px;
`;

export const Input = styled.input`
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

export const Select = styled.select`
    width: 100%;
    padding: 10px;
    border: 1px solid ${COLORS.BACKGROUND_DARK};
    border-radius: 6px;
    font-size: 1rem;
    color: ${COLORS.TEXT_DARK};
    background-color: ${COLORS.BACKGROUND_LIGHT};
    cursor: pointer;
`;

// 버튼 그룹
export const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 30px;
`;

export const CancelButton = styled.button`
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

export const SaveButton = styled.button`
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

interface StaffAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: StaffForm) => void;
}

export const StaffAddModal: React.FC<StaffAddModalProps> = ({ isOpen, onClose, onSave }) => {
    
    // StaffForm의 초기 상태를 정의합니다.
    const [formData, setFormData] = useState<StaffForm>({
        name: '',
        employeeId: '',
        password: '',
        role: 'Staff', // 기본 권한은 'Staff'로 설정
    });

    const permissionRoles: PermissionRole[] = ['Admin', 'Manager', 'Staff'];

    // 입력 필드 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ // 👈 TS7006 오류 해결
            ...prev,
            [name]: value,
        }));
    };

    // 저장 버튼 클릭 핸들러
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // 필수 필드 유효성 검사
        if (!formData.name || !formData.employeeId || !formData.password) {
            alert('모든 필수 정보를 입력해 주세요.');
            return;
        }
        
        onSave(formData);
        setFormData({ name: '', employeeId: '', password: '', role: 'Staff' }); // 폼 초기화
    };

    if (!isOpen) {
        return null;
    }

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalTitle>새 직원 등록</ModalTitle>
                <form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label htmlFor="name">직원 이름</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="예: 홍길동"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="employeeId">사번 (로그인 ID)</Label>
                        <Input
                            id="employeeId"
                            name="employeeId"
                            type="text"
                            value={formData.employeeId}
                            onChange={handleChange}
                            placeholder="고유한 사번을 입력하세요"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="password">초기 비밀번호</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="초기 비밀번호 설정"
                        />
                    </FormGroup>

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

                    <ButtonGroup>
                        <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                        <SaveButton type="submit">등록</SaveButton>
                    </ButtonGroup>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
};