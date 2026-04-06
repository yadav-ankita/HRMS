  //frontend/axios.js
import axios from 'axios';

// Set base URL from environment variable or fallback to production
//const baseURL = import.meta.env.VITE_API_URL || 'https://hrms-backend-ul3t.onrender.com/api/v1';
//const baseURL='http://localhost:5000/api/v1'
axios.defaults.baseURL = 'https://hrms-nkr0.onrender.com/';
 //Add request interceptor
axios.interceptors.request.use(
    (req) => {
        const user = localStorage.getItem('user');
      if (user) {
            try {
                const { token } = JSON.parse(user);
                req.headers.Authorization = `Bearer ${token}`;
                //console.log('Added Authorization header to request:', req);
            } catch (error) {
                //console.error('Error parsing user from localStorage:', error);
            }
        }
        return req;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export default axios;
