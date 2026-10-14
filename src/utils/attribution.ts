// Records where a visitor came from so every form submission carries its source.
// First touch is kept for 90 days; the current session's landing data is kept separately.

export interface IAttribution {
  leadSource: string
  firstTouch: ITouch | null
  lastTouch: ITouch | null
}

interface ITouch {
  source: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string
  referrer: string
  landingPage: string
  timestamp: string
}

const FIRST_KEY = 'lc_first_touch'
const LAST_KEY = 'lc_last_touch'
const FIRST_TTL_MS = 90 * 24 * 60 * 60 * 1000

const SEARCH_ENGINES = ['google.', 'bing.', 'yahoo.', 'duckduckgo.', 'ecosia.', 'yandex.', 'baidu.']
const SOCIAL = ['facebook.', 'instagram.', 'linkedin.', 'lnkd.in', 't.co', 'x.com', 'twitter.', 'youtube.', 'tiktok.', 'reddit.']
const AI = ['chatgpt.', 'openai.', 'perplexity.', 'gemini.google', 'claude.ai', 'copilot.microsoft']

const classify = (t: Omit<ITouch, 'source'>): string => {
  const medium = (t.utm_medium || '').toLowerCase()
  if (t.gclid || ['cpc', 'ppc', 'paid', 'paidsearch'].includes(medium)) return 'Paid search'
  if (medium === 'email') return 'Email'
  if (t.utm_source) return `Campaign (${t.utm_source})`
  if (!t.referrer) return 'Direct'
  let host = ''
  try {
    host = new URL(t.referrer).hostname.toLowerCase()
  } catch {
    return 'Referral'
  }
  if (host.endsWith('luminarcapital.com')) return 'Direct'
  if (AI.some((d) => host.includes(d))) return `AI assistant (${host})`
  if (SEARCH_ENGINES.some((d) => host.includes(d))) return `Organic search (${host})`
  if (SOCIAL.some((d) => host.includes(d))) return `Social (${host})`
  return `Referral (${host})`
}

const read = (storage: Storage | undefined, key: string): ITouch | null => {
  try {
    const raw = storage?.getItem(key)
    return raw ? (JSON.parse(raw) as ITouch) : null
  } catch {
    return null
  }
}

const write = (storage: Storage | undefined, key: string, value: ITouch) => {
  try {
    storage?.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable (private mode etc.), attribution falls back to null
  }
}

// Call once per page load (from _app).
export const captureAttribution = () => {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const base = {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
    gclid: params.get('gclid') || undefined,
    referrer: document.referrer || '',
    landingPage: window.location.pathname + window.location.search,
    timestamp: new Date().toISOString(),
  }
  const touch: ITouch = { ...base, source: classify(base) }

  let session: Storage | undefined
  let local: Storage | undefined
  try {
    session = window.sessionStorage
    local = window.localStorage
  } catch {
    return
  }

  // Only the first page of a session counts as its landing
  if (!read(session, LAST_KEY)) write(session, LAST_KEY, touch)

  const first = read(local, FIRST_KEY)
  const expired = first && Date.now() - new Date(first.timestamp).getTime() > FIRST_TTL_MS
  if (!first || expired) write(local, FIRST_KEY, touch)
}

export const getAttribution = (): IAttribution => {
  if (typeof window === 'undefined') {
    return { leadSource: 'Unknown', firstTouch: null, lastTouch: null }
  }
  let firstTouch: ITouch | null = null
  let lastTouch: ITouch | null = null
  try {
    firstTouch = read(window.localStorage, FIRST_KEY)
    lastTouch = read(window.sessionStorage, LAST_KEY)
  } catch {
    // ignore
  }
  return {
    leadSource: lastTouch?.source || firstTouch?.source || 'Unknown',
    firstTouch,
    lastTouch,
  }
}
