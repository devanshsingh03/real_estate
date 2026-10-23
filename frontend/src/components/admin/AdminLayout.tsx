import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Building2, Inbox, MapPinned, Settings, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/properties', label: 'Properties', icon: Building2 },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
  { to: '/admin/locations', label: 'Locations', icon: MapPinned },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-forest/10 bg-charcoal text-ivory md:flex">
        <div className="px-6 py-6">
          <p className="font-display text-xl font-semibold">Admin</p>
          <p className="truncate text-xs text-ivory/50">{user?.name}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-sage/20 text-ivory' : 'text-ivory/60 hover:bg-ivory/5 hover:text-ivory'
                }`
              }
            >
              <item.icon size={16} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ivory/10 p-3">
          <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-ivory/60 hover:bg-ivory/5 hover:text-ivory">
            <ExternalLink size={15} /> View site
          </Link>
        </div>
      </aside>

      <div className="flex-1 overflow-x-hidden">
        <header className="flex items-center justify-between border-b border-forest/10 bg-white px-4 py-3 md:hidden">
          <p className="font-display text-lg font-semibold text-forest">Admin</p>
          <Link to="/" className="text-sm text-forest underline">View site</Link>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-forest/10 bg-white px-3 py-2 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-forest text-ivory' : 'text-charcoal/60'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
