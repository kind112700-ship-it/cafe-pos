// src/types/index.ts

export type ScreenState = 'START' | 'MAIN' | 'PAYMENT' | 'COMPLETE' | 'ADMIN';
export type OrderType = 'STORE' | 'TAKEOUT';
export type Language = 'ko' | 'en';



// 주문 항목의 옵션 구조
export type Modifier = string; // 예: "샷 추가", "사이즈 UP"

// 주문 목록의 개별 항목 구조
export interface OrderItem {
    id: string;         // 고유 주문 ID (uniqueId)
    baseId: string;     // 메뉴 데이터 ID (MENU_ITEMS_DATA의 key)
    name: string;
    price: number;      // 기본 단가
    qty: number;
    temp: 'HOT' | 'ICE';
    modifiers: Modifier[];
    memo: string;
}

// 메뉴 데이터 항목 구조
export interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: Category;
}

// 카테고리 타입
export type Category = "COFFEE" | "BEVERAGE" | "TEA" | "FRAPPUCCINO" | "AED";

// 주문 목록은 OrderItem 객체들을 key-value 형태로 가짐
export interface CurrentOrder {
    [key: string]: OrderItem;
}

// 모달 컴포넌트에서 사용하는 초기 항목 데이터 (OrderIte에서 id만 제외)
export type InitialItemData = Omit<OrderItem, 'id'>;

export interface PaymentScreenProps {
    // 화면 전환 함수: 다음 화면(screen)과 전달할 데이터(props)를 정의
    navigateTo: (screen: ScreenState, props?: any) => void; 
    
    // 주문 항목 목록 (MainScreen에서 전달받음)
    orderItems: OrderItem[]; 
    
    // 최종 상품 합계 금액 (할인 적용 전)
    subTotal: number; 
    
    // 매장(STORE) 또는 포장(TAKEOUT) 정보
    orderType: 'STORE' | 'TAKEOUT';
}

export const ScreenStates = {
    START: 'START' as ScreenState,
    MAIN: 'MAIN' as ScreenState,
    PAYMENT: 'PAYMENT' as ScreenState,
    COMPLETE: 'COMPLETE' as ScreenState,
    ADMIN: 'ADMIN' as ScreenState,
};

export interface MainScreenProps {
    // navigateTo 함수는 필수적으로 MainScreen에 전달되어야 합니다.
    navigateTo: (screen: ScreenState, props?: any) => void;
    
    // MainScreen에서 필요한 다른 props들도 정의해줍니다.
    currentOrder: CurrentOrder;
    orderType: 'STORE' | 'TAKEOUT';
    totalPrice: number;
    // ... 기타 필요한 props
}

// ⭐️ [추가] 주문 완료 화면(CompleteScreen)에 필요한 Props 정의 ⭐️
export interface CompleteScreenProps {
    // 화면 전환 함수
    navigateTo: (screen: ScreenState, props?: any) => void; 
    
    // 주문 완료 화면에 표시할 주문 번호
    orderId: string; 
    
    // 매장/포장 정보 (안내 메시지 용도)
    orderType: 'STORE' | 'TAKEOUT';
    
    // ... (필요하다면 최종 결제 금액 등을 추가할 수 있습니다.)
}

// ⭐️ [새로운 추가] 거래 내역 (Transaction) 데이터 모델 ⭐️
export interface Transaction {
    id: string; // Firestore 문서 ID (거래 고유 ID)
    orderId: string; // 키오스크에서 출력된 주문 번호
    orderType: OrderType; // 매장/포장
    
    // 거래 상태 (관리자 모드에서 중요)
    status: 'COMPLETED' | 'CANCELED' | 'REFUNDED'; // 완료, 취소, 환불
    
    // 시간 정보 (정산 및 조회에 필수)
    timestamp: Date; // 거래 완료 시간 (Date 객체 또는 Firestore Timestamp)
    
    // 금액 정보
    totalAmount: number; // 최종 결제 금액
    paymentMethod: 'CARD' | 'CASH' | 'QR_PAY'; // 결제 수단
    
    // 주문 항목 목록 (거래 내역 상세 보기에 사용)
    items: OrderItem[]; 
}

// ⭐️ [추가] AdminScreenProps 정의 ⭐️
export interface AdminScreenProps {
    // 화면 전환 함수는 필수입니다.
    navigateTo: (screen: ScreenState, props?: any) => void; 
}


export interface ReportCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode; 
}

export interface TransactionTableProps {
    transactions: Transaction[];
    onRefund: (transactionId: string) => void;
    onTransactionClick: (transaction: Transaction) => void;
}

