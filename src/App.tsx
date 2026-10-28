import { useEffect, useState } from 'react';
import Home from './pages/Home';
import { resolveVariant } from './config/ui';
import { PROFILE } from './config/content';
import type { UIVariant } from './types';

const App = () => {
  const [variant, setVariant] = useState<UIVariant>(() => resolveVariant());

  // The variant lives in the URL so a direction can be shared as a link and
  // survives a reload. Back/forward stays consistent.
  useEffect(() => {
    const onPop = () => setVariant(resolveVariant());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.ui = variant;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', variant === '2' ? '#f4f1ea' : '#08080a');
  }, [variant]);

  useEffect(() => {
    const ld = document.getElementById('person-jsonld');
    if (ld) {
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: PROFILE.name,
        alternateName: PROFILE.alias,
        url: PROFILE.siteUrl,
        email: `mailto:${PROFILE.email}`,
        jobTitle: PROFILE.role,
        address: { '@type': 'PostalAddress', addressLocality: 'Ho Chi Minh City', addressCountry: 'VN' },
        alumniOf: 'FPT University',
        sameAs: [PROFILE.github],
        knowsAbout: ['Backend Engineering', 'Distributed Systems', 'Go', '.NET', 'Applied AI'],
      });
    }
  }, []);

  return <Home variant={variant} />;
};

export default App;
