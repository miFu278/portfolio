import Header from '../components/layout/Header';
import ChapterRail from '../components/layout/ChapterRail';
import ScrollProgress from '../components/layout/ScrollProgress';
import Footer from '../components/layout/Footer';
import Loader from '../components/layout/Loader';
import VariantTag from '../components/layout/VariantTag';
import Hero from '../features/hero/components/Hero';
import Gateway from '../features/gateway/components/Gateway';
import Services from '../features/services/components/Services';
import Anomaly from '../features/anomaly/components/Anomaly';
import Observability from '../features/observability/components/Observability';
import Response from '../features/response/components/Response';
import { UI_VARIANTS } from '../config/ui';
import { useLoadProgress } from '../hooks/useLoadProgress';
import type { UIVariant } from '../types';
import portrait from '../assets/mp.jpg';

interface HomeProps {
  variant: UIVariant;
}

/**
 * Routing shell. Maps a URL to a composition of feature sections and owns
 * nothing else — no data fetching, no business logic, no styling of its own.
 */
const Home = ({ variant }: HomeProps) => {
  const meta = UI_VARIANTS[variant];
  const { progress, done } = useLoadProgress(portrait);

  return (
    <>
      <Loader progress={progress} done={done} />
      <ScrollProgress />
      <Header />
      {meta.rail && <ChapterRail />}

      <main>
        <Hero variant={variant} />
        <Gateway />
        <Services variant={variant} />
        <Anomaly />
        <Observability />
        <Response />
      </main>

      <Footer />
      <VariantTag current={variant} />
    </>
  );
};

export default Home;
