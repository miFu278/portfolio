import { UI_VARIANTS } from '../../config/ui';
import type { UIVariant } from '../../types';

const VariantTag = ({ current }: { current: UIVariant }) => (
  <div className="variant-tag" role="group" aria-label="UI variant">
    <span>ui</span>
    {(Object.keys(UI_VARIANTS) as UIVariant[]).map((id) => (
      <a
        key={id}
        href={`?ui=${id}`}
        data-active={current === id}
        title={UI_VARIANTS[id].tagline}
        aria-current={current === id ? 'true' : undefined}
      >
        {id}
      </a>
    ))}
  </div>
);

export default VariantTag;
