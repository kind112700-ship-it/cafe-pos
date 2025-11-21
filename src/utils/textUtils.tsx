// src/utils/textUtils.tsx (확장자가 .tsx로 변경되었습니다!)

import React from 'react';

// 🌟 이 함수는 줄 바꿈 문자(\n)를 HTML의 <br /> 태그로 변환하는 역할을 합니다.
export const renderTextWithBreaks = (text: string) => {
  return text.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {/* 마지막 줄이 아닐 경우에만 <br />을 넣어 줄을 바꿉니다. */}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
};