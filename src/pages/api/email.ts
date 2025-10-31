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
    
    console.log('=== EMAIL DEBUG ===')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASS,
      sender: process.env.SENDER_EMAIL,
      senderName: process.env.SENDER_NAME,
    })
    
    const response = await sendEmail({
      to,
      subject,
      htmlMessage,
    })
    
    console.log('Email sent successfully!')
    res.status(200).json({ success: true, response, error: null })
  } catch (error) {
    console.error('=== EMAIL ERROR ===')
    console.error('Full error:', error)
    console.error('Error message:', (error as Error).message)
    console.error('Error stack:', (error as Error).stack)
    
    res.status(500).json({ 
      success: false, 
      response: null, 
      error: (error as Error).message 
    })
  }
}

export default handler
