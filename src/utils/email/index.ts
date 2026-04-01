import nodemailer, { TransportOptions } from 'nodemailer'
import striptags from 'striptags'

export interface IAttachment {
  filename: string
  content: Buffer
  contentType: string
}

export interface ISendEmail {
  to?: string
  subject: string
  htmlMessage?: string
  attachments?: IAttachment[]
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
} as TransportOptions)

export const sendEmail = async ({
  to = process.env.RECIPIENT_EMAIL,
  subject,
  htmlMessage = '',
  attachments = [],
}: ISendEmail) => {
  const recipient = to || process.env.RECIPIENT_EMAIL
  console.log('Sending email to:', recipient)
  return await transporter.sendMail({
    from: {
      name: process.env.SENDER_NAME!,
      address: process.env.SENDER_EMAIL!,
    },
    to: recipient,
    subject,
    text: striptags(htmlMessage),
    html: htmlMessage,
    attachments: attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  })
}
