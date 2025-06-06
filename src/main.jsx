import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename="/ice-pc">
        <AnimatePresence mode="wait">
          <App />
        </AnimatePresence>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);