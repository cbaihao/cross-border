# Cross-Border Demo Spec

## Product Intent

Build a local landing-page demo for X, an agent-native cross-border remittance product. The demo should show a user asking an agent to move money from USD to Chinese yuan (CNY), then watching the agent compare routes, handle KYC reuse/new KYC through regulated partners, prepare ACH payment, and confirm arrival.

This is an honest product demo. No real money movement, provider integration, KYC submission, document upload, bank login, or production deployment is required.

## Page Layout

- Single landing page.
- Warm off-white background inspired by the reference page.
- One large terminal window centered on the page, taking most of the viewport.
- Terminal window shape is static: it should not grow vertically as the workflow progresses.
- Terminal content rolls upward as new steps appear, while still allowing manual scroll up/down.
- Terminal uses dark mode with terminal-native typography and animated command/output lines.
- Top-right macOS-style notification appears outside the terminal at the end of the flow.
- Final funds-arrival notification can be closed and appears once per run. Rerunning the flow should show it again at the end.
- No large marketing sections are needed for this first demo.

## Visual Direction

- Reference page: `https://id-preview--cac1dfbb-e03f-439d-88c4-62de92da5213.lovable.app/`
- Main background: `#fcfbf8` / `#FCFBF8`.
- Primary text and buttons: `#1B1B1B`.
- Terminal: near-black surface with subtle border/shadow.
- Optional accents: sparse use of blue/orange/pink only for tiny status indicators or route badges.
- Overall feel: premium, quiet, high-trust, technical, and product-led.

## Demo Story

The terminal begins with the user prompt:

```text
Using X, do a cross-border remittance from USD to Chinese yuan.
```

The agent responds by running a visible terminal-native workflow with no manual user interaction during the demo:

1. Parse transfer intent and infer missing defaults for demo purposes.
2. Compare available market routes.
3. Recommend the most cost-effective route.
4. Check existing stored PII and KYC profile.
5. Reuse stored PII where possible.
6. Complete any new KYC required by the selected route.
7. Screen the route and resolve provider evidence requests.
8. Generate ACH payment instructions using the user's saved tokenized payment method.
9. Show automatic payment authorization and confirmation in the scripted flow.
10. Show transfer completion and destination-account arrival notification.

## Route Comparison

The terminal should show a compact UI/table comparing several routes:

- Traditional bank wire.
- Wise or similar remittance provider.
- Card-funded remittance provider.
- Stablecoin route using on-ramp, bridge/liquidity, and off-ramp partners.

Each route should show:

- FX rate.
- Fees.
- Estimated recipient amount in CNY.
- Estimated speed.
- KYC burden.
- Confidence/risk indicator.

The agent should recommend the best route using cost, speed, confidence, and KYC friction. For this demo, the stablecoin route should win after visibly comparing rate and speed against the other routes.

## KYC And PII Flow

KYC is the highest-friction part and should be visually explicit.

The demo should show:

- Existing verified user profile found.
- Stored PII retrieved from secure vault.
- PII fields reused: legal name, date of birth, address, ID number/document metadata, travel rule information.
- Sensitive values masked in the UI.
- New regulated partner/provider-specific KYC requirements detected for on-ramp and off-ramp.
- Agent prepares and submits required information to regulated partners using stored PII.
- Agent follows up on evidence requests automatically.
- Regulated partner KYC approvals received with timestamps/statuses.

The demo should communicate that returning users do not need to repeat KYC manually unless genuinely new information is required.

## Payment Flow

After route and KYC are cleared:

- Agent presents the final quote and route summary.
- Agent uses a saved tokenized ACH payment method for the USD funding leg.
- Demo shows a payment authorization panel in terminal.
- Payment confirmation is fully scripted/animated with no live user input required.
- The tokenized payment method should communicate that repeat transfers avoid refilling payment details.
- Agent marks the transfer submitted and tracks settlement.

## Final Notification

At the end, show a macOS-style notification outside the terminal in the top-right corner:

```text
X
$1,000 arrived in your WeChat Wallet (CNY).
```

The notification should feel like a native laptop notification, not an in-terminal message.

Use a recognizable China destination signal. For this demo, use WeChat (WeChat Wallet) as the local CNY arrival notification surface.

## Key Messages To Showcase

- X compares providers and routes automatically.
- X removes repeated KYC friction by securely reusing stored PII with regulated partners.
- X handles provider-specific KYC and evidence requests for the user through regulated partners.
- X can reuse a saved tokenized ACH payment method for repeat transfers.
- User only needs to specify the desired transfer in the demo flow.
- The workflow can run from terminal, Codex, Claude Code, or a future native/mobile web app.

## Initial Build Scope

- Static/local React implementation.
- Scripted animation sequence with a readable pause between each major step.
- Each step should linger for around 15 seconds so a viewer can read what is happening.
- No real AI call required for the first demo.
- No backend required unless useful for clean local structure.
- Code should remain easy to edit and extend.
- The demo should run locally with `npm run dev`.

## Out Of Scope For First Build

- Real remittance execution.
- Real exchange-rate APIs.
- Real bank payment QR generation.
- Real KYC provider integration.
- Real PII storage.
- Authentication.
- Mobile app implementation.
- Deployment.
