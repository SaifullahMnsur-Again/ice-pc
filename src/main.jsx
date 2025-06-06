import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          backgroundColor: '#111827', 
          color: '#F87171', 
          textAlign: 'center', 
          padding: '40px', 
          minHeight: '100vh',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops! Something went wrong.</h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            {this.state.error?.toString() || 'Unknown error occurred.'}
          </p>
          <p style={{ fontSize: '1rem', color: '#D1D5DB' }}>
            Please try refreshing the page or contact support.
          </p>
          {this.state.errorInfo && (
            <details style={{ marginTop: '1rem', color: '#D1D5DB' }}>
              <summary>Technical Details</summary>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

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