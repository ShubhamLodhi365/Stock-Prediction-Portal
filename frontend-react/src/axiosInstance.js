import axios from 'axios';


const baseUrl = import.meta.env.VITE_BACKEND_BASE_API
const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json'
    }
})


// Request interceptor
axiosInstance.interceptors.request.use(
    function (config) {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
)

// Response interceptor
axiosInstance.interceptors.response.use(
    function (response) {
        return response;
    },
    // Handle failed responses
    async function (error) {
        const originalRequest = error.config;
        if(error.response.status === 401 && ! originalRequest._retry) {
            originalRequest._retry = true;
            const refereshToken = localStorage.getItem('refreshToken');
            try{
                const response = await axiosInstance.post('/token/refresh/', {refreshToken: refereshToken})
                localStorage.setItem('accessToken', response.data.access)
                originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`
                return axiosInstance(originalRequest)
            }catch(error){
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
            }
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;
