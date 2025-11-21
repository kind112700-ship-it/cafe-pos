//src/theme/colorPalette.ts

export const COLORS = {
// --- 기본 색상 ---
    PRIMARY: '#008080',      // 틸 블루 (StartScreen 배경색)
    PRIMARY_DARK: '#005f5f', // PRIMARY의 진한 버전 (타이틀 등에 사용)
    PRIMARY_LIGHT: '#E0FFFF', // ⭐️ 추가: PRIMARY의 밝은 버전 (Hover/선택 배경색) ⭐️
    
    SECONDARY: '#FFC300',    // 강조색 (노란색)
    SECONDARY_DARK: '#FF9900', // SECONDARY의 진한 버전 (키패드 버튼 배경 등)
    
    ACCENT: '#00A3A3',       // PRIMARY와 비슷한 계열의 액션 버튼 (확인 버튼)
    ACCENT_DARK: '#007070',  // ACCENT의 진한 버전
    
    // --- 배경 및 텍스트 ---
    BACKGROUND: '#F5F5F5',    // 오프 화이트 (AdminScreen 배경색)
    BACKGROUND_LIGHT: '#FFFFFF', // 흰색 (모달 배경)
    BACKGROUND_MEDIUM: '#EEEEEE', // ⭐️ 추가: 중간 밝기 배경색 (테이블 짝수 행 등) ⭐️
    BACKGROUND_DARK: '#AAAAAA',  // 어두운 배경 (비밀번호 표시창)
    TEXT_LIGHT: '#FFFFFF',
    TEXT_DARK: '#333333',
    TEXT_MUTED: '#666666',

    // --- 액션 및 경고 ---
    DANGER: '#CC0000',       // 위험/취소 (빨간색)
    DANGER_DARK: '#A30000',  // DANGER의 진한 버전
    ERROR: '#FF3333',
};