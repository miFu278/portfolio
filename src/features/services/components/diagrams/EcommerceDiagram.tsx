/**
 * E-Commerce platform topology — drawn from the source, not the README.
 *   ApiGateway/ocelot.*.json        one gateway, bearer auth on protected routes
 *   ECommerce.AppHost/Program.cs    6 services, gRPC endpoints, per-service connections
 *   docker/docker-compose.yml       one RabbitMQ queue per consuming service
 *   BuildingBlocks/…/EventBus       OrderCreatedEvent → Payment + Notification,
 *                                   PaymentCompletedEvent → Order + Notification
 *
 * Inlined, not <img src>.svg: an img-referenced SVG renders in static mode with
 * no external resource loading, so it would drop Archivo and JetBrains Mono.
 * viewBox is 840 wide so it renders 1:1 inside the project card; a wider box
 * would shrink the 8px labels below anything else on the page.
 */
const SERVICES = [
  ['Identity', 'users · postgres'],
  ['Product catalogue', 'mongo atlas'],
  ['Shopping cart', 'redis cloud'],
  ['Order', 'postgres · saga'],
  ['Payment', 'payos · postgres'],
  ['Notification', 'mongo atlas'],
];

const NODE_X = 332;
const NODE_W = 180;
const NODE_H = 48;
const STEP = 62;
const FIRST_Y = 64;

const nodeY = (i: number) => FIRST_Y + i * STEP;
const nodeMid = (i: number) => nodeY(i) + NODE_H / 2;

const LABEL = {
  fill: 'var(--dg-muted)',
  fontSize: 9,
  fontFamily: 'var(--font-mono)',
  textAnchor: 'middle' as const,
  letterSpacing: '0.08em',
};

const EcommerceDiagram = () => (
  <svg
    className="diagram"
    viewBox="0 0 840 520"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby="dg-ecom-title dg-ecom-desc"
  >
    <title id="dg-ecom-title">Distributed e-commerce platform</title>
    <desc id="dg-ecom-desc">
      A client reaches an Ocelot gateway that routes into six .NET services. The order service
      publishes an order-created event to RabbitMQ, which payment and notification consume;
      payment completion returns to the order service.
    </desc>

    <defs>
      <pattern id="dg-ecom-dots" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.9" fill="var(--dg-dot)" />
      </pattern>
      <marker id="dg-ecom-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="var(--dg-muted)" />
      </marker>
      <marker id="dg-ecom-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="var(--dg-accent)" />
      </marker>
    </defs>

    <rect width="840" height="520" fill="url(#dg-ecom-dots)" opacity="0.5" />

    {/* zone first (bg → zones → arrows → nodes) */}
    <rect x="316" y="36" width="212" height="396" rx="8" fill="var(--dg-zone-fill)" stroke="var(--dg-zone-stroke)" strokeWidth="0.8" />
    <rect x="356" y="40" width="132" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="422" y="49" fill="var(--dg-soft)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle" letterSpacing="0.14em">
      SIX SERVICES · .NET
    </text>

    {/* arrows */}
    <line x1="128" y1="212" x2="160" y2="212" stroke="var(--dg-muted)" strokeWidth="1.2" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="292" y1="212" x2="312" y2="212" stroke="var(--dg-muted)" strokeWidth="1.2" markerEnd="url(#dg-ecom-arrow)" />

    <line x1="516" y1={nodeMid(3) - 6} x2="560" y2={nodeMid(3) - 6} stroke="var(--dg-accent)" strokeWidth="1.4" markerEnd="url(#dg-ecom-accent)" />
    <line x1="560" y1={nodeMid(3) + 6} x2="516" y2={nodeMid(3) + 6} stroke="var(--dg-muted)" strokeWidth="1" strokeDasharray="4,3" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="560" y1={nodeMid(4)} x2="516" y2={nodeMid(4)} stroke="var(--dg-muted)" strokeWidth="1" strokeDasharray="4,3" markerEnd="url(#dg-ecom-arrow)" />
    <line x1="560" y1={nodeMid(5)} x2="516" y2={nodeMid(5)} stroke="var(--dg-muted)" strokeWidth="1" strokeDasharray="4,3" markerEnd="url(#dg-ecom-arrow)" />

    {/* labels: mask, then 8px above the stroke */}
    <rect x="506" y={nodeMid(3) - 30} width="64" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="538" y={nodeMid(3) - 21} {...LABEL} fill="var(--dg-accent)" letterSpacing="0.06em">
      PUBLISH
    </text>
    <rect x="506" y={nodeMid(3) + 14} width="58" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="535" y={nodeMid(3) + 23} {...LABEL} letterSpacing="0.06em">
      RETURN
    </text>
    <rect x="506" y={nodeMid(4) - 24} width="62" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="537" y={nodeMid(4) - 15} {...LABEL} letterSpacing="0.06em">
      CONSUME
    </text>

    {/* client */}
    <rect x="24" y="180" width="104" height="64" rx="6" fill="var(--dg-mask)" />
    <rect x="24" y="180" width="104" height="64" rx="6" fill="var(--dg-node-ext)" stroke="var(--dg-stroke-ext)" strokeWidth="1" />
    <rect x="32" y="188" width="26" height="12" rx="2" fill="none" stroke="var(--dg-stroke-ext)" strokeWidth="0.8" />
    <text x="45" y="197" fill="var(--dg-soft)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle" letterSpacing="0.08em">EXT</text>
    <text x="76" y="216" fill="var(--dg-ink)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)" textAnchor="middle">Client</text>
    <text x="76" y="232" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">https</text>

    {/* gateway */}
    <rect x="160" y="180" width="132" height="64" rx="6" fill="var(--dg-mask)" />
    <rect x="160" y="180" width="132" height="64" rx="6" fill="var(--dg-node-cloud)" stroke="var(--dg-stroke-cloud)" strokeWidth="1" />
    <rect x="168" y="188" width="30" height="12" rx="2" fill="none" stroke="var(--dg-stroke-cloud)" strokeWidth="0.8" />
    <text x="183" y="197" fill="var(--dg-soft)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle" letterSpacing="0.08em">EDGE</text>
    <text x="226" y="216" fill="var(--dg-ink)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)" textAnchor="middle">Ocelot</text>
    <text x="226" y="232" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">routing · jwt</text>

    {/* six services */}
    {SERVICES.map(([name, sub], i) => (
      <g key={name}>
        <rect x={NODE_X} y={nodeY(i)} width={NODE_W} height={NODE_H} rx="6" fill="var(--dg-mask)" />
        <rect x={NODE_X} y={nodeY(i)} width={NODE_W} height={NODE_H} rx="6" fill="var(--dg-node-fill)" stroke="var(--dg-stroke)" strokeWidth="1" />
        <text x={NODE_X + 14} y={nodeY(i) + 21} fill="var(--dg-ink)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)">{name}</text>
        <text x={NODE_X + 14} y={nodeY(i) + 36} fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)">{sub}</text>
      </g>
    ))}

    {/* broker — the single focal node */}
    <rect x="560" y="64" width="80" height="368" rx="6" fill="var(--dg-mask)" />
    <rect x="560" y="64" width="80" height="368" rx="6" fill="var(--dg-node-accent)" stroke="var(--dg-accent)" strokeWidth="1" />
    <text x="600" y="240" fill="var(--dg-accent)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)" textAnchor="middle">Rabbit</text>
    <text x="600" y="256" fill="var(--dg-accent)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)" textAnchor="middle">MQ</text>
    <text x="600" y="276" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">1 queue</text>
    <text x="600" y="290" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">per svc</text>

    {/* data plane as annotation, keeping the node budget at nine */}
    <line x1="664" y1="64" x2="664" y2="432" stroke="var(--dg-rule)" strokeWidth="0.8" />
    <text x="682" y="72" fill="var(--dg-soft)" fontSize="8" fontFamily="var(--font-mono)" letterSpacing="0.14em">DATA PLANE</text>
    <text x="682" y="94" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">One schema per service.</text>
    <text x="682" y="112" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">No shared tables, no</text>
    <text x="682" y="130" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">cross-service joins —</text>
    <text x="682" y="148" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">consistency is the</text>
    <text x="682" y="166" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">queue's job.</text>
    <text x="682" y="196" fill="var(--dg-soft)" fontSize="9" fontFamily="var(--font-mono)">Supabase PG × 3</text>
    <text x="682" y="212" fill="var(--dg-soft)" fontSize="9" fontFamily="var(--font-mono)">Mongo Atlas × 2</text>
    <text x="682" y="228" fill="var(--dg-soft)" fontSize="9" fontFamily="var(--font-mono)">Redis Cloud × 1</text>
    <text x="682" y="258" fill="var(--dg-soft)" fontSize="8" fontFamily="var(--font-mono)" letterSpacing="0.14em">SYNC</text>
    <text x="682" y="276" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">gRPC between</text>
    <text x="682" y="294" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">services, omitted</text>
    <text x="682" y="312" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">here to keep the</text>
    <text x="682" y="330" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">figure readable.</text>

    {/* legend */}
    <line x1="24" y1="456" x2="816" y2="456" stroke="var(--dg-rule)" strokeWidth="0.8" />
    <text x="24" y="476" fill="var(--dg-soft)" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="0.18em">LEGEND</text>

    <rect x="104" y="468" width="14" height="10" rx="2" fill="var(--dg-node-accent)" stroke="var(--dg-accent)" strokeWidth="1" />
    <text x="124" y="476" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">Integration point</text>

    <rect x="252" y="468" width="14" height="10" rx="2" fill="var(--dg-node-fill)" stroke="var(--dg-stroke)" strokeWidth="1" />
    <text x="272" y="476" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">Service</text>

    <line x1="352" y1="473" x2="380" y2="473" stroke="var(--dg-accent)" strokeWidth="1.4" markerEnd="url(#dg-ecom-accent)" />
    <text x="388" y="476" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">Event published</text>

    <line x1="508" y1="473" x2="536" y2="473" stroke="var(--dg-muted)" strokeWidth="1" strokeDasharray="4,3" markerEnd="url(#dg-ecom-arrow)" />
    <text x="544" y="476" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">Async / consumed</text>
  </svg>
);

export default EcommerceDiagram;
