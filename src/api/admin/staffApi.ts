import { db } from '../../firebase/config';
import { StaffUser, StaffForm, PermissionRole } from '../../types/admin'; 
import { collection, getDocs, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore'; 

// 직원 콜렉션 참조 (DB의 'staffs' 테이블 역할)
// ⚠️ 주의: 프로젝트 ID는 사용자님의 'cafe-pos-66f22'로 설정되어 있습니다.
// 이 경로는 Canvas 환경의 Firestore 보안 규칙에 맞춰진 공개 데이터 경로입니다.
const STAFF_COLLECTION_PATH = 'artifacts/cafe-pos-66f22/public/data/staffs';
const staffCollection = collection(db, STAFF_COLLECTION_PATH);

// 1. ⭐️ 목록 조회 (`fetchStaffList`) ⭐️
export const fetchStaffList = async (): Promise<StaffUser[]> => {
    console.log("Firebase에서 직원 목록 조회 시작...");
    try {
        // Firestore에서 모든 문서 가져오기
        const snapshot = await getDocs(staffCollection);
        
        // DB 문서들을 StaffUser 타입 배열로 변환
        const staffList: StaffUser[] = snapshot.docs.map(doc => ({
            id: doc.id, // Firestore 문서 ID를 사용
            ...doc.data() as Omit<StaffUser, 'id'> 
        }));
        
        console.log(`총 ${staffList.length}명의 직원 정보 로드 완료.`);
        return staffList;
    } catch (error) {
        console.error("Firebase 직원 목록 조회 실패:", error);
        throw new Error("직원 목록을 서버에서 불러올 수 없습니다.");
    }
};

// 2. ⭐️ 신규 등록 (`addStaffUser`) ⭐️
export const addStaffUser = async (formData: StaffForm): Promise<StaffUser> => {
    try {
        const timestamp = new Date().toISOString();
        
        // ⭐️ DB에 저장할 때 누락되었던 필드에 기본값 추가 ⭐️
        const newDocRef = await addDoc(staffCollection, {
            ...formData,
            isActive: true, 
            createdAt: timestamp,
            lastLogin: '', // 기본값 설정
            isLoginLocked: false, // 기본값 설정
        });

        // ⭐️ 반환 객체를 만들 때 누락되었던 필드에 기본값 추가 ⭐️
        const newUserData: StaffUser = { 
            id: newDocRef.id, 
            ...formData, 
            isActive: true, 
            createdAt: timestamp,
            lastLogin: '', // 초기값 설정
            isLoginLocked: false, // 초기값 설정
        };

        console.log(`신규 직원 등록 성공: ID ${newDocRef.id}`);
        return newUserData;
    } catch (error) {
        console.error("Firebase 직원 등록 실패:", error);
        throw new Error("신규 직원 등록에 실패했습니다.");
    }
};

// 3. ⭐️ 정보 수정 (`updateStaffInfo`) ⭐️
export const updateStaffInfo = async (updatedUser: StaffUser): Promise<StaffUser> => {
    try {
        const staffDoc = doc(db, STAFF_COLLECTION_PATH, updatedUser.id);
        
        // DB의 해당 ID 문서를 업데이트 (name, role만 수정한다고 가정)
        await updateDoc(staffDoc, { 
            name: updatedUser.name, 
            role: updatedUser.role 
        });
        
        console.log(`직원 정보 수정 성공: ID ${updatedUser.id}`);
        return updatedUser;
    } catch (error) {
        console.error("Firebase 정보 수정 실패:", error);
        throw new Error("정보 수정에 실패했습니다.");
    }
};

// 4. ⭐️ 상태 토글 (`toggleStaffActive`) ⭐️
export const toggleStaffActive = async (userId: string, isActive: boolean): Promise<StaffUser> => {
    try {
        const staffDoc = doc(db, STAFF_COLLECTION_PATH, userId);
        
        // isActive 필드만 업데이트
        await updateDoc(staffDoc, { isActive: isActive });
        
        // 업데이트된 데이터 반환을 위해 다시 가져오기
        const docSnap = await getDoc(staffDoc);
        if (docSnap.exists()) {
            const updatedData = docSnap.data() as Omit<StaffUser, 'id'>;
            const result: StaffUser = { id: docSnap.id, ...updatedData };
            console.log(`직원 상태 토글 성공: ID ${userId}, Active: ${isActive}`);
            return result;
        }
        
        throw new Error("업데이트된 사용자를 찾을 수 없습니다.");
    } catch (error) {
        console.error("Firebase 상태 토글 실패:", error);
        throw new Error("계정 상태 변경에 실패했습니다.");
    }
};