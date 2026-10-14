import axios from 'axios'
import { sendGAEvent } from '@next/third-parties/google'
import { getAttribution } from '@/utils/attribution'

export interface IFileAttachment {
  filename: string
  content: string // base64
  contentType: string
}

interface ISendEmail {
  to?: string
  subject: string
  htmlMessage?: string
  honeypot?: string
  timestamp?: number
  formData?: Record<string, unknown>
  attachments?: IFileAttachment[]
}

export const browserSendEmail = async ({
  to,
  subject,
  htmlMessage,
  honeypot,
  timestamp,
  formData,
  attachments,
}: ISendEmail) => {
  const response = await axios.post('/api/email', {
    to,
    subject,
    htmlMessage,
    honeypot,
    timestamp,
    formData,
    attachments,
    attribution: getAttribution(),
  })

  // Admin notification (no `to`) succeeding = one real lead. Record it in GA4.
  if (!to) {
    try {
      const formType = subject.includes('Partner') ? 'partner' : 'financing'
      sendGAEvent('event', 'generate_lead', {
        form_type: formType,
        lead_source: getAttribution().leadSource,
      })
    } catch {
      // analytics must never block a submission
    }
  }

  return response
}
