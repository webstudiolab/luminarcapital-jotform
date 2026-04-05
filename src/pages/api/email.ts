import { NextApiResponse, NextApiRequest } from 'next'
import { sendEmail, IAttachment } from '@/utils/email'
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
    doc.rect(50, 50, pageWidth, 65).fill(navy)
    doc
      .fillColor('#ffffff')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('LUMINAR CAPITAL', 70, 65, { width: pageWidth - 40 })
    doc
      .fillColor('rgba(255,255,255,0.7)')
      .fontSize(10)
      .font('Helvetica')
      .text('Business Financing Application', 70, 92, { width: pageWidth - 40 })

    // ── Meta bar ──────────────────────────────────────────────────────────────
    doc.rect(50, 115, pageWidth, 44).fill(lightGray)
    doc
      .fillColor(gray)
      .fontSize(9)
      .font('Helvetica')
      .text(`Submitted: ${timestamp}`, 65, 126, { width: pageWidth - 30 })
      .text(`IP Address: ${ip}`, 65, 141, { width: pageWidth - 30 })

    doc.y = 175

    // ── Helpers ───────────────────────────────────────────────────────────────
    const section = (title: string) => {
      doc.moveDown(0.8)
      const y = doc.y
      doc.rect(50, y, pageWidth, 22).fill(navy)
      doc
        .fillColor('#ffffff')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(title.toUpperCase(), 65, y + 7, { width: pageWidth - 30, characterSpacing: 0.5 })
      doc.y = y + 30
    }

    const row = (label: string, value: string, shaded = false) => {
      const y = doc.y
      if (shaded) doc.rect(50, y - 2, pageWidth, 20).fill('#F7F8FB')
      doc
        .fillColor(gray)
        .fontSize(9)
        .font('Helvetica')
        .text(label, 65, y, { width: 155 })
      doc
        .fillColor('#1a1f36')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(value || '—', 230, y, { width: pageWidth - 185 })
      doc.y = y + 18
    }

    const o1 = (formData.owner1 as Record<string, string>) || {}
    const o2 = (formData.owner2 as Record<string, string>) || {}
    const ssnMask = (s: string) => (s ? `***-**-${s.slice(-4)}` : '—')
    const currency = (v: string) =>
      v ? `$${Number(v).toLocaleString('en-US')}` : '—'

    // ── Funding Details ───────────────────────────────────────────────────────
    section('Funding Details')
    row('Desired Funding Amount', currency(formData.desiredFunding as string))
    row('Use of Funds', formData.useOfFunds as string, true)

    // ── Business Information ──────────────────────────────────────────────────
    section('Business Information')
    row('Legal Business Name', formData.legalBusinessName as string)
    row('DBA', (formData.dba as string) || '—', true)
    row('Business Address', formData.businessAddress as string)
    row('Business Phone', formData.businessPhone as string, true)
    row('Entity Type', formData.entityType as string)
    row('Business Start Date', formData.businessStartDate as string, true)
    row('Industry', formData.industry as string)
    row('Avg. Monthly Revenue', currency(formData.avgMonthlyRevenue as string), true)
    row('Existing Loan Amount', formData.existingLoanAmount ? currency(formData.existingLoanAmount as string) : 'None')
    row('Federal Tax ID', formData.federalTaxId as string, true)

    // ── Primary Owner ─────────────────────────────────────────────────────────
    section('Primary Owner')
    row('Name', `${o1.firstName || ''} ${o1.lastName || ''}`.trim())
    row('Phone', o1.phone || '—', true)
    row('Email', o1.email || '—')
    row('Home Address', o1.homeAddress || '—', true)
    row('Date of Birth', o1.dob || '—')
    row('Credit Score', o1.creditScore || '—', true)
    row('SSN', ssnMask(o1.ssn || ''))
    row('Ownership %', o1.ownershipPct ? `${o1.ownershipPct}%` : '—', true)

    // ── Second Owner ──────────────────────────────────────────────────────────
    if (formData.hasSecondOwner) {
      section('Second Owner')
      row('Name', `${o2.firstName || ''} ${o2.lastName || ''}`.trim())
      row('Phone', o2.phone || '—', true)
      row('Email', o2.email || '—')
      row('Home Address', o2.homeAddress || '—', true)
      row('Date of Birth', o2.dob || '—')
      row('Credit Score', o2.creditScore || '—', true)
      row('SSN', ssnMask(o2.ssn || ''))
      row('Ownership %', o2.ownershipPct ? `${o2.ownershipPct}%` : '—', true)
    }

    // ── Bank Statements ───────────────────────────────────────────────────────
    section('Bank Statements')
    const files = (formData.bankStatementNames as string[]) || []
    row('Files Uploaded', files.length > 0 ? `${files.length} file(s) — attached to this email` : 'None')

    // ── Signature ─────────────────────────────────────────────────────────────
    section('Electronic Signature')

    // Signature image box
    const sigBoxY = doc.y + 6
    const sigBoxH = 100
    doc.rect(50, sigBoxY, pageWidth, sigBoxH).stroke('#CCCCCC')

    const sigDataUrl = formData.signatureDataUrl as string
    if (sigDataUrl && sigDataUrl.startsWith('data:image/png;base64,')) {
      try {
        const base64Data = sigDataUrl.replace('data:image/png;base64,', '')
        const sigBuffer = Buffer.from(base64Data, 'base64')
        doc.image(sigBuffer, 55, sigBoxY + 5, {
          width: pageWidth - 10,
          height: sigBoxH - 10,
          fit: [pageWidth - 10, sigBoxH - 10],
          align: 'center',
          valign: 'center',
        })
      } catch {
        doc
          .fillColor(gray)
          .fontSize(9)
          .font('Helvetica')
          .text('Signature captured electronically', 65, sigBoxY + 42)
      }
    } else {
      doc
        .fillColor(gray)
        .fontSize(9)
        .font('Helvetica')
        .text('Signature captured electronically', 65, sigBoxY + 42)
    }

    // Move below signature box with guaranteed gap
    doc.y = sigBoxY + sigBoxH + 16

    row('Signed by', `${o1.firstName || ''} ${o1.lastName || ''}`.trim())
    row('Date & Time', timestamp, true)
    row('IP Address', ip)

    // ── Legal text ────────────────────────────────────────────────────────────
    doc.moveDown(1.2)
    const legalY = doc.y
    doc.rect(50, legalY, pageWidth, 70).fill(lightGray)
    doc
      .fillColor(gray)
      .fontSize(7.5)
      .font('Helvetica')
      .text(
        'All consumer information is kept strictly confidential. By signing and submitting, the applicant authorized Luminar Capital and/or its affiliates to contact them via telephone, mobile device (including SMS and MMS), and/or email, even if the telephone number is listed on a Do Not Call registry. The applicant also authorized Luminar Capital to obtain consumer or personal, business, and investigative reports including credit card processor statements and bank statements from consumer reporting agencies, and for any and all lawful purposes.',
        62,
        legalY + 10,
        { width: pageWidth - 24, lineGap: 2 },
      )

    doc.end()
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const {
      to,
      subject,
      htmlMessage,
      honeypot,
      timestamp,
      formData,
      attachments: incomingAttachments,
    } = req.body

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

    const emailAttachments: IAttachment[] = []

    // Generate PDF and attach for admin financing emails only
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

      // Generate PDF
      try {
        const pdfBuffer = await generateApplicationPDF(formData, ip, submittedAt)
        const businessName = (formData.legalBusinessName as string || 'Application').replace(/\s+/g, '-')
        emailAttachments.push({
          filename: `Luminar-Application-${businessName}-${Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        })
        console.log('PDF generated successfully')
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError)
      }

      // Attach bank statement files
      if (
        incomingAttachments &&
        Array.isArray(incomingAttachments) &&
        incomingAttachments.length > 0
      ) {
        for (const file of incomingAttachments) {
          try {
            const fileBuffer = Buffer.from(file.content, 'base64')
            emailAttachments.push({
              filename: file.filename,
              content: fileBuffer,
              contentType: file.contentType,
            })
          } catch (fileError) {
            console.error(`Failed to attach file ${file.filename}:`, fileError)
          }
        }
        console.log(`Attached ${incomingAttachments.length} bank statement file(s)`)
      }
    }

    const response = await sendEmail({
      to: recipientEmail,
      subject,
      htmlMessage,
      attachments: emailAttachments,
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
