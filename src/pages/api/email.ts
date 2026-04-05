import { NextApiResponse, NextApiRequest } from 'next'
import { sendEmail, IAttachment } from '@/utils/email'
import PDFDocument from 'pdfkit'

const generateApplicationPDF = async (
  formData: Record<string, unknown>,
  ip: string,
  timestamp: string,
): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
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
    const L = 36
    const R = PAGE_W - 36
    const COL_W = R - L
    const COL2 = L + 160
    const COL2_W = R - COL2
    const navy = '#1B2B5E'
    const gray = '#888888'
    const lightGray = '#F7F8FB'
    const darkText = '#1a1f36'
    const rowH = 14
    let y = 0

    const ensureSpace = (needed: number) => {
      if (y + needed > PAGE_H - 30) {
        doc.addPage({ margin: 0, size: 'A4' })
        y = 30
      }
    }

    // ── Header ────────────────────────────────────────────────────────────────
    doc.rect(0, 0, PAGE_W, 52).fill('#ffffff')
    doc.rect(0, 52, PAGE_W, 4).fill(navy)

    // Logo left
    try {
      const https = require('https')
      const fetchLogo = (): Promise<Buffer> => new Promise((res, rej) => {
        https.get('https://www.luminarcapital.com/Luminar-Logo.jpg', (r: any) => {
          const chunks: Buffer[] = []
          r.on('data', (c: Buffer) => chunks.push(c))
          r.on('end', () => res(Buffer.concat(chunks)))
          r.on('error', rej)
        }).on('error', rej)
      })
      const logoBuffer = await fetchLogo()
      doc.image(logoBuffer, L, 8, { height: 36, fit: [130, 36] })
    } catch (logoErr) {
      console.error('Logo load error:', logoErr)
      doc.fillColor(navy).font('Helvetica-Bold').fontSize(12)
        .text('LUMINAR CAPITAL', L, 18, { width: 130, lineBreak: false })
    }

    // Title right
    doc.fillColor(navy).font('Helvetica-Bold').fontSize(12)
      .text('LUMINAR CAPITAL', L + 148, 14, { width: COL_W - 148 })
    doc.fillColor('#444444').font('Helvetica').fontSize(8)
      .text('Business Financing Application', L + 148, 30, { width: COL_W - 148 })

    // ── Meta bar ──────────────────────────────────────────────────────────────
    doc.rect(0, 56, PAGE_W, 24).fill(lightGray)
    doc.fillColor(gray).font('Helvetica').fontSize(7)
      .text(`Submitted: ${timestamp}`, L, 62, { width: COL_W / 2 })
      .text(`IP Address: ${ip}`, L, 72, { width: COL_W / 2 })

    y = 88

    const section = (title: string) => {
      y += 4
      doc.rect(L, y, COL_W, 13).fill(navy)
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(6.5)
        .text(title, L + 6, y + 4, { width: COL_W - 12, characterSpacing: 0.6 })
      y += 17
    }

    let rowShade = false
    const row = (label: string, value: string) => {
      ensureSpace(rowH)
      if (rowShade) doc.rect(L, y, COL_W, rowH).fill('#F3F4F8')
      doc.fillColor(gray).font('Helvetica').fontSize(7)
        .text(label, L + 4, y + 4, { width: 152, lineBreak: false })
      doc.fillColor(darkText).font('Helvetica-Bold').fontSize(7)
        .text(value || '—', COL2, y + 4, { width: COL2_W - 4, lineBreak: false })
      y += rowH
      rowShade = !rowShade
    }

    const resetShade = () => { rowShade = false }

    const o1 = (formData.owner1 as Record<string, string>) || {}
    const o2 = (formData.owner2 as Record<string, string>) || {}
    const ssnMask = (s: string) => (s ? `***-**-${s.slice(-4)}` : '—')
    const currency = (v: string) => v ? `$${Number(v).toLocaleString('en-US')}` : '—'

    resetShade()
    section('FUNDING DETAILS')
    row('Desired Funding Amount', currency(formData.desiredFunding as string))
    row('Use of Funds', formData.useOfFunds as string)

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

    // ── Owner section — side by side if 2 owners ──────────────────────────────
    const hasTwo = !!formData.hasSecondOwner
    y += 4

    if (hasTwo) {
      // Two-column owner layout
      const halfW = (COL_W - 4) / 2
      const C1 = L
      const C2 = L + halfW + 4

      // Section headers side by side
      doc.rect(C1, y, halfW, 13).fill(navy)
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(6.5)
        .text('PRIMARY OWNER', C1 + 6, y + 4, { width: halfW - 12, characterSpacing: 0.6, lineBreak: false })
      doc.rect(C2, y, halfW, 13).fill('#2d4070')
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(6.5)
        .text('SECOND OWNER', C2 + 6, y + 4, { width: halfW - 12, characterSpacing: 0.6, lineBreak: false })
      y += 17

      const ownerFields: Array<[string, string, string]> = [
        ['Name', `${o1.firstName || ''} ${o1.lastName || ''}`.trim(), `${o2.firstName || ''} ${o2.lastName || ''}`.trim()],
        ['Phone', o1.phone || '—', o2.phone || '—'],
        ['Email', o1.email || '—', o2.email || '—'],
        ['Home Address', o1.homeAddress || '—', o2.homeAddress || '—'],
        ['Date of Birth', o1.dob || '—', o2.dob || '—'],
        ['Credit Score', o1.creditScore || '—', o2.creditScore || '—'],
        ['SSN', ssnMask(o1.ssn || ''), ssnMask(o2.ssn || '')],
        ['Ownership %', o1.ownershipPct ? `${o1.ownershipPct}%` : '—', o2.ownershipPct ? `${o2.ownershipPct}%` : '—'],
      ]

      const labelW = 56
      let shade = false
      for (const [label, v1, v2] of ownerFields) {
        if (shade) {
          doc.rect(C1, y, halfW, rowH).fill('#F3F4F8')
          doc.rect(C2, y, halfW, rowH).fill('#F3F4F8')
        }
        doc.fillColor(gray).font('Helvetica').fontSize(7)
          .text(label, C1 + 4, y + 4, { width: labelW, lineBreak: false })
        doc.fillColor(darkText).font('Helvetica-Bold').fontSize(7)
          .text(v1, C1 + labelW + 6, y + 4, { width: halfW - labelW - 10, lineBreak: false })
        doc.fillColor(gray).font('Helvetica').fontSize(7)
          .text(label, C2 + 4, y + 4, { width: labelW, lineBreak: false })
        doc.fillColor(darkText).font('Helvetica-Bold').fontSize(7)
          .text(v2, C2 + labelW + 6, y + 4, { width: halfW - labelW - 10, lineBreak: false })
        y += rowH
        shade = !shade
      }
    } else {
      // Single owner
      y -= 4
      section('PRIMARY OWNER')
      row('Name', `${o1.firstName || ''} ${o1.lastName || ''}`.trim())
      row('Phone', o1.phone || '—')
      row('Email', o1.email || '—')
      row('Home Address', o1.homeAddress || '—')
      row('Date of Birth', o1.dob || '—')
      row('Credit Score', o1.creditScore || '—')
      row('SSN', ssnMask(o1.ssn || ''))
      row('Ownership %', o1.ownershipPct ? `${o1.ownershipPct}%` : '—')
    }

    resetShade()
    section('BANK STATEMENTS')
    const files = (formData.bankStatementNames as string[]) || []
    row('Files Attached', files.length > 0 ? `${files.length} file(s) attached to this email` : 'None')

    resetShade()
    section('ELECTRONIC SIGNATURE')

    const sigH = 60
    ensureSpace(sigH + rowH * 3 + 50)

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

    ensureSpace(50)
    y += 6
    doc.rect(L, y, COL_W, 42).fill(lightGray)
    doc.fillColor(gray).font('Helvetica').fontSize(6)
      .text(
        'All consumer information is kept strictly confidential. By signing and submitting, the applicant authorized Luminar Capital and/or its affiliates to contact them via telephone, mobile device (including SMS and MMS), and/or email, even if the telephone number is listed on a Do Not Call registry. The applicant also authorized Luminar Capital to obtain consumer or personal, business, and investigative reports including credit card processor statements and bank statements from consumer reporting agencies, and for any and all lawful purposes.',
        L + 8, y + 8,
        { width: COL_W - 16, lineGap: 1 },
      )

    doc.end()
  })
}

// ── Admin email template ──────────────────────────────────────────────────────

const buildAdminEmail = (data: Record<string, unknown>): string => {
  const o1 = (data.owner1 as Record<string, string>) || {}
  const o2 = (data.owner2 as Record<string, string>) || {}
  const ssnMask = (s: string) => (s ? `***-**-${s.slice(-4)}` : '—')
  const currency = (v: string) => v ? `$${Number(v).toLocaleString('en-US')}` : '—'
  const files = (data.bankStatementNames as string[]) || []

  const fieldRow = (label: string, value: string, shaded = false) =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #eef0f8;${shaded ? 'background:#f9f9fc;' : ''}"><table border="0" width="100%"><tbody><tr>
      <td style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#6b7a99;text-transform:uppercase;font-weight:600;${shaded ? 'padding-left:4px;' : ''}" width="40%">${label}</td>
      <td style="font-family:Georgia,serif;font-size:15px;color:#1a1f36;" width="60%">${value || '—'}</td>
    </tr></tbody></table></td></tr>`

  const sectionHeader = (title: string) =>
    `<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;color:#3d52a0;letter-spacing:3px;text-transform:uppercase;padding-bottom:10px;padding-top:24px;border-bottom:2px solid #3d52a0;">${title}</td></tr>`

  return `
<table border="0" width="100%" cellspacing="0" cellpadding="0" bgcolor="#eaecf5">
<tbody><tr><td height="40">&nbsp;</td></tr>
<tr><td style="padding:0 20px;" align="center">
<table style="max-width:680px;width:100%;" border="0" width="680" cellspacing="0" cellpadding="0"><tbody>
<tr><td style="padding-bottom:28px;" align="center">
  <img style="display:block;margin:0 auto;" src="https://www.luminarcapital.com/color_logo.svg" alt="Luminar Capital" width="200" height="42" />
</td></tr>
<tr><td>
<table style="border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(61,82,160,0.13);" border="0" width="100%" cellspacing="0" cellpadding="0"><tbody>
<tr><td style="background:linear-gradient(90deg,#3d52a0 0%,#7091e6 50%,#3d52a0 100%);font-size:0;line-height:0;" height="5">&nbsp;</td></tr>
<tr><td style="padding:36px 48px 32px;" bgcolor="#1a1f36">
  <p style="margin:0 0 6px 0;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#7091e6;letter-spacing:3px;text-transform:uppercase;">New Application Received</p>
  <h1 style="margin:0 0 8px 0;font-family:Georgia,serif;font-size:26px;font-weight:bold;color:#ffffff;line-height:1.2;">Financing Application</h1>
  <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#aab0c4;">${o1.firstName || ''} ${o1.lastName || ''} &middot; ${o1.email || ''}</p>
</td></tr>
<tr><td style="padding:32px 48px 40px;" bgcolor="#ffffff">
<table border="0" width="100%" cellspacing="0" cellpadding="0"><tbody>
  ${sectionHeader('FUNDING DETAILS')}
  ${fieldRow('Desired Funding', currency(data.desiredFunding as string))}
  ${fieldRow('Use of Funds', data.useOfFunds as string, true)}
  ${sectionHeader('BUSINESS INFORMATION')}
  ${fieldRow('Legal Business Name', data.legalBusinessName as string)}
  ${fieldRow('DBA', (data.dba as string) || '—', true)}
  ${fieldRow('Business Address', data.businessAddress as string)}
  ${fieldRow('Business Phone', data.businessPhone as string, true)}
  ${fieldRow('Entity Type', data.entityType as string)}
  ${fieldRow('Business Start Date', data.businessStartDate as string, true)}
  ${fieldRow('Industry', data.industry as string)}
  ${fieldRow('Avg. Monthly Revenue', currency(data.avgMonthlyRevenue as string), true)}
  ${fieldRow('Existing Loan Amount', data.existingLoanAmount ? currency(data.existingLoanAmount as string) : 'None')}
  ${fieldRow('Federal Tax ID', data.federalTaxId as string, true)}
  ${sectionHeader('PRIMARY OWNER')}
  ${fieldRow('Name', `${o1.firstName || ''} ${o1.lastName || ''}`.trim())}
  ${fieldRow('Phone', o1.phone || '—', true)}
  ${fieldRow('Email', o1.email || '—')}
  ${fieldRow('Home Address', o1.homeAddress || '—', true)}
  ${fieldRow('Date of Birth', o1.dob || '—')}
  ${fieldRow('Credit Score', o1.creditScore || '—', true)}
  ${fieldRow('SSN', ssnMask(o1.ssn || ''))}
  ${fieldRow('Ownership %', o1.ownershipPct ? `${o1.ownershipPct}%` : '—', true)}
  ${data.hasSecondOwner ? `
  ${sectionHeader('SECOND OWNER')}
  ${fieldRow('Name', `${o2.firstName || ''} ${o2.lastName || ''}`.trim())}
  ${fieldRow('Phone', o2.phone || '—', true)}
  ${fieldRow('Email', o2.email || '—')}
  ${fieldRow('Home Address', o2.homeAddress || '—', true)}
  ${fieldRow('Date of Birth', o2.dob || '—')}
  ${fieldRow('Credit Score', o2.creditScore || '—', true)}
  ${fieldRow('SSN', ssnMask(o2.ssn || ''))}
  ${fieldRow('Ownership %', o2.ownershipPct ? `${o2.ownershipPct}%` : '—', true)}
  ` : ''}
  ${sectionHeader('BANK STATEMENTS')}
  ${fieldRow('Files Attached', files.length > 0 ? `${files.length} file(s) attached to this email` : 'None')}
</tbody></table>
</td></tr>
<tr><td style="background:linear-gradient(90deg,#3d52a0 0%,#7091e6 50%,#3d52a0 100%);font-size:0;line-height:0;" height="5">&nbsp;</td></tr>
</tbody></table>
</td></tr>
<tr><td style="padding:28px 0 20px;" align="center">
  <p style="margin:0 0 5px 0;font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:bold;color:#3d52a0;letter-spacing:2.5px;text-transform:uppercase;">LUMINAR CAPITAL</p>
  <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#6b7a99;">Business Financing Solutions</p>
</td></tr>
</tbody></table>
</td></tr>
<tr><td height="40">&nbsp;</td></tr>
</tbody></table>`
}

// ── Applicant confirmation email template ─────────────────────────────────────

const buildUserEmail = (data: Record<string, unknown>): string => {
  const o1 = (data.owner1 as Record<string, string>) || {}
  const currency = (v: string) => v ? `$${Number(v).toLocaleString('en-US')}` : '—'

  return `
<table border="0" width="100%" cellspacing="0" cellpadding="0" bgcolor="#eaecf5">
<tbody><tr><td height="48">&nbsp;</td></tr>
<tr><td style="padding:0 20px;" align="center">
<table style="max-width:620px;width:100%;" border="0" width="620" cellspacing="0" cellpadding="0"><tbody>
<tr><td style="padding-bottom:30px;" align="center">
  <img style="display:block;" src="https://www.luminarcapital.com/color_logo.svg" alt="Luminar Capital" width="196" height="41" />
</td></tr>
<tr><td>
<table style="border-radius:16px;overflow:hidden;box-shadow:0 10px 44px rgba(61,82,160,0.14);" border="0" width="100%" cellspacing="0" cellpadding="0"><tbody>
<tr><td style="background:linear-gradient(90deg,#3d52a0 0%,#7091e6 50%,#3d52a0 100%);font-size:0;line-height:0;" height="5">&nbsp;</td></tr>
<tr><td style="padding:52px 56px 48px;" align="center" bgcolor="#1a1f36">
  <table border="0" cellspacing="0" cellpadding="0" align="center"><tbody><tr>
    <td style="width:68px;height:68px;border-radius:34px;border:2px solid #7091e6;background-color:rgba(112,145,230,0.12);font-size:26px;line-height:68px;color:#7091e6;font-family:Arial,sans-serif;text-align:center;" align="center" valign="middle" width="68" height="68">&#10003;</td>
  </tr></tbody></table>
  <p style="margin:22px 0 8px 0;font-family:Georgia,Times New Roman,serif;font-size:10px;color:#7091e6;letter-spacing:3px;text-transform:uppercase;text-align:center;">Application Received</p>
  <h1 style="margin:0 0 18px 0;font-family:Georgia,Times New Roman,serif;font-size:30px;font-weight:bold;color:#ffffff;letter-spacing:-0.3px;line-height:1.2;text-align:center;">Thank You for<br />Choosing Luminar Capital</h1>
  <p style="margin:0 auto;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#aab0c4;line-height:1.8;text-align:center;max-width:420px;">Your application has been successfully submitted and is now being reviewed by our financing team.</p>
</td></tr>
<tr><td style="padding:0;" bgcolor="#3d52a0">
  <table border="0" width="100%" cellspacing="0" cellpadding="0"><tbody><tr>
    <td style="padding:22px 8px;" align="center" valign="middle" width="33%">
      <p style="margin:0 0 5px 0;font-family:Georgia,Times New Roman,serif;font-size:19px;font-weight:bold;color:#7091e6;text-align:center;">01</p>
      <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;color:#ffffff;letter-spacing:1.2px;text-transform:uppercase;text-align:center;">Application<br />Received</p>
    </td>
    <td style="font-size:0;line-height:0;" bgcolor="#5568b8" width="1">&nbsp;</td>
    <td style="padding:22px 8px;" align="center" valign="middle" width="33%">
      <p style="margin:0 0 5px 0;font-family:Georgia,Times New Roman,serif;font-size:19px;font-weight:bold;color:#7091e6;text-align:center;">02</p>
      <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;color:#ffffff;letter-spacing:1.2px;text-transform:uppercase;text-align:center;">Under<br />Review</p>
    </td>
    <td style="font-size:0;line-height:0;" bgcolor="#5568b8" width="1">&nbsp;</td>
    <td style="padding:22px 8px;" align="center" valign="middle" width="33%">
      <p style="margin:0 0 5px 0;font-family:Georgia,Times New Roman,serif;font-size:19px;font-weight:bold;color:#7091e6;text-align:center;">03</p>
      <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;color:#ffffff;letter-spacing:1.2px;text-transform:uppercase;text-align:center;">Decision<br />Delivered</p>
    </td>
  </tr></tbody></table>
</td></tr>
<tr><td style="padding:44px 56px 48px;" bgcolor="#ffffff">
  <p style="margin:0 0 20px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#3a3f58;line-height:1.85;">Hi ${o1.firstName || ''},</p>
  <p style="margin:0 0 20px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#3a3f58;line-height:1.85;">Our financing specialists are now reviewing your submission and will be in touch within <strong style="color:#3d52a0;">1&ndash;2 business days</strong>. If any additional information is required, a member of our team will contact you directly.</p>
  <table border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;"><tbody>
  <tr><td style="border-radius:10px;background-color:#f4f6fc;border-left:4px solid #3d52a0;padding:26px 28px 20px 28px;">
    <p style="margin:0 0 14px 0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;color:#3d52a0;letter-spacing:3px;text-transform:uppercase;">Application Summary</p>
    <table border="0" width="100%" cellspacing="0" cellpadding="0"><tbody>
      <tr>
        <td style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#6b7a99;text-transform:uppercase;font-weight:600;padding:6px 0;" width="45%">Business</td>
        <td style="font-family:Georgia,serif;font-size:14px;color:#1a1f36;padding:6px 0;">${data.legalBusinessName}</td>
      </tr>
      <tr>
        <td style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#6b7a99;text-transform:uppercase;font-weight:600;padding:6px 0;" width="45%">Funding Requested</td>
        <td style="font-family:Georgia,serif;font-size:14px;color:#1a1f36;padding:6px 0;">${currency(data.desiredFunding as string)}</td>
      </tr>
      <tr>
        <td style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#6b7a99;text-transform:uppercase;font-weight:600;padding:6px 0;" width="45%">Use of Funds</td>
        <td style="font-family:Georgia,serif;font-size:14px;color:#1a1f36;padding:6px 0;">${data.useOfFunds}</td>
      </tr>
    </tbody></table>
  </td></tr>
  </tbody></table>
  <table border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-top:36px;"><tbody>
  <tr><td align="center">
    <p style="margin:0 0 4px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b7a99;text-align:center;">We look forward to supporting your business.</p>
    <p style="margin:0;font-family:Georgia,Times New Roman,serif;font-size:15px;font-weight:bold;color:#1a1f36;text-align:center;">The Luminar Capital Team</p>
  </td></tr>
  </tbody></table>
</td></tr>
<tr><td style="background:linear-gradient(90deg,#3d52a0 0%,#7091e6 50%,#3d52a0 100%);font-size:0;line-height:0;" height="5">&nbsp;</td></tr>
</tbody></table>
</td></tr>
<tr><td style="padding:28px 0 20px;" align="center">
  <p style="margin:0 0 5px 0;font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:bold;color:#3d52a0;letter-spacing:2.5px;text-transform:uppercase;">LUMINAR CAPITAL</p>
  <p style="margin:0 0 3px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#6b7a99;">Business Financing Solutions</p>
  <p style="margin:0 0 3px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#6b7a99;">+1 (305) 307-0190</p>
  <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#aab0c4;">Please retain this email as confirmation of your application submission.</p>
</td></tr>
</tbody></table>
</td></tr>
<tr><td height="48">&nbsp;</td></tr>
</tbody></table>`
}

// ── Handler ───────────────────────────────────────────────────────────────────

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
      } else if (subject && subject.includes('Financing Application')) {
        recipientEmail = process.env.FINANCING_EMAIL || 'clientsuccess@luminarcapital.com'
      } else {
        recipientEmail = process.env.RECIPIENT_EMAIL
      }
    }

    console.log('=== EMAIL DEBUG ===')
    console.log('To:', recipientEmail)
    console.log('Subject:', subject)

    // ── Admin financing email — generate PDF, attach files, use branded template
    if (!to && subject && subject.includes('Financing Application') && formData) {
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

      const emailAttachments: IAttachment[] = []

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
            emailAttachments.push({
              filename: file.filename,
              content: Buffer.from(file.content, 'base64'),
              contentType: file.contentType,
            })
          } catch (fileError) {
            console.error(`Failed to attach file ${file.filename}:`, fileError)
          }
        }
        console.log(`Attached ${incomingAttachments.length} bank statement file(s)`)
      }

      const response = await sendEmail({
        to: recipientEmail,
        subject,
        htmlMessage: buildAdminEmail(formData),
        attachments: emailAttachments,
      })
      console.log('Admin email sent successfully!')

      // Send applicant confirmation
      const o1 = (formData.owner1 as Record<string, string>) || {}
      if (o1.email) {
        await sendEmail({
          to: o1.email,
          subject: 'Your Luminar Capital Application Has Been Received',
          htmlMessage: buildUserEmail(formData),
          attachments: [],
        })
        console.log('Applicant confirmation email sent!')
      }

      return res.status(200).json({ success: true, response, error: null })
    }

    // ── All other emails (partner forms etc) — use passed htmlMessage
    const response = await sendEmail({
      to: recipientEmail,
      subject,
      htmlMessage,
      attachments: [],
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
