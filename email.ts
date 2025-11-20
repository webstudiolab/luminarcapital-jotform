import { NextApiResponse, NextApiRequest } from 'next'
import { sendEmail } from '@/utils/email'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { to, subject, htmlMessage, honeypot, timestamp } = req.body

    // SIMPLE SPAM PROTECTION - Honeypot only
    if (honeypot && honeypot.trim() !== '') {
      console.warn('Spam detected: Honeypot filled')
      return res.status(200).json({ success: true, response: null, error: null })
    }

    // SIMPLE SPAM PROTECTION - Timing check
    if (timestamp) {
      const elapsed = Date.now() - timestamp
      if (elapsed < 3000 || elapsed > 1800000) {
        console.warn('Spam detected: Suspicious timing')
        return res.status(200).json({ success: true, response: null, error: null })
      }
    }

    // Route emails based on subject
    let recipientEmail = to
    if (!to) {
      if (subject && subject.includes('Partner')) {
        recipientEmail = process.env.PARTNER_EMAIL || 'partners@luminarcapital.com'
      } else if (subject && subject.includes('Financing')) {
        recipientEmail = process.env.FINANCING_EMAIL || 'clientsuccess@luminarcapital.com'
      } else {
        recipientEmail = process.env.RECIPIENT_EMAIL
      }
    }

    console.log('=== EMAIL DEBUG ===')
    console.log('To:', recipientEmail)
    console.log('Subject:', subject)

    const response = await sendEmail({
      to: recipientEmail,
      subject,
      htmlMessage,
    })

    console.log('Email sent successfully!')
    res.status(200).json({ success: true, response, error: null })
  } catch (error) {
    console.error('=== EMAIL ERROR ===')
    console.error('Full error:', error)
    console.error('Error message:', (error as Error).message)
    res.status(500).json({
      success: false,
      response: null,
      error: (error as Error).message,
    })
  }
}

export default handler
