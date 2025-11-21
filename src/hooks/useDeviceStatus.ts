// src/hooks/useDeviceStatus.ts

import { useState, useEffect, useCallback } from 'react';

// 장치 상태 타입 정의
export type DeviceStatus = 'OK' | 'ERROR' | 'WARN' | 'UNKNOWN';

export interface SystemStatus {
    label: string;
    status: DeviceStatus;
    detail: string;
}

export interface DeviceCheckData {
    network: SystemStatus[];
    payment: SystemStatus[];
    printer: SystemStatus[];
    system: SystemStatus[];
}

const initialData: DeviceCheckData = {
    network: [],
    payment: [],
    printer: [],
    system: [],
};

const API_BASE_URL = 'http://localhost:3001'; //

// ⭐️ API 연결 및 시뮬레이션 데이터를 혼합하여 반환하는 함수 ⭐️
const fetchCheckDevice = async (): Promise<DeviceCheckData> => {
    // 1. 로딩 시간 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    let posServerStatus: DeviceStatus = 'ERROR';
    let posServerDetail = '서버 통신 실패';

    // 2. POS 서버 통신 상태 체크 (실제 API 호출: /transactions 엔드포인트 사용)
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`);
        if (response.ok) {
            posServerStatus = 'OK';
            posServerDetail = `Health Check (Code: ${response.status} OK)`;
            // 실제 데이터는 사용하지 않고 연결 성공 여부만 확인합니다.
            await response.json(); 
        } else {
            posServerStatus = 'ERROR';
            posServerDetail = `서버 응답 오류 (Code: ${response.status})`;
        }
    } catch (error) {
        // 네트워크 오류 또는 서버 연결 자체 실패
        posServerStatus = 'ERROR';
        posServerDetail = `네트워크 오류 발생: ${error instanceof Error ? error.message : '연결 실패'}`;
    }


// 💡 Mock API를 사용하여 비동기 진단 시뮬레이션
const simulatedData: DeviceCheckData = {
        network: [
            { label: '인터넷 연결 (WAN)', status: 'OK', detail: 'Public IP 접근 성공' },
            // ⭐️ API 호출 결과를 여기에 반영 ⭐️
            { label: 'POS 서버 통신', status: posServerStatus, detail: posServerDetail },
            { label: 'VAN사/결제망 통신', status: 'WARN', detail: '응답 지연 발생 (1500ms)' },
        ],
        payment: [
            { label: '카드 리더기/IC', status: 'OK', detail: 'USB 포트 연결됨' },
            { label: '현금 투입기', status: 'ERROR', detail: '장치 연결 끊김 (하드웨어 미장착)' },
        ],
        printer: [
            { label: '영수증 프린터', status: 'WARN', detail: '용지 잔량 부족 (20% 미만)' },
            { label: '주방 프린터 (랜)', status: 'OK', detail: '네트워크 핑 테스트 성공' },
        ],
        system: [
            { label: 'CPU/메모리 사용률', status: 'OK', detail: 'CPU: 25%, RAM: 60%' },
            { label: '로컬 저장소 상태', status: 'OK', detail: '여유 공간: 50GB' },
            { label: '앱 버전', status: 'OK', detail: 'v1.2.5' },
            { label: '최근 오류 로그', status: 'WARN', detail: '결제 타임아웃 1건 (10분 전)' },
        ],
    };
    
    return simulatedData;
};

export const useDeviceStatus = () => {
    const [statusData, setStatusData] = useState<DeviceCheckData>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const runDeviceCheck = useCallback(async () => {
        setIsLoading(true);
        try {
            // ⭐️ 변경: fetchCheckDevice 호출 ⭐️
            const data = await fetchCheckDevice(); 
            setStatusData(data);
            setLastChecked(new Date());
        } catch (error) {
            console.error("장치 진단 중 오류 발생:", error);
            // 오류 발생 시 전체 상태를 ERROR로 표시하는 로직
        } finally {
            setIsLoading(false);
        }
    }, []);

    
    // 컴포넌트 마운트 시 자동 실행
    useEffect(() => {
        runDeviceCheck();
    }, [runDeviceCheck]);

    return {
        statusData,
        isLoading,
        lastChecked,
        runDeviceCheck, // 관리자가 수동으로 재진단할 수 있도록 함수 노출
    };
};

