import { useEffect } from 'react';
import Home from './pages/Home';
import { PROFILE } from './config/content';

const App = () => {
  // Person schema lives in index.html as an empty shell and is filled here, so
  // the profile has exactly one source of truth: config/content.ts.
  useEffect(() => {
    const ld = document.getElementById('person-jsonld');
    if (!ld) return;

    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: PROFILE.name,
      alternateName: PROFILE.alias,
      url: PROFILE.siteUrl,
      email: `mailto:${PROFILE.email}`,
      jobTitle: PROFILE.role,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ho Chi Minh City',
        addressCountry: 'VN',
      },
      alumniOf: 'FPT University',
      sameAs: [PROFILE.github],
      knowsAbout: ['Backend Engineering', 'Distributed Systems', 'Go', '.NET', 'Applied AI'],
    });
  }, []);

  return <Home />;
};

export default App;
