import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { Notifications } from '@mantine/notifications';
import { MantineProvider } from '@mantine/core';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'light' }}>
    {/* Notifications should NOT wrap other components */}
      
    <Notifications />
    <BrowserRouter>

      <App />
      
    </BrowserRouter>
  </MantineProvider>
);

// If you want to start measuring performance in your app
reportWebVitals();
