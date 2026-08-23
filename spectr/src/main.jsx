import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Axios Interceptor to dynamically direct local hardcoded calls to VITE_API_URL in production
axios.interceptors.request.use((config) => {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4006';
  if (config.url && config.url.startsWith('http://localhost:4006')) {
    config.url = config.url.replace('http://localhost:4006', apiBase);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
