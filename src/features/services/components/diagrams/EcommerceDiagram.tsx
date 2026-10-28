/**
 * E-Commerce platform — composition follows the excalidraw-diagram doctrine.
 *
 * Source of truth for content: docs/diagrams/ecommerce-full.excalidraw (the
 * detailed scene, corrected against the code). Source of truth for layout: the
 * doctrine's two rules — default to no container, and build hierarchy from type
 * size instead of identical boxes. Only three containers survive: client,
 * gateway, broker. The six services are a dot + text list on a spine, each with
 * its own datastore, so "polyglot persistence" is visible without six more boxes.
 *
 * Corrections applied to the original scene, verified in the repo:
 *   Stripe            → PayOS          (Program.cs: IPaymentGateway → PayOSGateway)
 *   MassTransit       → custom bus     (BuildingBlocks/ECommerce.EventBus, no MassTransit csproj)
 *   Serilog/Seq/Jaeger→ OTLP exporter  (ServiceDefaults/Extensions.cs: UseOtlpExporter)
 *   PaymentProcessed  → PaymentCompletedEvent (published by PaymentService, consumed by Order + Notification)
 *   rate limiting/caching dropped      (ocelot.json declares routes + Bearer auth only)
 */
const SERVICES: Array<[name: string, store: string]> = [
  ['Identity', 'PostgreSQL'],
  ['Catalogue', 'MongoDB Atlas'],
  ['Cart', 'Redis Cloud'],
  ['Order', 'PostgreSQL'],
  ['Payment', 'PostgreSQL · PayOS'],
  ['Notification', 'MongoDB Atlas'],
];

const FIRST_Y = 118;
const STEP = 54;
const dotY = (i: number) => FIRST_Y + i * STEP;

const EcommerceDiagram = () => (
  <svg
    className="diagram"
    viewBox="0 0 780 470"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby="dg-ecom-title dg-ecom-desc"
  >
    <title id="dg-ecom-title">Distributed e-commerce platform</title>
    <desc id="dg-ecom-desc">
      A client reaches an Ocelot gateway that fronts six .NET services, each owning its own
      datastore. The order service publishes an order-created event to RabbitMQ; payment and
      notification consume it, and payment completion returns to the order service.
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

    {/* shapes wobble; text stays outside the filtered group */}
    <g filter="url(#dg-ecom-sketch)">
      <ellipse cx="88" cy="258" rx="48" ry="26" fill="none" stroke="var(--dg-muted)" strokeWidth="2" />
      <rect x="188" y="224" width="128" height="68" rx="8" fill="var(--dg-node-fill)" stroke="var(--dg-muted)" strokeWidth="2" />

      {/* the service spine: structure through a line, not six boxes */}
      <line x1="396" y1={FIRST_Y - 16} x2="396" y2={dotY(5) + 16} stroke="var(--dg-rule)" strokeWidth="2" />
      {SERVICES.map(([name], i) => (
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

    <line x1="140" y1="258" x2="184" y2="258" stroke="var(--dg-muted)" strokeWidth="2" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="320" y1="258" x2="392" y2="258" stroke="var(--dg-muted)" strokeWidth="2" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="486" y1="289" x2="582" y2="289" stroke="var(--dg-accent)" strokeWidth="3" markerEnd="url(#dg-ecom-accent)" />
    <line x1="582" y1="304" x2="540" y2="304" stroke="var(--dg-muted)" strokeWidth="2" strokeDasharray="5,4" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="582" y1="335" x2="540" y2="335" stroke="var(--dg-muted)" strokeWidth="2" strokeDasharray="5,4" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="582" y1="389" x2="540" y2="389" stroke="var(--dg-muted)" strokeWidth="2" strokeDasharray="5,4" markerEnd="url(#dg-ecom-arrow)" />

    <text x="88" y="264" fontFamily="var(--font-mono)" fontSize="15" fill="var(--dg-ink)" textAnchor="middle">
      client
    </text>
    <text x="252" y="264" fontFamily="var(--font-mono)" fontSize="15" fill="var(--dg-ink)" textAnchor="middle">
      Ocelot
    </text>

    {SERVICES.map(([name, store], i) => (
      <g key={name}>
        <text x="416" y={dotY(i) + 2} fontFamily="var(--font-mono)" fontSize="15" fill="var(--dg-ink)">
          {name}
        </text>
        <text x="416" y={dotY(i) + 17} fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-soft)">
          {store}
        </text>
      </g>
    ))}

    <text x="666" y="240" fontFamily="var(--font-mono)" fontSize="19" fill="var(--dg-accent)" textAnchor="middle">
      RabbitMQ
    </text>
    <text x="486" y="281" fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-accent)">
      order.created
    </text>
  </svg>
);

export default EcommerceDiagram;
