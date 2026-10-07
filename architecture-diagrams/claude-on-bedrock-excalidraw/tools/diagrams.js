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
  const ic = [
    [["building", 220], ["ram", 620], ["chip", 1020]],
    [["cloud", 420], ["building", 820]],
    [["claude", 1020], ["coin", 1180]],
    [["rack", 620], ["laptop", 1020], ["coin", 1180]],
  ];
  ic.forEach((row, i) => row.forEach(([k, cx]) => s.icon(k, cx - 20, i * (ZH + GAP) + 6, { size: 40, color: k === "claude" || k === "coin" ? undefined : [zones[i][2][0], zones[i][2][1]] })));
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
  [[C.orange, "Trn"], [C.blue, "TPU"], [C.green, "GPU"]].forEach(([col, g], i) => s.icon("chip", -74, i * 110 + 8, { size: 56, color: col, glyph: g }));
  s.icon("claude", 480, 6, { size: 50 });
  s.icon("chip", 1225, 205, { size: 50, color: C.orange, glyph: "Trn" });
  s.icon("chip", 1300, 205, { size: 50, color: C.orange, glyph: "GPU" });
  s.icon("check", 1375, 210, { size: 40 });
  s.icon("shield", -60, 382, { size: 40 });
  s.text(0, 390, "Multi-cloud compute is a supply hedge for Anthropic, not a request path.", { fs: 17, color: C.muted });
  return s;
};

// 3. Endpoints -------------------------------------------------------------
D["3-endpoints"] = () => {
  const s = new Scene();
  s.header(0, -200, "3 · Bedrock endpoints for Claude", "Worked example: your app in Sydney calls Claude Opus 5.5. Same per-token price on both endpoints; the features differ.");
  const CW = 640, RX = 0, MX = 740;
  s.icon("person", 290, -100, { size: 56 });
  s.icon("laptop", 344, -94, { size: 56 });
  s.box("app", 420, -110, "Your app in Sydney (ap-southeast-2)\nboto3 or the Anthropic SDK", { w: 370, h: 80, color: C.gray });
  s.icon("pin", 806, -104, { size: 44 });
  s.bubble("say", 870, -112, "Same price either way.\nChoose on capability.", { fs: 16, tail: "bl" });
  const rt = s.card("rt", RX, 40, "bedrock-runtime", "bedrock-runtime.ap-southeast-2.amazonaws.com\nmodelId: au.anthropic.claude-opus-5-5 (stays in Australia)\nAWS's recommended default for new apps", { w: CW, color: C.blue, tfs: 24 });
  const mt = s.card("mt", MX, 40, "bedrock-mantle", "bedrock-mantle.{region}.api.aws\nmodel: anthropic.claude-opus-5-5 (no profile prefix)\nin-region only · fewer models and regions", { w: CW, color: C.purple, tfs: 24 });
  s.icon("cloud", RX + 16, 50, { size: 48 });
  s.icon("cloud", MX + 16, 50, { size: 48, color: C.purple });
  s.arrow("app", "b", "rt", "t", { ta: 0.3 }); s.arrow("app", "b", "mt", "t", { ta: 0.7 });
  const col = (x, id, title, body, color, y, h, k) => {
    s.card(id, x, y, title, body, { w: CW, h, color, align: "left", tfs: 20, bfs: 16 });
    s.icon(k, x + CW - 58, y + 10, { size: 42, color: k === "gauge" || k === "terminal" ? undefined : [color[0], "#ffffff"] });
  };
  const y1 = 235, h1 = 200;
  col(RX, "rapi", "APIs", "converse(modelId=…, messages=[…])  / ConverseStream\ninvoke_model_with_response_stream(…)  ← Claude Code uses this\nMessages API (Anthropic-native)\nChat Completions (OpenAI-compatible)\nResponses API: sync only, no server-side tools", ["#1971c2", "#e7f5ff"], y1, h1, "terminal");
  col(MX, "mapi", "APIs", "Messages API (Anthropic-native)\n    but output_config.format (structured outputs) → HTTP 400\nChat Completions (OpenAI-compatible)\nResponses API: full, incl. background=true and server tools", ["#6741d9", "#f3f0ff"], y1, h1, "terminal");
  const y2 = y1 + h1 + 30, h2 = 175;
  col(RX, "ronly", "Only on runtime", "Cross-Region inference: au. · apac. · global. profiles\nGuardrails, e.g. mask PII before it reaches the model\nIntelligent prompt routing\nStructured outputs (use Converse or InvokeModel)\nApplication inference profiles → cost per team", C.blue, y2, h2, "shield");
  col(MX, "monly", "Only on mantle", "Server-side tool use\nPre-configured tools, e.g. web search\nAsync jobs for long-running agent work\nProjects and Workspaces → usage per team", C.purple, y2, h2, "gear");
  const y3 = y2 + h2 + 30, h3 = 175;
  col(RX, "rq", "Quotas and attribution", "One TPM quota per model, input + output combined\nOutput burns 5×: 1,000 output tokens = 5,000 TPM\nmax_tokens is reserved when the request starts\nNo RPM limit · attribute by IAM principal, tags,\n    application inference profiles", ["#1971c2", "#e7f5ff"], y3, h3, "gauge");
  col(MX, "mq", "Quotas and attribution", "Separate input TPM and output TPM\nFair-share scheduling: requests may briefly queue\nHigher initial limits · no RPM limit\nAttribute by Projects and Workspaces", ["#6741d9", "#f3f0ff"], y3, h3, "gauge");
  [["rt", "rapi"], ["rapi", "ronly"], ["ronly", "rq"], ["mt", "mapi"], ["mapi", "monly"], ["monly", "mq"]].forEach(([a, b]) => s.arrow(a, "b", b, "t"));
  const y4 = y3 + h3 + 50;
  const both = s.card("both", RX, y4, "On both endpoints", "SigV4 or Bedrock API key · client-side tool use · prompt caching (mantle: model-dependent) · stateful conversations · identical per-token price", { w: MX + CW, color: C.gray, tfs: 20, bfs: 16 });
  s.icon("check", 18, y4 + (both.height - 40) / 2, { size: 40 });
  s.icon("scale", MX + CW - 60, y4 + (both.height - 44) / 2, { size: 44 });
  s.arrow("rq", "b", "both", "t", { ta: 0.5, tb: CW / 2 / (MX + CW) });
  s.arrow("mq", "b", "both", "t", { tb: (MX + CW / 2) / (MX + CW) });
  const y5 = y4 + 140;
  const fleet = s.card("fleet", 330, y5, "Inference on an AWS serving fleet", "AWS Trainium chips + NVIDIA GPUs · weights and KV cache held in HBM", { w: 720, color: C.green, tfs: 20 });
  s.icons("chip", 330 - 130, y5 + (fleet.height - 50) / 2, 2, { size: 50, gap: 10 });
  s.icon("rack", 1050 + 24, y5 + (fleet.height - 56) / 2, { size: 56 });
  s.icon("ram", 1050 + 90, y5 + (fleet.height - 50) / 2, { size: 50 });
  s.arrow("both", "b", "fleet", "t");
  const ty = y5 + fleet.height + 34;
  s.icon("warning", 0, ty, { size: 28 });
  s.text(42, ty + 2, "Choose on capability, not cost. Model access is per account: \"is not available for this account\" is a Model access issue, not IAM or code.", { fs: 16, color: C.muted });
  s.icon("lock", 0, ty + 36, { size: 28 });
  s.text(42, ty + 38, "From a VPC, use PrivateLink interface endpoints to avoid NAT egress charges.", { fs: 16, color: C.muted });
  s.legend([["bedrock-runtime", C.blue], ["bedrock-mantle", C.purple], ["both", C.gray]], 0, ty + 84);
  return s;
};

// 4. Picking an endpoint and profile ---------------------------------------
D["4-pick-endpoint"] = () => {
  const s = new Scene();
  s.header(-200, -150, "4 · Which endpoint, which inference profile", "Start on runtime unless you need something only mantle has");
  s.icon("person", 600, -66, { size: 56 });
  s.bubble("say", 668, -78, "Which endpoint,\nwhich profile?", { fs: 16, tail: "bl" });
  s.box("q1", 545, 0, "Need server-side tools,\nweb search, async,\nProjects or Workspaces?", { shape: "diamond", w: 400, h: 190, color: C.yellow, fs: 18 });
  s.card("rt", 160, 270, "bedrock-runtime", "default for new apps", { w: 300, color: C.blue });
  s.card("mt", 1010, 270, "bedrock-mantle", "Messages or Responses API", { w: 300, color: C.purple });
  s.icon("cloud", 92, 288, { size: 56 });
  s.icon("cloud", 1322, 288, { size: 56, color: C.purple });
  s.arrow("q1", "l", "rt", "t", { via: [[310, 95]], label: "no" });
  s.arrow("q1", "r", "mt", "t", { via: [[1160, 95]], label: "yes" });
  s.icon("cross", 324, 44, { size: 32 });
  s.icon("check", 1132, 44, { size: 32 });
  s.box("q3", 135, 430, "Data residency\nconstraint?", { shape: "diamond", w: 350, h: 170, color: C.yellow, fs: 18 });
  s.box("q2", 985, 430, "Also need structured\noutputs, Guardrails\nor CRIS?", { shape: "diamond", w: 350, h: 170, color: C.yellow, fs: 18 });
  s.icon("shield", 52, 488, { size: 54 });
  s.icon("gear", 1350, 488, { size: 54 });
  s.arrow("rt", "b", "q3", "t"); s.arrow("mt", "b", "q2", "t");
  const oy = 720, ow = 300;
  const corner = (k, x, o = {}) => s.icon(k, x - 16, oy - 26, { size: 46, ...o });
  s.card("in", -200, oy, "In-region model ID", "or application inference profile.\nCheck the model is served\nin that region.", { w: ow, color: C.green, bfs: 15 });
  s.card("geo", 160, oy, "Geo profile", "apac. · au. · jp. · us. · eu.\nstays in the geography", { w: ow, color: C.green, bfs: 15 });
  s.card("gl", 520, oy, "Global profile", "global.\nmost throughput, lowest price;\nmay process outside your geography", { w: ow, color: C.green, bfs: 15 });
  corner("pin", -200); corner("flag", 160); corner("globe", 520);
  s.arrow("q3", "b", "in", "t", { label: "one region" });
  s.arrow("q3", "b", "geo", "t", { label: "geography" });
  s.arrow("q3", "b", "gl", "t", { label: "none" });
  s.card("split", 880, oy, "Split the workload", "send those calls to runtime\n(Converse or InvokeModel)", { w: 290, color: C.orange, bfs: 15 });
  s.card("stay", 1210, oy, "Stay on mantle", "in-region only", { w: 230, color: C.purple, bfs: 15 });
  corner("cloud", 880); corner("cloud", 1210, { color: C.purple });
  s.arrow("q2", "b", "split", "t", { label: "yes" });
  s.arrow("q2", "b", "stay", "t", { label: "no" });
  s.icon("lock", -200, oy + 168, { size: 30 });
  s.text(-156, oy + 170, "Enforce the profile choice with an IAM condition on bedrock:InferenceProfileArn, and an SCP for the whole organization.\nDon't rely on developers picking the right model ID.", { fs: 17, color: C.muted });
  s.legend([["question", C.yellow], ["runtime", C.blue], ["mantle", C.purple], ["inference profile", C.green]], -200, oy + 240);
  return s;
};

// 5. Cross-Region inference path -------------------------------------------
D["5-cris-path"] = () => {
  const s = new Scene();
  s.header(0, -150, "5 · What moves with cross-Region inference", "The model runs elsewhere; the request, logs and price stay in the source region (runtime only)");
  s.zone("src", 0, 0, 525, 620, "Source region · e.g. ap-southeast-2", { color: C.blue });
  s.icon("pin", 468, 8, { size: 44 });
  s.icon("laptop", 52, 64, { size: 56 });
  s.box("app", 130, 60, "Your application", { w: 300, h: 64, color: C.gray });
  s.card("ep", 60, 200, "bedrock-runtime endpoint", "IAM check, incl. the condition key\nbedrock:InferenceProfileArn", { w: 440, h: 110, color: C.blue });
  s.icon("key", 448, 232, { size: 44 });
  s.card("stay", 60, 430, "Stays in the source region", "CloudWatch metrics · CloudTrail\nModel invocation logs\nPrice: the source region's rate", { w: 440, h: 150, color: C.yellow, bfs: 16 });
  s.icon("doc", 450, 448, { size: 40 });
  s.icon("coin", 450, 516, { size: 40 });
  s.icon("gear", 765, 80, { size: 52 });
  s.card("prof", 660, 150, "Inference profile", "in-region · apac. · global.", { w: 260, h: 90, color: C.purple });
  s.zone("geo", 1010, 90, 470, 290, "Geo profile (e.g. apac.)", { color: C.green });
  s.card("gf", 1050, 200, "Serving fleet in another region", "of the same geography, with capacity", { w: 400, h: 110, color: C.green, bfs: 16 });
  s.icons("chip", 1180, 320, 3, { size: 44, gap: 12 });
  s.zone("glb", 1010, 440, 470, 220, "Global profile (global.)", { color: C.orange });
  s.icon("globe", 1408, 450, { size: 50 });
  s.card("glf", 1050, 510, "Serving fleet in any", "supported commercial region,\ncan be outside your geography", { w: 400, h: 110, color: C.orange, bfs: 16 });
  // Numbered steps: yellow badges carry the step number.
  s.arrow("app", "b", "ep", "t", { ta: 0.3, tb: 160 / 440 });
  s.badge(62, 152, 1, { size: 30 });
  s.text(198, 150, "request +\nprofile ID", { fs: 16, align: "right" });
  s.arrow("ep", "t", "app", "b", { ta: 280 / 440, tb: 0.7 });
  s.badge(352, 152, 5, { size: 30 });
  s.text(390, 156, "response", { fs: 16 });
  s.arrow("ep", "r", "prof", "l", { ta: 0.2, tb: 0.8 });
  s.badge(536, 184, 2, { size: 30 });
  s.text(572, 188, "resolve", { fs: 16 });
  s.arrow("prof", "r", "gf", "l", { ta: 0.8, tb: 0.2 });
  s.badge(926, 184, 3, { size: 30 });
  s.text(960, 188, "route", { fs: 16 });
  s.arrow("gf", "l", "ep", "r", { ta: 0.85, tb: 0.85 });
  s.badge(640, 306, 4, { size: 30 });
  s.text(678, 304, "tokens return\nthrough the source", { fs: 16 });
  s.arrow("prof", "b", "glf", "l", { ta: 0.9, via: [[894, 565]], dashed: true });
  s.text(906, 400, "or", { fs: 16 });
  s.arrow("ep", "b", "stay", "t", { dashed: true });
  s.text(0, 700, "Geo profiles keep processing in the geography. Global can use any commercial region and is the baseline price;\ngeo and in-region cost about 10% more (every model since Sonnet 4.5). Mantle doesn't do CRIS: it serves in-region only.\nAWS doesn't publish how Claude fleets are placed across AZs, so this diagram stops at the region.", { fs: 16, color: C.muted });
  return s;
};

// 6. Quota burndown --------------------------------------------------------
D["6-quota-burndown"] = () => {
  const s = new Scene();
  s.header(0, -190, "6 · How a runtime request uses TPM quota", "Claude 3.7 and later on bedrock-runtime: output burns 5×, max_tokens is reserved up front");
  const steps = [
    ["req", "Request", "input 1,000 tokens\nmax_tokens 8,000", C.gray, "mail"],
    ["res", "Reserve at start", "1,000 + 8,000\n= 9,000 TPM held", C.red, "lock"],
    ["gen", "Model generates", "100 output tokens", C.purple, "claude"],
    ["set", "Settle quota", "1,000 + 100 × 5\n= 1,500 TPM used", C.blue, "gauge"],
    ["bill", "Bill", "1,000 + 100\n= 1,100 tokens", C.green, "coin"],
  ];
  steps.forEach(([id, t, b, col, k], i) => {
    s.card(id, i * 300, 0, t, b, { w: 240, h: 130, color: col });
    s.icon(k, i * 300 + 92, -70, { size: 56, color: k === "lock" ? C.red : k === "coin" ? C.green : undefined });
    s.badge(i * 300 - 14, -14, i + 1);
  });
  for (let i = 0; i < steps.length - 1; i++) s.arrow(steps[i][0], "r", steps[i + 1][0], "l");
  const tip = s.card("tip", 300, 200, "Throttling comes from the reservation, not the bill", "A large max_tokens holds quota you never use, so 429s arrive early.\nSet max_tokens close to the output you expect.", { w: 840, h: 120, color: C.yellow, bfs: 17, align: "left", pad: 90 });
  s.icon("warning", 318, 200 + (tip.height - 54) / 2, { size: 54 });
  s.arrow("res", "b", "tip", "t", { dashed: true, tb: 0.14 });
  // held vs used, to scale
  const by = 200 + tip.height + 40, BW = 720;
  s.text(0, by + 2, "9,000 TPM held", { fs: 17, color: C.red[0] });
  s._shape("rectangle", 170, by, BW, 26, { stroke: C.red[0], fill: C.red[1] });
  s.text(0, by + 42, "1,500 TPM used", { fs: 17, color: C.blue[0] });
  s._shape("rectangle", 170, by + 40, BW * 1500 / 9000, 26, { stroke: C.blue[0], fill: C.blue[1] });
  s.bubble("say", 920, by - 6, "429 already?\nI only used 1,500.", { fs: 16, tail: "bl" });
  s.text(0, by + 110, "Runtime has one TPM quota per model covering input and output; there's no RPM limit. Mantle meters input and output separately.", { fs: 16, color: C.muted });
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
  // Compute over prefill, memory over the KV cache, a waiting clock on the stall.
  s.icon("bolt", 105, -80, { size: 60 });
  s.icon("ram", 455, -72, { size: 60 });
  s.icon("chip", 730, -80, { size: 60 });
  s.icon("clock", 1090, 225, { size: 60 });
  s.icon("gauge", 1090, 300, { size: 60 });
  s.icon("check", 425, 225, { size: 54 });
  s.text(0, 440, "Longer context grows the KV cache and the bytes moved per token.\nMoE cuts active parameters per token but not resident memory: every expert stays loaded.", { fs: 17, color: C.muted });
  return s;
};

window.buildAll = async () => {
  await window.loadFonts();
  const out = {};
  for (const [k, f] of Object.entries(D)) out[k] = f().toJSON();
  return out;
};
