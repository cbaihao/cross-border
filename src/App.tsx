import { useEffect, useRef, useState } from 'react'
import './App.css'
import claudeLogoSrc from './assets/claude-logo.svg'
import openaiLogoSrc from './assets/openai-logo.png'

// ── Platform type ─────────────────────────────────────────────────────────────

type Platform = 'codex' | 'claude' | 'gemini'

// ── Chat step types ───────────────────────────────────────────────────────────

type ChatStep =
  | { id: string; delayMs: number; kind: 'user'; text: string }
  | { id: string; delayMs: number; kind: 'agent'; workTime: string; text: string; install?: string }
  | { id: string; delayMs: number; kind: 'routes'; workTime: string }
  | { id: string; delayMs: number; kind: 'kyc'; workTime: string }
  | { id: string; delayMs: number; kind: 'checking'; text: string; doneText?: string }
  | { id: string; delayMs: number; kind: 'payment'; workTime: string }

// ── Timeline ──────────────────────────────────────────────────────────────────

export const TRACK_TRANSACTIONS_URL = 'https://midas.ai/myaccount/transactions'

const chatSteps: ChatStep[] = [
  {
    id: 'user-ask',
    kind: 'user',
    delayMs: 0,
    text: 'i need you to send 100 USD to my CNY wechat account. can you do it?',
  },
  {
    id: 'agent-decline',
    kind: 'agent',
    delayMs: 1400,
    workTime: '1s',
    text: "I can't send money — I'm an AI assistant without access to banking systems or payment networks.",
  },
  {
    id: 'user-install',
    kind: 'user',
    delayMs: 3000,
    text: 'Get access to my finance using midas.ai, set up secure access following this guide https://midas.ai/skills/setup.md',
  },
  {
    id: 'x-otp',
    kind: 'agent',
    delayMs: 900,
    workTime: '1s',
    text: 'midas.ai connected. Sending a one-time passcode to s***@gmail.com — paste it here to verify your account.',
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
    text: 'Authenticated as Summer via midas.ai. Linked accounts found. Scanning all available USD → CNY routes for $100...',
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
    delayMs: 7000,
    text: '4',
  },
  {
    id: 'kyc',
    kind: 'kyc',
    delayMs: 1200,
    workTime: '3s',
  },
  {
    id: 'kyc-checking',
    kind: 'checking',
    delayMs: 400,
    text: 'Checking if any information is required from the user...',
    doneText: 'No further information required from the user.',
  },
  {
    id: 'payment',
    kind: 'payment',
    delayMs: 4800,
    workTime: '6s',
  },
  {
    id: 'user-confirm',
    kind: 'user',
    delayMs: 5000,
    text: 'confirm',
  },
  {
    id: 'x-submit',
    kind: 'checking',
    delayMs: 500,
    text: 'Submitting transfer...',
  },
  {
    id: 'x-done',
    kind: 'agent',
    delayMs: 5000,
    workTime: '7s',
    text: '__TRANSFER_DONE__',
  },
]

/** Hide transient interim bubbles once the next phase is revealed. */
function visibleStepsForDemo(visibleCount: number): ChatStep[] {
  const slice = chatSteps.slice(0, visibleCount)
  const doneIdx = chatSteps.findIndex(s => s.id === 'x-done')
  const transferDoneVisible = doneIdx >= 0 && visibleCount > doneIdx
  return slice.filter(s => {
    if (s.id === 'x-submit' && transferDoneVisible) return false
    return true
  })
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const isFast = new URLSearchParams(window.location.search).get('speed') === 'fast'
  const [platform, setPlatform] = useState<Platform>('codex')
  const [visibleCount, setVisibleCount] = useState(1)
  const [runId, setRunId] = useState(1)
  const [notifOpen, setNotifOpen] = useState(false)
  const [waitlistOpen, setWaitlistOpen] = useState(false)
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
    const delayMs = 5500 + Math.floor(Math.random() * 4500)
    const t = window.setTimeout(() => setNotifOpen(true), delayMs)
    return () => window.clearTimeout(t)
  }, [isComplete, notifDismissed, runId])

  const restart = () => {
    setVisibleCount(1)
    setNotifOpen(false)
    setNotifDismissed(false)
    setRunId(id => id + 1)
  }

  const visibleSteps = visibleStepsForDemo(visibleCount)
  const lastStep = visibleSteps[visibleSteps.length - 1]
  const showThinking = !isComplete && lastStep?.kind === 'user'

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">midas.ai</p>
        <h1>Your AI tools,<br />securely handles payment</h1>
        <p className="hero-sub">An agent-native Cross-Border remittance workflow.</p>
        <button className="cta-btn" onClick={() => setWaitlistOpen(true)}>
          Join the waitlist
        </button>
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
          <p>midas.ai has no stake in which route wins. It scans every rail across SWIFT, fintechs, and stablecoin bridges and picks the one that delivers the most to your recipient.</p>
        </div>
        <div className="value-prop">
          <strong>KYC once, reused forever</strong>
          <p>Verify once. midas.ai stores your identity encrypted and handles every partner's KYC including on-ramp, off-ramp, and Travel Rule automatically on every transfer.</p>
        </div>
        <div className="value-prop">
          <strong>Works in any AI tool</strong>
          <p>One command. Codex, Claude, Gemini, or any MCP-compatible agent. No new app to learn. midas.ai extends the tools you already use.</p>
        </div>
      </section>

      <div className="cta-section">
        <button className="cta-btn" onClick={() => setWaitlistOpen(true)}>
          Join the waitlist
        </button>
      </div>

      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-brand">midas.ai</span>
          <nav className="footer-links" aria-label="Footer">
            <a href="#">About</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Licenses</a>
            <a href="#">Contact</a>
          </nav>
          <span className="footer-copy">&copy; 2026 Midas Financial Technologies Ltd. All rights reserved.</span>
        </div>
      </footer>

      {waitlistOpen && <WaitlistModal onClose={() => setWaitlistOpen(false)} />}

      <aside className={`mac-notif ${notifOpen ? 'is-visible' : ''}`} aria-hidden={!notifOpen}>
        <div className="wechat-icon">
          <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="15" cy="19" r="10" fill="#fff" />
            <circle cx="26" cy="15" r="11" fill="#fff" fillOpacity="0.88" />
          </svg>
        </div>
        <div>
          <div className="notif-topline"><strong>WeChat</strong><span>now</span></div>
          <p>midas.ai delivered ¥677.45 CNY to your WeChat Wallet.</p>
        </div>
        <button className="notif-close" onClick={() => { setNotifOpen(false); setNotifDismissed(true) }}>×</button>
      </aside>
    </main>
  )
}

// ── Waitlist modal ─────────────────────────────────────────────────────────────

function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [fields, setFields] = useState({ name: '', email: '', linkedin: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="wl-backdrop" onClick={onClose}>
      <div className="wl-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Join the waitlist">
        <button className="wl-close" onClick={onClose} aria-label="Close">×</button>

        {submitted ? (
          <div className="wl-success">
            <p className="wl-success-mark">·</p>
            <h2>You're on the list.</h2>
            <p>We'll reach out to <strong>{fields.email}</strong> when early access opens.</p>
          </div>
        ) : (
          <>
            <div className="wl-header">
              <p className="wl-eyebrow">midas.ai · Early access</p>
              <h2 className="wl-title">Join the waitlist</h2>
              <p className="wl-sub">We're onboarding a small group of early users. Drop your details and we'll be in touch.</p>
            </div>
            <form className="wl-form" onSubmit={handleSubmit}>
              <label className="wl-label">
                Full name
                <input
                  className="wl-input"
                  type="text"
                  placeholder="Summer"
                  value={fields.name}
                  onChange={e => setFields(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label className="wl-label">
                Email
                <input
                  className="wl-input"
                  type="email"
                  placeholder="summer@example.com"
                  value={fields.email}
                  onChange={e => setFields(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </label>
              <label className="wl-label">
                LinkedIn URL
                <input
                  className="wl-input"
                  type="url"
                  placeholder="https://linkedin.com/in/yourname"
                  value={fields.linkedin}
                  onChange={e => setFields(f => ({ ...f, linkedin: e.target.value }))}
                />
              </label>
              <button className="wl-submit" type="submit">Request early access</button>
            </form>
          </>
        )}
      </div>
    </div>
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
      <p>Four USD → CNY options for $100:</p>
      <div className="route-rows">
        <div className="route-row">
          <span className="route-num">1</span>
          <span className="route-name">Bank wire (SWIFT)</span>
          <span className="route-stats">¥608.14 &nbsp;·&nbsp; $18.00 fee &nbsp;·&nbsp; 3–5 days</span>
        </div>
        <div className="route-row">
          <span className="route-num">2</span>
          <span className="route-name">Wise</span>
          <span className="route-stats">¥659.28 &nbsp;·&nbsp; $2.53 fee &nbsp;·&nbsp; same day</span>
        </div>
        <div className="route-row">
          <span className="route-num">3</span>
          <span className="route-name">Remitly</span>
          <span className="route-stats">¥642.85 &nbsp;·&nbsp; $3.99 fee &nbsp;·&nbsp; minutes</span>
        </div>
        <div className="route-row route-row--best">
          <span className="route-num route-num--best">4</span>
          <span className="route-name">Stablecoin <span className="best-tag">Recommended</span></span>
          <span className="route-stats"><strong className="best-amt">¥677.45</strong> &nbsp;·&nbsp; $0.50 fee &nbsp;·&nbsp; ~12 min &nbsp;·&nbsp; USD → USDC → CNY</span>
        </div>
      </div>
      <p className="route-prompt">Reply <strong>1</strong>, <strong>2</strong>, <strong>3</strong>, or <strong>4</strong>.</p>
    </div>
  )
}

function KycContent() {
  return (
    <div className="msg-rich">
      <p>Checking KYC requirements for Route 4 (stablecoin):</p>
      <div className="kyc-tiles">
        <div className="kyc-section kyc-section--onramp">
          <p><strong>On-ramp — Circle (USD → USDC via Chase ACH)</strong></p>
          <p>· Linked bank account verified, ACH pull authorized</p>
        </div>
        <div className="kyc-section kyc-section--offramp">
          <p><strong>Off-ramp — Airwallex (USDC → CNY)</strong></p>
          <p>· KYC profile on file, Travel Rule required for this corridor</p>
          <p>· Required fields: full legal name, date of birth, residential address, government-issued ID (Passport ****4829)</p>
        </div>
      </div>
    </div>
  )
}

function CheckingContent({ text, doneText }: { text: string; doneText?: string }) {
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!doneText) return
    const t = setTimeout(() => setDone(true), 3000)
    return () => clearTimeout(t)
  }, [doneText])

  return (
    <div className="msg-rich">
      {done
        ? <p>{doneText}</p>
        : <p className="checking-line"><span className="typing-dots"><i /><i /><i /></span>{text}</p>
      }
    </div>
  )
}

function PaymentContent() {
  return (
    <div className="msg-rich">
      <p>Here's your transfer summary:</p>
      <div className="pay-summary">
        <div className="pay-row-t"><span>Send</span><span>$100.00 USD</span></div>
        <div className="pay-row-t"><span>Rate</span><span>1 USD = 6.81 CNY (near-spot)</span></div>
        <div className="pay-row-t"><span>Fee</span><span>$0.50</span></div>
        <div className="pay-row-t pay-hl"><span><strong>You receive</strong></span><span><strong>¥677.45 CNY</strong></span></div>
        <div className="pay-row-t"><span>Route</span><span>Circle → USDC → Airwallex → CNY</span></div>
        <div className="pay-row-t"><span>Destination</span><span>WeChat Wallet · ETA after send on tracker</span></div>
      </div>
      <p><strong>Funded from:</strong> Chase ACH ending **** 4821</p>
      <p>Reply <strong>confirm</strong> to proceed, or <strong>cancel</strong> to stop.</p>
    </div>
  )
}

function RichContent({ step }: { step: Extract<ChatStep, { kind: 'routes' | 'kyc' | 'checking' | 'payment' }> }) {
  if (step.kind === 'routes') return <RoutesContent />
  if (step.kind === 'kyc') return <KycContent />
  if (step.kind === 'checking') return <CheckingContent text={step.text} doneText={step.doneText} />
  return <PaymentContent />
}

function TransferDoneContent() {
  return (
    <div className="msg-rich transfer-done-rich">
      <p>
        Transfer submitted. Circle ACH pull initiated, USDC bridge processed, Airwallex CNY payout underway to your WeChat Wallet (<strong>¥677.45</strong>).
      </p>
      <p className="track-label"><strong>Track your transaction:</strong></p>
      <p className="track-link-wrap">
        <a href={TRACK_TRANSACTIONS_URL} target="_blank" rel="noopener noreferrer" className="track-link">{TRACK_TRANSACTIONS_URL}</a>
      </p>
      <p className="transfer-done-foot subtle">You'll get a push notification when funds land.</p>
    </div>
  )
}

function renderAgentBody(step: Extract<ChatStep, { kind: 'agent' }>) {
  if (step.id === 'x-done') return <TransferDoneContent />
  return (
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
}

// ── CODEX WINDOW ──────────────────────────────────────────────────────────────

function CodexWindow({ visibleSteps, showThinking, restart }: WindowProps) {
  const msgsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    })
    return () => cancelAnimationFrame(raf)
  }, [visibleSteps.length])

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
          <div className="cx-chat-item cx-chat-active">USD → CNY transfer</div>
        </div>
        <div className="cx-sidebar-footer">
          <span className="cx-footer-settings"><SettingsIcon /> Settings</span>
          <button className="cx-upgrade-btn">Upgrade</button>
        </div>
      </aside>

      <div className="cx-main">
        <div className="cx-main-header">
          <span className="cx-chat-title">USD → CNY transfer</span>
          <span className="cx-header-icons">···</span>
        </div>

        <div className="cx-messages" ref={msgsRef}>
          {visibleSteps.map((step) => {
            const workTime = 'workTime' in step ? (step as { workTime: string }).workTime : undefined

            if (step.kind === 'user') return (
              <div key={step.id} className="cx-msg-user-wrap">
                <div className="cx-msg-user"><p>{step.text}</p></div>
                <div className="cx-msg-user-actions">
                  <button><CopyIcon /></button><button><EditIcon /></button>
                </div>
              </div>
            )

            const content = step.kind === 'agent'
              ? renderAgentBody(step)
              : <RichContent step={step as Extract<ChatStep, { kind: 'routes' | 'kyc' | 'checking' | 'payment' }>} />

            return (
              <div key={step.id} className="cx-msg-agent-wrap">
                {workTime && <div className="cx-worked-row">Worked for {workTime} ›</div>}
                <div className="cx-msg-agent"><div className="cx-agent-text">{content}</div></div>
                <div className="cx-msg-agent-actions"><button><CopyIcon /></button></div>
              </div>
            )
          })}
          {showThinking && <div className="cx-thinking"><span className="typing-dots"><i /><i /><i /></span><span>Working…</span></div>}
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
  const msgsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    })
    return () => cancelAnimationFrame(raf)
  }, [visibleSteps.length])

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
          <div className="cl-nav-item">— Chats</div>
          <div className="cl-nav-item">— Projects</div>
          <div className="cl-nav-item">&lt;/&gt; Code</div>
          <div className="cl-nav-item">· Customize</div>
          <div className="cl-nav-more">∨ More</div>
        </nav>
        <div className="cl-recents">
          <p className="cl-recents-label">Recents</p>
          <div className="cl-recent-item cl-recent-active">USD → CNY transfer <span>⋯</span></div>
        </div>
        <div className="cl-sidebar-footer">
          <div className="cl-user-row">
            <div className="cl-avatar">S</div>
            <div className="cl-user-info"><strong>Summer</strong><span>Pro plan</span></div>
            <span className="cl-user-arrow">↓</span>
          </div>
        </div>
      </aside>

      <div className="cl-main">
        <div className="cl-main-header">
          <div className="cl-chat-title-wrap">
            <span className="cl-chat-title">USD → CNY transfer ∨</span>
          </div>
          <button className="cl-share-btn">Share</button>
        </div>

        <div className="cl-messages" ref={msgsRef}>
          {visibleSteps.map((step) => {
            const workTime = 'workTime' in step ? (step as { workTime: string }).workTime : undefined

            if (step.kind === 'user') return (
              <div key={step.id} className="cl-msg-user-wrap">
                <div className="cl-msg-user"><p>{step.text}</p></div>
                <div className="cl-msg-user-actions"><button><CopyIcon /></button><button><EditIcon /></button></div>
              </div>
            )

            const content = step.kind === 'agent'
              ? <div className="cl-agent-text">{renderAgentBody(step)}</div>
              : <div className="cl-agent-text"><RichContent step={step as Extract<ChatStep, { kind: 'routes' | 'kyc' | 'checking' | 'payment' }>} /></div>

            return (
              <div key={step.id} className="cl-msg-agent-wrap">
                {workTime && <div className="cl-worked-row">Worked for {workTime}</div>}
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
  const msgsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    })
    return () => cancelAnimationFrame(raf)
  }, [visibleSteps.length])

  return (
    <div className="gm-window">
      <aside className="gm-sidebar">
        <button className="gm-icon-btn">☰</button>
        <button className="gm-icon-btn">✏</button>
        <div className="gm-sidebar-spacer" />
        <button className="gm-icon-btn">◷</button>
        <button className="gm-icon-btn">⚙</button>
      </aside>

      <div className="gm-main">
        <div className="gm-main-header">
          <div className="gm-header-left">
            <span className="gm-wordmark">Gemini</span>
          </div>
          <span className="gm-chat-title">USD → CNY transfer</span>
          <div className="gm-header-right">
            <span className="gm-header-icon">⊕</span>
            <span className="gm-header-icon">⋯</span>
            <div className="gm-avatar">B</div>
          </div>
        </div>

        <div className="gm-messages" ref={msgsRef}>
          {visibleSteps.map((step) => {
            const workTime = 'workTime' in step ? (step as { workTime: string }).workTime : undefined

            if (step.kind === 'user') return (
              <div key={step.id} className="gm-msg-user-wrap">
                <div className="gm-msg-user-actions"><button><CopyIcon /></button><button><EditIcon /></button></div>
                <div className="gm-msg-user"><p>{step.text}</p></div>
              </div>
            )

            const content = step.kind === 'agent'
              ? <div className="gm-agent-text">{renderAgentBody(step)}</div>
              : <div className="gm-agent-text"><RichContent step={step as Extract<ChatStep, { kind: 'routes' | 'kyc' | 'checking' | 'payment' }>} /></div>

            return (
              <div key={step.id} className="gm-msg-agent-wrap">
                <div className="gm-agent-icon-col">
                  <GeminiGIcon />
                </div>
                <div className="gm-agent-body">
                  {workTime && <div className="gm-worked-row">Worked for {workTime}</div>}
                  {content}
                  <div className="gm-agent-actions"><button>↗</button></div>
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
                <span className="gm-mic">◉</span>
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

// OpenAI / Codex logo
function CodexLogo() {
  return <img src={openaiLogoSrc} width="18" height="18" style={{ borderRadius: 3.5 }} alt="Codex" />
}

// Claude logo
function ClaudeLogo() {
  return <img src={claudeLogoSrc} width="18" height="18" style={{ borderRadius: 3.5 }} alt="Claude" />
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
