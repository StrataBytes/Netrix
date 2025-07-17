import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import TitleBar from './components/layout/TitleBar';
import { NotificationProvider } from './components/NotificationManager';
import Home from './pages/Home';
import Mods from './pages/Mods';
import News from './pages/News';
import Status from './pages/Status';
import Settings from './pages/Settings';
import './styles/globals.css';

type Page = 'home' | 'mods' | 'news' | 'status' | 'settings';

export default function App() {
  const [page, setPage] = useState<Page>('home');

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home onNavigate={setPage} />;
      case 'mods': return <Mods />;
      case 'news': return <News />;
      case 'status': return <Status />;
      case 'settings': return <Settings />;
    }
  };

  return (
    <NotificationProvider>
      <div className={`app-container tab-${page}`}>
        <TitleBar currentPage={page} />
        <div className="content-container">
          <Sidebar setPage={setPage} currentPage={page} />
          <main className="main-content">
            {renderPage()}
          </main>
        </div>
        <Footer />
      </div>
    </NotificationProvider>
  );
}
