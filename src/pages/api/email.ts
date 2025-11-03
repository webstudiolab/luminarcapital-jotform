/*
import { NextApiResponse, NextApiRequest } from 'next'
import { sendEmail } from '@/utils/email'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { to, subject, htmlMessage } = req.body

    const response = await sendEmail({
      to,
      subject,
      htmlMessage,
    })
    res.status(200).json({ success: true, response, error: null })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, response: null, error: error as Error })
  }
}

export default handler
*/

import { NextApiResponse, NextApiRequest } from 'next'
import { sendEmail } from '@/utils/email'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { to, subject, htmlMessage } = req.body

    // Route to different emails based on form type
    let recipientEmail = to

    // If no 'to' is specified, route based on subject
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
