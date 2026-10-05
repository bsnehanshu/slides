window.DIAGRAMS = {};
const D = window.DIAGRAMS;
// Story C: Claude in Australia and New Zealand, from silicon to invoice (L300–400).
// Render: bash .claude/skills/excalidraw-story-deck/scripts/excalidraw/render.sh tools/diagrams.js diagrams

// C0. Overview ---------------------------------------------------------------
D["c0-overview"] = () => {
  const s = new Scene();
  s.header(-30, -170, "Claude in ANZ, end to end", "From the training cluster to a prompt typed in Sydney. Dashed = not published by AWS or Anthropic.");
  s.zone("zt", -30, -60, 380, 250, "Training · not in your Region", { color: C.purple });
  s.card("train", 0, 0, "Training", "AWS Trainium2 (Project Rainier)\nGoogle TPUs · NVIDIA GPUs", { w: 320, h: 130, color: C.purple });
  s.box("w", 410, 25, "Claude weights\n(a checkpoint)", { shape: "ellipse", w: 240, h: 120, color: C.yellow, fs: 20 });
  s.zone("zb", 700, -60, 830, 600, "Amazon Bedrock · ANZ Regions (Sydney · Melbourne · Auckland)", { color: C.orange });
  s.card("dep", 730, 0, "Model deployment account", "one per model provider, per Region\nowned by Bedrock · Anthropic has no access", { w: 360, h: 130, color: C.orange, bfs: 15 });
  s.card("fleet", 1140, 0, "Serving fleet", "accelerators with weights\n+ KV cache in HBM\nprefill, then decode token by token", { w: 360, h: 130, color: C.green, bfs: 15 });
  s.card("ep", 1140, 330, "bedrock-runtime.ap-southeast-2", "IAM · Guardrails · inference profile\n(in-region, au., global.)", { w: 360, h: 130, color: C.blue, bfs: 15 });
  s.zone("zy", -30, 280, 700, 260, "Your AWS account · ap-southeast-2", { color: C.blue });
  s.card("gov", 0, 340, "Stays in Sydney", "CloudTrail · CloudWatch\ninvocation logs · your bill", { w: 290, h: 130, color: C.gray, bfs: 15 });
  s.card("app", 340, 340, "Your app · Claude Code", "SigV4-signed\nConverse or InvokeModel", { w: 300, h: 130, color: C.blue, bfs: 15 });
  s.arrow("train", "r", "w", "l", { label: "1" });
  s.arrow("w", "r", "dep", "l", { dashed: true, label: "2" });
  s.arrow("dep", "r", "fleet", "l", { label: "3" });
  s.arrow("app", "r", "ep", "l", { ta: 0.5, tb: 0.5, label: "4 · prompt" });
  s.arrow("ep", "t", "fleet", "b", { both: true, label: "5 · tokens" });
  s.arrow("app", "l", "gov", "r", { label: "6" });
  s.text(-30, 580, "1 train · 2 ship the checkpoint to each Region · 3 load onto the fleet · 4 your app calls Sydney · 5 tokens stream back · 6 logs and billing stay in your account.\nException: Mythos-class models (e.g. Fable 5) share prompts and outputs with Anthropic for 30 days (see C7a).", { fs: 17, color: C.muted });
  return s;
};

// C1. Training vs serving silicon -------------------------------------------
D["c1-silicon"] = () => {
  const s = new Scene();
  s.header(0, -150, "Where Claude is trained vs where it is served", "Anthropic trains on three chip platforms. A Bedrock request is served on AWS.");
  s.zone("zt", 0, 0, 580, 470, "Training · Anthropic's compute", { color: C.purple });
  s.card("tr1", 30, 60, "AWS Trainium2", "Project Rainier, Indiana (US)\nover 1M Trainium2 chips train and serve Claude", { w: 520, h: 110, color: C.purple, bfs: 15 });
  s.card("tr2", 30, 195, "Google Cloud TPUs", "up to 1M TPUs, over 1 GW, from 2026", { w: 520, h: 110, color: C.purple, bfs: 15 });
  s.card("tr3", 30, 330, "NVIDIA GPUs", "the third platform in Anthropic's mix", { w: 520, h: 110, color: C.purple, bfs: 15 });
  s.zone("zs", 700, 0, 580, 470, "Serving · Claude on Amazon Bedrock", { color: C.green });
  s.card("s1", 730, 60, "AWS Trainium2", "e.g. latency-optimized Claude 3.5 Haiku\nruns on Trainium2 in Bedrock", { w: 520, h: 110, color: C.green, bfs: 15 });
  s.card("s2", 730, 195, "NVIDIA GPU instances", "AWS GPU instances run NVIDIA GPUs\nAWS doesn't say which GPU generation serves Claude", { w: 520, h: 110, color: C.green, bfs: 15 });
  s.card("s3", 730, 330, "AWS Inferentia", "no public link to Claude", { w: 520, h: 110, color: C.gray, bfs: 15, dashed: true });
  s.arrow("zt", "r", "zs", "l", { label: "checkpoint" });
  s.card("hbm", 0, 530, "Memory per accelerator (HBM on the package)", "Trainium2 96 GB · NVIDIA H100 80 GB · H200 141 GB · B200 192 GB\ntrn2.48xlarge: 16 Trainium2 = 1.5 TiB HBM · Trn2 UltraServer: 64 chips = 6 TiB, linked by NeuronLink\np5en.48xlarge: 8 × H200 = 1,128 GB HBM, linked by NVLink", { w: 1280, color: C.yellow, bfs: 16 });
  s.text(0, 720, "Training never happens in ap-southeast-2. Your Region only runs inference.", { fs: 17, color: C.muted });
  return s;
};

// C1a. Accelerator anatomy ----------------------------------------------------
D["c1a-anatomy"] = () => {
  const s = new Scene();
  s.header(0, -150, "Anatomy of one accelerator", "Same layout for NVIDIA GPUs, AWS Trainium and Google TPUs: a compute die ringed by HBM, on one package");
  s.zone("pkg", 0, 0, 900, 540, "One package (what you'd hold in your hand)", { color: C.green });
  s.card("die", 300, 110, "Compute die", "tensor cores / NeuronCores / MXUs\nvector + scalar units\non-chip SRAM: tens of MB", { w: 300, h: 230, color: C.green, bfs: 15 });
  [0, 1, 2].forEach((i) => {
    s.box(`hl${i}`, 50, 95 + i * 90, "HBM stack", { w: 190, h: 70, color: C.blue, fs: 17 });
    s.box(`hr${i}`, 660, 95 + i * 90, "HBM stack", { w: 190, h: 70, color: C.blue, fs: 17 });
    s.arrow(`hl${i}`, "r", "die", "l", { both: true, tb: 0.2 + i * 0.3 });
    s.arrow(`hr${i}`, "l", "die", "r", { both: true, tb: 0.2 + i * 0.3 });
  });
  s.text(245, 62, "TB/s", { fs: 16, color: C.blue[0] });
  s.box("ip", 40, 400, "silicon interposer (TSMC CoWoS) wires die and HBM together", { w: 820, h: 56, color: C.gray, fs: 17 });
  s.text(40, 475, "HBM per package: 32–288 GB · 1.6–8 TB/s (see next slide)", { fs: 16, color: C.muted });
  s.zone("host", 1000, 0, 440, 300, "Host server", { color: C.gray });
  s.card("cpu", 1030, 60, "CPU + server DRAM", "terabytes, but reached over PCIe", { w: 380, h: 100, color: C.gray, bfs: 15 });
  s.card("ssd", 1030, 180, "NVMe SSD", "weights load from here at startup", { w: 380, h: 90, color: C.gray, bfs: 15 });
  s.arrow("die", "t", "cpu", "l", { via: [[450, -30], [960, -30], [960, 110]], label: "PCIe Gen5 x16 ≈ 64 GB/s each way", at: 0.45 });
  s.card("peers", 1000, 360, "Other accelerators", "NVLink (NVIDIA) · NeuronLink (Trainium)\nICI (Google TPU)\nhow one model spans 8–64+ chips", { w: 440, h: 140, color: C.purple, bfs: 15 });
  s.arrow("pkg", "r", "peers", "l", { ta: 0.8, both: true });
  s.card("stack", 0, 600, "Inside one HBM stack", "8–12 DRAM dies stacked on a base die, joined by through-silicon vias.\nMade by SK hynix, Samsung and Micron. It's the most supply-constrained part of the chip.", { w: 1440, color: C.blue, bfs: 16 });
  s.text(0, 760, "Memory ladder, fastest to slowest: on-die SRAM (MBs) → HBM on the package (GBs at TB/s) → host DRAM over PCIe (TBs, ~50–100× slower to reach) → NVMe.\nWeights and the KV cache sit in HBM because decode re-reads them for every token.", { fs: 17, color: C.muted });
  return s;
};

// C1b. Chip lineup -------------------------------------------------------------
D["c1b-chip-lineup"] = () => {
  const s = new Scene();
  s.header(0, -150, "NVIDIA vs Trainium vs Google TPU: memory per chip", "Bar length = HBM capacity per chip. Label = capacity · bandwidth. All three are fabbed by TSMC.");
  const rows = [
    ["NVIDIA", C.green, [["H100", 80, "3.35 TB/s"], ["H200", 141, "4.8 TB/s"], ["B200", 192, "8 TB/s"], ["B300", 288, "8 TB/s"]]],
    ["AWS Trainium", C.orange, [["Trainium2", 96, "2.9 TB/s"], ["Trainium3", 144, "4.9 TB/s"]]],
    ["Google TPU", C.blue, [["TPU v5p", 95, "2.76 TB/s"], ["TPU v6e Trillium", 32, "1.6 TB/s"], ["TPU7x Ironwood", 192, "7.4 TB/s"]]],
  ];
  const X0 = 420, K = 3, RH = 62;
  let y = 0;
  rows.forEach(([vendor, col, chips], vi) => {
    const top = y;
    chips.forEach(([name, gb, bw], i) => {
      s.text(X0 - 20, y + 14, name, { fs: 19, align: "right" });
      s.box(`b${vi}${i}`, X0, y, "", { w: gb * K, h: 46, color: col });
      s.text(X0 + gb * K + 16, y + 12, `${gb} GB · ${bw}`, { fs: 18 });
      y += RH;
    });
    s.text(0, top + (y - top - RH) / 2 + 12, vendor, { fs: 22, color: col[0] });
    y += 30;
  });
  s.line([[X0, -20], [X0, y - 20]], { stroke: C.muted });
  [100, 200, 300].forEach((g) => s.text(X0 + g * K, y - 10, `${g} GB`, { fs: 15, color: C.muted, align: "center" }));
  s.card("how", 0, y + 50, "Who can buy them", "NVIDIA sells to every cloud and on-prem buyer. Trainium only exists inside AWS (EC2, Bedrock).\nTPUs only exist inside Google Cloud. All three run Claude: Trainium2 (Project Rainier), TPUs (up to 1M), NVIDIA GPUs.", { w: 1300, color: C.gray, bfs: 16 });
  return s;
};

// C1c. Market share --------------------------------------------------------------
D["c1c-market-share"] = () => {
  const s = new Scene();
  s.header(0, -150, "Who supplies the parts: market share", "HBM is a three-company market. Accelerators are mostly NVIDIA, with custom chips growing.");
  const K = 12;
  const bar = (id, y, parts) => {
    let x = 0;
    parts.forEach(([name, pct, col, label], i) => {
      s.box(`${id}${i}`, x, y, label || `${name} ${pct}%`, { w: pct * K, h: 80, color: col, fs: pct * K < 230 ? 16 : 20 });
      x += pct * K;
    });
  };
  s.text(0, 0, "HBM revenue share · Q2 2026 (Counterpoint Research)", { fs: 22 });
  bar("hbm", 40, [["SK hynix", 50, C.purple], ["Samsung", 33, C.blue], ["Micron", 17, C.orange, "Micron 18%"]]);
  s.text(0, 135, "SK hynix had 64% a year earlier. Samsung jumped from 21% in Q1 by shipping HBM4 first. Figures round to 101%.", { fs: 16, color: C.muted });
  s.text(0, 230, "Data-center AI accelerator revenue share · 2026 analyst estimates (they vary)", { fs: 22 });
  bar("acc", 270, [["NVIDIA", 78, C.green, "NVIDIA ~75–85%"], ["Custom", 16, C.yellow, "Custom chips\n~15–20%"], ["AMD", 6, C.red, "AMD\n~5–7%"]]);
  s.text(0, 365, "Custom chips = Google TPU (~6–8%), AWS Trainium (~2–3%), Microsoft Maia, Meta MTIA. NVIDIA was ~92% in 2023.", { fs: 16, color: C.muted });
  s.card("why", 0, 450, "Why this matters for a Claude roadmap", "Every accelerator needs HBM, so HBM supply caps how fast anyone can add serving capacity.\nAnthropic runs on all three accelerator families, which hedges against any one supplier running short.", { w: 1200, color: C.gray, bfs: 16 });
  return s;
};

// C1d. One rack, physically ---------------------------------------------------
D["c1d-rack"] = () => {
  const s = new Scene();
  s.header(0, -150, "One rack, physically", "NVIDIA GB200 NVL72, the best-documented AI rack. AWS doesn't publish its Trainium rack layout.");
  s.zone("rack", 0, 0, 440, 900, "Front of the rack", { color: C.gray });
  const units = [
    ["u0", "2 × top-of-rack mgmt switches", 40, C.gray],
    ["u1", "power shelves", 70, C.red],
    ["u2", "10 compute trays", 250, C.green],
    ["u3", "9 NVLink switch trays", 150, C.purple],
    ["u4", "8 compute trays", 200, C.green],
    ["u5", "power shelves", 70, C.red],
  ];
  let y = 50;
  units.forEach(([id, label, h, col]) => { s.box(id, 30, y, label, { w: 380, h, color: col, fs: 18 }); y += h + 12; });
  s.card("tray", 540, 40, "Inside one compute tray", "2 × Grace CPUs + 4 × Blackwell GPUs\n~186 GB HBM3e on each GPU package\nLPDDR5X memory for the CPUs\nNVMe drives · network cards (NICs)", { w: 520, h: 190, color: C.green, align: "left", bfs: 16 });
  s.arrow("u2", "r", "tray", "l", { ta: 0.3 });
  s.card("tot", 540, 280, "Whole rack", "72 GPUs · 36 CPUs\n13.4 TB HBM3e · up to 17 TB CPU memory\nNVLink: 130 TB/s inside the rack (1.8 TB/s per GPU)\n~1.36 tonnes", { w: 520, h: 190, color: C.yellow, align: "left", bfs: 16 });
  s.arrow("u3", "r", "tot", "l", { ta: 0.2, tb: 0.6, dashed: true });
  s.card("pw", 1120, 40, "Power", "~120 kW per rack\na typical enterprise rack is 5–15 kW\nbusbar → power shelves → trays", { w: 400, h: 150, color: C.red, align: "left", bfs: 16 });
  s.card("cool", 1120, 220, "Cooling", "direct liquid cooling: cold plates\non GPUs and CPUs, a coolant\ndistribution unit (CDU) per row", { w: 400, h: 150, color: C.blue, align: "left", bfs: 16 });
  s.card("net", 1120, 400, "Network out of the rack", "scale-out NICs (InfiniBand, Ethernet,\nor EFA on AWS) to other racks\nand to storage", { w: 400, h: 150, color: C.purple, align: "left", bfs: 16 });
  s.card("aws", 540, 620, "The AWS equivalents", "Trn2 UltraServer: 64 Trainium2 chips across 4 servers, 6 TiB HBM, NeuronLink\nTrn3 UltraServer: up to 144 Trainium3 chips, 20.7 TB HBM3e, 706 TB/s\nTrn3 racks pack over 2× the chips of Trn2 racks. Power per rack isn't published.", { w: 980, color: C.orange, align: "left", bfs: 16 });
  return s;
};

// C1e. Serving a Region vs training -------------------------------------------
D["c1e-serve-vs-train"] = () => {
  const s = new Scene();
  s.header(0, -150, "Serving one Region vs training the model", "Same racks, very different shapes of work");
  const col = (id, x, title, color, lines, scale) => {
    s.zone(id, x, 0, 480, 600, title, { color });
    s.card(`${id}a`, x + 25, 60, lines[0][0], lines[0][1], { w: 430, h: 150, color, bfs: 15 });
    s.card(`${id}b`, x + 25, 240, lines[1][0], lines[1][1], { w: 430, h: 150, color, bfs: 15 });
    s.card(`${id}c`, x + 25, 420, lines[2][0], lines[2][1], { w: 430, h: 150, color, bfs: 15 });
  };
  col("inf", 0, "Inference · one Region (e.g. Sydney)", C.green, [
    ["Many independent replicas", "each replica = enough chips to hold\nthe weights + KV cache (a rack or part)\nrequests are spread across them"],
    ["Close to users, across AZs", "latency matters · sized for peak\ntraffic · always on, 24×7"],
    ["Scale: not published", "illustrative: 50 replicas × 120 kW\n≈ 6 MW for one Region"],
  ]);
  col("pre", 530, "Pretraining", C.purple, [
    ["One giant synchronous job", "every chip works on the same model\nand syncs gradients every step"],
    ["One tightly coupled site", "needs the fastest fabric between all chips\nweeks to months · checkpoints to storage"],
    ["Scale: Project Rainier", "~500K Trainium2 in 7 buildings at launch\n30 buildings · 2.2 GW planned · Indiana"],
  ]);
  col("rl", 1060, "RL post-training (RLHF and beyond)", C.orange, [
    ["Generate, score, update", "rollouts (inference-like) → rewards\n(human or AI feedback, tests) → gradient step"],
    ["Mixed hardware pattern", "rollout fleets can be looser;\nthe update step needs a training cluster"],
    ["Scale: large and repeated", "runs again for every model version\nnot published per model"],
  ]);
  s.card("bar", 0, 650, "Order of magnitude", "1 rack ≈ 120 kW  →  one Region's inference fleet: megawatts (illustrative)  →  Project Rainier at full build: 2.2 GW ≈ 18,000 racks' worth of power", { w: 1540, color: C.gray, bfs: 17 });
  s.text(0, 800, "Your ap-southeast-2 traffic only ever touches the left column. Training happens elsewhere and ships a checkpoint (slide C2).", { fs: 17, color: C.muted });
  return s;
};

// C1f. Pretraining data and where safety goes in ---------------------------------
D["c1f-pretraining-data"] = () => {
  const s = new Scene();
  s.header(0, -150, "From raw data to a checkpoint: where safety goes in", "Safety starts before training. Harmful weapons content is filtered out of the data, then values are trained in, then it's tested.");
  const W = 290, G = 40;
  const steps = [
    ["s1", "1 · Collect", "public web: crawler follows\nrobots.txt, skips password-\nand login-gated pages\nlicensed third-party data\nopted-in user data · synthetic", C.gray],
    ["s2", "2 · Clean and filter", "deduplication\nquality classifiers\nCBRN filter: strips chemical,\nbiological, radiological and\nnuclear weapons content", C.red],
    ["s3", "3 · Pretrain", "next-token prediction\non the filtered corpus\none giant job (C1e)", C.purple],
    ["s4", "4 · Post-train", "RLHF + Constitutional AI\nClaude's constitution:\nvalues, character,\nwhen to decline", C.orange],
    ["s5", "5 · Evaluate", "Responsible Scaling Policy\nCBRN, cyber, autonomy evals\n→ which safeguards\nship with the model", C.blue],
  ];
  steps.forEach(([id, t, b, col], i) => s.card(id, i * (W + G), 0, t, b, { w: W, h: 230, color: col, bfs: 15 }));
  for (let i = 1; i < 5; i++) s.arrow(`s${i}`, "r", `s${i + 1}`, "l");
  s.box("ck", 1290, 300, "checkpoint\n+ its classifiers (C3b)", { shape: "ellipse", w: 300, h: 120, color: C.yellow, fs: 18 });
  s.arrow("s5", "b", "ck", "t");
  s.card("cbrn", 0, 300, "What the CBRN filter buys (Anthropic research, Aug 2025)", "A small fine-tuned classifier screened the whole pretraining corpus for weapons content.\nHarmful-knowledge eval (WMDP): 33.7% → 30.8%, where chance is 25%. A third of the above-chance knowledge gone.\nNo significant drop on prose, code, MMLU or natural science. The model never learns what it never saw.", { w: 1230, color: C.red, align: "left", bfs: 16 });
  s.card("not", 0, 500, "Not in this pipeline: your Bedrock traffic", "Bedrock doesn't use prompts or outputs to train any model. Opus, Sonnet, Haiku: nothing is shared with Anthropic.", { w: 1230, color: C.blue, align: "left", bfs: 16 });
  s.text(0, 640, "Sources: Claude system cards (training data), Anthropic Alignment blog \"Pretraining data filtering\" (19 Aug 2025), Anthropic Responsible Scaling Policy.\nNot published: corpus size and mix, and how the research filter is tuned for each production model.", { fs: 16, color: C.muted });
  return s;
};

// C2. How weights land in a Region ------------------------------------------
D["c2-weights-to-region"] = () => {
  const s = new Scene();
  s.header(0, -150, "How the model lands in Sydney, Melbourne and Auckland", "The account model is documented. The transfer itself is not.");
  s.box("w", 0, 240, "Claude weights\n(final checkpoint)", { shape: "ellipse", w: 260, h: 130, color: C.yellow, fs: 20 });
  const regions = [["syd", "Sydney · ap-southeast-2"], ["mel", "Melbourne · ap-southeast-4"], ["akl", "Auckland · ap-southeast-6"]];
  regions.forEach(([id, label], i) => {
    const y = i * 210;
    s.zone(`z${id}`, 420, y, 860, 180, label, { color: C.orange });
    s.card(`${id}d`, 450, y + 50, "Model deployment account", "owned by Bedrock, one per provider", { w: 360, h: 100, color: C.orange, bfs: 15 });
    s.card(`${id}f`, 880, y + 50, "Serving fleet", "weights loaded into HBM", { w: 360, h: 100, color: C.green, bfs: 15 });
    s.arrow("w", "r", `${id}d`, "l", { dashed: true, tb: 0.5 });
    s.arrow(`${id}d`, "r", `${id}f`, "l");
  });
  s.text(0, 400, "dashed = packaging, encryption and\ntransfer between Regions: not published", { fs: 15, color: C.muted });
  s.card("doc", 0, 680, "Documented", "Anthropic can't access the deployment accounts or their logs.\nOpus, Sonnet, Haiku: prompts and outputs aren't\nstored or shared, and aren't used for training.\nMythos-class models (e.g. Fable 5) are the exception.", { w: 620, color: C.blue, align: "left", bfs: 16 });
  s.card("not", 660, 680, "Not published", "how weights are copied between Regions\nhow many replicas each Region runs\nwhich Availability Zones hold them\nwhich chip type serves which model", { w: 620, color: C.gray, align: "left", bfs: 16, dashed: true });
  return s;
};

// C3. Inside one request -----------------------------------------------------
D["c3-inside-a-request"] = () => {
  const s = new Scene();
  s.header(0, -150, "Inside one request: prefill, then decode", "What one accelerator does with a 20,000-token prompt");
  s.card("req", 0, 140, "Your prompt", "20,000 input tokens\nmax_tokens 1,000", { w: 250, h: 120, color: C.gray });
  s.zone("acc", 320, 0, 880, 640, "One accelerator · GPU or Trainium2 chip", { color: C.green });
  s.card("cores", 360, 60, "Compute cores", "GPU SMs or NeuronCores\n+ on-chip SRAM (MBs, not GBs)", { w: 380, h: 120, color: C.green, bfs: 15 });
  s.zone("hbm", 360, 340, 800, 290, "", { color: C.blue, fill: "#e7f5ff" });
  s.text(380, 585, "HBM · 80–192 GB stacked on the same package", { fs: 20, color: C.blue[0] });
  s.card("wt", 390, 410, "Model weights (a shard)", "big models are split across\n8–64 chips (NVLink / NeuronLink)", { w: 350, h: 150, color: C.blue, bfs: 15 });
  s.card("kv", 780, 410, "KV cache", "keys and values for every token,\nevery layer, of every live request\ngrows with context length", { w: 350, h: 150, color: C.yellow, bfs: 15 });
  s.card("out", 1270, 140, "Streamed back", "one token per decode step\n~1,000 steps here", { w: 250, h: 120, color: C.gray });
  s.arrow("req", "r", "cores", "l", { tb: 0.6, label: "1 · prefill" });
  s.arrow("cores", "b", "kv", "t", { ta: 0.85, tb: 0.3, label: "2 · writes KV", at: 0.35 });
  s.arrow("wt", "t", "cores", "b", { ta: 0.4, tb: 0.3, label: "3 · read every step", at: 0.65 });
  s.arrow("cores", "r", "out", "l", { ta: 0.5, tb: 0.4, label: "4 · decode" });
  s.text(0, 690, "Prefill processes all 20,000 tokens in parallel: compute bound.\nDecode makes one token per step and re-reads the weights plus the whole KV cache from HBM each time: memory-bandwidth bound.\nThat's why HBM size and bandwidth (H200 4.8 TB/s, Trainium2 ~2.9 TB/s) decide how many users one chip can serve.", { fs: 17, color: C.muted });
  return s;
};

// C3a. What "memory-constrained" means ------------------------------------------
D["c3a-memory-constrained"] = () => {
  const s = new Scene();
  s.header(0, -150, "\"We're memory-constrained\" doesn't mean the context window", "When AI leaders say it, they mean HBM, in three different ways");
  const W = 470, H = 300;
  s.card("bw", 0, 0, "1 · Bandwidth", "decode re-reads the weights and the\nKV cache from HBM for every token\n\nmore TB/s = more tokens per second\n(H200 4.8 TB/s · Ironwood 7.4 TB/s)\n\nsee C3", { w: W, h: H, color: C.blue, bfs: 16 });
  s.card("cap", 520, 0, "2 · Capacity", "HBM holds weights + KV cache\nKV cache grows with every token of context\n\nfixed GB per chip, so it's a trade:\nlonger context = fewer users at once\n\nsee C5", { w: W, h: H, color: C.yellow, bfs: 16 });
  s.card("sup", 1040, 0, "3 · Supply", "only SK hynix, Samsung, Micron make HBM\nMicron: \"sold out for 2026\"\n\n1 bit of HBM costs ~3 bits of\nordinary DRAM in fab capacity\n\nsee C1c", { w: W, h: H, color: C.red, bfs: 16 });
  s.box("ctx", 520, 400, "the context window", { w: W, h: 80, color: C.gray, fs: 22 });
  s.arrow("cap", "b", "ctx", "t", { label: "is a consequence of", at: 0.5 });
  s.card("q", 0, 540, "Said in public", "Demis Hassabis (Google DeepMind): memory shortages are \"constraining a lot of deployment\".\nIntel's Lip-Bu Tan calls HBM the biggest AI bottleneck.", { w: 1510, color: C.gray, bfs: 16 });
  s.text(0, 690, "One line to remember: the chips aren't short of maths. They're short of fast memory, and the whole world shares three suppliers of it.", { fs: 17, color: C.muted });
  return s;
};

// C4. Prompt caching ---------------------------------------------------------
D["c4-prompt-caching"] = () => {
  const s = new Scene();
  s.header(0, -150, "Prompt caching: where the cache actually lives", "It's the KV cache from slide C3, kept after the request ends. It lives in HBM, not in the compute cores.");
  s.card("turn1", 0, 0, "Turn 1", "50,000-token system prompt + docs\n+ a question", { w: 400, h: 110, color: C.gray });
  s.card("p1", 0, 180, "Full prefill", "all 50,000 tokens computed\ncache write: 1.25× input price (5 min)\nor 2× (1 hour)", { w: 400, h: 130, color: C.red, bfs: 15 });
  s.card("turn2", 860, 0, "Turn 2, three minutes later", "same 50,000-token prefix\n+ a new question", { w: 400, h: 110, color: C.gray });
  s.card("p2", 860, 180, "Short prefill", "only the new tokens are computed\ncache read: 0.05× input on Opus 5.5\n(0.1× on most models)\nfaster time to first token", { w: 400, h: 130, color: C.green, bfs: 15 });
  s.zone("hbm", 0, 390, 1260, 240, "", { color: C.blue, fill: "#e7f5ff" });
  s.text(1240, 585, "Accelerator HBM in the Region that served turn 1", { fs: 20, color: C.blue[0], align: "right" });
  s.card("kv", 330, 450, "Cached prefix (KV tensors)", "kept for the TTL: 5 minutes by default, or 1 hour\nmin 512 tokens per checkpoint on Opus 5.5 and Sonnet 5.5", { w: 600, h: 110, color: C.yellow, bfs: 15 });
  s.arrow("turn1", "b", "p1", "t");
  s.arrow("turn2", "b", "p2", "t");
  s.arrow("p1", "b", "kv", "l", { via: [[200, 505]], label: "write" });
  s.arrow("kv", "r", "p2", "b", { via: [[1060, 505]], label: "read on exact prefix match" });
  s.text(0, 680, "With cross-Region inference, turn 2 can land in a different Region and miss the cache, so expect more cache writes.\nAWS doesn't publish whether cached prefixes also spill to host memory or SSD.\nOpus 5.5 list price: input $4/MTok · cache write $5 (5 min) or $8 (1 h) · cache read $0.20. On au., add ~10%.", { fs: 17, color: C.muted });
  return s;
};

// C3b. Safety classifiers at serving time --------------------------------------------
D["c3b-classifiers"] = () => {
  const s = new Scene();
  s.header(0, -150, "Classifiers run alongside every request", "Training is layer 1. Classifiers are layer 2: they ship with the model and run on every platform, Bedrock included.");
  s.card("p", 0, 60, "Your prompt", "bedrock-runtime\nor mantle", { w: 220, h: 110, color: C.gray, bfs: 15 });
  s.zone("srv", 270, 0, 900, 200, "Around the model · Anthropic-built, runs wherever Claude runs", { color: C.green });
  s.card("ic", 300, 60, "Input classifier", "screens the prompt\nbefore any output", { w: 240, h: 110, color: C.red, bfs: 15 });
  s.card("m", 600, 60, "Claude", "decodes token by token (C3)\ncan also decline in plain text", { w: 260, h: 110, color: C.green, bfs: 15 });
  s.card("oc", 910, 60, "Output classifier", "watches the stream\ncan stop it mid-answer", { w: 230, h: 110, color: C.red, bfs: 15 });
  s.card("app", 1230, 60, "Your app", "reads stop_reason", { w: 220, h: 110, color: C.gray, bfs: 15 });
  s.arrow("p", "r", "ic", "l"); s.arrow("ic", "r", "m", "l"); s.arrow("m", "r", "oc", "l"); s.arrow("oc", "r", "app", "l");
  const out = [
    ["o1", "Answered", "stop_reason: end_turn", C.green],
    ["o2", "Classifier refusal", "HTTP 200, not an error\nstop_reason: refusal\nstop_details.category\ndiscard any partial output", C.red],
    ["o3", "Model declines", "a normal text reply\nno flag set", C.yellow],
    ["o4", "Input rejected", "HTTP 400\nvalidation or copyright", C.gray],
  ];
  out.forEach(([id, t, b, col], i) => s.card(id, i * 370, 260, t, b, { w: 340, h: 150, color: col, bfs: 15 }));
  s.card("cat", 0, 460, "stop_details.category", "cyber · bio · frontier_llm (building competing models) · reasoning_extraction · general_harms (rest of the Usage Policy)\nNo category of its own for chemical, radiological or nuclear: those decline as general_harms, a null category, or in plain text.\nBilled if refused before any output: bio, frontier_llm, reasoning_extraction. Every refusal still counts against your quota.", { w: 1450, color: C.gray, align: "left", bfs: 16 });
  s.card("nuc", 0, 640, "Example: nuclear", "Anthropic and the US NNSA built a classifier that separates concerning from benign nuclear conversations, 96% accurate in testing.\nIt runs in Anthropic's misuse detection (Aug 2025). The point: nuclear energy and medicine questions get through, weapons questions don't.", { w: 1450, color: C.purple, align: "left", bfs: 16 });
  s.text(0, 810, "Models with refusal classifiers: Fable 5.1, Fable 5, Opus 5.5, Opus 5, Sonnet 5.5 (Anthropic refusals and fallback docs, Oct 2026). What to do about a refusal: C6b.", { fs: 16, color: C.muted });
  return s;
};

// C5. Sizing -----------------------------------------------------------------
D["c5-sizing"] = () => {
  const s = new Scene();
  s.header(0, -150, "Sizing: chips, memory, power, money", "Illustrative only. Claude's size isn't published, so this uses a made-up 400B-parameter model at FP8.");
  const W = 400, H = 150, GX = 440, GY = 200;
  const cells = [
    ["m1", "1 · Weights", "400B params × 1 byte (FP8)\n= 400 GB", C.purple],
    ["m2", "2 · Pick a node", "p5en.48xlarge: 8 × H200 = 1,128 GB\ntrn2.48xlarge: 16 × Trainium2 = 1.5 TiB", C.blue],
    ["m3", "3 · Left for KV cache", "1,128 − 400 ≈ 700 GB\n(less runtime overhead)", C.yellow],
    ["m4", "4 · KV per token", "2 × 100 layers × 8 KV heads\n× 128 dims × 1 byte ≈ 205 KB\n200K-token context ≈ 41 GB", C.yellow],
    ["m5", "5 · Power", "8 GPUs × 700 W = 5.6 kW\nwhole node ≈ 10 kW+ (estimate)\nbefore cooling", C.red],
    ["m6", "6 · Money", "p5en.48xlarge on-demand\n≈ $63.30/h (us-east-1)\n≈ $46K/month per node", C.green],
  ];
  cells.forEach(([id, t, b, col], i) => s.card(id, (i % 3) * GX, Math.floor(i / 3) * GY, t, b, { w: W, h: H, color: col, bfs: 15 }));
  s.arrow("m1", "r", "m2", "l"); s.arrow("m2", "r", "m3", "l");
  s.arrow("m3", "b", "m4", "t", { via: [[1080, 175], [200, 175]] });
  s.arrow("m4", "r", "m5", "l"); s.arrow("m5", "r", "m6", "l");
  s.card("so", 0, 420, "So one node holds ~17 full 200K-token sessions at once", "Real fleets run many nodes per Region for capacity and redundancy.\nOn Bedrock you buy tokens, and AWS spreads that fleet cost across all its customers.", { w: 1280, color: C.gray, bfs: 16 });
  return s;
};

// C6. Consuming it -----------------------------------------------------------
D["c6-consume"] = () => {
  const s = new Scene();
  s.header(0, -150, "How customers consume it: APIs and the token meter", "Every call is metered twice: against your quota, and on your bill.");
  s.card("c1", 0, 0, "Your app", "boto3 · Anthropic SDK\n(AnthropicBedrock client)", { w: 320, h: 110, color: C.gray, bfs: 15 });
  s.card("c2", 0, 150, "Claude Code\nClaude Desktop", "Bedrock as the provider", { w: 320, h: 110, color: C.gray, bfs: 15 });
  s.card("rt", 400, 0, "bedrock-runtime", "InvokeModel · InvokeModelWithResponseStream\nConverse · ConverseStream · CountTokens\nMessages · Chat Completions", { w: 440, h: 170, color: C.blue, bfs: 15 });
  s.card("mt", 400, 240, "bedrock-mantle", "Messages · Chat Completions · Responses\nsame SDKs, plus OpenAI-compatible clients\nin-region only", { w: 440, h: 170, color: C.purple, bfs: 15 });
  [1, 2].forEach((i) => s.arrow(`c${i}`, "r", "rt", "l", { tb: i === 1 ? 0.3 : 0.7 }));
  s.card("tok", 940, 0, "Tokens in one call", "input · cache write · cache read · output", { w: 400, h: 110, color: C.yellow, bfs: 15 });
  s.card("quota", 940, 160, "Quota (runtime TPM)", "input + 5 × output (Claude 3.7+)\nmax_tokens reserved at the start\nno RPM limit", { w: 400, h: 130, color: C.red, bfs: 15 });
  s.card("bill", 940, 330, "Bill", "input + output at list price\ncache write 1.25× or 2× · cache read 0.05–0.1×\nau. or in-region ≈ 10% over global.", { w: 400, h: 130, color: C.green, bfs: 15 });
  s.arrow("rt", "r", "tok", "l", { ta: 0.4 });
  s.arrow("tok", "b", "quota", "t"); s.arrow("quota", "b", "bill", "t", { dashed: true, none: true });
  s.text(0, 520, "Throttling comes from the quota, cost comes from the bill. The same 1,000 output tokens burn 5,000 TPM but bill as 1,000.\nBatch jobs go through the bedrock control-plane API instead (CreateModelInvocationJob, input and output files in S3).", { fs: 17, color: C.muted });
  return s;
};

// C7. Residency ---------------------------------------------------------------
D["c7-residency"] = () => {
  const s = new Scene();
  s.header(0, -150, "Data residency: what crosses the AU and NZ border", "Pick the inference profile, then enforce it with IAM and an SCP.");
  s.zone("au", 0, 0, 640, 430, "Australia", { color: C.blue });
  s.card("syd", 40, 60, "Sydney · ap-southeast-2", "your app + bedrock-runtime", { w: 300, h: 100, color: C.blue, bfs: 15 });
  s.card("mel", 40, 280, "Melbourne · ap-southeast-4", "au. destination", { w: 300, h: 100, color: C.blue, bfs: 15 });
  s.zone("nz", 760, 0, 420, 430, "New Zealand", { color: C.teal });
  s.card("akl", 800, 60, "Auckland · ap-southeast-6", "Bedrock since 2026\nau. routes Auckland ↔ Sydney\n↔ Melbourne", { w: 340, h: 130, color: C.teal, bfs: 15 });
  s.zone("gl", 0, 490, 1180, 130, "Rest of the world · global. profile", { color: C.red });
  s.box("anyw", 380, 530, "any supported commercial Region, e.g. Tokyo, Singapore, US", { w: 600, h: 60, color: C.red, fs: 16 });
  s.arrow("syd", "b", "mel", "t", { both: true, label: "au." });
  s.arrow("syd", "r", "akl", "l", { both: true, dashed: true, label: "au.?" });
  s.arrow("syd", "r", "anyw", "t", { ta: 0.8, tb: 0.2, via: [[480, 140], [480, 470]], dashed: true, label: "global.", at: 0.45 });
  s.card("x", 1240, 0, "Crosses the border", "prompt and completion,\nencrypted in transit on the\nAWS network, while processed", { w: 340, h: 140, color: C.red, bfs: 15 });
  s.card("stay", 1240, 170, "Stays in the source Region", "CloudTrail · CloudWatch\ninvocation logs · bill", { w: 340, h: 120, color: C.green, bfs: 15 });
  s.card("none", 1240, 320, "Stored? Depends on the model", "Opus · Sonnet · Haiku: not stored,\nnot shared with Anthropic\nMythos-class (e.g. Fable 5): kept\n30 days by Anthropic", { w: 340, h: 160, color: C.gray, bfs: 15 });
  s.text(0, 660, "Check the real destination list: aws bedrock get-inference-profile --inference-profile-identifier au.anthropic.claude-opus-5-5\nNZ data on au. can be processed in Australia. In-region keeps it in one Region, if the model is offered there.\nEnforce with an IAM condition on bedrock:InferenceProfileArn plus an SCP. Residency is about location; sovereignty (whose law applies) is a question for legal.", { fs: 16, color: C.muted });
  return s;
};

// C7c. Who processes your data ----------------------------------------------------
D["c7c-who-processes"] = () => {
  const s = new Scene();
  s.header(0, -170, "\"Claude on AWS\": four ways, two data processors", "Billing through AWS doesn't mean AWS processes your data. Ask one question: who runs the inference that sees the prompt?");
  s.box("app", 520, -60, "Your company, with an AWS account and AWS bill", { w: 680, h: 64, color: C.gray, fs: 18 });
  const W = 420, G = 20, CW = 380;
  const col = (id, i, title, sub, color, rows) => {
    const x = i * (W + G);
    s.zone(id, x, 60, W, 640, "", { color });
    s.card(`${id}h`, x + 20, 80, title, sub, { w: CW, h: 120, color, tfs: 21, bfs: 14 });
    rows.forEach(([t, b], j) => s.card(`${id}${j}`, x + 20, 225 + j * 155, t, b, { w: CW, h: 135, color: [color[0], "#ffffff"], align: "left", tfs: 18, bfs: 14 }));
  };
  col("bed", 0, "Claude in Amazon Bedrock", "API · bedrock-runtime / mantle\nOpus, Sonnet, Haiku", C.orange, [
    ["Data processor", "AWS, in AWS-operated accounts\nAnthropic: zero operator access"],
    ["Who sees prompts", "only AWS systems\nnot stored, not shared with Anthropic"],
    ["Where it can run", "one Region, au., or global.\nAWS compliance programs apply"],
  ]);
  col("myt", 1, "Bedrock + Mythos-class", "API · e.g. Claude Fable 5\nprovider_data_share", C.yellow, [
    ["Data processor", "AWS"],
    ["Who sees prompts", "AWS, plus a copy to Anthropic\nkept 30 days for safety review"],
    ["Where it can run", "per model card\n(Fable 5.1 regional: us-east-1 only)"],
  ]);
  col("cpa", 2, "Claude Platform on AWS", "API · AWS Marketplace\naws-external-anthropic endpoint", C.purple, [
    ["Data processor", "Anthropic, on Anthropic's terms\nAWS: billing (CCUs) + identity only"],
    ["Who sees prompts", "Anthropic: prompts, outputs, files,\nSkills, batches · Claude API\nretention, ZDR on request"],
    ["Where it can run", "inference_geo: US (1.1×) or Global\nno AU option · workspace Region\nisn't where inference runs"],
  ]);
  col("ent", 3, "Claude Enterprise", "apps for employees · AWS Marketplace\nChat, Cowork, Claude Code", C.blue, [
    ["Data processor", "Anthropic: it's the claude.ai\nproduct, managed at claude.ai\nAWS: billing only"],
    ["Who sees prompts", "Anthropic: chats, files, projects\nretention set by your admins\nZDR by agreement"],
    ["Where it can run", "Anthropic-hosted\ncheck current data residency\noptions before promising AU"],
  ]);
  ["bedh", "myth", "cpah", "enth"].forEach((t, i) => s.arrow("app", "b", t, "t", { ta: 0.1 + i * 0.27 }));
  s.text(0, 740, "AWS processes your data in columns 1–2. Anthropic processes it in columns 3–4, even though all four can show up on the AWS bill.\nWant employees in the Claude apps but data on Bedrock? That's the Claude Desktop on Bedrock pattern in chapter 6.", { fs: 17, color: C.muted });
  return s;
};

// C7a. The sovereignty ladder ------------------------------------------------------
D["c7a-sovereignty-ladder"] = () => {
  const s = new Scene();
  s.header(0, -150, "The sovereignty ladder: which rung does the customer need?", "Each rung keeps more of the AI lifecycle in-country. Most customers need rung 2, not rung 5.");
  const rungs = [
    ["r1", "1 · Data at rest", "S3, logs, knowledge bases stay in ap-southeast-2", "solved by AWS Regions", C.green],
    ["r2", "2 · Processing location", "in-region or au. profile, enforced with IAM + SCP", "available now (C7)", C.green],
    ["r3", "3 · Safety retention location", "Mythos-class models (e.g. Fable 5): 30 days kept by Anthropic\n(Bedrock: provider_data_share, mandatory)", "reported: option to keep it in\nyour own cloud, by end of 2026", C.yellow],
    ["r4", "4 · In-country inference mandate", "law says the model must run in-country", "AU: AI and data-centre rules,\nbills expected early 2027", C.orange],
    ["r5", "5 · Sovereign hosting", "government-cleared fleets or national models\n(e.g. NZ Kererū.ai, India IndiaAI)", "niche, expensive, growing", C.red],
  ];
  rungs.forEach(([id, t, b, status, col], i) => {
    const y = (4 - i) * 130;
    const x = i * 60;
    s.card(id, x, y, t, b, { w: 760, h: 110, color: col, align: "left", bfs: 15 });
    s.text(x + 790, y + 30, status, { fs: 16, color: C.muted });
  });
  for (let i = 0; i < 4; i++) s.arrow(`r${i + 1}`, "t", `r${i + 2}`, "b", { ta: 0.08, tb: 0.04 });
  s.text(0, 680, "Rung 3 sources: Anthropic support doc (effective 9 June 2026), AWS Fable 5 launch post, Bloomberg (20 Aug 2026) on the customer-cloud option.\nThe customer-cloud option isn't published as a policy yet. Don't promise dates or details to customers.", { fs: 16, color: C.muted });
  return s;
};

// C7b. Pool globally vs build in-country ----------------------------------------------
D["c7b-pool-vs-local"] = () => {
  const s = new Scene();
  s.header(0, -150, "Pool globally, or build in-country?", "Economics pulls toward one global pool. Politics pulls toward local fleets.");
  s.zone("eco", 0, 0, 660, 380, "Economics → pool globally", { color: C.green });
  s.card("e1", 30, 60, "Scarce chips go further pooled", "one global fleet absorbs peaks\nfrom every Region at once", { w: 600, h: 120, color: C.green, bfs: 16 });
  s.card("e2", 30, 220, "So global. is the cheapest profile", "geo and in-region cost ~10% more\n(every model since Sonnet 4.5)", { w: 600, h: 120, color: C.green, bfs: 16 });
  s.zone("pol", 760, 0, 660, 380, "Politics → build in-country", { color: C.red });
  s.card("p1", 790, 60, "Australia", "National AI Plan · data-centre capacity\n1,350 MW (2024) → 3,100 MW (2030 forecast)", { w: 600, h: 120, color: C.red, bfs: 16 });
  s.card("p2", 790, 220, "Rest of APJ", "Korea: national AI centre, 15,000 chips by 2028\nIndia: ~34,000 GPUs via IndiaAI · NZ: Kererū.ai", { w: 600, h: 120, color: C.red, bfs: 16 });
  s.text(0, 430, "Where new capacity actually gets built", { fs: 22 });
  s.card("b1", 0, 480, "Hyperscaler Regions", "more AZs and AI capacity\nin existing Regions", { w: 450, h: 120, color: C.orange, bfs: 16 });
  s.card("b2", 485, 480, "Sovereign / neocloud operators", "in-country GPU clouds for\ngovernment and regulated work", { w: 450, h: 120, color: C.purple, bfs: 16 });
  s.card("b3", 970, 480, "Enterprise private AI", "banks and telcos running open\nmodels on their own hardware", { w: 450, h: 120, color: C.gray, bfs: 16 });
  s.text(0, 650, "Our read, not a published forecast: regulated industries and government end up in-country; everyone else rides the global pool.\nHBM scarcity means the biggest Regions get new capacity first, so smaller countries wait longest.", { fs: 17, color: C.muted });
  return s;
};

// C8. Tokens to dollars --------------------------------------------------------
D["c8-tokens-to-dollars"] = () => {
  const s = new Scene();
  s.header(0, -150, "Tokens to dollars: a Sydney team of 1,000", "Claude Opus 5.5 on the au. profile: ~$4.40 per million input tokens, ~$22 per million output (list + ~10% regional)");
  s.card("in", 0, 0, "The workload", "1,000 developers × 50 requests a day\n20,000 input + 1,000 output tokens each\n= 1.0B input + 50M output tokens a day", { w: 480, h: 150, color: C.gray, bfs: 16 });
  s.card("no", 580, -60, "Without caching", "input 1.0B × $4.40/M = $4,400\noutput 50M × $22/M = $1,100\n≈ $5,500 a day ≈ $121K a month (22 days)", { w: 560, h: 150, color: C.red, bfs: 16 });
  s.card("yes", 580, 140, "With caching (80% read, 10% written)", "read 800M × $0.22/M = $176\nwrite 100M × $5.50/M = $550 · rest 100M × $4.40/M = $440\noutput $1,100 → ≈ $2,270 a day ≈ $50K a month", { w: 560, h: 150, color: C.green, bfs: 16 });
  s.arrow("in", "r", "no", "l", { tb: 0.6 }); s.arrow("in", "r", "yes", "l", { tb: 0.4 });
  s.card("q", 0, 360, "Quota to ask for", "50,000 requests over an 8-hour day ≈ 104 per minute\n× (20,000 input + 5 × 1,000 output) ≈ 2.6M TPM on average\nplan 2–3× for peaks, and keep max_tokens tight", { w: 1140, color: C.yellow, bfs: 16 });
  s.text(0, 530, "Cheaper option: Sonnet 5.5 at $2 / $10 is ≈ $2,500 a day uncached, but in Sydney it's on global. only (at launch), so processing can leave Australia.\nEvery number here is an assumption you can swap: tokens × price for the bill, (input + 5 × output) per minute for the quota.", { fs: 17, color: C.muted });
  return s;
};

// C6b. Handling a refusal ------------------------------------------------------------
D["c6b-refusals"] = () => {
  const s = new Scene();
  s.header(0, -150, "Hit a refusal? The category picks the path", "Read stop_details.category, then follow the row. Re-sending the same turn to the same model usually refuses again.");
  const rows = [
    ["cyber", "defensive security: pentesting,\nvuln research, malware analysis", "Cyber Verification Program (CVP)", "the organisation applies to Anthropic with its use case\nif approved, safeguards are adjusted for that organisation", C.blue],
    ["bio", "life-sciences R&D", "Life Sciences Verification Program (LSVP)", "US organisations only today\nre-test first: Fable 5.1 lets medical and textbook questions through", C.green],
    ["chemical · radiological ·\nnuclear · weapons", "nuclear medicine, radiation safety,\nindustrial chemistry, defence", "No verification program", "weapons uplift is a hard line in the Usage Policy\nreword away from weapons detail\nstill blocked? report the false positive to Anthropic", C.red],
    ["frontier_llm ·\nreasoning_extraction", "benign ML work · prompts that ask\nfor reasoning in the output text", "Reword the prompt", "use thinking blocks (display: summarized)\ninstead of a <thinking> section in the answer\nstill blocked? Anthropic support + request ID", C.yellow],
  ];
  rows.forEach(([cat, who, pt, pb, col], i) => {
    const y = i * 150;
    s.card(`c${i}`, 0, y, cat, who, { w: 440, h: 125, color: col, align: "left", tfs: 20, bfs: 15 });
    s.card(`p${i}`, 520, y, pt, pb, { w: 900, h: 125, color: [col[0], "#ffffff"], align: "left", bfs: 16 });
    s.arrow(`c${i}`, "r", `p${i}`, "l");
  });
  s.card("bed", 0, 620, "Fallback on Bedrock: build it client-side", "Server-side fallbacks (\"default\") are Claude API only. On Bedrock, use the Anthropic SDK refusal-fallback middleware or retry on another model yourself.\nSome categories have a recommended fallback model; others don't, and the refusal stands. Reset the conversation before you retry.", { w: 1420, color: C.orange, align: "left", bfs: 16 });
  s.text(0, 780, "Mythos 5.1 (same model as Fable 5.1, looser safeguards) is trusted access that Anthropic grants directly. AWS can't add customers.\nCheck which models and platforms CVP and LSVP cover on Anthropic's pages before you promise a customer a path.", { fs: 16, color: C.muted });
  return s;
};

// C6a. Model lineup ------------------------------------------------------------
D["c6a-model-lineup"] = () => {
  const s = new Scene();
  s.header(0, -150, "The Claude lineup on Bedrock today (Oct 2026)", "Price per million input / output tokens · context window · what you can call from Sydney");
  const rows = [
    ["fab", "Claude Fable 5.1", "$10 / $50 · 1M context", "global. (regional only in us-east-1)\nMythos-class family: check data retention first", C.red],
    ["opu", "Claude Opus 5.5", "$4 / $20 · 1M context · Sep 2026", "au. and global.\nanthropic.claude-opus-5-5 · cache reads 5% of input", C.purple],
    ["son", "Claude Sonnet 5.5", "$2 / $10 · 1M context · Sep 2026", "global. only, at launch\nanthropic.claude-sonnet-5-5 · best speed for the price", C.blue],
    ["hai", "Claude Haiku 4.5", "$1 / $5 · 200K context", "au. and global.\nfastest and cheapest", C.green],
  ];
  rows.forEach(([id, name, price, where, col], i) => {
    const y = i * 150;
    s.card(id, 0, y, name, price, { w: 520, h: 120, color: col, align: "left", tfs: 24, bfs: 17 });
    s.card(id + "w", 560, y, "From Sydney", where, { w: 760, h: 120, color: [col[0], "#ffffff"], align: "left", bfs: 17 });
  });
  s.text(0, 620, "No date suffix on the new IDs. Add au. or global. for cross-Region inference on bedrock-runtime; mantle takes the bare ID, in-region only.\nRegional (au., in-region) costs ~10% more than global. Availability changes fast: check the Bedrock model card before you quote a customer.", { fs: 16, color: C.muted });
  return s;
};

window.buildAll = async () => {
  await window.loadFonts();
  const out = {};
  for (const [k, f] of Object.entries(D)) out[k] = f().toJSON();
  return out;
};
