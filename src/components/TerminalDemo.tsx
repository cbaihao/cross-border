import { useEffect, useMemo, useState } from 'react'
import { terminalTimeline, type TimelineStep } from '../data/remittanceDemo'

type RenderedStep = Exclude<TimelineStep, { kind: 'notification' }>

type TerminalDemoProps = {
  onNotification: (notification: { appName: string; message: string }) => void
}

const isVisibleStep = (step: TimelineStep): step is RenderedStep => step.kind !== 'notification'

function useScriptedTimeline(onNotification: TerminalDemoProps['onNotification']) {
  const [visibleStepIds, setVisibleStepIds] = useState<string[]>([])

  useEffect(() => {
    let elapsed = 0
    const timers = terminalTimeline.map((step) => {
      elapsed += step.delayMs

      return window.setTimeout(() => {
        if (step.kind === 'notification') {
          onNotification({ appName: step.appName, message: step.message })
          return
        }

        setVisibleStepIds((current) =>
          current.includes(step.id) ? current : [...current, step.id],
        )
      }, elapsed)
    })

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [onNotification])

  return useMemo(
    () =>
      terminalTimeline.filter(
        (step): step is RenderedStep => isVisibleStep(step) && visibleStepIds.includes(step.id),
      ),
    [visibleStepIds],
  )
}

export function TerminalDemo({ onNotification }: TerminalDemoProps) {
  const visibleSteps = useScriptedTimeline(onNotification)

  return (
    <section className="terminal-demo" aria-label="Scripted X remittance terminal demo">
      <header className="terminal-demo__chrome" aria-label="Terminal window controls">
        <span className="terminal-demo__control terminal-demo__control--close" />
        <span className="terminal-demo__control terminal-demo__control--minimize" />
        <span className="terminal-demo__control terminal-demo__control--maximize" />
        <span className="terminal-demo__title">x-agent / cross-border-remittance</span>
      </header>

      <div className="terminal-demo__body" role="log" aria-live="polite">
        {visibleSteps.map((step) => (
          <TerminalStep key={step.id} step={step} />
        ))}
        <div className="terminal-demo__cursor" aria-hidden="true">
          _
        </div>
      </div>
    </section>
  )
}

function TerminalStep({ step }: { step: RenderedStep }) {
  if (step.kind === 'lines') {
    return (
      <div className="terminal-step terminal-step--lines">
        {step.lines.map((line) => (
          <p
            className={`terminal-line terminal-line--${line.tone ?? 'muted'}`}
            key={line.text}
          >
            {line.text}
          </p>
        ))}
      </div>
    )
  }

  if (step.kind === 'routes') {
    return (
      <section className="terminal-panel terminal-panel--routes">
        <h2 className="terminal-panel__title">{step.title}</h2>
        <div className="terminal-route-table" role="table" aria-label="Route comparison">
          <div className="terminal-route-table__row terminal-route-table__row--header" role="row">
            <span role="columnheader">Route</span>
            <span role="columnheader">FX</span>
            <span role="columnheader">Fees</span>
            <span role="columnheader">Recipient</span>
            <span role="columnheader">Speed</span>
            <span role="columnheader">KYC</span>
            <span role="columnheader">Confidence</span>
          </div>
          {step.routes.map((route) => (
            <div
              className={`terminal-route-table__row terminal-route-table__row--${route.id}${
                route.recommendation === 'winner' ? ' terminal-route-table__row--winner' : ''
              }`}
              role="row"
              key={route.id}
            >
              <span role="cell">
                <strong>{route.label}</strong>
                <small>{route.rails}</small>
              </span>
              <span role="cell">{route.fxRate}</span>
              <span role="cell">{route.feesUsd}</span>
              <span role="cell">{route.recipientAmountCny}</span>
              <span role="cell">{route.estimatedSpeed}</span>
              <span role="cell">{route.kycBurden}</span>
              <span role="cell" className={`terminal-status terminal-status--${route.confidence}`}>
                {route.confidence}
              </span>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (step.kind === 'pii') {
    return (
      <section className="terminal-panel terminal-panel--pii">
        <h2 className="terminal-panel__title">{step.title}</h2>
        <p className="terminal-line terminal-line--success">
          Existing verified profile found. Reusing masked PII from secure vault.
        </p>
        <dl className="terminal-pii-list">
          {step.fields.map((field) => (
            <div className="terminal-pii-list__item" key={field.label}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
              <dd className={`terminal-badge terminal-badge--${field.reuse}`}>
                {field.reuse === 'stored' ? 'stored PII reused' : 'partner packet'}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    )
  }

  if (step.kind === 'kyc') {
    return (
      <section className="terminal-panel terminal-panel--kyc">
        <h2 className="terminal-panel__title">{step.title}</h2>
        <div className="terminal-kyc-list">
          {step.statuses.map((status) => (
            <article className="terminal-kyc-list__item" key={status.partner}>
              <div>
                <h3>{status.partner}</h3>
                <p>{status.requirement}</p>
              </div>
              <span className={`terminal-badge terminal-badge--${status.role}`}>{status.role}</span>
              <span className={`terminal-status terminal-status--${status.status}`}>
                {status.status} {status.timestamp}
              </span>
            </article>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="terminal-panel terminal-panel--payment">
      <h2 className="terminal-panel__title">{step.title}</h2>
      <div className="terminal-payment-card">
        <p>
          <strong>{step.method.label}</strong>
        </p>
        <p>
          Token {step.method.token} / {step.method.network} ending {step.method.lastFour}
        </p>
        <p>{step.method.authorization}</p>
      </div>
      {step.summary.map((line) => (
        <p className={`terminal-line terminal-line--${line.tone ?? 'muted'}`} key={line.text}>
          {line.text}
        </p>
      ))}
    </section>
  )
}
