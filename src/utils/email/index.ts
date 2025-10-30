import nodemailer, { TransportOptions } from 'nodemailer'
import striptags from 'striptags'

export interface ISendEmail {
  to?: string
  subject: string
  htmlMessage?: string
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
} as TransportOptions)

export const sendEmail = async ({
  to = process.env.RECIPIENT_EMAIL,
  subject,
  htmlMessage = '',
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
  })
}
