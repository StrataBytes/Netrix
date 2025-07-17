import { Icons } from '../icons';

type Props = {
  setPage: (page: 'home' | 'mods' | 'news' | 'status' | 'settings') => void;
  currentPage: string;
};

const navigationItems = [
  { id: 'home', label: 'Dashboard', icon: <Icons.home size={18} /> },
  { id: 'news', label: 'News', icon: <Icons.news size={18} /> },
  { id: 'status', label: 'Status', icon: <Icons.status size={18} /> },
  { id: 'mods', label: 'Modpack Manager', icon: <Icons.package size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Icons.settings size={18} /> }
];

export default function Sidebar({ setPage, currentPage }: Props) {
  return (
    <nav className="sidebar">
      <div className="sidebar-nav">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id as any)}
            className={`sidebar-button ${currentPage === item.id ? 'active' : ''}`}
          >
            <span className="sidebar-button-icon">{item.icon}</span>
            <span className="sidebar-button-text">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
