// src/firebase/config.ts

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; 

const firebaseConfig = {
  apiKey: "AIzaSyC3ArxIy_3e7oRyFrYvUp5ZNv7ya4Cu_E4", // 이 값은 사용자님의 고유 키입니다
  authDomain: "cafe-pos-66f22.firebaseapp.com",
  projectId: "cafe-pos-66f22",
  storageBucket: "cafe-pos-66f22.firebasestorage.app",
  messagingSenderId: "513454781574",
  appId: "1:513454781574:web:d4a554cddfd52c94e24d07",
  measurementId: "G-F271CTCC9N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // ⭐️ db 인스턴스를 외부로 내보냅니다 ⭐️
// (getAnalytics 코드는 제거해도 됩니다.)