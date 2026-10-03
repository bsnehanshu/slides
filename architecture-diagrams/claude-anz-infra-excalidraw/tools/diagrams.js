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
  s.text(-30, 580, "1 train · 2 ship the checkpoint to each Region · 3 load onto the fleet · 4 your app calls Sydney · 5 tokens stream back · 6 logs and billing stay in your account.", { fs: 17, color: C.muted });
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
  s.card("doc", 0, 680, "Documented", "Anthropic can't access the deployment accounts,\ntheir logs, or your prompts and completions.\nBedrock doesn't store prompts or outputs,\nor use them to train models.", { w: 620, color: C.blue, align: "left", bfs: 16 });
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

// C4. Prompt caching ---------------------------------------------------------
D["c4-prompt-caching"] = () => {
  const s = new Scene();
  s.header(0, -150, "Prompt caching: where the cache actually lives", "It's the KV cache from slide C3, kept after the request ends. It lives in HBM, not in the compute cores.");
  s.card("turn1", 0, 0, "Turn 1", "50,000-token system prompt + docs\n+ a question", { w: 400, h: 110, color: C.gray });
  s.card("p1", 0, 180, "Full prefill", "all 50,000 tokens computed\ncache write: 1.25× input price (5 min)\nor 2× (1 hour)", { w: 400, h: 130, color: C.red, bfs: 15 });
  s.card("turn2", 860, 0, "Turn 2, three minutes later", "same 50,000-token prefix\n+ a new question", { w: 400, h: 110, color: C.gray });
  s.card("p2", 860, 180, "Short prefill", "only the new tokens are computed\ncache read: 0.1× input price\nfaster time to first token", { w: 400, h: 130, color: C.green, bfs: 15 });
  s.zone("hbm", 0, 390, 1260, 240, "", { color: C.blue, fill: "#e7f5ff" });
  s.text(1240, 585, "Accelerator HBM in the Region that served turn 1", { fs: 20, color: C.blue[0], align: "right" });
  s.card("kv", 330, 450, "Cached prefix (KV tensors)", "kept for the TTL: 5 minutes by default, 1 hour on\nSonnet 4.5, Haiku 4.5, Opus 4.5 · min 4,096 tokens per checkpoint", { w: 600, h: 110, color: C.yellow, bfs: 15 });
  s.arrow("turn1", "b", "p1", "t");
  s.arrow("turn2", "b", "p2", "t");
  s.arrow("p1", "b", "kv", "l", { via: [[200, 505]], label: "write" });
  s.arrow("kv", "r", "p2", "b", { via: [[1060, 505]], label: "read on exact prefix match" });
  s.text(0, 680, "With cross-Region inference, turn 2 can land in a different Region and miss the cache, so expect more cache writes.\nAWS doesn't publish whether cached prefixes also spill to host memory or SSD.\nAu. price for Sonnet 4.5: input $3.30/MTok · cache write $4.125 (5 min) or $6.60 (1 h) · cache read $0.33.", { fs: 17, color: C.muted });
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
  s.card("bill", 940, 330, "Bill", "input + output at list price\ncache write 1.25× or 2× · cache read 0.1×\nau. or in-region ≈ 10% over global.", { w: 400, h: 130, color: C.green, bfs: 15 });
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
  s.card("none", 1240, 320, "Stored nowhere", "Bedrock doesn't store prompts\nor outputs; Anthropic never\nsees them", { w: 340, h: 140, color: C.gray, bfs: 15 });
  s.text(0, 660, "Check the real destination list: aws bedrock get-inference-profile --inference-profile-identifier au.anthropic.claude-sonnet-4-5-20250929-v1:0\nNZ data on au. can be processed in Australia. In-region keeps it in one Region, if the model is offered there.\nEnforce with an IAM condition on bedrock:InferenceProfileArn plus an SCP. Residency is about location; sovereignty (whose law applies) is a question for legal.", { fs: 16, color: C.muted });
  return s;
};

// C8. Tokens to dollars --------------------------------------------------------
D["c8-tokens-to-dollars"] = () => {
  const s = new Scene();
  s.header(0, -150, "Tokens to dollars: a Sydney team of 1,000", "Claude Sonnet 4.5 on the au. profile: $3.30 per million input tokens, $16.50 per million output tokens");
  s.card("in", 0, 0, "The workload", "1,000 developers × 50 requests a day\n20,000 input + 1,000 output tokens each\n= 1.0B input + 50M output tokens a day", { w: 480, h: 150, color: C.gray, bfs: 16 });
  s.card("no", 580, -60, "Without caching", "input 1.0B × $3.30/M = $3,300\noutput 50M × $16.50/M = $825\n≈ $4,125 a day ≈ $90K a month (22 days)", { w: 520, h: 150, color: C.red, bfs: 16 });
  s.card("yes", 580, 140, "With caching (80% read, 10% written)", "read 800M × $0.33/M = $264\nwrite 100M × $4.125/M = $413 · rest 100M × $3.30/M = $330\noutput $825 → ≈ $1,830 a day ≈ $40K a month", { w: 520, h: 150, color: C.green, bfs: 16 });
  s.arrow("in", "r", "no", "l", { tb: 0.6 }); s.arrow("in", "r", "yes", "l", { tb: 0.4 });
  s.card("q", 0, 360, "Quota to ask for", "50,000 requests over an 8-hour day ≈ 104 per minute\n× (20,000 input + 5 × 1,000 output) ≈ 2.6M TPM on average\nplan 2–3× for peaks, and keep max_tokens tight", { w: 1100, color: C.yellow, bfs: 16 });
  s.text(0, 530, "Every number here is an assumption you can swap. The method stays the same: tokens × price for the bill, (input + 5 × output) per minute for the quota.", { fs: 17, color: C.muted });
  return s;
};

window.buildAll = async () => {
  await window.loadFonts();
  const out = {};
  for (const [k, f] of Object.entries(D)) out[k] = f().toJSON();
  return out;
};
