// src/MenuArea.tsx

import React, { useState } from 'react';
import { MENU_ITEMS_DATA, CATEGORIES } from '../utils/data';
import { Category } from '../types'; // Category 타입 임포트

// Props 타입 정의
interface MenuAreaProps {
    onItemClick: (itemId: string) => void;
}

const MenuArea: React.FC<MenuAreaProps> = ({ onItemClick }) => {
    // 1. useState에 Category 타입을 정확히 지정
    const [activeCategory, setActiveCategory] = useState<Category>('COFFEE');

    const filteredItems = Object.values(MENU_ITEMS_DATA).filter(
        item => item.category === activeCategory
    );

    return (
        <div id="menu-area">
            <div className="category-tabs">
                {CATEGORIES.map(category => (
                    <button
                        key={category}
                        className={`tab ${activeCategory === category ? 'active' : ''}`}
                        // ⭐️ 에러 해결: category 변수에 타입 단언 적용 (as Category) ⭐️
                        onClick={() => setActiveCategory(category as Category)} 
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="item-grid">
                {filteredItems.map(item => (
                    <button
                        key={item.id}
                        className="item-card"
                        onClick={() => onItemClick(item.id)}
                    >
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">{item.price.toLocaleString('ko-KR')}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MenuArea;