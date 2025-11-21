// src/hooks/LanguageContext.tsx

import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import { Language } from '../types'; 

// 🚫 renderTextWithBreaks 함수 제거! (이 함수는 src/utils/textUtils.tsx 로 이동되어야 합니다.)

// 1. Context 타입 정의
interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

// 2. Context 생성
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 3. 번역 데이터 정의 (줄 바꿈 문자 '\n'은 그대로 유지)
const translations: { [key: string]: { [lang in Language]: string } } = {
    'welcome_message': { ko: '25번가 커피입니다.\n반갑습니다.', en: 'Welcome to\n 25th Street Coffee.'},
    'admin_mode': { ko: '관리자', en: 'Admin' },
    'store': { ko: '매장', en: 'Store' },
    'takeout': { ko: '테이크아웃', en: 'Takeout' },
};

// 4. Provider 컴포넌트 생성
export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ko');

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'ko' ? 'en' : 'ko'));
  };

  const t = (key: string): string => {
    // t() 함수는 단순히 문자열을 반환합니다. JSX 변환은 하지 않습니다.
    return translations[key]?.[language] || key;
  };

  const contextValue = { language, toggleLanguage, t };

  return ( 
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// 5. 커스텀 훅
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage는 LanguageProvider 내에서 사용되어야 합니다.');
  }
  return context;
};