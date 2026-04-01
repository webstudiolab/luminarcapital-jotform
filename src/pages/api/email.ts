import { NextApiResponse, NextApiRequest } from 'next'
import { sendEmail } from '@/utils/email'
import PDFDocument from 'pdfkit'

const generateApplicationPDF = async (
  formData: Record<string, unknown>,
  ip: string,
  timestamp: string,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const navy = '#1B2B5E'
    const gray = '#666666'
    const lightGray = '#F7F8FB'
    const pageWidth = doc.page.width - 100

    // ── Header ────────────────────────────────────────────────────────────────
    doc.rect(50, 50, pageWidth, 60).fill(navy)
    doc
      .fillColor('#ffffff')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('LUMINAR CAPITAL', 70, 65)
    doc
      .fillColor('rgba(255,255,255,0.7)')
      .fontSize(10)
      .font('Helvetica')
      .text('Financing Application', 70, 90)

    // ── Meta ──────────────────────────────────────────────────────────────────
    doc.moveDown(2)
    doc.rect(50, 125, pageWidth, 40).fill(lightGray)
    doc
      .fillColor(gray)
      .fontSize(9)
      .font('Helvetica')
      .text(`Submitted: ${timestamp}`, 60, 135)
      .text(`IP Address: ${ip}`, 60, 148)

    doc.y = 180

    // ── Section helper ────────────────────────────────────────────────────────
    const section = (title: string) => {
      doc.moveDown(0.5)
      doc
        .rect(50, doc.y, pageWidth, 20)
        .fill(navy)
      doc
        .fillColor('#ffffff')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(title.toUpperCase(), 60, doc.y - 16)
      doc.moveDown(0.8)
    }

    const row = (label: string, value: string) => {
      const y = doc.y
      doc.fillColor(gray).fontSize(9).font('Helvetica').text(label, 60, y, { width: 160 })
      doc.fillColor('#1a1f36').fontSize(9).font('Helvetica-Bold').text(value || '—', 230, y, { width: pageWidth - 180 })
      doc.moveDown(0.6)
    }

    const o1 = formData.owner1 as Record<string, string> || {}
    const o2 = formData.owner2 as Record<string, string> || {}
    const ssnMask = (s: string) => (s ? `***-**-${s.slice(-4)}` : '—')
    const currency = (v: string) => v ? `$${Number(v).toLocaleString('en-US')}` : '—'

    // ── Funding Details ───────────────────────────────────────────────────────
    section('Funding Details')
    row('Desired Funding Amount', currency(formData.desiredFunding as string))
    row('Use of Funds', formData.useOfFunds as string)

    // ── Business Information ──────────────────────────────────────────────────
    section('Business Information')
    row('Legal Business Name', formData.legalBusinessName as string)
    row('DBA', formData.dba as string || '—')
    row('Business Address', formData.businessAddress as string)
    row('Business Phone', formData.businessPhone as string)
    row('Entity Type', formData.entityType as string)
    row('Business Start Date', formData.businessStartDate as string)
    row('Industry', formData.industry as string)
    row('Avg. Monthly Revenue', currency(formData.avgMonthlyRevenue as string))
    row('Existing Loan Amount', formData.existingLoanAmount ? currency(formData.existingLoanAmount as string) : 'None')
    row('Federal Tax ID', formData.federalTaxId as string)

    // ── Primary Owner ─────────────────────────────────────────────────────────
    section('Primary Owner')
    row('Name', `${o1.firstName || ''} ${o1.lastName || ''}`.trim())
    row('Phone', o1.phone || '—')
    row('Email', o1.email || '—')
    row('Home Address', o1.homeAddress || '—')
    row('Date of Birth', o1.dob || '—')
    row('Credit Score', o1.creditScore || '—')
    row('SSN', ssnMask(o1.ssn || ''))
    row('Ownership %', o1.ownershipPct ? `${o1.ownershipPct}%` : '—')

    // ── Second Owner ──────────────────────────────────────────────────────────
    if (formData.hasSecondOwner) {
      section('Second Owner')
      row('Name', `${o2.firstName || ''} ${o2.lastName || ''}`.trim())
      row('Phone', o2.phone || '—')
      row('Email', o2.email || '—')
      row('Home Address', o2.homeAddress || '—')
      row('Date of Birth', o2.dob || '—')
      row('Credit Score', o2.creditScore || '—')
      row('SSN', ssnMask(o2.ssn || ''))
      row('Ownership %', o2.ownershipPct ? `${o2.ownershipPct}%` : '—')
    }

    // ── Bank Statements ───────────────────────────────────────────────────────
    section('Bank Statements')
    const files = formData.bankStatementNames as string[] || []
    row('Files Uploaded', files.length > 0 ? `${files.length} file(s): ${files.join(', ')}` : 'None')

    // ── Signature ─────────────────────────────────────────────────────────────
    section('Signature')

    const sigDataUrl = formData.signatureDataUrl as string
    if (sigDataUrl && sigDataUrl.startsWith('data:image/png;base64,')) {
      try {
        const base64Data = sigDataUrl.replace('data:image/png;base64,', '')
        const sigBuffer = Buffer.from(base64Data, 'base64')
        doc.moveDown(0.3)
        doc.rect(60, doc.y, pageWidth - 20, 80).stroke('#cccccc')
        doc.image(sigBuffer, 65, doc.y - 78, { width: pageWidth - 30, height: 76 })
        doc.moveDown(4)
      } catch {
        row('Signature', 'Signature captured electronically')
      }
    } else {
      row('Signature', 'Signature captured electronically')
    }

    row('Signed at', timestamp)
    row('IP Address', ip)

    // ── Legal ─────────────────────────────────────────────────────────────────
    doc.moveDown(1)
    doc
      .rect(50, doc.y, pageWidth, 55)
      .fill(lightGray)
    doc
      .fillColor(gray)
      .fontSize(7.5)
      .font('Helvetica')
      .text(
        'All consumer information is kept strictly confidential. By signing and submitting, the applicant authorized Luminar Capital and/or its affiliates to contact them via telephone, mobile device (including SMS and MMS), and/or email. The applicant also authorized Luminar Capital to obtain consumer or personal, business, and investigative reports including credit card processor statements and bank statements from consumer reporting agencies, and for any and all lawful purposes.',
        60,
        doc.y - 50,
        { width: pageWidth - 20 },
      )

    doc.end()
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const { to, subject, htmlMessage, honeypot, timestamp, formData } = req.body

    if (honeypot && honeypot.trim() !== '') {
      console.warn('Spam detected: Honeypot filled')
      return res.status(200).json({ success: true, response: null, error: null })
    }

    if (timestamp) {
      const elapsed = Date.now() - timestamp
      if (elapsed < 3000 || elapsed > 1800000) {
        console.warn('Spam detected: Suspicious timing')
        return res.status(200).json({ success: true, response: null, error: null })
      }
    }

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

    // Generate PDF attachment for admin financing emails only
    const attachments = []
    if (!to && subject && subject.includes('Financing') && formData) {
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'Unknown'
      const submittedAt = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      })

      try {
        const pdfBuffer = await generateApplicationPDF(formData, ip, submittedAt)
        attachments.push({
          filename: `Luminar-Application-${(formData.legalBusinessName as string || 'Application').replace(/\s+/g, '-')}-${Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        })
        console.log('PDF generated successfully')
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError)
        // Continue without PDF rather than failing the whole email
      }
    }

    const response = await sendEmail({
      to: recipientEmail,
      subject,
      htmlMessage,
      attachments,
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
