/**
 * E-Commerce platform — rendered from docs/diagrams/ecommerce.excalidraw.
 *
 * Composition follows the excalidraw-diagram doctrine, which is what changed the
 * figure: only three containers exist (client, gateway, broker); the six services
 * are dot + free-floating text, so hierarchy comes from type size instead of six
 * identical boxes. One accent, on the broker and the event it publishes.
 *
 * The .excalidraw file is the editable source. This component is its SVG twin:
 * Excalidraw bakes its hand-drawn wobble into path geometry at build time, while
 * here it is a displacement filter applied to shapes only — text stays crisp.
 * The renderer that ships with the skill cannot run offline (it imports the
 * Excalidraw module graph from esm.sh inside headless Chromium), so the scene is
 * mirrored by hand rather than rasterised.
 */
const SERVICES = ['Identity', 'Catalogue', 'Cart', 'Order', 'Payment', 'Notification'];

const FIRST_Y = 118;
const STEP = 54;
const dotY = (i: number) => FIRST_Y + i * STEP;

const TEXT = { fontFamily: 'var(--font-mono)', fill: 'var(--dg-ink)' } as const;

const EcommerceDiagram = () => (
  <svg
    className="diagram"
    viewBox="0 0 780 460"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby="dg-ecom-title dg-ecom-desc"
  >
    <title id="dg-ecom-title">Distributed e-commerce platform</title>
    <desc id="dg-ecom-desc">
      A client reaches an Ocelot gateway that fronts six .NET services. The order service publishes
      an order-created event to RabbitMQ, which the payment and notification services consume and
      which returns payment completion to the order service.
    </desc>

    <defs>
      <filter id="dg-ecom-sketch" x="-3%" y="-3%" width="106%" height="106%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="1.3" />
      </filter>
      <marker id="dg-ecom-arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
        <polygon points="0 0, 9 3.5, 0 7" fill="var(--dg-muted)" />
      </marker>
      <marker id="dg-ecom-accent" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
        <polygon points="0 0, 9 3.5, 0 7" fill="var(--dg-accent)" />
      </marker>
    </defs>

    {/* shapes wobble; text never enters the filtered group */}
    <g filter="url(#dg-ecom-sketch)">
      <ellipse cx="88" cy="258" rx="48" ry="26" fill="none" stroke="var(--dg-muted)" strokeWidth="2" />

      <rect x="188" y="224" width="128" height="68" rx="8" fill="var(--dg-node-fill)" stroke="var(--dg-muted)" strokeWidth="2" />

      {/* the service spine: structure through a line, not six boxes */}
      <line x1="396" y1="118" x2="396" y2="406" stroke="var(--dg-rule)" strokeWidth="2" />
      {SERVICES.map((name, i) => (
        <circle
          key={name}
          cx="396"
          cy={dotY(i)}
          r="5"
          fill={name === 'Order' ? 'var(--dg-accent)' : 'var(--dg-muted)'}
        />
      ))}

      <rect x="588" y="196" width="156" height="92" rx="8" fill="var(--dg-node-accent)" stroke="var(--dg-accent)" strokeWidth="3" />
    </g>

    {/* connectors, drawn under the labels */}
    <line x1="140" y1="258" x2="184" y2="258" stroke="var(--dg-muted)" strokeWidth="2" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="320" y1="258" x2="392" y2="258" stroke="var(--dg-muted)" strokeWidth="2" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="486" y1="289" x2="582" y2="289" stroke="var(--dg-accent)" strokeWidth="3" markerEnd="url(#dg-ecom-accent)" />
    <line x1="582" y1="304" x2="540" y2="304" stroke="var(--dg-muted)" strokeWidth="2" strokeDasharray="5,4" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="582" y1="335" x2="540" y2="335" stroke="var(--dg-muted)" strokeWidth="2" strokeDasharray="5,4" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="582" y1="389" x2="540" y2="389" stroke="var(--dg-muted)" strokeWidth="2" strokeDasharray="5,4" markerEnd="url(#dg-ecom-arrow)" />

    {/* labels */}
    <text x="88" y="264" {...TEXT} fontSize="15" textAnchor="middle">
      client
    </text>
    <text x="252" y="264" {...TEXT} fontSize="15" textAnchor="middle">
      Ocelot
    </text>

    {SERVICES.map((name, i) => (
      <text key={name} x="416" y={dotY(i) + 6} {...TEXT} fontSize="15">
        {name}
      </text>
    ))}

    <text x="666" y="240" fontSize="19" fontFamily="var(--font-mono)" fill="var(--dg-accent)" textAnchor="middle">
      RabbitMQ
    </text>
    <text x="486" y="281" fontSize="11" fontFamily="var(--font-mono)" fill="var(--dg-accent)">
      order.created
    </text>
  </svg>
);

export default EcommerceDiagram;
