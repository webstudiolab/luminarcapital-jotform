import axios from 'axios'

interface ISendEmail {
  to?: string
  subject: string
  htmlMessage: string
  honeypot?: string
  timestamp?: number
}

export const browserSendEmail = async ({
  to,
  subject,
  htmlMessage,
  honeypot,
  timestamp,
}: ISendEmail) => {
  return await axios.post('/api/email', {
    to,
    subject,
    htmlMessage,
    honeypot,
    timestamp,
  })
}
