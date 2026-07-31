import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios'
import { Menu, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    axios.get(API_BASE + '/api/auth/me', { withCredentials: true })
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const handleAuthClick = () => { setMenuOpen(false); navigate('/auth'); };

  const handleLogout = () => {
    axios.post(API_BASE + '/api/auth/logout', {}, { withCredentials: true })
      .catch(() => {})
      .finally(() => {
        setUser(null);
        setMenuOpen(false);
        navigate('/');
      })
  };

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : '';

  return (
    <div className="absolute top-0 left-0 w-full z-50 text-white">
      <div className="flex justify-between items-center px-4 sm:px-6 md:px-14 py-4 md:py-6">
        <h1 className="font-semibold tracking-wide text-lg">Iternation</h1>

        <div className="hidden md:flex gap-12 text-sm opacity-80">
          <Link to="/">Home</Link>
          {user ? <Link to="/profile">My Trips</Link> : <a href="#">Destinations</a>}
          <a href="#">Explore</a>
          <a href="#">Contact</a>
          <a href="#">Contact</a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <button onClick={handleAuthClick} className="text-sm opacity-80">Login / Sign up</button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm">{user.name}</span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
                {initial}
              </div>
              <button onClick={handleLogout} className="text-sm text-white/60 hover:underline">Logout</button>
            </div>
          )}
        </div>

        {/* Mobile: avatar + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {user && (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden mx-4 mb-4 rounded-xl bg-black/70 backdrop-blur-xl border border-white/10 px-5 py-4 flex flex-col gap-4 text-sm">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          {user ? (
            <Link to="/profile" onClick={() => setMenuOpen(false)}>My Trips</Link>
          ) : (
            <a href="#" onClick={() => setMenuOpen(false)}>Destinations</a>
          )}
          <a href="#" onClick={() => setMenuOpen(false)}>Explore</a>
          <a href="#" onClick={() => setMenuOpen(false)}>Contact</a>
          {!user ? (
            <button onClick={handleAuthClick} className="text-left opacity-90">Login / Sign up</button>
          ) : (
            <button onClick={handleLogout} className="text-left text-white/60">Logout</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;