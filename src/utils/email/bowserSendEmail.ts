import axios from 'axios'

interface ISendEmail {
  to?: string
  subject: string
  htmlMessage: string
  // SPAM PROTECTION - Add these optional fields
  recaptchaToken?: string
  honeypot?: string
  timestamp?: number
}

export const browserSendEmail = async ({
  to,
  subject,
  htmlMessage,
  recaptchaToken,
  honeypot,
  timestamp,
}: ISendEmail) => {
  return await axios.post('/api/email', {
    to,
    subject,
    htmlMessage,
    recaptchaToken,
    honeypot,
    timestamp,
  })
}