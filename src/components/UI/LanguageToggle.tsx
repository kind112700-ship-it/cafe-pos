import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../LanguageContext';
import { COLORS } from '../../theme/colorPalette';

const ToggleContainer = styled.button`
  background: none;
  border: 2px solid ${COLORS.TEXT_LIGHT};
  color: ${COLORS.TEXT_LIGHT};
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const displayLang = language === 'ko' ? 'English' : '한국어';

  return (
    <ToggleContainer onClick={toggleLanguage}>
      {displayLang}
    </ToggleContainer>
  );
};