import axios from 'axios';

// ตรวจสอบและแสดงค่า API URL เพื่อการ debug
const API_URL = import.meta.env.VITE_API_URL;
console.log('API URL:', API_URL); // เพื่อตรวจสอบว่าค่าถูกตั้งอย่างถูกต้อง

// ใช้ fallback URL หากไม่พบค่า VITE_API_URL
const api = axios.create({
  baseURL: API_URL || 'http://localhost:3001'
});

// Add request interceptor to include auth token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// เพิ่ม response interceptor เพื่อจัดการกับ JSON parsing errors และการตอบกลับที่ไม่ถูกต้อง
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // แสดงข้อผิดพลาดเพื่อการ debug
    console.error('API Error:', error);
    
    if (error.response) {
      // ข้อผิดพลาดจากการตอบกลับของเซิร์ฟเวอร์
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // ข้อผิดพลาดจากการไม่ได้รับการตอบกลับจากเซิร์ฟเวอร์
      console.error('No response received');
    } else {
      // ข้อผิดพลาดอื่นๆ
      console.error('Error message:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;