import axios from 'axios'

interface ISendEmail {
  to?: string
  subject: string
  htmlMessage: string
  honeypot?: string
  timestamp?: number
  formData?: Record<string, unknown>
}

export const browserSendEmail = async ({
  to,
  subject,
  htmlMessage,
  honeypot,
  timestamp,
  formData,
}: ISendEmail) => {
  return await axios.post('/api/email', {
    to,
    subject,
    htmlMessage,
    honeypot,
    timestamp,
    formData,
  })
}
