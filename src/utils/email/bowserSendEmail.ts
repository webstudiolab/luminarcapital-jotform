import axios from 'axios'
import { ISendEmail } from '@/utils/email/index'

export const browserSendEmail = async ({
  to,
  subject,
  htmlMessage,
}: ISendEmail) => {
  return await axios.post('/api/email', { to, subject, htmlMessage })
}
