import { Buffer } from 'buffer';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
