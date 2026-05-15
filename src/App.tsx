import { useEffect, useRef, useState } from 'react'
import './App.css'

// ── Platform type ─────────────────────────────────────────────────────────────

type Platform = 'codex' | 'claude' | 'gemini'

// ── Chat step types ───────────────────────────────────────────────────────────

type ChatStep =
  | { id: string; delayMs: number; kind: 'user'; text: string }
  | { id: string; delayMs: number; kind: 'agent'; workTime: string; text: string; install?: string }
  | { id: string; delayMs: number; kind: 'routes'; workTime: string }
  | { id: string; delayMs: number; kind: 'kyc'; workTime: string }
  | { id: string; delayMs: number; kind: 'payment'; workTime: string }

// ── Timeline ──────────────────────────────────────────────────────────────────

const chatSteps: ChatStep[] = [
  {
    id: 'user-ask',
    kind: 'user',
    delayMs: 0,
    text: 'i need you to send 100 GBP to my CNY wechat account. can you do it?',
  },
  {
    id: 'agent-decline',
    kind: 'agent',
    delayMs: 1400,
    workTime: '1s',
    text: "I can't send money — I'm an AI assistant without access to banking systems or payment networks.\n\nTo let an agent handle cross-border transfers directly, add X to this session:",
    install: 'claude mcp add x-pay https://x.money/mcp',
  },
  {
    id: 'user-install',
    kind: 'user',
    delayMs: 3000,
    text: 'claude mcp add x-pay https://x.money/mcp',
  },
  {
    id: 'x-otp',
    kind: 'agent',
    delayMs: 900,
    workTime: '1s',
    text: 'X connected. Sending a one-time passcode to j***@gmail.com — paste it here to verify your account.',
  },
  {
    id: 'user-otp',
    kind: 'user',
    delayMs: 4000,
    text: '847291',
  },
  {
    id: 'x-auth',
    kind: 'agent',
    delayMs: 900,
    workTime: '2s',
    text: 'Authenticated as James A. Linked accounts found. Scanning all available GBP → CNY routes for £100...',
  },
  {
    id: 'routes',
    kind: 'routes',
    delayMs: 1600,
    workTime: '4s',
  },
  {
    id: 'user-choice',
    kind: 'user',
    delayMs: 4500,
    text: '4',
  },
  {
    id: 'kyc',
    kind: 'kyc',
    delayMs: 1200,
    workTime: '5s',
  },
  {
    id: 'payment',
    kind: 'payment',
    delayMs: 1100,
    workTime: '6s',
  },
  {
    id: 'user-confirm',
    kind: 'user',
    delayMs: 5000,
    text: 'confirm',
  },
  {
    id: 'x-done',
    kind: 'agent',
    delayMs: 800,
    workTime: '7s',
    text: '✓ Transfer submitted. Coinbase on-ramp filled. USDC bridge processed. Airwallex CNY payout initiated.\n\n¥909.40 arriving in your WeChat Wallet in approximately 12 minutes.',
  },
]

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const isFast = new URLSearchParams(window.location.search).get('speed') === 'fast'
  const [platform, setPlatform] = useState<Platform>('codex')
  const [visibleCount, setVisibleCount] = useState(1)
  const [runId, setRunId] = useState(1)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifDismissed, setNotifDismissed] = useState(false)
  const isComplete = visibleCount >= chatSteps.length

  useEffect(() => {
    if (visibleCount >= chatSteps.length) return
    const delay = isFast ? 350 : chatSteps[visibleCount].delayMs
    const t = window.setTimeout(() => setVisibleCount(c => c + 1), delay)
    return () => window.clearTimeout(t)
  }, [isFast, visibleCount])

  useEffect(() => {
    if (!isComplete || notifDismissed) return
    const t = window.setTimeout(() => setNotifOpen(true), 1800)
    return () => window.clearTimeout(t)
  }, [isComplete, notifDismissed, runId])

  const restart = () => {
    setVisibleCount(1)
    setNotifOpen(false)
    setNotifDismissed(false)
    setRunId(id => id + 1)
  }

  const visibleSteps = chatSteps.slice(0, visibleCount)
  const lastStep = visibleSteps[visibleSteps.length - 1]
  const showThinking = !isComplete && lastStep?.kind === 'user'

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">X · Agent-native payments</p>
        <h1>Works in every AI tool you already use</h1>
        <p className="hero-sub">
          Drop one line into Codex, Claude, or Gemini. Same transfer, same result —
          your agent handles it while staying in its native interface.
        </p>
      </section>

      {/* Platform switcher */}
      <div className="platform-tabs-wrap">
        <div className="platform-tabs">
          {(['codex', 'claude', 'gemini'] as Platform[]).map(p => (
            <button
              key={p}
              className={`platform-tab ${platform === p ? 'active' : ''}`}
              onClick={() => setPlatform(p)}
            >
              {p === 'codex' && <CodexLogo />}
              {p === 'claude' && <ClaudeLogo />}
              {p === 'gemini' && <GeminiLogo />}
              <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="demo-wrap">
        {platform === 'codex' && (
          <CodexWindow visibleSteps={visibleSteps} showThinking={showThinking} isComplete={isComplete} restart={restart} />
        )}
        {platform === 'claude' && (
          <ClaudeWindow visibleSteps={visibleSteps} showThinking={showThinking} isComplete={isComplete} restart={restart} />
        )}
        {platform === 'gemini' && (
          <GeminiWindow visibleSteps={visibleSteps} showThinking={showThinking} isComplete={isComplete} restart={restart} />
        )}
      </div>

      <section className="value-props">
        <div className="value-prop">
          <strong>Always on your side</strong>
          <p>X has no stake in which route wins. It scans every rail — SWIFT, fintechs, stablecoin bridges — and picks the one that delivers the most to your recipient.</p>
        </div>
        <div className="value-prop">
          <strong>KYC once, reused forever</strong>
          <p>Verify once. X stores your identity encrypted and handles every partner's KYC — on-ramp, off-ramp, Travel Rule — automatically on every transfer.</p>
        </div>
        <div className="value-prop">
          <strong>Works in any AI tool</strong>
          <p>One command. Codex, Claude, Gemini, or any MCP-compatible agent. No new app to learn — X extends the tools you already use.</p>
        </div>
      </section>

      <aside className={`mac-notif ${notifOpen ? 'is-visible' : ''}`} aria-hidden={!notifOpen}>
        <div className="wechat-icon">
          <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="15" cy="19" r="10" fill="#fff" />
            <circle cx="26" cy="15" r="11" fill="#fff" fillOpacity="0.88" />
          </svg>
        </div>
        <div>
          <div className="notif-topline"><strong>WeChat</strong><span>now</span></div>
          <p>X delivered ¥909.40 CNY to your WeChat Wallet.</p>
        </div>
        <button className="notif-close" onClick={() => { setNotifOpen(false); setNotifDismissed(true) }}>×</button>
      </aside>
    </main>
  )
}

// ── Shared types for window props ─────────────────────────────────────────────

type WindowProps = {
  visibleSteps: ChatStep[]
  showThinking: boolean
  isComplete: boolean
  restart: () => void
}

// ── Shared message content ────────────────────────────────────────────────────

function RoutesContent() {
  return (
    <div className="msg-rich">
      <p>I found 4 routes for your £100 GBP → CNY transfer:</p>
      <div className="route-list">
        <div className="route-opt">
          <p><strong>1. Bank wire</strong> — SWIFT correspondent</p>
          <p className="route-detail">Rate: 1 GBP = 8.71 CNY &nbsp;·&nbsp; Fee: £12.00 &nbsp;·&nbsp; You receive: <strong>¥769.08</strong> &nbsp;·&nbsp; 3–5 days</p>
        </div>
        <div className="route-opt">
          <p><strong>2. Wise</strong> — Local payout network</p>
          <p className="route-detail">Rate: 1 GBP = 8.94 CNY &nbsp;·&nbsp; Fee: £1.39 &nbsp;·&nbsp; You receive: <strong>¥905.17</strong> &nbsp;·&nbsp; Same day</p>
        </div>
        <div className="route-opt">
          <p><strong>3. Western Union</strong> — Card + local payout</p>
          <p className="route-detail">Rate: 1 GBP = 8.81 CNY &nbsp;·&nbsp; Fee: £3.90 &nbsp;·&nbsp; You receive: <strong>¥861.39</strong> &nbsp;·&nbsp; Minutes</p>
        </div>
        <div className="route-opt best-opt">
          <p><strong>4. X Stablecoin route</strong> — GBP on-ramp → USDC bridge → CNY off-ramp <span className="best-tag">★ Best rate</span></p>
          <p className="route-detail">Rate: 1 GBP = 9.09 CNY &nbsp;·&nbsp; Fee: £0.48 &nbsp;·&nbsp; You receive: <strong className="best-amt">¥909.40</strong> &nbsp;·&nbsp; ~12 min</p>
        </div>
      </div>
      <p className="route-prompt">Which route would you like? Reply <strong>1</strong>, <strong>2</strong>, <strong>3</strong>, or <strong>4</strong>.</p>
    </div>
  )
}

function KycContent() {
  return (
    <div className="msg-rich">
      <p>Checking KYC requirements for route 4 (stablecoin):</p>
      <div className="kyc-section">
        <p><strong>On-ramp — Coinbase Institutional (GBP → USDC)</strong></p>
        <p>✓ KYC verified — your existing Coinbase account qualifies. No new forms required.</p>
      </div>
      <div className="kyc-section">
        <p><strong>Off-ramp — Airwallex (USDC → CNY)</strong></p>
        <p>✓ Identity matched using your stored profile (name, DOB, address, Passport ****4829)</p>
        <p>⚡ Travel Rule packet auto-generated for the GBP/CNY corridor</p>
      </div>
      <p>All checks passed. No action needed from you.</p>
    </div>
  )
}

function PaymentContent() {
  return (
    <div className="msg-rich">
      <p>Here's your transfer summary:</p>
      <div className="pay-summary">
        <div className="pay-row-t"><span>Send</span><span>£100.00 GBP</span></div>
        <div className="pay-row-t"><span>Rate</span><span>1 GBP = 9.09 CNY (near-spot)</span></div>
        <div className="pay-row-t"><span>Fee</span><span>£0.48</span></div>
        <div className="pay-row-t pay-hl"><span><strong>You receive</strong></span><span><strong>¥909.40 CNY</strong></span></div>
        <div className="pay-row-t"><span>Route</span><span>Coinbase → USDC → Airwallex → CNY</span></div>
        <div className="pay-row-t"><span>Arrives</span><span>~12 min · WeChat Wallet</span></div>
      </div>
      <p><strong>Funded from:</strong> Barclays current account ending **** 8842</p>
      <p>Reply <strong>confirm</strong> to proceed, or <strong>cancel</strong> to stop.</p>
    </div>
  )
}

function RichContent({ kind }: { kind: 'routes' | 'kyc' | 'payment' }) {
  if (kind === 'routes') return <RoutesContent />
  if (kind === 'kyc') return <KycContent />
  return <PaymentContent />
}

// ── CODEX WINDOW ──────────────────────────────────────────────────────────────

function CodexWindow({ visibleSteps, showThinking, restart }: WindowProps) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [visibleSteps.length])

  return (
    <div className="cx-window">
      <aside className="cx-sidebar">
        <div className="cx-sidebar-top">
          <div className="cx-traffic-lights">
            <span className="tl tl-red" /><span className="tl tl-yellow" /><span className="tl tl-green" />
          </div>
        </div>
        <nav className="cx-nav">
          <div className="cx-nav-item"><PlusIcon /> New chat</div>
          <div className="cx-nav-item"><SearchIcon /> Search</div>
          <div className="cx-nav-item cx-nav-muted">Plugins</div>
          <div className="cx-nav-item cx-nav-muted">Automations</div>
        </nav>
        <div className="cx-chats-section">
          <p className="cx-chats-label">Chats</p>
          <div className="cx-chat-item cx-chat-active">GBP → CNY transfer</div>
          <div className="cx-chat-item">Research stablecoin rails</div>
          <div className="cx-chat-item">Review KYC flow <span className="cx-chat-badge">Awaiting approval</span></div>
          <div className="cx-chat-item cx-chat-muted">Accept Circle terms <span className="cx-chat-date">2d</span></div>
        </div>
        <div className="cx-sidebar-footer">
          <span className="cx-footer-settings"><SettingsIcon /> Settings</span>
          <button className="cx-upgrade-btn">Upgrade</button>
        </div>
      </aside>

      <div className="cx-main">
        <div className="cx-main-header">
          <span className="cx-chat-title">GBP → CNY transfer</span>
          <span className="cx-header-icons">···</span>
        </div>

        <div className="cx-messages">
          {visibleSteps.map((step, i) => {
            const prevKind = visibleSteps[i - 1]?.kind
            const isFirstAgent = (step.kind === 'agent' || step.kind === 'routes' || step.kind === 'kyc' || step.kind === 'payment') && prevKind === 'user'
            const workTime = 'workTime' in step ? step.workTime : undefined

            if (step.kind === 'user') return (
              <div key={step.id} className="cx-msg-user-wrap">
                <div className="cx-msg-user"><p>{step.text}</p></div>
                <div className="cx-msg-user-actions">
                  <button><CopyIcon /></button><button><EditIcon /></button>
                </div>
              </div>
            )

            const content = step.kind === 'agent'
              ? (
                <>
                  {step.text.split('\n\n').map((p, j) => <p key={j}>{p}</p>)}
                  {step.install && (
                    <div className="cx-code-block">
                      <div className="cx-code-lang">sh</div>
                      <pre><code><span className="cx-code-kw">claude</span>{' mcp add x-pay https://x.money/mcp'}</code></pre>
                    </div>
                  )}
                </>
              )
              : <RichContent kind={step.kind} />

            return (
              <div key={step.id} className="cx-msg-agent-wrap">
                {isFirstAgent && workTime && <div className="cx-worked-row">Worked for {workTime} ›</div>}
                <div className="cx-msg-agent"><div className="cx-agent-text">{content}</div></div>
                <div className="cx-msg-agent-actions">
                  <button><CopyIcon /></button>
                </div>
              </div>
            )
          })}
          {showThinking && <div className="cx-thinking"><span className="typing-dots"><i /><i /><i /></span><span>Working…</span></div>}
          <div ref={endRef} />
        </div>

        <div className="cx-input-area">
          <div className="cx-input-bar"><span className="cx-input-placeholder">Ask for follow-up changes</span></div>
          <div className="cx-input-toolbar">
            <button className="cx-toolbar-btn" onClick={restart}>↺ Rerun demo</button>
            <div className="cx-toolbar-right"><span className="cx-model-badge">5.5 Medium</span><span className="cx-send-btn">↑</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CLAUDE WINDOW ─────────────────────────────────────────────────────────────

function ClaudeWindow({ visibleSteps, showThinking, restart }: WindowProps) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [visibleSteps.length])

  return (
    <div className="cl-window">
      <aside className="cl-sidebar">
        <div className="cl-sidebar-top">
          <span className="cl-logo">Claude</span>
          <button className="cl-toggle-btn">⊡</button>
        </div>
        <nav className="cl-nav">
          <div className="cl-nav-item cl-nav-primary"><span>+</span> New chat</div>
          <div className="cl-nav-item"><SearchIcon /> Search</div>
          <div className="cl-nav-item">💬 Chats</div>
          <div className="cl-nav-item">📁 Projects</div>
          <div className="cl-nav-item">&lt;/&gt; Code</div>
          <div className="cl-nav-item">✦ Customize</div>
          <div className="cl-nav-more">∨ More</div>
        </nav>
        <div className="cl-recents">
          <p className="cl-recents-label">Recents</p>
          <div className="cl-recent-item cl-recent-active">GBP → CNY transfer <span>⋯</span></div>
          <div className="cl-recent-item">Cross-border payments with stabl...</div>
          <div className="cl-recent-item">AI agents and the future of financi...</div>
          <div className="cl-recent-item">Building an AI agent for online mo...</div>
          <div className="cl-recent-item">Remote work and human connecti...</div>
        </div>
        <div className="cl-sidebar-footer">
          <div className="cl-user-row">
            <div className="cl-avatar">J</div>
            <div className="cl-user-info"><strong>James</strong><span>Pro plan</span></div>
            <span className="cl-user-arrow">↓</span>
          </div>
        </div>
      </aside>

      <div className="cl-main">
        <div className="cl-main-header">
          <div className="cl-chat-title-wrap">
            <span className="cl-chat-title">GBP → CNY transfer ∨</span>
          </div>
          <button className="cl-share-btn">Share</button>
        </div>

        <div className="cl-messages">
          {visibleSteps.map((step, i) => {
            const prevKind = visibleSteps[i - 1]?.kind

            if (step.kind === 'user') return (
              <div key={step.id} className="cl-msg-user-wrap">
                <div className="cl-msg-user"><p>{step.text}</p></div>
                <div className="cl-msg-user-actions"><button><CopyIcon /></button><button><EditIcon /></button></div>
              </div>
            )

            const isInstall = step.kind === 'agent' && step.install
            const content = step.kind === 'agent'
              ? (
                <div className="cl-agent-text">
                  {step.text.split('\n\n').map((p, j) => <p key={j}>{p}</p>)}
                  {isInstall && (
                    <div className="cl-code-block">
                      <span className="cl-code-label">sh</span>
                      <pre><code><span className="cl-code-kw">claude</span>{' mcp add x-pay https://x.money/mcp'}</code></pre>
                    </div>
                  )}
                </div>
              )
              : <div className="cl-agent-text"><RichContent kind={step.kind} /></div>

            const isFirstAgent = (step.kind !== 'user') && prevKind === 'user'
            return (
              <div key={step.id} className="cl-msg-agent-wrap">
                {content}
                <div className="cl-msg-agent-actions"><button><CopyIcon /></button></div>
              </div>
            )
          })}
          {showThinking && (
            <div className="cl-thinking">
              <span className="typing-dots"><i /><i /><i /></span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="cl-input-area">
          <div className="cl-input-box">
            <span className="cl-input-placeholder">Write a message…</span>
          </div>
          <div className="cl-input-toolbar">
            <button className="cl-toolbar-left">+</button>
            <div className="cl-toolbar-right">
              <button className="cl-rerun-btn" onClick={restart}>↺ Rerun</button>
              <span className="cl-model-label">Sonnet 4.6</span>
              <span className="cl-voice-icon">∿∿∿</span>
            </div>
          </div>
          <p className="cl-disclaimer">Claude.AI can make mistakes. Please double-check important information.</p>
        </div>
      </div>
    </div>
  )
}

// ── GEMINI WINDOW ─────────────────────────────────────────────────────────────

function GeminiWindow({ visibleSteps, showThinking, restart }: WindowProps) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [visibleSteps.length])

  return (
    <div className="gm-window">
      <aside className="gm-sidebar">
        <button className="gm-icon-btn">☰</button>
        <button className="gm-icon-btn">✏</button>
        <div className="gm-sidebar-spacer" />
        <button className="gm-icon-btn">🕒</button>
        <button className="gm-icon-btn">⚙</button>
      </aside>

      <div className="gm-main">
        <div className="gm-main-header">
          <div className="gm-header-left">
            <span className="gm-wordmark">Gemini</span>
          </div>
          <span className="gm-chat-title">GBP → CNY transfer</span>
          <div className="gm-header-right">
            <button className="gm-upgrade-btn"><GeminiLogo /> Upgrade</button>
            <span className="gm-header-icon">⊕</span>
            <span className="gm-header-icon">⋯</span>
            <div className="gm-avatar">B</div>
          </div>
        </div>

        <div className="gm-messages">
          {visibleSteps.map((step, i) => {
            if (step.kind === 'user') return (
              <div key={step.id} className="gm-msg-user-wrap">
                <div className="gm-msg-user-actions"><button><CopyIcon /></button><button><EditIcon /></button></div>
                <div className="gm-msg-user"><p>{step.text}</p></div>
              </div>
            )

            const content = step.kind === 'agent'
              ? (
                <div className="gm-agent-text">
                  {step.text.split('\n\n').map((p, j) => <p key={j}>{p}</p>)}
                  {step.install && (
                    <div className="gm-code-block">
                      <pre><code><span className="gm-code-kw">claude</span>{' mcp add x-pay https://x.money/mcp'}</code></pre>
                    </div>
                  )}
                </div>
              )
              : <div className="gm-agent-text"><RichContent kind={step.kind} /></div>

            return (
              <div key={step.id} className="gm-msg-agent-wrap">
                <div className="gm-agent-icon-col">
                  <GeminiGIcon />
                </div>
                <div className="gm-agent-body">
                  <div className="gm-show-thinking">Show thinking ∨</div>
                  {content}
                  <div className="gm-agent-actions"><button>🔗</button></div>
                </div>
              </div>
            )
          })}
          {showThinking && (
            <div className="gm-thinking">
              <GeminiGIcon />
              <div className="gm-thinking-body">
                <div className="gm-show-thinking">Show thinking ∨</div>
                <span className="typing-dots"><i /><i /><i /></span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="gm-input-area">
          <div className="gm-input-box">
            <span className="gm-input-placeholder">Ask Gemini</span>
            <div className="gm-input-toolbar">
              <span>+</span>
              <span className="gm-tools-btn">◎ Tools</span>
              <div className="gm-input-right">
                <button className="gm-rerun-btn" onClick={restart}>↺ Rerun</button>
                <span className="gm-thinking-btn">Thinking ∨</span>
                <span className="gm-mic">🎤</span>
              </div>
            </div>
          </div>
          <p className="gm-disclaimer">Gemini is AI and can make mistakes, including about people. <u>Your privacy & Gemini</u></p>
        </div>
      </div>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function PlusIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function SearchIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function SettingsIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M6.5 1v1M6.5 11v1M1 6.5h1M11 6.5h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function CopyIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 9V2.5A1.5 1.5 0 013.5 1H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function EditIcon() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-6 6H3V8l6-6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> }

// OpenAI / Codex logo — the OpenAI polyhedron mark
function CodexLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="3.5" fill="#000"/>
      {/* OpenAI logo: 6 rotated overlapping triangles forming a hexagonal shape */}
      <path
        d="M9 2.8L13.2 5.3V10.2L9 12.7L4.8 10.2V5.3L9 2.8Z
           M9 4.2L6 5.9V9.3L9 11L12 9.3V5.9L9 4.2Z"
        fill="white"
        fillRule="evenodd"
      />
      <circle cx="9" cy="7.6" r="1.35" fill="white"/>
    </svg>
  )
}

// Claude logo — Anthropic's Claude icon (warm orange with the concentric-arc mark)
function ClaudeLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="3.5" fill="#D97757"/>
      {/* Claude's characteristic concentric-arc / sunrise shape */}
      <path d="M4.5 12.5 Q6.5 6.5 9 5.5 Q11.5 6.5 13.5 12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M6 12.5 Q7.5 8.5 9 7.5 Q10.5 8.5 12 12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
    </svg>
  )
}

// Gemini logo — Google's exact 4-pointed star with gradient
function GeminiLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 1.5C9 5.91 5.91 9 1.5 9C5.91 9 9 12.09 9 16.5C9 12.09 12.09 9 16.5 9C12.09 9 9 5.91 9 1.5Z"
        fill="url(#gtab)"
      />
      <defs>
        <linearGradient id="gtab" x1="1.5" y1="1.5" x2="16.5" y2="16.5">
          <stop stopColor="#4285F4"/>
          <stop offset="1" stopColor="#EA4335"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// Gemini G icon shown next to each agent message
function GeminiGIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M11 2C11 7.52 7.52 11 2 11C7.52 11 11 14.48 11 20C11 14.48 14.48 11 20 11C14.48 11 11 7.52 11 2Z"
        fill="url(#gmsg)"
      />
      <defs>
        <linearGradient id="gmsg" x1="2" y1="2" x2="20" y2="20">
          <stop stopColor="#4285F4"/>
          <stop offset="0.5" stopColor="#9C27B0"/>
          <stop offset="1" stopColor="#EA4335"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
