import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const axiosJwt = axios.create({
  baseURL: process.env.REACT_APP_API_URL, 
  withCredentials: true, 
})




axiosJwt.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('access_token');
    
    try {
      if (token && token.startsWith('"')) {
        token = JSON.parse(token);
      }
    } catch (e) {
    }
    
    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
    } catch (err) {
      console.log('Token không hợp lệ:', err);
    }

    const currentTime = Date.now() / 1000;
    if (decodedToken?.exp < currentTime) {
      try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/user/refresh-token`, {}, {
          withCredentials: true
        });
        const data = res.data;
        if (data?.status === 'OK' && data?.access_token) {
          const tokenToSave = typeof data.access_token === 'string' 
            ? data.access_token 
            : JSON.stringify(data.access_token);
          localStorage.setItem('access_token', tokenToSave);
          config.headers['token'] = `Bearer ${data.access_token}`;
        }
      } catch (err) {
        console.error('Refresh token thất bại', err);
      }
    } else if (token) {
      const cleanToken = token.replace(/^"(.*)"$/, '$1');
      config.headers['token'] = `Bearer ${cleanToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosJwt;
