import { DocumentItem, Flashcard, GraphNode } from '../types';

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-raft',
    title: 'Distributed Consensus & Raft Invariants',
    category: 'Distributed Systems',
    tags: ['consensus', 'fault-tolerance', 'protocols', 'invariants'],
    lastModified: '2026-11-07 10:14 UTC',
    revision: 'REV 04.2',
    diffStats: { additions: 38, deletions: 64 },
    rawText: `# Distributed Consensus: Raft Protocol Safety Invariants

Distributed state machines rely on consensus algorithms to remain coherent across unbounded asynchronous network delays and intermittent peer failures. Raft decomposes consensus into three orthogonal subproblems: Leader Election, Log Replication, and Safety Invariants.

## 1. Election Safety & Term Monotonicity
At any given physical instant, at most one leader can be elected per term $\\tau \\in \\mathbb{N}$. Candidates increment their local currentTerm counter prior to initiating RequestVote RPCs. If a follower receives a RequestVote message with term $\\tau_{rpc} < \\tau_{local}$, the vote is rejected unconditionally. Followers cast at most one vote per term on a first-come-first-served basis, strictly condition-gated on log completeness.

## 2. Leader Append-Only Invariant
A leader never overwrites or truncates its own log entries; it only appends new entries to its local ledger. Client proposals are translated into entries marked with monotonic index $i$ and current term $\\tau$. Entries remain uncommitted until a majority quorum $\\mathcal{Q}$ of followers have acknowledged disk persistence.

## 3. Log Matching Property
If two distinct logs contain an entry with the exact same index and term:
- They store the identical command payload at index $i$.
- Their logs are strictly identical across all preceding positions from index $1$ to $i-1$.

When a leader sends an AppendEntries RPC, it includes $prevLogIndex$ and $prevLogTerm$. If the recipient follower fails to identify an entry matching both coordinates, it rejects the batch. The leader subsequently decrements $nextIndex$ for that follower until agreement is reached, wiping any uncommitted conflicting suffixes.

## 4. Leader Completeness & State Machine Safety
If a log entry is committed in a given term, that entry will be present in the logs of the leaders for all higher terms. A candidate cannot win an election unless its log is at least as up-to-date as any majority quorum member, preventing historical regressions.

\`\`\`
Quorum Formula: Q = floor(N / 2) + 1
Fault Tolerance: F = floor((N - 1) / 2)
\`\`\`
`,
    synthesizedText: `### Formal Invariant Specification: Raft Protocol

#### 1. Fundamental Safety Invariants
- **Election Uniqueness**: $|\\{ L \\in \\mathcal{P} \\mid \\text{role}(L) = \\text{Leader} \\land \\text{term}(L) = \\tau \\}| \\le 1$
- **Monotonicity**: Local term progression satisfies $\\tau_{t+1} \\ge \\tau_t$ monotonically across all peers.
- **Log Inductive Matching**:
  $$\\forall e_1, e_2 \\in \\mathcal{L}: (e_1.i = e_2.i \\land e_1.\\tau = e_2.\\tau) \\implies (e_1.cmd = e_2.cmd \\land \\mathcal{L}_1[1..i] = \\mathcal{L}_2[1..i])$$

#### 2. Quorum Boundary Constraints
Let system peer set be $\\mathcal{P}$ of size $N = |\\mathcal{P}|$. The minimal quorum for safety is:
$$\\mathcal{Q} = \\left\\lfloor \\frac{N}{2} \\right\\rfloor + 1, \\quad F_{\\max} = \\left\\lfloor \\frac{N - 1}{2} \\right\\rfloor$$

#### 3. Operational Directives
1. **Append-Only Preservation**: Leaders reject mutation of pre-existing entries; conflict resolution is strictly follower-side truncation.
2. **Commit Boundary**: An entry is irrevocable once replicated across $\\ge \\mathcal{Q}$ nodes within the leader's current term.`,
  },
  {
    id: 'doc-attention',
    title: 'Transformer Attention & KV Cache Memory Footprint',
    category: 'Deep Learning Systems',
    tags: ['llm-infra', 'memory-bandwidth', 'attention', 'gpu-kernels'],
    lastModified: '2026-11-06 22:45 UTC',
    revision: 'REV 02.8',
    diffStats: { additions: 24, deletions: 41 },
    rawText: `# KV Cache Memory Footprint and Computational Scaling in Decoder Transformers

Autoregressive inference in Large Language Models is fundamentally memory-bandwidth bound rather than arithmetic-throughput bound during the generation phase. While the prefill phase processes the prompt in parallel with high compute intensity, token-by-token decoding requires streaming gigabytes of Key-Value (KV) cache tensors from High Bandwidth Memory (HBM) to SRAM for every newly generated token.

## 1. KV Cache Tensor Geometry
For a standard Multi-Head Attention (MHA) decoder with $L$ layers, sequence length $S$, batch size $B$, number of attention heads $H$, and head dimension $d_{head}$:

$$\\text{Size}_{KV} = 2 \\times B \\times S \\times L \\times H \\times d_{head} \\times \\text{sizeof}(dtype)$$

For a 70B parameter model with $L=80$, $H=64$, $d_{head}=128$, running at batch size $B=16$ with FP16 precision ($2$ bytes) over an $8192$ token context:
$$\\text{Size}_{KV} = 2 \\times 16 \\times 8192 \\times 80 \\times 64 \\times 128 \\times 2 \\approx 343.6 \\text{ GB}$$

This dramatically exceeds the total VRAM of standard 80GB accelerator nodes, mandating aggressive architectural mitigations.

## 2. Multi-Query Attention (MQA) & Grouped-Query Attention (GQA)
- Multi-Query Attention shares a single Key-Value head across all $H$ Query heads, reducing KV memory by a factor of $H$.
- Grouped-Query Attention defines $G$ groups where $1 < G < H$. With $G=8$ and $H=64$, KV cache requirement drops by $8\\times$ with negligible perplexity degradation.

## 3. PagedAttention & Continuous Batching
Standard contiguous memory allocation suffers up to 60-80% memory waste due to internal and external fragmentation and reservation for maximum generation length. PagedAttention maps virtual tokens to physical blocks in non-contiguous HBM pages, eliminating fragmentation and enabling zero-copy prefix sharing.
`,
    synthesizedText: `### Architectural Analysis: KV Cache Scaling & Latency Optimization

#### 1. Core Invariant: Memory Bandwidth Bottleneck
The token generation decoding phase exhibits arithmetic intensity $\\ll 1$ FLOP/byte. Performance is governed by the Roofline model:
$$\\text{Decoding Latency} \\propto \\frac{\\text{Weight Footprint} + \\text{KV Cache Volume}}{\\text{HBM Memory Bandwidth}}$$

#### 2. KV Compression Matrix
- **Standard MHA**: Overhead $O(2 \\cdot B \\cdot S \\cdot L \\cdot H \\cdot d)$
- **GQA Ratio**: Compresses cache footprints by factor $H / G$ (e.g. $8\\times$ reduction at $G=8$)
- **PagedAllocation**: Eliminates dynamic pre-allocation reservations, reclaiming up to 70% uncommitted VRAM.`,
  },
  {
    id: 'doc-quantum',
    title: 'Quantum Decoherence & Surface Code Error Correction',
    category: 'Quantum Computing',
    tags: ['quantum-info', 'surface-code', 'syndrome-extraction', 'physics'],
    lastModified: '2026-11-05 18:20 UTC',
    revision: 'REV 05.0',
    diffStats: { additions: 19, deletions: 33 },
    rawText: `# Quantum Decoherence and Topological Fault Tolerance via 2D Surface Codes

Physical quantum bits (qubits) suffer from environmental noise through relaxation ($T_1$) and dephasing ($T_2$). Because quantum states cannot be cloned (No-Cloning Theorem) and direct projective measurement destroys coherent superpositions, quantum error correction must detect errors non-destructively through ancilla syndrome extraction.

## 1. Stabilizer Formalism
An $[[n, k, d]]$ stabilizer code protects $k$ logical qubits using $n$ physical qubits with code distance $d$. The code space is defined as the joint $+1$ eigenspace of an abelian subgroup $\\mathcal{S} \\subset \\mathcal{G}_n$ of the Pauli group:
$$\\mathcal{S} = \\langle S_1, S_2, \\dots, S_{n-k} \\rangle, \\quad -I \\notin \\mathcal{S}$$

## 2. 2D Surface Code Geometry
Physical qubits reside on the vertices and edges of a 2D planar square lattice:
- Data qubits: store the entangled superposition.
- Star Operators (X-stabilizers): measure vertex parity $A_s = \\prod_{j \\in star(s)} X_j$.
- Plaquette Operators (Z-stabilizers): measure face parity $B_p = \\prod_{j \\in boundary(p)} Z_j$.

When a bit-flip ($X$) or phase-flip ($Z$) occurs on a data qubit, adjacent stabilizer measurements yield eigenvalues $-1$, flagging the topological endpoints of an error chain.

## 3. Threshold Theorem & Minimum-Weight Perfect Matching (MWPM)
The fault-tolerance threshold for the rotated surface code is approximately $1\\%$. Provided physical gate error rates satisfy $p < p_{th}$, logical error probability decays exponentially with code distance:
$$P_L \\approx C \\left( \\frac{p}{p_{th}} \\right)^{(d+1)/2}$$
`,
  },
  {
    id: 'doc-neuro',
    title: 'Neurobiology of Long-Term Potentiation & Synaptic Consolidation',
    category: 'Cognitive Neuroscience',
    tags: ['neuroscience', 'memory-retention', 'synaptic-plasticity', 'cognition'],
    lastModified: '2026-11-04 14:10 UTC',
    revision: 'REV 01.9',
    diffStats: { additions: 15, deletions: 28 },
    rawText: `# Cellular Mechanisms of Long-Term Potentiation and Memory Consolidation

Long-Term Potentiation (LTP) in the CA1 pyramidal neurons of the mammalian hippocampus represents the primary synaptic substrate for declarative memory encoding and persistence. 

## 1. Induction Phase: NMDA Receptor Coincidence Detection
Under resting membrane potentials ($-70\\text{ mV}$), the ionotropic NMDA (N-methyl-D-aspartate) receptor pore is electrostatically blocked by extracellular Magnesium ions ($Mg^{2+}$). High-frequency presynaptic glutamate release activates adjacent AMPA receptors, inducing local membrane depolarization. When the dendritic spine depolarizes beyond $-30\\text{ mV}$, $Mg^{2+}$ is expelled, permitting an influx of Calcium ($Ca^{2+}$) ions into the post-synaptic density.

## 2. Early-LTP vs. Late-LTP (Protein Synthesis Dependency)
- **Early-LTP (E-LTP)**: Lasts 1 to 3 hours. Driven by $Ca^{2+}$-dependent CaMKII autophosphorylation, promoting the exocytosis and phosphorylation of GluA1-containing AMPA receptors to increase post-synaptic sensitivity.
- **Late-LTP (L-LTP)**: Persists for days to months. Requires retrograde messengers, adenylyl cyclase activation, and cAMP-dependent PKA signaling to phosphorylate CREB (cAMP response element-binding protein) in the cell nucleus, initiating transcriptional cascades for new dendritic spine architecture.

## 3. Systems Consolidation & Spaced Retrieval Practice
Immediate hippocampal memories are labile. Spaced reactivation during slow-wave sleep and effortful active recall drives the progressive transfer of mnemonic representations to associative neocortical ensembles.
`,
  },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    documentId: 'doc-raft',
    question: 'What is the Election Safety invariant in the Raft consensus protocol?',
    answer: 'At most one leader can be elected per term τ. Followers only cast one vote per term on a first-come, first-served basis, strictly condition-gated on log completeness.',
    category: 'Distributed Systems',
    tags: ['consensus', 'invariants'],
    masteryLevel: 'mastered',
    lastStudied: 'Today',
    repetitions: 4,
  },
  {
    id: 'fc-2',
    documentId: 'doc-raft',
    question: 'How does Raft guarantee that a newly elected leader contains all previously committed entries?',
    answer: 'Via the Election Restriction: a candidate can only receive a majority quorum of votes if its log is at least as up-to-date as the voters log in terms of (lastLogTerm, lastLogIndex).',
    category: 'Distributed Systems',
    tags: ['fault-tolerance', 'protocols'],
    masteryLevel: 'review',
    lastStudied: 'Yesterday',
    repetitions: 2,
  },
  {
    id: 'fc-3',
    documentId: 'doc-attention',
    question: 'Why is LLM autoregressive token decoding memory-bandwidth bound rather than compute bound?',
    answer: 'During decoding, tokens are generated one by one. For each token, the GPU must stream the entire KV cache and model weights from HBM to SRAM, resulting in an arithmetic intensity << 1 FLOP/byte.',
    category: 'Deep Learning',
    tags: ['llm-infra', 'memory-bandwidth'],
    masteryLevel: 'mastered',
    lastStudied: '2 days ago',
    repetitions: 5,
  },
  {
    id: 'fc-4',
    documentId: 'doc-attention',
    question: 'How does Grouped-Query Attention (GQA) reduce KV cache memory without sacrificing model expressivity?',
    answer: 'GQA groups multiple Query heads (e.g. 8 query heads) to share a single Key-Value head, compressing the KV cache volume by H/G (e.g., 8x) while preserving full query representation capacity.',
    category: 'Deep Learning',
    tags: ['attention', 'gpu-kernels'],
    masteryLevel: 'new',
    repetitions: 0,
  },
  {
    id: 'fc-5',
    documentId: 'doc-quantum',
    question: 'What is the role of ancilla qubits in the 2D surface code stabilizer formalism?',
    answer: 'Ancilla qubits extract parity syndromes (X-star and Z-plaquette operators) without measuring data qubits directly, preserving coherent superposition while detecting error chain endpoints.',
    category: 'Quantum Computing',
    tags: ['surface-code', 'syndrome-extraction'],
    masteryLevel: 'review',
    lastStudied: '3 days ago',
    repetitions: 1,
  },
  {
    id: 'fc-6',
    documentId: 'doc-neuro',
    question: 'What molecular mechanism makes the NMDA receptor a biological "coincidence detector"?',
    answer: 'The magnesium (Mg2+) block at resting potential: NMDA channels only open when presynaptic glutamate binding coincides with strong postsynaptic depolarization that expels the Mg2+ ion.',
    category: 'Neuroscience',
    tags: ['synaptic-plasticity', 'memory-retention'],
    masteryLevel: 'mastered',
    lastStudied: 'Today',
    repetitions: 6,
  },
];

export const INITIAL_GRAPH_NODES: GraphNode[] = [
  { id: 'node-raft', label: 'Raft Consensus', category: 'Distributed', x: 280, y: 140, documentId: 'doc-raft', connections: ['node-quorum', 'node-term', 'node-log'] },
  { id: 'node-quorum', label: 'Quorum Invariants', category: 'Distributed', x: 160, y: 270, documentId: 'doc-raft', connections: ['node-raft', 'node-fault'] },
  { id: 'node-term', label: 'Monotonic Terms', category: 'Distributed', x: 380, y: 260, documentId: 'doc-raft', connections: ['node-raft'] },
  { id: 'node-log', label: 'Log Replication', category: 'Distributed', x: 260, y: 390, documentId: 'doc-raft', connections: ['node-raft'] },
  { id: 'node-fault', label: 'Byzantine / Crash Resilience', category: 'Distributed', x: 90, y: 400, documentId: 'doc-raft', connections: ['node-quorum'] },
  
  { id: 'node-attn', label: 'KV Cache Architecture', category: 'Deep Learning', x: 620, y: 150, documentId: 'doc-attention', connections: ['node-gqa', 'node-paged', 'node-hbm'] },
  { id: 'node-gqa', label: 'Grouped-Query Attention', category: 'Deep Learning', x: 540, y: 290, documentId: 'doc-attention', connections: ['node-attn'] },
  { id: 'node-paged', label: 'PagedAttention', category: 'Deep Learning', x: 740, y: 280, documentId: 'doc-attention', connections: ['node-attn'] },
  { id: 'node-hbm', label: 'HBM Bandwidth Saturation', category: 'Deep Learning', x: 660, y: 410, documentId: 'doc-attention', connections: ['node-attn'] },

  { id: 'node-quantum', label: 'Surface Code Topology', category: 'Quantum', x: 960, y: 180, documentId: 'doc-quantum', connections: ['node-stabilizer', 'node-mwpm'] },
  { id: 'node-stabilizer', label: 'Pauli Stabilizers', category: 'Quantum', x: 880, y: 320, documentId: 'doc-quantum', connections: ['node-quantum'] },
  { id: 'node-mwpm', label: 'MWPM Syndrome Decoding', category: 'Quantum', x: 1040, y: 340, documentId: 'doc-quantum', connections: ['node-quantum'] },

  { id: 'node-neuro', label: 'Long-Term Potentiation', category: 'Neuroscience', x: 420, y: 520, documentId: 'doc-neuro', connections: ['node-nmda', 'node-retrieval'] },
  { id: 'node-nmda', label: 'NMDA Coincidence Gating', category: 'Neuroscience', x: 280, y: 620, documentId: 'doc-neuro', connections: ['node-neuro'] },
  { id: 'node-retrieval', label: 'Spaced Retrieval Consolidation', category: 'Neuroscience', x: 580, y: 630, documentId: 'doc-neuro', connections: ['node-neuro', 'node-gqa'] },
];
