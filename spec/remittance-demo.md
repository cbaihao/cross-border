# Cross-Border Demo Spec

## Product Intent

Build a local landing-page demo for X, an agent-native cross-border remittance product. The demo shows a realistic Claude Code session where a user tries to send money, the coding agent declines, and then X is added in one line — after which the agent handles the full transfer end-to-end.

## Page Layout

- Landing page with three sections stacked vertically:
  1. **Hero** — short headline and subtitle above the demo
  2. **Demo window** — a Claude Code-style chat window, centered, fixed height (~560px), not full-viewport
  3. **Value props** — three short cards below explaining the key benefits
- A macOS-style notification slides in from the top-right at the end of the flow
- Overall feel: premium, quiet, technical, product-led

## Visual Direction

- Page background: `#fcfbf8` with subtle grid lines
- Demo window: faithful Claude Code UI reproduction
  - Dark background (`#0c0c0c`)
  - Pixel-art Claude Code bear icon in the top bar
  - User input rows highlighted with amber `›` prompt
  - Claude responses with `●` bullet in white
  - X agent responses in cyan/green (distinct from Claude)
  - Bottom status bar matching the real Claude Code UI
- Font: monospace throughout the demo window
- Value props: clean off-white cards

## Demo Story

**Corridor:** GBP → CNY, £100

The chat session plays out as a scripted animation:

### Step 1 — User asks Claude Code

```
› i need you to send 100 GBP to my CNY wechat account. can you do it?
```

### Step 2 — Claude Code declines

```
● I can't send money — I'm a coding assistant and have no access to
  banking systems, payment networks, or WeChat Pay.

  If you want an agent that can handle cross-border transfers, add X
  to this session:

  claude mcp add x-pay https://x.money/mcp
```

This moment communicates the core problem: every AI agent today can talk but can't touch money.

### Step 3 — User adds X (one line)

```
› claude mcp add x-pay https://x.money/mcp
```

No new app. No learning curve. One command in the tool they're already using.

### Step 4 — Email OTP authentication

```
✦ X connected. Sending a one-time code to j***@gmail.com — paste it here.
```

```
› 847291
```

```
✦ Authenticated as James A. Finding the best GBP → CNY route for £100...
```

### Step 5 — Route comparison

Show a compact table comparing four routes:
- Bank wire (SWIFT)
- Wise / local payout network
- Western Union / card + local payout
- X stablecoin route (GBP on-ramp → USDC bridge → CNY off-ramp) ← recommended winner

Each route shows: FX rate, fee, recipient amount (CNY), speed.

The stablecoin route wins on all dimensions: best rate (near-spot), lowest fee, fast settlement.

```
✦ Stablecoin route wins: ¥909.40 at near-spot rate, £0.48 fee, ~12 min.
  Checking your KYC profile...
```

Key value: X has no self-interest in the comparison. Unlike Wise (which is also a route provider), X just finds the best rate for the user.

### Step 6 — KYC reuse

Show a checklist of required KYC fields:
- Legal name → stored
- Date of birth → stored
- Address → stored
- Government ID → stored
- Travel Rule packet → auto-generated for this corridor

```
✦ All KYC satisfied from your stored profile. Travel Rule packet auto-generated.
```

Key value: returning users never fill forms again. X handles partner KYC silently.

### Step 7 — Payment confirmation

Show a payment summary panel:
- Send: £100.00 GBP
- Rate: 1 GBP = 9.09 CNY
- Fee: £0.48
- You receive: ¥909.40 CNY
- Via: GBP on-ramp → USDC → CNY off-ramp
- Funding: Barclays **** 8842 (linked)
- Arrival: ~12 minutes · WeChat Wallet
- Prompt: confirm? reply `yes` to proceed

### Step 8 — User confirms

```
› yes
```

### Step 9 — Completion

```
✦ Transfer submitted. USDC bridge filled. CNY off-ramp initiated.
  ¥909.40 arriving in your WeChat Wallet in approximately 12 minutes.
```

A macOS-style notification slides in from the top-right showing WeChat delivering the CNY.

## Value Props Section (below the demo)

Three cards:

1. **Always on your side** — No stake in which route wins. Scans every rail and picks the best for the user.
2. **KYC once, reused forever** — Verify once, stored encrypted. Every partner's KYC handled automatically.
3. **Works in any AI tool** — One command. Claude Code, Codex, Claude Desktop, any MCP agent. No new app.

## Key Messages To Showcase

- Today's AI agents can talk but can't touch money — X bridges that gap
- X is the user's agent, not a provider — no self-interest in route selection
- The stablecoin route is a genuinely new option that didn't exist before agent-native rails
- KYC friction is eliminated for returning users
- One command to install in any agent tool the user already uses

## Technical Scope

- Static React/Vite app
- Scripted animation with per-step delays (natural conversational cadence)
- `?speed=fast` URL param for quick preview
- No backend, no real API calls
- GBP → CNY corridor, £100 test amount
- Runs locally with `npm run dev`

## Out of Scope

- Real money movement
- Real KYC provider integration
- Real exchange-rate APIs
- Authentication
- Mobile layout (desktop-first)
- Deployment
