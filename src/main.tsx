import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installClientDbFallback } from './clientDbFallback.js';

// Install standard client-side storage & database simulation fallback for offline & Vercel deployment
installClientDbFallback();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

