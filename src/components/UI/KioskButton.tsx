// src/components/UI/KioskButton.tsx
import React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../theme/colorPalette';

interface KioskButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'accent';
  children: React.ReactNode;
}

const StyledButton = styled.button<Omit<KioskButtonProps, 'children'>>`
  padding: 25px 40px;
  border: none;
  border-radius: 12px;
  font-size: 2.5rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s, transform 0.1s;

  ${props => props.variant === 'primary' && `
    background-color: ${COLORS.PRIMARY};
    color: ${COLORS.TEXT_LIGHT};
    &:hover {
      background-color: #006666; /* 조금 더 어두운 틸 */
    }
  `}

  ${props => props.variant === 'accent' && `
    background-color: ${COLORS.SECONDARY};
    color: ${COLORS.TEXT_DARK};
    &:hover {
      background-color: #CCB100; /* 조금 더 어두운 강조색 */
    }
  `}

  &:active {
    transform: scale(0.98);
  }
`;

export const KioskButton: React.FC<KioskButtonProps> = ({ variant, children, ...rest }) => (
  <StyledButton variant={variant} {...rest}>{children}</StyledButton>
);