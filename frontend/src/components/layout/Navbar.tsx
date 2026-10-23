import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, User as UserIcon, Heart, LayoutDashboard, BookmarkPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/plots', label: 'Explore Plots' },
  { to: '/locations', label: 'Locations' },
  { to: '/explorer', label: '3D Explorer' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { brandName } = useConfig();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-350 ${
        scrolled ? 'bg-ivory/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="font-display text-2xl font-semibold tracking-wide text-forest focus-ring" onClick={() => setMenuOpen(false)}>
          {brandName}
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative text-sm font-medium tracking-wide transition-colors duration-250 focus-ring ${
                  isActive ? 'text-forest' : scrolled ? 'text-charcoal/80 hover:text-forest' : 'text-forest/90 hover:text-forest'
                }`
              }
            >
              {({ isActive }) => (
                <span className="relative pb-1">
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-forest"
                    />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to="/list-your-plot"
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-ivory transition-all duration-250 hover:bg-charcoal focus-ring"
          >
            List Your Plot
          </Link>
          {user ? (
            <div className="group relative">
              <button className="flex items-center gap-2 rounded-full border border-forest/20 p-2.5 text-forest transition-colors hover:bg-forest/5 focus-ring">
                <UserIcon size={18} />
              </button>
              <div className="invisible absolute right-0 top-full w-48 translate-y-1 rounded-xl border border-forest/10 bg-ivory p-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
                <p className="truncate px-3 py-1.5 text-xs text-charcoal/60">{user.name}</p>
                <Link to="/account/wishlist" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sage/20">
                  <Heart size={14} /> Wishlist
                </Link>
                <Link to="/account/enquiries" className="block rounded-lg px-3 py-2 text-sm hover:bg-sage/20">
                  My Enquiries
                </Link>
                <Link to="/account/saved-searches" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sage/20">
                  <BookmarkPlus size={14} /> Saved Searches
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-forest hover:bg-sage/20">
                    <LayoutDashboard size={14} /> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-charcoal/70 hover:bg-sage/20"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="rounded-full border border-forest/20 p-2.5 text-forest transition-colors hover:bg-forest/5 focus-ring">
              <UserIcon size={18} />
            </Link>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-forest lg:hidden focus-ring"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden bg-ivory lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 pb-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-3 text-base font-medium ${isActive ? 'bg-sage/20 text-forest' : 'text-charcoal/80'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/list-your-plot"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full bg-forest px-5 py-3 text-center text-sm font-medium text-ivory"
              >
                List Your Plot
              </Link>
              {user ? (
                <>
                  <Link to="/account/wishlist" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-base text-charcoal/80">
                    Wishlist
                  </Link>
                  <Link to="/account/enquiries" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-base text-charcoal/80">
                    My Enquiries
                  </Link>
                  <Link to="/account/saved-searches" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-base text-charcoal/80">
                    Saved Searches
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-forest">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      navigate('/');
                    }}
                    className="rounded-lg px-3 py-3 text-left text-base text-charcoal/80"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-base text-charcoal/80">
                  Log in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
