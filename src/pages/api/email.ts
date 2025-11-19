import { NextApiResponse, NextApiRequest } from 'next'
import { sendEmail } from '@/utils/email'
import { validateSpam } from '@/lib/spamProtection'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      to,
      subject,
      htmlMessage,
      recaptchaToken,
      honeypot,
      timestamp,
    } = req.body

    // SPAM VALIDATION - Only if spam protection data is provided
    if (recaptchaToken && timestamp !== undefined) {
      const spamCheck = await validateSpam(
        recaptchaToken,
        honeypot,
        timestamp,
        'contact_form',
      )

      if (!spamCheck.isValid) {
        console.warn('Spam detected:', spamCheck.reason)
        // Return success to bot (don't let them know we caught them)
        return res.status(200).json({ success: true, response: null, error: null })
      }
    }

    // Route to different emails based on form type
    let recipientEmail = to

    // If no 'to' is specified, route based on subject
    if (!to) {
      if (subject && subject.includes('Partner')) {
        recipientEmail =
          process.env.PARTNER_EMAIL || 'partners@luminarcapital.com'
      } else if (subject && subject.includes('Financing')) {
        recipientEmail =
          process.env.FINANCING_EMAIL || 'clientsuccess@luminarcapital.com'
      } else {
        recipientEmail = process.env.RECIPIENT_EMAIL
      }
    }

    console.log('=== EMAIL DEBUG ===')
    console.log('To:', recipientEmail)
    console.log('Subject:', subject)
    console.log('Spam Protection:', recaptchaToken ? 'ENABLED' : 'DISABLED')

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
