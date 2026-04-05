import axios from 'axios'

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
  return await axios.post('/api/email', {
    to,
    subject,
    htmlMessage,
    honeypot,
    timestamp,
    formData,
    attachments,
  })
}
