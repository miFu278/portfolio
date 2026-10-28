/**
 * E-Commerce platform — FULL content, compact composition.
 *
 * Content is the corrected docs/diagrams/ecommerce-full.excalidraw: clients →
 * Ocelot gateway → six services (each with its own role and datastore) → event
 * bus → observability. The original scene is 1950×1150; scaled to a ~760px card
 * that puts 13px labels at 5px. So the same content is re-laid as a 3×2 grid —
 * nothing dropped, only re-flowed.
 *
 * Corrections carried over from the code, verified in the repo:
 *   Stripe            → PayOS            (IPaymentGateway : PayOSGateway)
 *   MassTransit       → custom IEventBus (no MassTransit csproj anywhere)
 *   Serilog/Seq/Jaeger→ OTLP exporter    (ServiceDefaults: UseOtlpExporter)
 *   PaymentProcessed  → PaymentCompletedEvent
 *   rate limiting/caching dropped        (ocelot.json: routes + Bearer only)
 *   Orders · Saga and Cart · Coupon dropped: neither is in the code
 */
type Service = { name: string; role: string; store: string };

const SERVICES: Service[] = [
  { name: 'Identity', role: 'auth · profile', store: 'PostgreSQL' },
  { name: 'Product catalogue', role: 'products · search', store: 'MongoDB Atlas' },
  { name: 'Shopping cart', role: 'cart', store: 'Redis Cloud' },
  { name: 'Order', role: 'orders · choreography', store: 'PostgreSQL' },
  { name: 'Payment', role: 'PayOS · webhook', store: 'PostgreSQL' },
  { name: 'Notification', role: 'email · SMS', store: 'MongoDB Atlas' },
];

const COLS = [40, 286, 532];
const ROWS = [168, 272];
const CARD_W = 232;
const CARD_H = 92;

const CARD = { fill: 'var(--dg-node-fill)', stroke: 'var(--dg-rule)' } as const;

const EcommerceDiagram = () => (
  <svg
    className="diagram"
    viewBox="0 0 780 540"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby="dg-ecom-title dg-ecom-desc"
  >
    <title id="dg-ecom-title">Distributed e-commerce platform</title>
    <desc id="dg-ecom-desc">
      Web and mobile clients reach an Ocelot gateway fronting six .NET services, each owning its
      own datastore. The order service publishes an order-created event onto RabbitMQ through a
      hand-written event bus; payment completes and returns. All services export OpenTelemetry
      traces over OTLP.
    </desc>

    <defs>
      <filter id="dg-ecom-sketch" x="-3%" y="-3%" width="106%" height="106%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="1.2" />
      </filter>
      <marker id="dg-ecom-arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
        <polygon points="0 0, 9 3.5, 0 7" fill="var(--dg-muted)" />
      </marker>
      <marker id="dg-ecom-accent" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
        <polygon points="0 0, 9 3.5, 0 7" fill="var(--dg-accent)" />
      </marker>
    </defs>

    <g filter="url(#dg-ecom-sketch)">
      <rect x="40" y="28" width="700" height="44" rx="8" fill="var(--dg-node-ext)" stroke="var(--dg-stroke-ext)" strokeWidth="1.5" />
      <rect x="40" y="92" width="700" height="52" rx="8" fill="var(--dg-node-cloud)" stroke="var(--dg-stroke-cloud)" strokeWidth="1.5" />

      {SERVICES.map((s, i) => (
        <rect
          key={s.name}
          x={COLS[i % 3]}
          y={ROWS[Math.floor(i / 3)]}
          width={CARD_W}
          height={CARD_H}
          rx="8"
          fill={CARD.fill}
          stroke={CARD.stroke}
          strokeWidth="1.5"
        />
      ))}

      <rect x="40" y="392" width="700" height="56" rx="8" fill="var(--dg-node-accent)" stroke="var(--dg-accent)" strokeWidth="3" />
      <rect x="40" y="468" width="700" height="44" rx="8" fill="var(--dg-node-fill)" stroke="var(--dg-rule)" strokeWidth="1.5" />
    </g>

    {/* connectors */}
    <line x1="390" y1="72" x2="390" y2="88" stroke="var(--dg-muted)" strokeWidth="2" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="390" y1="144" x2="390" y2="164" stroke="var(--dg-muted)" strokeWidth="2" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="390" y1="364" x2="390" y2="388" stroke="var(--dg-accent)" strokeWidth="3" markerEnd="url(#dg-ecom-accent)" />
    <path
      d="M 650,364 H 760 V 482 Q 760,490 752,490 H 742"
      fill="none"
      stroke="var(--dg-muted)"
      strokeWidth="2"
      strokeDasharray="5,4"
      markerEnd="url(#dg-ecom-arrow)"
    />

    {/* clients */}
    <text x="60" y="56" fontFamily="var(--font-mono)" fontSize="14" fill="var(--dg-ink)">
      clients
    </text>
    <text x="160" y="56" fontFamily="var(--font-mono)" fontSize="11" fill="var(--dg-soft)">
      web app · mobile app
    </text>

    {/* gateway */}
    <text x="60" y="114" fontFamily="var(--font-mono)" fontSize="15" fill="var(--dg-ink)">
      Ocelot gateway
    </text>
    <text x="60" y="132" fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-soft)">
      routing · JWT auth
    </text>

    {/* six services */}
    {SERVICES.map((s, i) => {
      const x = COLS[i % 3] + 16;
      const y = ROWS[Math.floor(i / 3)];
      return (
        <g key={s.name}>
          <text x={x} y={y + 28} fontFamily="var(--font-mono)" fontSize="14" fill="var(--dg-ink)">
            {s.name}
          </text>
          <text x={x} y={y + 48} fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-soft)">
            {s.role}
          </text>
          <text x={x} y={y + 72} fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-muted)">
            {s.store}
          </text>
        </g>
      );
    })}

    {/* event bus — the one accent */}
    <text x="60" y="416" fontFamily="var(--font-mono)" fontSize="15" fill="var(--dg-accent)">
      RabbitMQ · event bus
    </text>
    <text x="60" y="434" fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-soft)">
      hand-written IEventBus · one queue per consumer
    </text>

    {/* observability */}
    <text x="60" y="490" fontFamily="var(--font-mono)" fontSize="13" fill="var(--dg-ink)">
      observability
    </text>
    <text x="176" y="490" fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-soft)">
      OpenTelemetry → OTLP exporter
    </text>
  </svg>
);

export default EcommerceDiagram;
