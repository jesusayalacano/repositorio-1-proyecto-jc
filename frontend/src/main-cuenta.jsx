import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import CuentaApp from './CuentaApp.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CuentaApp />
  </StrictMode>
);
