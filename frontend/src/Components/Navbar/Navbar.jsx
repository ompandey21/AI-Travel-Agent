import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(API_BASE + '/api/auth/me', { withCredentials: true })
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const handleAuthClick = () => navigate('/auth');

  const handleLogout = () => {
    axios.post(API_BASE + '/api/auth/logout', {}, { withCredentials: true })
      .catch(() => {})
      .finally(() => {
        setUser(null);
        navigate('/');
      })
  };

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : '';

  return (
    <div className="absolute top-0 left-0 w-full flex justify-between items-center px-6 md:px-14 py-4 md:py-6 text-white z-50">
      <h1 className="font-semibold tracking-wide text-lg">Iternation</h1>

      <div className="hidden md:flex gap-12 text-sm opacity-80">
        <Link to="/">Home</Link>
        <a href="#">Explore</a>
        <a href="#">Destinations</a>
        <a href="#">Contact</a>
      </div>

      <div className="flex items-center gap-4">
        {!user ? (
          <button onClick={handleAuthClick} className="hidden md:flex gap-12 text-sm opacity-80">Login / Sign up</button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-sm">{user.name}</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
            <button onClick={handleLogout} className="text-sm text-white/60 hover:underline">Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;