import { PROFILE } from '../../config/content';
import { useClock } from '../../hooks/useClock';

const Footer = () => {
  const clock = useClock(7);

  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <span>
          {PROFILE.name} · {PROFILE.location}
        </span>
        <span>
          {clock} {PROFILE.timezone} · built by hand
        </span>
      </div>
    </footer>
  );
};

export default Footer;
