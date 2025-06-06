import { NavLink, useLocation } from 'react-router-dom';
import { useState, useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Relative paths since basename="/ice-pc" handles the base path
const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/coders', label: 'Coders' },
  { path: '/contests', label: 'Contests' },
];

function Navbar() {
  const location = useLocation();
  const [markerStyle, setMarkerStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef(null);

  useLayoutEffect(() => {
    const updateMarker = () => {
      // Find the active link using the 'active' class applied by NavLink
      const activeLink = navRef.current?.querySelector('a.active');

      if (activeLink) {
        const { offsetLeft, offsetWidth } = activeLink;
        setMarkerStyle({ left: offsetLeft, width: offsetWidth });
      } else {
        // Default to the first link (Home) for unmatched routes
        const defaultLink = navRef.current?.querySelectorAll('a')[0];
        if (defaultLink) {
          const { offsetLeft, offsetWidth } = defaultLink;
          setMarkerStyle({ left: offsetLeft, width: offsetWidth });
        } else {
          setMarkerStyle({ left: 0, width: 0 });
        }
      }
    };

    // Run immediately and on resize
    updateMarker();
    window.addEventListener('resize', updateMarker);
    return () => window.removeEventListener('resize', updateMarker);
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
                  end={link.path === '/'} // Exact match for root path
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
            animate={{ left: markerStyle.left, width: markerStyle.width }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;