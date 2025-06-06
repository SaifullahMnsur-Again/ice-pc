import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Coders from './pages/Coders';
import Contests from './pages/Contests';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect');
    if (redirectPath && redirectPath !== location.pathname.replace(/^\/ice-pc/, '')) {
      sessionStorage.removeItem('redirect');
      navigate(redirectPath === '/' ? '/' : redirectPath, { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/coders" element={<Coders />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default App;