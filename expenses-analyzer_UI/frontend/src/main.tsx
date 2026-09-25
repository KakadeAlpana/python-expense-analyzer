// ============================================================
// src/main.tsx
//
// Entry point — mounts the React app into index.html's #root div.
// ============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
