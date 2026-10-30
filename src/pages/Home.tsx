import Header from '../components/layout/Header';
import ChapterRail from '../components/layout/ChapterRail';
import ScrollProgress from '../components/layout/ScrollProgress';
import Footer from '../components/layout/Footer';
import Loader from '../components/layout/Loader';
import StarField from '../components/layout/StarField';
import Cursor from '../components/ui/Cursor';
import Hero from '../features/hero/components/Hero';
import Gateway from '../features/gateway/components/Gateway';
import Services from '../features/services/components/Services';
import Anomaly from '../features/anomaly/components/Anomaly';
import Observability from '../features/observability/components/Observability';
import Response from '../features/response/components/Response';
import { useLoadProgress } from '../hooks/useLoadProgress';
import { useScrollMotion } from '../hooks/useScrollMotion';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import portrait from '../assets/mp-chibi.jpg';

/**
 * Routing shell. Maps a URL to a composition of feature sections and owns
 * nothing else — no data fetching, no business logic, no styling of its own.
 */
const Home = () => {
  const { progress, done } = useLoadProgress(portrait);
  useSmoothScroll();
  useScrollMotion();

  return (
    <>
      <a className="skip-link" href="#ingress">
        Skip to content
      </a>
      {/* First in the document and behind everything: the sky the frames sit in. */}
      <StarField />
      <Loader progress={progress} done={done} />
      <Cursor />
      <ScrollProgress />
      <Header />
      <ChapterRail />

      <main>
        <Hero />
        <Gateway />
        <Services />
        <Anomaly />
        <Observability />
        <Response />
      </main>

      <Footer />
    </>
  );
};

export default Home;
