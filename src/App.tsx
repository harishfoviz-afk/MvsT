import React, { useState, useEffect } from 'react';
import { BookRecord } from './types/book';
import { useRouter } from './core/router/useRouter';
import { loadBookCatalog } from './core/storage/bookCatalogStorage';
import { setActiveChildIndex } from './core/storage/kidsProfileStorage';
import { KidsPortal } from './components/KidsPortal';
import { LandingPage } from './components/LandingPage';

export const App: React.FC = () => {
  const router = useRouter();
  
  // Persistent Book Catalog (with auto-seeded Road Trip books for Maan and Toshi)
  const [catalog, setCatalog] = useState<BookRecord[]>(() => loadBookCatalog());

  // Active selected book for kids portal
  const [kidsSelectedBook, setKidsSelectedBook] = useState<BookRecord | null>(null);

  // Sync direct book selection if bookId is provided in URL
  useEffect(() => {
    if (router.bookId) {
      const found = catalog.find((b) => b.id === router.bookId || b.sku === router.bookId);
      if (found) {
        setKidsSelectedBook(found);
      }
    }
  }, [router.bookId, catalog]);

  // Handler when selecting Maan (idx 0) or Toshi (idx 1)
  const handleSelectChild = (childIdx: number) => {
    setActiveChildIndex(childIdx);
    const targetAge = childIdx === 0 ? '10+' : '4-6';
    const ageBook = catalog.find((b) => b.ageGroup === targetAge) || null;
    setKidsSelectedBook(ageBook);
    router.navigate('kids');
  };

  // If on Kids route (/play or /kids), render Kids Portal View
  if (router.route === 'kids') {
    return (
      <KidsPortal
        catalog={catalog}
        initialBook={kidsSelectedBook}
        onGoToLanding={() => router.navigate('landing')}
        onUpdateCatalog={(newCatalog) => setCatalog(newCatalog)}
      />
    );
  }

  // Default Launch Screen: 2 Kid Figures (Maan & Toshi)
  return (
    <LandingPage
      catalog={catalog}
      onSelectChild={handleSelectChild}
    />
  );
};

export default App;
