import { useState } from 'react';
import Header from './renderer/components/layout/Header';
import Sidebar from './renderer/components/layout/Sidebar';
import Footer from './renderer/components/layout/Footer';
import Mods from './renderer/pages/Mods';
import News from './renderer/pages/News';
import Status from './renderer/pages/Status';
import Settings from './renderer/pages/Settings';
import './renderer/styles/globals.css';

type Page = 'mods' | 'news' | 'status' | 'settings';

export default function App() {
  const [page, setPage] = useState<Page>('mods');

  const renderPage = () => {
    switch (page) {
      case 'mods': return <Mods />;
      case 'news': return <News />;
      case 'status': return <Status />;
      case 'settings': return <Settings />;
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="content-container">
        <Sidebar setPage={setPage} currentPage={page} />
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
      <Footer />
    </div>
  );
}
