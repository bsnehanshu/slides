window.DIAGRAMS = {};
const D = window.DIAGRAMS;

// 1. Compute stack ---------------------------------------------------------
D["1-compute-stack"] = () => {
  const s = new Scene();
  s.header(0, -120, "1 · Compute stack: silicon to inference", "Where Claude's compute comes from, and which costs recur");
  const W = 1240, ZH = 165, GAP = 60, BW = 360, BH = 92;
  const zones = [
    ["z1", "Silicon supply", C.gray, [
      ["Fabrication", "TSMC"], ["HBM", "SK Hynix · Samsung · Micron"], ["Accelerators", "Nvidia GPU · Google TPU · AWS Trainium"]]],
    ["z2", "Capacity", C.blue, [
      ["Cloud fleets", "AWS · Google Cloud · Azure"], ["Mega-clusters", "e.g. Project Rainier (Trainium2)"], null]],
    ["z3", "Training · once per checkpoint, recurring per model generation", C.purple, [
      ["Pretraining", "months on large clusters"], ["Post-training", "RL · distillation (large, repeated)"], ["Checkpoint", "the model weights"]]],
    ["z4", "Inference · continuous, scales with usage", C.green, [
      ["KV cache in HBM", "per-request context"], ["Serving fleets", "Trainium · GPU, regional, always on"], ["Customer apps", "API calls · agents"]]],
  ];
  zones.forEach(([id, label, col, cards], i) => {
    const y = i * (ZH + GAP);
    s.zone(id, 0, y, W, ZH, label, { color: col });
    cards.forEach((c, j) => {
      if (!c) return;
      const off = cards.filter(Boolean).length === 2 ? (BW + 40) / 2 : 0;
      s.card(`${id}c${j}`, 40 + off + j * (BW + 40), y + 52, c[0], c[1], { w: BW, h: BH, color: [col[0], col[1]] });
    });
  });
  s.arrow("z3c0", "r", "z3c1", "l"); s.arrow("z3c1", "r", "z3c2", "l");
  s.arrow("z4c0", "r", "z4c1", "l", { none: true, dashed: true });
  s.arrow("z4c1", "r", "z4c2", "l");
  s.arrow("z1", "b", "z2", "t"); s.arrow("z2", "b", "z3", "t");
  s.arrow("z3", "b", "z4", "t");
  s.text(636, 3 * (ZH + GAP) - GAP / 2 - 11, "checkpoint ships to serving fleets", { fs: 16, color: C.purple[0] });
  const fy = 4 * (ZH + GAP) - GAP + 30;
  s.text(0, fy, "Training is paid once per checkpoint, but every model generation pays it again, and RL post-training is a large repeated cost.\nInference is the bill that grows with usage. During decode it is memory-bandwidth bound, not compute bound (see 7).", { fs: 17, color: C.muted });
  return s;
};

// 2. Distribution ----------------------------------------------------------
D["2-distribution"] = () => {
  const s = new Scene();
  s.header(0, -150, "2 · Trained on many clouds, served per platform", "Fan-in and fan-out are independent");
  s.text(0, -50, "Trained on", { fs: 20, color: C.muted });
  ["AWS Trainium", "Google TPU", "Nvidia GPU"].forEach((t, i) => s.box(`tr${i}`, 0, i * 110, t, { w: 240, h: 72, color: C.gray }));
  s.box("w", 380, 70, "Claude model\nweights", { shape: "ellipse", w: 250, h: 120, color: C.purple, fs: 22 });
  s.text(780, -50, "Served through", { fs: 20, color: C.muted });
  const outs = [["Claude API", "first-party", C.gray], ["Amazon Bedrock", "AWS", C.orange], ["Vertex AI", "Google Cloud", C.gray], ["Microsoft Foundry", "Azure", C.gray]];
  outs.forEach(([t, b, col], i) => s.card(`o${i}`, 780, -20 + i * 95, t, b, { w: 260, h: 76, color: col, tfs: 20, bfs: 15 }));
  [0, 1, 2].forEach((i) => s.arrow(`tr${i}`, "r", "w", "l"));
  [0, 1, 2, 3].forEach((i) => s.arrow("w", "r", `o${i}`, "l", { ta: 0.2 + i * 0.2 }));
  s.card("aws", 1130, 55, "A Bedrock call runs on AWS", "end to end, on Trainium and GPU\nserving fleets. A request never\nhops to another provider.", { w: 330, color: C.orange, tfs: 20, bfs: 16 });
  s.arrow("o1", "r", "aws", "l");
  s.text(0, 390, "Multi-cloud compute is a supply hedge for Anthropic, not a request path.", { fs: 17, color: C.muted });
  return s;
};

// 3. Endpoints -------------------------------------------------------------
D["3-endpoints"] = () => {
  const s = new Scene();
  s.header(0, -170, "3 · Bedrock endpoints for Claude", "Same models, same per-token price. Capabilities belong to the endpoint, not the API.");
  const CW = 640, RX = 0, MX = 740;
  s.box("app", 470, -70, "Your application", { w: 270, h: 60, color: C.gray });
  s.card("rt", RX, 40, "bedrock-runtime", "bedrock-runtime.{region}.amazonaws.com\nrecommended default for new apps", { w: CW, color: C.blue, tfs: 24 });
  s.card("mt", MX, 40, "bedrock-mantle", "bedrock-mantle.{region}.api.aws\nin-region only · fewer models and regions", { w: CW, color: C.purple, tfs: 24 });
  s.arrow("app", "b", "rt", "t", { ta: 0.3 }); s.arrow("app", "b", "mt", "t", { ta: 0.7 });
  const col = (x, id, title, body, color, y, h) => s.card(id, x, y, title, body, { w: CW, h, color, align: "left", tfs: 20, bfs: 16 });
  const y1 = 190, h1 = 200;
  col(RX, "rapi", "APIs", "InvokeModel / InvokeModelWithResponseStream\nConverse / ConverseStream\nMessages API (Anthropic-native)\nChat Completions (OpenAI-compatible)\nResponses API: sync only, default project only,\n    no server-side tools, response pinned to its region", ["#1971c2", "#e7f5ff"], y1, h1);
  col(MX, "mapi", "APIs", "Messages API (Anthropic-native)\n    but output_config.format (structured outputs) → 400\nChat Completions (OpenAI-compatible)\nResponses API: full, incl. background and server tools", ["#6741d9", "#f3f0ff"], y1, h1);
  const y2 = y1 + h1 + 30, h2 = 175;
  col(RX, "ronly", "Only on runtime", "Cross-Region inference: geo and global profiles\nGuardrails\nIntelligent prompt routing\nStructured outputs (use Converse or InvokeModel)\nApplication inference profiles", C.blue, y2, h2);
  col(MX, "monly", "Only on mantle", "Server-side tool use\nPre-configured tools, incl. web search\nAsynchronous / long-running inference\nProjects and Workspaces", C.purple, y2, h2);
  const y3 = y2 + h2 + 30, h3 = 175;
  col(RX, "rq", "Quotas and attribution", "One TPM quota per model, input + output combined\nOutput tokens burn 5× (Claude 3.7 and later)\nmax_tokens is reserved when the request starts\nNo RPM limit · attribute by IAM principal, tags,\n    application inference profiles", ["#1971c2", "#e7f5ff"], y3, h3);
  col(MX, "mq", "Quotas and attribution", "Separate input TPM and output TPM\nFair-share scheduling: requests may briefly queue\nHigher initial limits · no RPM limit\nAttribute by Projects and Workspaces", ["#6741d9", "#f3f0ff"], y3, h3);
  [["rt", "rapi"], ["rapi", "ronly"], ["ronly", "rq"], ["mt", "mapi"], ["mapi", "monly"], ["monly", "mq"]].forEach(([a, b]) => s.arrow(a, "b", b, "t"));
  const y4 = y3 + h3 + 50;
  s.card("both", RX, y4, "On both endpoints", "SigV4 or Bedrock API key · client-side tool use · prompt caching (mantle: model-dependent) · stateful conversations · identical per-token price", { w: MX + CW, color: C.gray, tfs: 20, bfs: 16 });
  s.arrow("rq", "b", "both", "t", { ta: 0.5, tb: CW / 2 / (MX + CW) });
  s.arrow("mq", "b", "both", "t", { tb: (MX + CW / 2) / (MX + CW) });
  const y5 = y4 + 140;
  s.card("fleet", 330, y5, "Inference on an AWS serving fleet", "Trainium · GPU · weights and KV cache resident in HBM", { w: 720, color: C.green, tfs: 20 });
  s.arrow("both", "b", "fleet", "t");
  s.text(0, y5 + 120, "Choose on capability, not cost. Model access is per account: \"is not available for this account\" is a Model access issue, not IAM or code.\nFrom a VPC, use PrivateLink interface endpoints to avoid NAT egress charges.", { fs: 16, color: C.muted });
  return s;
};

// 4. Picking an endpoint and profile ---------------------------------------
D["4-pick-endpoint"] = () => {
  const s = new Scene();
  s.header(-200, -150, "4 · Which endpoint, which inference profile", "Start on runtime unless you need something only mantle has");
  s.box("q1", 545, 0, "Need server-side tools,\nweb search, async,\nProjects or Workspaces?", { shape: "diamond", w: 400, h: 190, color: C.yellow, fs: 18 });
  s.card("rt", 160, 270, "bedrock-runtime", "default for new apps", { w: 300, color: C.blue });
  s.card("mt", 1010, 270, "bedrock-mantle", "Messages or Responses API", { w: 300, color: C.purple });
  s.arrow("q1", "l", "rt", "t", { via: [[310, 95]], label: "no" });
  s.arrow("q1", "r", "mt", "t", { via: [[1160, 95]], label: "yes" });
  s.box("q3", 135, 430, "Data residency\nconstraint?", { shape: "diamond", w: 350, h: 170, color: C.yellow, fs: 18 });
  s.box("q2", 985, 430, "Also need structured\noutputs, Guardrails\nor CRIS?", { shape: "diamond", w: 350, h: 170, color: C.yellow, fs: 18 });
  s.arrow("rt", "b", "q3", "t"); s.arrow("mt", "b", "q2", "t");
  const oy = 720, ow = 300;
  s.card("in", -200, oy, "In-region model ID", "or application inference profile.\nCheck the model is served\nin that region.", { w: ow, color: C.green, bfs: 15 });
  s.card("geo", 160, oy, "Geo profile", "apac. · au. · jp. · us. · eu.\nstays in the geography", { w: ow, color: C.green, bfs: 15 });
  s.card("gl", 520, oy, "Global profile", "global.\nmost throughput, lowest price;\nmay process outside your geography", { w: ow, color: C.green, bfs: 15 });
  s.arrow("q3", "b", "in", "t", { label: "one region" });
  s.arrow("q3", "b", "geo", "t", { label: "geography" });
  s.arrow("q3", "b", "gl", "t", { label: "none" });
  s.card("split", 880, oy, "Split the workload", "send those calls to runtime\n(Converse or InvokeModel)", { w: 290, color: C.orange, bfs: 15 });
  s.card("stay", 1210, oy, "Stay on mantle", "in-region only", { w: 230, color: C.purple, bfs: 15 });
  s.arrow("q2", "b", "split", "t", { label: "yes" });
  s.arrow("q2", "b", "stay", "t", { label: "no" });
  s.text(-200, oy + 170, "Enforce the profile choice with an IAM condition on bedrock:InferenceProfileArn, and an SCP for the whole organization.\nDon't rely on developers picking the right model ID.", { fs: 17, color: C.muted });
  return s;
};

// 5. Cross-Region inference path -------------------------------------------
D["5-cris-path"] = () => {
  const s = new Scene();
  s.header(0, -150, "5 · What moves with cross-Region inference", "The model runs elsewhere; the request, logs and price stay in the source region (runtime only)");
  s.zone("src", 0, 0, 525, 620, "Source region · e.g. ap-southeast-2", { color: C.blue });
  s.box("app", 130, 60, "Your application", { w: 300, h: 64, color: C.gray });
  s.card("ep", 60, 200, "bedrock-runtime endpoint", "IAM check, incl. the condition key\nbedrock:InferenceProfileArn", { w: 440, h: 110, color: C.blue });
  s.card("stay", 60, 430, "Stays in the source region", "CloudWatch metrics · CloudTrail\nModel invocation logs\nPrice: the source region's rate", { w: 440, color: C.yellow, bfs: 16 });
  s.card("prof", 660, 150, "Inference profile", "in-region · apac. · global.", { w: 260, h: 90, color: C.purple });
  s.zone("geo", 1010, 90, 470, 290, "Geo profile (e.g. apac.)", { color: C.green });
  s.card("gf", 1050, 200, "Serving fleet in another region", "of the same geography, with capacity", { w: 400, h: 110, color: C.green, bfs: 16 });
  s.zone("glb", 1010, 440, 470, 220, "Global profile (global.)", { color: C.orange });
  s.card("glf", 1050, 510, "Serving fleet in any", "supported commercial region,\ncan be outside your geography", { w: 400, h: 110, color: C.orange, bfs: 16 });
  s.arrow("app", "b", "ep", "t", { ta: 0.3, tb: 160 / 440 });
  s.text(208, 150, "1 · request + profile ID", { fs: 16, align: "right" });
  s.arrow("ep", "t", "app", "b", { ta: 280 / 440, tb: 0.7 });
  s.text(352, 150, "5 · response", { fs: 16 });
  s.arrow("ep", "r", "prof", "l", { ta: 0.2, tb: 0.8 });
  s.text(592, 192, "2 · resolve", { fs: 16, align: "center" });
  s.arrow("prof", "r", "gf", "l", { ta: 0.8, tb: 0.2 });
  s.text(965, 192, "3 · route", { fs: 16, align: "center" });
  s.arrow("gf", "l", "ep", "r", { ta: 0.85, tb: 0.85 });
  s.text(760, 300, "4 · tokens return\nthrough the source", { fs: 16, align: "center" });
  s.arrow("prof", "b", "glf", "l", { ta: 0.9, via: [[894, 565]], dashed: true });
  s.text(906, 400, "or", { fs: 16 });
  s.arrow("ep", "b", "stay", "t", { dashed: true });
  s.text(0, 700, "Geo profiles keep processing in the geography. Global can use any commercial region and is the baseline price;\ngeo and in-region cost about 10% more (Sonnet 4.5 and later). Mantle doesn't do CRIS: it serves in-region only.\nAWS doesn't publish how Claude fleets are placed across AZs, so this diagram stops at the region.", { fs: 16, color: C.muted });
  return s;
};

// 6. Quota burndown --------------------------------------------------------
D["6-quota-burndown"] = () => {
  const s = new Scene();
  s.header(0, -150, "6 · How a runtime request uses TPM quota", "Claude 3.7 and later on bedrock-runtime: output burns 5×, max_tokens is reserved up front");
  const steps = [
    ["req", "Request", "input 1,000 tokens\nmax_tokens 8,000", C.gray],
    ["res", "Reserve at start", "1,000 + 8,000\n= 9,000 TPM held", C.red],
    ["gen", "Model generates", "100 output tokens", C.purple],
    ["set", "Settle quota", "1,000 + 100 × 5\n= 1,500 TPM used", C.blue],
    ["bill", "Bill", "1,000 + 100\n= 1,100 tokens", C.green],
  ];
  steps.forEach(([id, t, b, col], i) => s.card(id, i * 300, 0, t, b, { w: 240, h: 130, color: col }));
  for (let i = 0; i < steps.length - 1; i++) s.arrow(steps[i][0], "r", steps[i + 1][0], "l");
  s.card("tip", 300, 200, "Throttling comes from the reservation, not the bill", "A large max_tokens holds quota you never use, so 429s arrive early.\nSet max_tokens close to the output you expect.", { w: 840, color: C.yellow, bfs: 17 });
  s.arrow("res", "b", "tip", "t", { dashed: true, tb: 0.14 });
  s.text(0, 380, "Runtime has one TPM quota per model covering input and output; there's no RPM limit. Mantle meters input and output separately.", { fs: 16, color: C.muted });
  return s;
};

// 7. Decode -----------------------------------------------------------------
D["7-decode"] = () => {
  const s = new Scene();
  s.header(0, -200, "7 · Why memory, not compute, is the bottleneck", "Prefill is compute bound. Decode is memory-bandwidth bound.");
  s.card("pre", 0, 0, "Prefill", "whole prompt in parallel\ncompute bound", { w: 270, color: C.blue });
  s.box("kv", 380, 5, "KV cache\nin HBM", { shape: "ellipse", w: 210, h: 105, color: C.yellow, fs: 20 });
  s.card("dec", 700, 0, "Decode step", "read active weights + KV cache\nto emit one token", { w: 320, color: C.purple });
  s.box("tok", 1110, 22, "token", { w: 140, h: 66, color: C.gray });
  s.arrow("pre", "r", "kv", "l", { label: "writes" });
  s.arrow("kv", "r", "dec", "l", { label: "reads" });
  s.arrow("dec", "r", "tok", "l");
  s.arrow("tok", "t", "dec", "t", { via: [[1180, -70], [860, -70]], label: "append to KV, repeat" });
  s.card("why", 650, 210, "Low arithmetic intensity", "every token reloads the weights from HBM,\nthen does little maths with them:\ncores stall waiting on memory", { w: 420, color: C.red });
  s.arrow("dec", "b", "why", "t", { dashed: true });
  s.card("lev", 0, 210, "Levers", "Batching: reuse each loaded byte across requests\nPrompt caching: skip prefill for repeated prefixes\nDisaggregated serving: prefill and decode on\n    separate hardware\nShorter context: smaller KV cache per token", { w: 500, color: C.green, align: "left" });
  s.arrow("why", "l", "lev", "r");
  s.text(0, 440, "Longer context grows the KV cache and the bytes moved per token.\nMoE cuts active parameters per token but not resident memory: every expert stays loaded.", { fs: 17, color: C.muted });
  return s;
};

window.buildAll = async () => {
  await window.loadFonts();
  const out = {};
  for (const [k, f] of Object.entries(D)) out[k] = f().toJSON();
  return out;
};
