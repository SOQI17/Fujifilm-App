import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import App from './App.tsx';
import './index.css';

registerSW({
  immediate: true,

  onNeedRefresh() {
    window.location.reload();
  },

  onOfflineReady() {
    console.log('La app está lista para funcionar offline.');
  },

  onRegisteredSW(_swScriptUrl, registration) {
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 1000);
    }
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
