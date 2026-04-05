import { NextApiResponse, NextApiRequest } from 'next'
import { sendEmail, IAttachment } from '@/utils/email'
import PDFDocument from 'pdfkit'

const generateApplicationPDF = async (
  formData: Record<string, unknown>,
  ip: string,
  timestamp: string,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 0,
      size: 'A4',
      bufferPages: true,
      autoFirstPage: true,
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const PAGE_W = doc.page.width
    const PAGE_H = doc.page.height
    const L = 40 // left margin
    const R = PAGE_W - 40 // right edge
    const COL_W = R - L // content width
    const COL2 = L + 175 // value column start
    const COL2_W = R - COL2 // value column width
    const navy = '#1B2B5E'
    const gray = '#888888'
    const lightGray = '#F7F8FB'
    const darkText = '#1a1f36'
    const rowH = 19
    let y = 0

    // ── ensure space, add page if needed ─────────────────────────────────────
    const ensureSpace = (needed: number) => {
      if (y + needed > PAGE_H - 40) {
        doc.addPage({ margin: 0, size: 'A4' })
        y = 40
      }
    }

    // ── header ────────────────────────────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, 70).fill(navy)
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(18)
      .text('LUMINAR CAPITAL', L, 16, { width: COL_W })
    doc.fillColor('rgba(255,255,255,0.65)').font('Helvetica').fontSize(10)
      .text('Business Financing Application', L, 40, { width: COL_W })

    // ── meta ──────────────────────────────────────────────────────────────────
    doc.rect(0, 70, PAGE_W, 38).fill(lightGray)
    doc.fillColor(gray).font('Helvetica').fontSize(8.5)
      .text(`Submitted: ${timestamp}`, L, 80, { width: COL_W / 2 })
      .text(`IP Address: ${ip}`, L + COL_W / 2, 80, { width: COL_W / 2, align: 'right' })

    y = 120

    // ── section header ────────────────────────────────────────────────────────
    const section = (title: string) => {
      ensureSpace(26)
      y += 8
      doc.rect(L, y, COL_W, 18).fill(navy)
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8)
        .text(title, L + 8, y + 5, { width: COL_W - 16, characterSpacing: 0.8 })
      y += 24
    }

    // ── data row ──────────────────────────────────────────────────────────────
    let rowShade = false
    const row = (label: string, value: string) => {
      ensureSpace(rowH)
      if (rowShade) doc.rect(L, y, COL_W, rowH).fill('#F3F4F8')
      doc.fillColor(gray).font('Helvetica').fontSize(8.5)
        .text(label, L + 6, y + 5, { width: 160, lineBreak: false })
      doc.fillColor(darkText).font('Helvetica-Bold').fontSize(8.5)
        .text(value || '—', COL2, y + 5, { width: COL2_W - 6, lineBreak: false })
      y += rowH
      rowShade = !rowShade
    }

    const resetShade = () => { rowShade = false }

    const o1 = (formData.owner1 as Record<string, string>) || {}
    const o2 = (formData.owner2 as Record<string, string>) || {}
    const ssnMask = (s: string) => (s ? `***-**-${s.slice(-4)}` : '—')
    const currency = (v: string) => v ? `$${Number(v).toLocaleString('en-US')}` : '—'

    // ── Funding Details ───────────────────────────────────────────────────────
    resetShade()
    section('FUNDING DETAILS')
    row('Desired Funding Amount', currency(formData.desiredFunding as string))
    row('Use of Funds', formData.useOfFunds as string)

    // ── Business Information ──────────────────────────────────────────────────
    resetShade()
    section('BUSINESS INFORMATION')
    row('Legal Business Name', formData.legalBusinessName as string)
    row('DBA', (formData.dba as string) || '—')
    row('Business Address', formData.businessAddress as string)
    row('Business Phone', formData.businessPhone as string)
    row('Entity Type', formData.entityType as string)
    row('Business Start Date', formData.businessStartDate as string)
    row('Industry', formData.industry as string)
    row('Avg. Monthly Revenue', currency(formData.avgMonthlyRevenue as string))
    row('Existing Loan Amount', formData.existingLoanAmount ? currency(formData.existingLoanAmount as string) : 'None')
    row('Federal Tax ID', formData.federalTaxId as string)

    // ── Primary Owner ─────────────────────────────────────────────────────────
    resetShade()
    section('PRIMARY OWNER')
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
      resetShade()
      section('SECOND OWNER')
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
    resetShade()
    section('BANK STATEMENTS')
    const files = (formData.bankStatementNames as string[]) || []
    row('Files Attached', files.length > 0 ? `${files.length} file(s) attached to this email` : 'None')

    // ── Signature ─────────────────────────────────────────────────────────────
    resetShade()
    section('ELECTRONIC SIGNATURE')

    const sigH = 90
    ensureSpace(sigH + 20)

    // Draw signature box
    doc.rect(L, y, COL_W, sigH).strokeColor('#CCCCCC').lineWidth(0.5).stroke()

    const sigDataUrl = formData.signatureDataUrl as string
    if (sigDataUrl && sigDataUrl.startsWith('data:image/png;base64,')) {
      try {
        const base64Data = sigDataUrl.replace('data:image/png;base64,', '')
        const sigBuffer = Buffer.from(base64Data, 'base64')
        doc.image(sigBuffer, L + 4, y + 4, {
          width: COL_W - 8,
          height: sigH - 8,
          fit: [COL_W - 8, sigH - 8],
          align: 'center',
          valign: 'center',
        })
      } catch (err) {
        console.error('Signature image error:', err)
        doc.fillColor(gray).font('Helvetica').fontSize(8)
          .text('Signature captured electronically', L + 8, y + sigH / 2 - 5)
      }
    } else {
      doc.fillColor(gray).font('Helvetica').fontSize(8)
        .text('Signature captured electronically', L + 8, y + sigH / 2 - 5)
    }

    y += sigH + 8
    rowShade = false
    row('Signed by', `${o1.firstName || ''} ${o1.lastName || ''}`.trim())
    row('Date & Time', timestamp)
    row('IP Address', ip)

    // ── Legal ─────────────────────────────────────────────────────────────────
    ensureSpace(68)
    y += 12
    doc.rect(L, y, COL_W, 56).fill(lightGray)
    doc.fillColor(gray).font('Helvetica').fontSize(7)
      .text(
        'All consumer information is kept strictly confidential. By signing and submitting, the applicant authorized Luminar Capital and/or its affiliates to contact them via telephone, mobile device (including SMS and MMS), and/or email, even if the telephone number is listed on a Do Not Call registry. The applicant also authorized Luminar Capital to obtain consumer or personal, business, and investigative reports including credit card processor statements and bank statements from consumer reporting agencies, and for any and all lawful purposes.',
        L + 10,
        y + 10,
        { width: COL_W - 20, lineGap: 1.5 },
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
        const businessName = (formData.legalBusinessName as string || 'Application').replace(/[^a-zA-Z0-9]/g, '-')
        emailAttachments.push({
          filename: `Luminar-Application-${businessName}-${Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        })
        console.log('PDF generated successfully')
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError)
      }

      if (incomingAttachments && Array.isArray(incomingAttachments) && incomingAttachments.length > 0) {
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
