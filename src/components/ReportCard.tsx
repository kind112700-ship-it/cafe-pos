// src/components/ReportCard.tsx

import React from 'react';
import styled from 'styled-components';
import { COLORS } from '../theme/colorPalette'; 
import { ReportCardProps } from '../types';


// --- 스타일 컴포넌트 ---
const CardContainer = styled.div`
    background-color: ${COLORS.BACKGROUND_LIGHT}; // 흰색 배경
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 120px;
    transition: transform 0.2s;
`;

const Title = styled.h3`
    font-size: 1.2rem;
    color: ${COLORS.TEXT_DARK}; 
    margin-bottom: 5px;
    font-weight: 500;
`;

const Value = styled.p`
    font-size: 2.5rem;
    font-weight: 700;
    color: ${COLORS.PRIMARY_DARK}; // 진한 PRIMARY로 강조
    margin: 0;
`;

// --- 컴포넌트 로직 ---
export const ReportCard: React.FC<ReportCardProps> = ({ title, value, icon }) => {
    return (
        <CardContainer>
            {/* 아이콘은 여기서는 제외하고 Title과 Value에 집중합니다. */}
            <Title>{title}</Title>
            <Value>{value}</Value>
        </CardContainer>
    );
};