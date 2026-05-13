export type RouteOption = {
  id: string
  label: string
  rails: string
  fxRate: string
  feesUsd: string
  recipientAmountCny: string
  estimatedSpeed: string
  kycBurden: string
  confidence: 'high' | 'medium'
  recommendation?: 'winner'
}

export type MaskedPiiField = {
  label: string
  value: string
  reuse: 'stored' | 'partner-required'
}

export type PartnerKycStatus = {
  partner: string
  role: 'on-ramp' | 'off-ramp' | 'screening'
  requirement: string
  status: 'approved' | 'resolved'
  timestamp: string
}

export type PaymentMethod = {
  label: string
  token: string
  network: string
  lastFour: string
  authorization: string
}

export type TerminalLineTone =
  | 'prompt'
  | 'command'
  | 'muted'
  | 'success'
  | 'warning'
  | 'accent'

export type TerminalLine = {
  text: string
  tone?: TerminalLineTone
}

export type TimelineStep =
  | {
      id: string
      delayMs: number
      kind: 'lines'
      lines: TerminalLine[]
    }
  | {
      id: string
      delayMs: number
      kind: 'routes'
      title: string
      routes: RouteOption[]
    }
  | {
      id: string
      delayMs: number
      kind: 'pii'
      title: string
      fields: MaskedPiiField[]
    }
  | {
      id: string
      delayMs: number
      kind: 'kyc'
      title: string
      statuses: PartnerKycStatus[]
    }
  | {
      id: string
      delayMs: number
      kind: 'payment'
      title: string
      method: PaymentMethod
      summary: TerminalLine[]
    }
  | {
      id: string
      delayMs: number
      kind: 'notification'
      title: string
      appName: string
      message: string
    }

export const routeOptions: RouteOption[] = [
  {
    id: 'bank-wire',
    label: 'Bank wire',
    rails: 'USD wire -> correspondent -> CNY deposit',
    fxRate: '7.04',
    feesUsd: '$42.00',
    recipientAmountCny: '¥6,815.04',
    estimatedSpeed: '2-4 business days',
    kycBurden: 'manual bank review',
    confidence: 'medium',
  },
  {
    id: 'wise',
    label: 'Wise',
    rails: 'ACH debit -> Wise CNY payout',
    fxRate: '7.12',
    feesUsd: '$8.76',
    recipientAmountCny: '¥7,059.35',
    estimatedSpeed: 'same day',
    kycBurden: 'returning profile',
    confidence: 'high',
  },
  {
    id: 'card-remit',
    label: 'Card remittance',
    rails: 'card funding -> provider CNY payout',
    fxRate: '7.09',
    feesUsd: '$29.40',
    recipientAmountCny: '¥6,949.82',
    estimatedSpeed: 'minutes',
    kycBurden: 'card + provider checks',
    confidence: 'medium',
  },
  {
    id: 'stablecoin',
    label: 'Stablecoin route',
    rails: 'ACH on-ramp -> USDC bridge -> CNY off-ramp',
    fxRate: '7.24',
    feesUsd: '$3.80',
    recipientAmountCny: '¥7,211.42',
    estimatedSpeed: '< 10 minutes',
    kycBurden: 'stored PII + partner KYC',
    confidence: 'high',
    recommendation: 'winner',
  },
]

export const maskedPiiFields: MaskedPiiField[] = [
  { label: 'Legal name', value: 'J**** A****', reuse: 'stored' },
  { label: 'Date of birth', value: '**/**/19**', reuse: 'stored' },
  { label: 'Residential address', value: '*** Mission St, San Francisco, CA', reuse: 'stored' },
  { label: 'Government ID', value: 'passport metadata ending **42', reuse: 'stored' },
  { label: 'Travel rule profile', value: 'originator + beneficiary bundle v3', reuse: 'partner-required' },
]

export const partnerKycStatuses: PartnerKycStatus[] = [
  {
    partner: 'Northstar Trust',
    role: 'on-ramp',
    requirement: 'reusable identity attestation + ACH ownership evidence',
    status: 'approved',
    timestamp: '09:41:18',
  },
  {
    partner: 'Pacific Bridge Liquidity',
    role: 'screening',
    requirement: 'sanctions, wallet provenance, and travel rule packet',
    status: 'resolved',
    timestamp: '09:41:24',
  },
  {
    partner: 'Jade River Payments',
    role: 'off-ramp',
    requirement: 'beneficiary account validation + stored PII match',
    status: 'approved',
    timestamp: '09:41:31',
  },
]

export const paymentMethod: PaymentMethod = {
  label: 'Saved ACH payment method',
  token: 'pm_ach_x9H2...7Q',
  network: 'ACH',
  lastFour: '8842',
  authorization: 'standing repeat-transfer mandate on file',
}

export const terminalTimeline: TimelineStep[] = [
  {
    id: 'prompt',
    delayMs: 500,
    kind: 'lines',
    lines: [
      { text: 'user@macbook ~ % Using X, do a cross-border remittance from USD to Chinese yuan.', tone: 'prompt' },
      { text: 'x-agent: intent received. Preparing a local deterministic remittance plan.', tone: 'muted' },
    ],
  },
  {
    id: 'intent',
    delayMs: 1100,
    kind: 'lines',
    lines: [
      { text: '$ x remit plan --from USD --to CNY --amount 1000 --demo', tone: 'command' },
      { text: 'Parsed: send $1,000.00 USD to saved mainland CNY beneficiary.', tone: 'success' },
      { text: 'Defaults inferred for demo: returning user, saved beneficiary, quote lock requested.', tone: 'muted' },
    ],
  },
  {
    id: 'routes',
    delayMs: 1500,
    kind: 'routes',
    title: 'Route comparison',
    routes: routeOptions,
  },
  {
    id: 'recommendation',
    delayMs: 1800,
    kind: 'lines',
    lines: [
      { text: 'Recommendation: Stablecoin route wins on delivered CNY (near spot), fee, and speed.', tone: 'accent' },
      { text: 'Why: best FX 7.24 CNY/USD, lowest fee $3.80, expected arrival under 10 minutes.', tone: 'success' },
      { text: 'Risk check: regulated on-ramp/off-ramp available; confidence high.', tone: 'muted' },
    ],
  },
  {
    id: 'pii',
    delayMs: 1300,
    kind: 'pii',
    title: 'Secure vault lookup',
    fields: maskedPiiFields,
  },
  {
    id: 'kyc',
    delayMs: 1700,
    kind: 'kyc',
    title: 'Regulated partner KYC',
    statuses: partnerKycStatuses,
  },
  {
    id: 'screening',
    delayMs: 1400,
    kind: 'lines',
    lines: [
      { text: 'Evidence request received: confirm ACH ownership and beneficiary account purpose.', tone: 'warning' },
      { text: 'Submitted stored ACH token evidence and travel rule packet. No manual user action needed.', tone: 'success' },
      { text: 'Screening cleared. Quote locked for 60 seconds.', tone: 'success' },
    ],
  },
  {
    id: 'payment',
    delayMs: 1500,
    kind: 'payment',
    title: 'Payment authorization',
    method: paymentMethod,
    summary: [
      { text: 'Funding leg: $1,000.00 USD via tokenized ACH.', tone: 'muted' },
      { text: 'Authorization: scripted confirmation accepted for local demo.', tone: 'success' },
      { text: 'Repeat transfer benefit: no bank details or payment form re-entry.', tone: 'accent' },
    ],
  },
  {
    id: 'submit',
    delayMs: 1600,
    kind: 'lines',
    lines: [
      { text: '$ x remit submit --quote quote_cny_721142 --payment pm_ach_x9H2...7Q', tone: 'command' },
      { text: 'Payment confirmed. ACH debit scheduled and on-ramp order opened.', tone: 'success' },
      { text: 'USDC bridge filled. CNY off-ramp payout initiated to saved destination account.', tone: 'success' },
      { text: 'Transfer complete: ¥7,211.42 delivered.', tone: 'accent' },
    ],
  },
  {
    id: 'notification',
    delayMs: 800,
    kind: 'notification',
    title: 'Native notification trigger',
    appName: 'X',
    message: '$1,000 arrived in your WeChat Wallet (CNY).',
  },
]
