import { useState, useEffect, useCallback } from 'react';

export type AppRoute = 'landing' | 'kids' | 'studio';
export type StudioTab = 'setup' | 'pages' | 'cover' | 'kindle' | 'marketing' | 'export' | 'catalog';

export interface RouteState {
  route: AppRoute;
  tab: StudioTab;
  bookId?: string;
  isHashRouting: boolean;
}

const VALID_STUDIO_TABS: StudioTab[] = [
  'setup',
  'pages',
  'cover',
  'kindle',
  'marketing',
  'export',
  'catalog',
];

function parseCurrentLocation(): RouteState {
  if (typeof window === 'undefined') {
    return { route: 'landing', tab: 'setup', isHashRouting: false };
  }

  const hash = window.location.hash || '';
  const pathname = window.location.pathname || '/';
  const isHash = hash.startsWith('#/');

  let pathPart = pathname.toLowerCase();
  let searchPart = window.location.search;

  if (isHash) {
    const rawHash = hash.slice(1); // remove '#'
    const [hPath, hQuery] = rawHash.split('?');
    pathPart = (hPath || '/').toLowerCase();
    searchPart = hQuery ? `?${hQuery}` : '';
  }

  const params = new URLSearchParams(searchPart);
  const rawTab = params.get('tab');
  const tab: StudioTab = (rawTab && VALID_STUDIO_TABS.includes(rawTab as StudioTab))
    ? (rawTab as StudioTab)
    : 'setup';
  const bookId = params.get('book') || undefined;

  // Determine route:
  // /studio, /admin, or /publisher route opens Publisher Studio
  // /play, /kids, or /game opens TotLogix Kids Hub
  // Everything else defaults to playful 'landing' page
  const isPlay =
    pathPart.includes('/play') ||
    pathPart.includes('/kids') ||
    pathPart.includes('/game');

  const route: AppRoute = isPlay ? 'kids' : 'landing';

  return {
    route,
    tab,
    bookId,
    isHashRouting: isHash,
  };
}

export function useRouter() {
  const [state, setState] = useState<RouteState>(() => parseCurrentLocation());

  useEffect(() => {
    const handleLocationChange = () => {
      setState(parseCurrentLocation());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = useCallback(
    (
      targetRoute: AppRoute,
      options?: { tab?: StudioTab; bookId?: string; preferHash?: boolean }
    ) => {
      const current = parseCurrentLocation();
      const useHash = options?.preferHash ?? true;
      const tab = options?.tab || (targetRoute === 'studio' ? current.tab : undefined);
      const bookId = options?.bookId;

      const query = new URLSearchParams();
      if (tab && targetRoute === 'studio') query.set('tab', tab);
      if (bookId) query.set('book', bookId);
      const queryString = query.toString() ? `?${query.toString()}` : '';

      let path = '/';
      if (targetRoute === 'studio') path = '/studio';
      else if (targetRoute === 'kids') path = '/play';
      else path = '/';

      const targetUrl = useHash
        ? `#${path}${queryString}`
        : `${path}${queryString}`;

      window.history.pushState(null, '', targetUrl);
      setState(parseCurrentLocation());
    },
    []
  );

  const setStudioTab = useCallback((newTab: StudioTab) => {
    const current = parseCurrentLocation();
    const query = new URLSearchParams(
      current.isHashRouting
        ? (window.location.hash.split('?')[1] || '')
        : window.location.search
    );
    query.set('tab', newTab);
    const queryString = `?${query.toString()}`;

    const path = '/studio';
    const targetUrl = current.isHashRouting
      ? `#${path}${queryString}`
      : `${path}${queryString}`;

    window.history.pushState(null, '', targetUrl);
    setState((prev) => ({ ...prev, tab: newTab }));
  }, []);

  return {
    route: state.route,
    tab: state.tab,
    bookId: state.bookId,
    navigate,
    setStudioTab,
  };
}
