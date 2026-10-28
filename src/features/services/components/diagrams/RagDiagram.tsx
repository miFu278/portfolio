/**
 * RAG learning assistant — same skeleton as the e-commerce figure, so the two
 * cards read as one system of drawings: entry on the left, the store as the one
 * hero container on the right, everything between them carried by type.
 *
 * Content verified in PRN222_ASM:
 *   DAL/Services/DocumentProcessingWorker.cs  polls approved docs → download →
 *                                            extract → chunk → batch embed → vectors
 *   BLL/Services/ChatService.cs              credit + ownership → embed question →
 *                                            pgvector top-5 → context → completion
 *   BLL/Services/PayOSService.cs             payment is PayOS (docs/*.drawio is stale)
 */
const RagDiagram = () => (
  <svg
    className="diagram"
    viewBox="0 0 780 420"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby="dg-rag-title dg-rag-desc"
  >
    <title id="dg-rag-title">RAG learning assistant</title>
    <desc id="dg-rag-desc">
      Ingestion turns approved documents into vectors in the background. A student question goes
      through the chat service, which reads the top five vectors as context and answers through a
      chat model.
    </desc>

    <defs>
      <filter id="dg-rag-sketch" x="-3%" y="-3%" width="106%" height="106%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="11" />
        <feDisplacementMap in="SourceGraphic" scale="1.3" />
      </filter>
      <marker id="dg-rag-arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
        <polygon points="0 0, 9 3.5, 0 7" fill="var(--dg-muted)" />
      </marker>
      <marker id="dg-rag-accent" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
        <polygon points="0 0, 9 3.5, 0 7" fill="var(--dg-accent)" />
      </marker>
    </defs>

    {/* shapes only — text never enters the filtered group */}
    <g filter="url(#dg-rag-sketch)">
      <ellipse cx="95" cy="106" rx="55" ry="26" fill="none" stroke="var(--dg-muted)" strokeWidth="2" />
      <ellipse cx="95" cy="326" rx="55" ry="26" fill="none" stroke="var(--dg-muted)" strokeWidth="2" />
      <rect x="588" y="186" width="150" height="100" rx="8" fill="var(--dg-node-accent)" stroke="var(--dg-accent)" strokeWidth="3" />
    </g>

    {/* ingestion chain */}
    <line x1="152" y1="106" x2="176" y2="106" stroke="var(--dg-muted)" strokeWidth="2" markerEnd="url(#dg-rag-arrow)" />
    <line x1="340" y1="106" x2="374" y2="106" stroke="var(--dg-muted)" strokeWidth="2" strokeDasharray="5,4" markerEnd="url(#dg-rag-arrow)" />
    <path
      d="M 540,106 H 566 Q 574,106 574,114 V 178 Q 574,186 582,186 H 588"
      fill="none"
      stroke="var(--dg-muted)"
      strokeWidth="2"
      markerEnd="url(#dg-rag-arrow)"
    />

    {/* answer chain */}
    <line x1="152" y1="326" x2="176" y2="326" stroke="var(--dg-muted)" strokeWidth="2" markerEnd="url(#dg-rag-arrow)" />
    <line x1="298" y1="326" x2="334" y2="326" stroke="var(--dg-muted)" strokeWidth="2" markerEnd="url(#dg-rag-arrow)" />

    {/* the store is read on the request path — the one accent */}
    <path
      d="M 240,312 V 262 Q 240,254 248,254 H 588"
      fill="none"
      stroke="var(--dg-accent)"
      strokeWidth="3"
      markerEnd="url(#dg-rag-accent)"
    />
    {/* and its context goes to the model */}
    <path
      d="M 663,286 V 296 Q 663,304 655,304 H 408 Q 400,304 400,312 V 318"
      fill="none"
      stroke="var(--dg-muted)"
      strokeWidth="2"
      strokeDasharray="5,4"
      markerEnd="url(#dg-rag-arrow)"
    />

    {/* labels */}
    <text x="95" y="112" fontFamily="var(--font-mono)" fontSize="15" fill="var(--dg-ink)" textAnchor="middle">
      PDF / DOCX
    </text>

    <text x="182" y="102" fontFamily="var(--font-mono)" fontSize="15" fill="var(--dg-ink)">
      Supabase Storage
    </text>
    <text x="182" y="117" fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-soft)">
      object bucket
    </text>

    <text x="380" y="102" fontFamily="var(--font-mono)" fontSize="15" fill="var(--dg-ink)">
      Worker
    </text>
    <text x="380" y="117" fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-soft)">
      extract · chunk · embed
    </text>

    <text x="95" y="332" fontFamily="var(--font-mono)" fontSize="15" fill="var(--dg-ink)" textAnchor="middle">
      student
    </text>

    <text x="182" y="322" fontFamily="var(--font-mono)" fontSize="15" fill="var(--dg-ink)">
      ChatService
    </text>
    <text x="182" y="337" fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-soft)">
      credit · ownership
    </text>

    <text x="340" y="322" fontFamily="var(--font-mono)" fontSize="15" fill="var(--dg-ink)">
      Chat model
    </text>
    <text x="340" y="337" fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-soft)">
      openai-compatible
    </text>
    <text x="400" y="366" fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-soft)" textAnchor="middle">
      context
    </text>

    <text x="663" y="228" fontFamily="var(--font-mono)" fontSize="19" fill="var(--dg-accent)" textAnchor="middle">
      pgvector
    </text>
    <text x="663" y="246" fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-soft)" textAnchor="middle">
      1536-d chunks
    </text>
    <text x="663" y="262" fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-soft)" textAnchor="middle">
      read per turn
    </text>

    <text x="252" y="246" fontFamily="var(--font-mono)" fontSize="10" fill="var(--dg-accent)">
      top-5
    </text>
  </svg>
);

export default RagDiagram;
