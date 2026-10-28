/**
 * RAG learning assistant — two paths, one store. Drawn from the source:
 *   DAL/Services/DocumentProcessingWorker.cs  polls approved pending docs → download →
 *                                             extract → chunk → batch embed → save vectors
 *   BLL/Services/ChatService.cs               credit + ownership → embed question →
 *                                             pgvector top-5 → context + history → completion
 *   BLL/Services/PayOSService.cs              payment is PayOS; docs/*.drawio still says
 *                                             VNPay and is stale — the code wins
 *
 * The figure's claim: ingestion writes the vector store off the request path, the
 * chat path only reads it. The store is the join, so it carries the accent.
 */
const LABEL = {
  fill: 'var(--dg-muted)',
  fontSize: 9,
  fontFamily: 'var(--font-mono)',
  textAnchor: 'middle' as const,
  letterSpacing: '0.08em',
};

const TAG = { fontSize: 8, fontFamily: 'var(--font-mono)', textAnchor: 'middle' as const, letterSpacing: '0.08em' };

const RagDiagram = () => (
  <svg
    className="diagram"
    viewBox="0 0 840 480"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby="dg-rag-title dg-rag-desc"
  >
    <title id="dg-rag-title">RAG learning assistant: ingestion and retrieval</title>
    <desc id="dg-rag-desc">
      A background worker turns uploaded documents into vectors in Postgres with pgvector. The chat
      path embeds a student question, reads the top five vectors back as context, then asks the
      language model for an answer.
    </desc>

    <defs>
      <pattern id="dg-rag-dots" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.9" fill="var(--dg-dot)" />
      </pattern>
      <marker id="dg-rag-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="var(--dg-muted)" />
      </marker>
      <marker id="dg-rag-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="var(--dg-accent)" />
      </marker>
    </defs>

    <rect width="840" height="480" fill="url(#dg-rag-dots)" opacity="0.5" />

    {/* zones */}
    <rect x="24" y="36" width="496" height="180" rx="8" fill="var(--dg-zone-fill)" stroke="var(--dg-zone-stroke)" strokeWidth="0.8" />
    <rect x="44" y="40" width="196" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="142" y="49" fill="var(--dg-soft)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle" letterSpacing="0.14em">
      INGESTION · OFF THE REQUEST PATH
    </text>

    <rect x="24" y="256" width="496" height="180" rx="8" fill="var(--dg-zone-fill)" stroke="var(--dg-zone-stroke)" strokeWidth="0.8" />
    <rect x="44" y="260" width="184" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="136" y="269" fill="var(--dg-soft)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle" letterSpacing="0.14em">
      ANSWER · ON THE REQUEST PATH
    </text>

    {/* arrows */}
    <line x1="168" y1="124" x2="208" y2="124" stroke="var(--dg-muted)" strokeWidth="1.2" markerEnd="url(#dg-rag-arrow)" />
    <line x1="336" y1="124" x2="376" y2="124" stroke="var(--dg-muted)" strokeWidth="1" strokeDasharray="4,3" markerEnd="url(#dg-rag-arrow)" />

    <path
      d="M 504,124 H 540 Q 548,124 548,132 V 208 Q 548,216 556,216 H 576"
      fill="none"
      stroke="var(--dg-muted)"
      strokeWidth="1.2"
      markerEnd="url(#dg-rag-arrow)"
    />

    <line x1="168" y1="344" x2="208" y2="344" stroke="var(--dg-muted)" strokeWidth="1.2" markerEnd="url(#dg-rag-arrow)" />

    <path
      d="M 336,324 H 528 Q 536,324 536,316 V 248 Q 536,240 544,240 H 576"
      fill="none"
      stroke="var(--dg-accent)"
      strokeWidth="1.4"
      markerEnd="url(#dg-rag-accent)"
    />

    <path
      d="M 576,264 H 564 Q 556,264 556,272 V 356 Q 556,364 548,364 H 336"
      fill="none"
      stroke="var(--dg-muted)"
      strokeWidth="1"
      strokeDasharray="4,3"
      markerEnd="url(#dg-rag-arrow)"
    />

    <line x1="336" y1="344" x2="376" y2="344" stroke="var(--dg-muted)" strokeWidth="1.2" markerEnd="url(#dg-rag-arrow)" />

    {/* the answer returns under the lane, never through it */}
    <path
      d="M 440,376 V 404 Q 440,412 432,412 H 112 Q 104,412 104,404 V 382"
      fill="none"
      stroke="var(--dg-muted)"
      strokeWidth="1"
      strokeDasharray="4,3"
      markerEnd="url(#dg-rag-arrow)"
    />

    {/* labels */}
    <rect x="170" y="104" width="36" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="188" y="113" {...LABEL}>PUT</text>

    <rect x="338" y="104" width="36" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="356" y="113" {...LABEL}>POLL</text>

    <rect x="462" y="170" width="78" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="501" y="179" {...LABEL} letterSpacing="0.06em">CHUNK · EMBED</text>

    <rect x="170" y="324" width="36" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="188" y="333" {...LABEL}>ASK</text>

    <rect x="478" y="278" width="50" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="503" y="287" {...LABEL} fill="var(--dg-accent)" letterSpacing="0.06em">TOP-5</text>

    <rect x="490" y="300" width="58" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="519" y="309" {...LABEL} letterSpacing="0.06em">CONTEXT</text>

    <rect x="338" y="324" width="52" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="364" y="333" {...LABEL} letterSpacing="0.06em">PROMPT</text>

    <rect x="196" y="422" width="68" height="12" rx="2" fill="var(--dg-mask)" />
    <text x="230" y="431" {...LABEL} letterSpacing="0.06em">ANSWER</text>

    {/* ingestion nodes */}
    <g>
      <rect x="40" y="92" width="128" height="64" rx="6" fill="var(--dg-mask)" />
      <rect x="40" y="92" width="128" height="64" rx="6" fill="var(--dg-node-ext)" stroke="var(--dg-stroke-ext)" strokeWidth="1" />
      <rect x="48" y="100" width="26" height="12" rx="2" fill="none" stroke="var(--dg-stroke-ext)" strokeWidth="0.8" />
      <text x="61" y="109" fill="var(--dg-soft)" {...TAG}>LECT</text>
      <text x="104" y="132" fill="var(--dg-ink)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)" textAnchor="middle">PDF / DOCX</text>
      <text x="104" y="148" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">approved first</text>
    </g>

    <g>
      <rect x="208" y="92" width="128" height="64" rx="6" fill="var(--dg-mask)" />
      <rect x="208" y="92" width="128" height="64" rx="6" fill="var(--dg-node-cloud)" stroke="var(--dg-stroke-cloud)" strokeWidth="1" />
      <rect x="216" y="100" width="30" height="12" rx="2" fill="none" stroke="var(--dg-stroke-cloud)" strokeWidth="0.8" />
      <text x="231" y="109" fill="var(--dg-soft)" {...TAG}>CLOUD</text>
      <text x="272" y="132" fill="var(--dg-ink)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)" textAnchor="middle">Supabase</text>
      <text x="272" y="148" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">object storage</text>
    </g>

    <g>
      <rect x="376" y="92" width="128" height="64" rx="6" fill="var(--dg-mask)" />
      <rect x="376" y="92" width="128" height="64" rx="6" fill="var(--dg-node-fill)" stroke="var(--dg-stroke)" strokeWidth="1" />
      <text x="440" y="120" fill="var(--dg-ink)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)" textAnchor="middle">Worker</text>
      <text x="440" y="136" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">background</text>
      <text x="440" y="150" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">service</text>
    </g>

    {/* answer-path nodes */}
    <g>
      <rect x="40" y="312" width="128" height="64" rx="6" fill="var(--dg-mask)" />
      <rect x="40" y="312" width="128" height="64" rx="6" fill="var(--dg-node-ext)" stroke="var(--dg-stroke-ext)" strokeWidth="1" />
      <rect x="48" y="320" width="26" height="12" rx="2" fill="none" stroke="var(--dg-stroke-ext)" strokeWidth="0.8" />
      <text x="61" y="329" fill="var(--dg-soft)" {...TAG}>STUD</text>
      <text x="104" y="352" fill="var(--dg-ink)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)" textAnchor="middle">Student</text>
      <text x="104" y="368" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">signalr</text>
    </g>

    <g>
      <rect x="208" y="312" width="128" height="64" rx="6" fill="var(--dg-mask)" />
      <rect x="208" y="312" width="128" height="64" rx="6" fill="var(--dg-node-fill)" stroke="var(--dg-stroke)" strokeWidth="1" />
      <text x="272" y="340" fill="var(--dg-ink)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)" textAnchor="middle">ChatService</text>
      <text x="272" y="356" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">credit · owner</text>
      <text x="272" y="370" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">history</text>
    </g>

    <g>
      <rect x="376" y="312" width="128" height="64" rx="6" fill="var(--dg-mask)" />
      <rect x="376" y="312" width="128" height="64" rx="6" fill="var(--dg-node-cloud)" stroke="var(--dg-stroke-cloud)" strokeWidth="1" />
      <rect x="384" y="320" width="26" height="12" rx="2" fill="none" stroke="var(--dg-stroke-cloud)" strokeWidth="0.8" />
      <text x="397" y="329" fill="var(--dg-soft)" {...TAG}>EXT</text>
      <text x="440" y="352" fill="var(--dg-ink)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)" textAnchor="middle">Chat model</text>
      <text x="440" y="368" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">openai-compat</text>
    </g>

    {/* the shared store — the one focal node */}
    <rect x="576" y="150" width="200" height="130" rx="6" fill="var(--dg-mask)" />
    <rect x="576" y="150" width="200" height="130" rx="6" fill="var(--dg-node-accent)" stroke="var(--dg-accent)" strokeWidth="1" />
    <rect x="584" y="158" width="34" height="12" rx="2" fill="none" stroke="var(--dg-accent)" strokeWidth="0.8" />
    <text x="601" y="167" fill="var(--dg-accent)" {...TAG}>STORE</text>
    <text x="676" y="200" fill="var(--dg-accent)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)" textAnchor="middle">Postgres</text>
    <text x="676" y="216" fill="var(--dg-accent)" fontSize="13" fontWeight="600" fontFamily="var(--font-display)" textAnchor="middle">pgvector</text>
    <text x="676" y="236" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">1536-d chunks</text>
    <text x="676" y="256" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">written once</text>
    <text x="676" y="270" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">read per turn</text>

    {/* legend */}
    <line x1="24" y1="452" x2="816" y2="452" stroke="var(--dg-rule)" strokeWidth="0.8" />
    <text x="24" y="472" fill="var(--dg-soft)" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="0.18em">LEGEND</text>

    <rect x="104" y="464" width="14" height="10" rx="2" fill="var(--dg-node-accent)" stroke="var(--dg-accent)" strokeWidth="1" />
    <text x="124" y="472" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">Shared store</text>

    <rect x="232" y="464" width="14" height="10" rx="2" fill="var(--dg-node-fill)" stroke="var(--dg-stroke)" strokeWidth="1" />
    <text x="252" y="472" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">Application</text>

    <rect x="352" y="464" width="14" height="10" rx="2" fill="var(--dg-node-cloud)" stroke="var(--dg-stroke-cloud)" strokeWidth="1" />
    <text x="372" y="472" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">Managed / external</text>

    <line x1="500" y1="469" x2="528" y2="469" stroke="var(--dg-accent)" strokeWidth="1.4" markerEnd="url(#dg-rag-accent)" />
    <text x="536" y="472" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">Request-path read</text>

    <line x1="676" y1="469" x2="704" y2="469" stroke="var(--dg-muted)" strokeWidth="1" strokeDasharray="4,3" markerEnd="url(#dg-rag-arrow)" />
    <text x="712" y="472" fill="var(--dg-muted)" fontSize="10" fontFamily="var(--font-display)">Background / return</text>
  </svg>
);

export default RagDiagram;
