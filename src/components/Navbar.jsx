import { NavLink, useLocation } from 'react-router-dom';
import { useState, useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/coders', label: 'Coders' },
  { path: '/contests', label: 'Contests' },
];

function Navbar() {
  const location = useLocation();
  const [markerStyle, setMarkerStyle] = useState({ left: 0, width: 0 });
  const [animationDirection, setAnimationDirection] = useState('left');
  const navRef = useRef(null);

  useLayoutEffect(() => {
    const currentIndex = navLinks.findIndex(link => link.path === location.pathname);
    const prevIndex = sessionStorage.getItem('prevNavIndex')
      ? parseInt(sessionStorage.getItem('prevNavIndex'))
      : currentIndex;

    if (currentIndex !== prevIndex && currentIndex !== -1) {
      setAnimationDirection(currentIndex > prevIndex ? 'left' : 'right');
      sessionStorage.setItem('prevNavIndex', currentIndex);
    }

    const activeLink = navRef.current?.querySelector('a.active');
    if (activeLink) {
      const { offsetLeft, offsetWidth } = activeLink;
      setMarkerStyle({ left: offsetLeft, width: offsetWidth });
    } else {
      setMarkerStyle({ left: 0, width: 0 });
    }
  }, [location.pathname]);

  return (
    <nav className="bg-gradient-to-r from-indigo-950 to-purple-950 text-white fixed w-full top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <NavLink to="/" className="flex items-center gap-4">
          <span className="text-3xl font-bold text-indigo-300">&lt;/&gt;</span>
          <h1 className="text-xl font-bold font-['Inter']">ICE PC</h1>
        </NavLink>
        <div className="relative flex gap-6 items-center font-['Inter']" ref={navRef}>
          <ul className="flex gap-6 items-center">
            {navLinks.map(link => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `relative text-lg transition-all duration-300 px-2 py-1 ${
                      isActive ? 'text-indigo-300 active' : 'text-gray-200 hover:text-indigo-200'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <motion.div
            className="absolute bottom-0 h-0.5 bg-indigo-400 rounded-full"
            style={{ transformOrigin: animationDirection === 'left' ? 'left' : 'right' }}
            animate={{ left: markerStyle.left, width: markerStyle.width }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;