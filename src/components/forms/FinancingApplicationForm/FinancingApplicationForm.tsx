import { useState, useRef, useCallback, useEffect, FC } from 'react'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'
import { closeModal } from '@/store/slices/modalSlice'
import { browserSendEmail, IFileAttachment } from '@/utils/email/bowserSendEmail'
import styles from './FinancingApplicationForm.module.scss'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Owner {
  firstName: string
  lastName: string
  phone: string
  email: string
  homeAddress: string
  dob: string
  creditScore: string
  ssn: string
  ownershipPct: string
}

interface FormData {
  desiredFunding: string
  useOfFunds: string
  legalBusinessName: string
  dba: string
  businessAddress: string
  businessPhone: string
  entityType: string
  businessStartDate: string
  industry: string
  avgMonthlyRevenue: string
  existingLoanAmount: string
  federalTaxId: string
  owner1: Owner
  hasSecondOwner: boolean
  owner2: Owner
  bankStatements: File[]
  signatureDataUrl: string
  consentAgreed: boolean
}

interface FieldError {
  [key: string]: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_CHARS = 50
const MAX_FILES = 10

const USE_OF_FUNDS_OPTIONS = [
  'Expansion',
  'Working Capital',
  'Payroll',
  'Purchase Inventory',
  'Purchase Equipment',
  'Buy Existing Business',
  'Start a Business',
  'Real Estate',
  'Debt Consolidation',
]

const ENTITY_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'LLC',
  'S Corp',
  'C Corp',
  'Other',
]

const INDUSTRIES = [
  'Accounting',
  'Advertising',
  'Agriculture / Farms',
  'Architecture',
  'Attorney / Legal Services',
  'Auto Sales',
  'Auto Repair',
  'Beauty / Salon / Spa',
  'Childcare',
  'Construction',
  'Consulting',
  'Dental',
  'E-commerce',
  'Education',
  'Engineering',
  'Entertainment',
  'Financial Services',
  'Fitness / Gym',
  'Food & Beverage',
  'Franchise',
  'Freight / Trucking',
  'Healthcare',
  'Home Services',
  'Hospitality / Hotel',
  'Insurance',
  'IT / Technology',
  'Landscaping',
  'Manufacturing',
  'Marketing',
  'Media / Publishing',
  'Medical / Clinic',
  'Non-profit',
  'Pet Services',
  'Pharmacy',
  'Photography',
  'Plumbing / HVAC',
  'Property Management',
  'Real Estate',
  'Restaurant',
  'Retail',
  'Security',
  'Staffing',
  'Transportation',
  'Veterinary',
  'Wholesale / Distribution',
  'Other',
]

const EMPTY_OWNER: Owner = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  homeAddress: '',
  dob: '',
  creditScore: '',
  ssn: '',
  ownershipPct: '',
}

const INITIAL_FORM: FormData = {
  desiredFunding: '',
  useOfFunds: '',
  legalBusinessName: '',
  dba: '',
  businessAddress: '',
  businessPhone: '',
  entityType: '',
  businessStartDate: '',
  industry: '',
  avgMonthlyRevenue: '',
  existingLoanAmount: '',
  federalTaxId: '',
  owner1: { ...EMPTY_OWNER },
  hasSecondOwner: false,
  owner2: { ...EMPTY_OWNER },
  bankStatements: [],
  signatureDataUrl: '',
  consentAgreed: false,
}

const STEP_TITLES = [
  'Funding Details',
  'Business Information',
  'Owner Information',
  'Bank Statements',
  'Review & Sign',
]

// ─── Date helpers ─────────────────────────────────────────────────────────────

const getMaxDOB = (): string => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().split('T')[0]
}

const getMinDOB = (): string => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 100)
  return d.toISOString().split('T')[0]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (val: string): string => {
  const num = val.replace(/[^0-9]/g, '')
  if (!num) return ''
  return Number(num).toLocaleString('en-US')
}

const parseCurrency = (val: string): string => val.replace(/[^0-9]/g, '')

const formatSSN = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

const formatPhone = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // strip data URL prefix, return pure base64
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Email templates ──────────────────────────────────────────────────────────

const buildAdminEmail = (data: FormData): string => {
  const o1 = data.owner1
  const o2 = data.owner2
  const ssnMask = (s: string) => (s ? `***-**-${s.slice(-4)}` : '—')

  return `
<div style="font-family:Inter,Arial,sans-serif;max-width:700px;margin:0 auto;color:#1a1f36;">
  <div style="background:#1B2B5E;padding:32px 40px;border-radius:12px 12px 0 0;">
    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">New Financing Application</h1>
    <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Submitted via Luminar Capital website · ${new Date().toLocaleString('en-US')}</p>
  </div>
  <div style="border:1px solid #e0e4ef;border-top:none;border-radius:0 0 12px 12px;padding:32px 40px;background:#ffffff;">
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr><td colspan="2" style="padding:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#1B2B5E;border-bottom:2px solid #e0e4ef;">Funding Details</td></tr>
      <tr><td style="padding:10px 0;width:45%;color:#666;font-size:14px;">Desired Funding Amount</td><td style="padding:10px 0;font-weight:600;font-size:14px;">$${Number(data.desiredFunding).toLocaleString('en-US')}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Use of Funds</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${data.useOfFunds || '—'}</td></tr>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr><td colspan="2" style="padding:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#1B2B5E;border-bottom:2px solid #e0e4ef;">Business Information</td></tr>
      <tr><td style="padding:10px 0;width:45%;color:#666;font-size:14px;">Legal Business Name</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${data.legalBusinessName}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">DBA</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${data.dba || '—'}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px;">Business Address</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${data.businessAddress}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Business Phone</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${data.businessPhone}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px;">Entity Type</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${data.entityType}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Business Start Date</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${data.businessStartDate}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px;">Industry</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${data.industry}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Avg. Monthly Revenue</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">$${Number(data.avgMonthlyRevenue).toLocaleString('en-US')}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px;">Existing Loan Amount</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${data.existingLoanAmount ? '$' + Number(data.existingLoanAmount).toLocaleString('en-US') : 'None'}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Federal Tax ID</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${data.federalTaxId}</td></tr>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr><td colspan="2" style="padding:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#1B2B5E;border-bottom:2px solid #e0e4ef;">Primary Owner</td></tr>
      <tr><td style="padding:10px 0;width:45%;color:#666;font-size:14px;">Name</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${o1.firstName} ${o1.lastName}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Phone</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${o1.phone}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px;">Email</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${o1.email}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Home Address</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${o1.homeAddress}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px;">Date of Birth</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${o1.dob}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Credit Score</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${o1.creditScore}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px;">SSN</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${ssnMask(o1.ssn)}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Ownership %</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${o1.ownershipPct}%</td></tr>
    </table>
    ${data.hasSecondOwner ? `
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr><td colspan="2" style="padding:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#1B2B5E;border-bottom:2px solid #e0e4ef;">Second Owner</td></tr>
      <tr><td style="padding:10px 0;width:45%;color:#666;font-size:14px;">Name</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${o2.firstName} ${o2.lastName}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Phone</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${o2.phone}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px;">Email</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${o2.email}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Home Address</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${o2.homeAddress}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px;">Date of Birth</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${o2.dob}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Credit Score</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${o2.creditScore}</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px;">SSN</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${ssnMask(o2.ssn)}</td></tr>
      <tr style="background:#f7f8fb;"><td style="padding:10px 8px;color:#666;font-size:14px;">Ownership %</td><td style="padding:10px 8px;font-weight:600;font-size:14px;">${o2.ownershipPct}%</td></tr>
    </table>` : ''}
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr><td colspan="2" style="padding:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#1B2B5E;border-bottom:2px solid #e0e4ef;">Bank Statements</td></tr>
      <tr><td style="padding:10px 0;color:#666;font-size:14px;">Files Attached</td><td style="padding:10px 0;font-weight:600;font-size:14px;">${data.bankStatements.length > 0 ? `${data.bankStatements.length} file(s) attached to this email` : 'None'}</td></tr>
    </table>
  </div>
</div>`
}

// ─── Google Places ────────────────────────────────────────────────────────────

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: object,
          ) => {
            addListener: (event: string, cb: () => void) => void
            getPlace: () => { formatted_address?: string }
          }
        }
      }
    }
    grecaptcha: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>
      ready: (callback: () => void) => void
    }
  }
}

const usePlacesAutocomplete = (
  inputRef: React.RefObject<HTMLInputElement>,
  onSelect: (address: string) => void,
) => {
  useEffect(() => {
    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) return
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        { componentRestrictions: { country: 'us' } },
      )
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place.formatted_address) onSelect(place.formatted_address)
      })
    }
    if (window.google?.maps?.places) {
      initAutocomplete()
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval)
          initAutocomplete()
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [inputRef, onSelect])
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Field: FC<{
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}> = ({ label, error, required, children, className }) => (
  <div className={classNames(styles.field, className)}>
    <label className={styles.fieldLabel}>
      {label}
      {required && <span className={styles.required}>*</span>}
    </label>
    {children}
    {error && <span className={styles.fieldError}>{error}</span>}
  </div>
)

const TextInput: FC<
  React.InputHTMLAttributes<HTMLInputElement> & { error?: string }
> = ({ error, className, ...props }) => (
  <input
    className={classNames(styles.input, error && styles.inputError, className)}
    {...props}
  />
)

const CurrencyInput: FC<{
  value: string
  onChange: (raw: string) => void
  placeholder?: string
  error?: string
  max?: number
}> = ({ value, onChange, placeholder, error, max }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseCurrency(e.target.value)
    if (max && Number(raw) > max) return
    onChange(raw)
  }
  return (
    <div className={styles.currencyWrapper}>
      <span className={styles.currencySymbol}>$</span>
      <input
        type="text"
        inputMode="numeric"
        value={value ? formatCurrency(value) : ''}
        onChange={handleChange}
        placeholder={placeholder || '0'}
        className={classNames(styles.input, styles.inputCurrency, error && styles.inputError)}
      />
    </div>
  )
}

const ButtonGroup: FC<{
  options: string[]
  value: string
  onChange: (v: string) => void
}> = ({ options, value, onChange }) => (
  <div className={styles.buttonGroup}>
    {options.map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={classNames(
          styles.buttonGroupItem,
          value === opt && styles.buttonGroupItemActive,
        )}
      >
        {opt}
      </button>
    ))}
  </div>
)

const AddressInput: FC<{
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
}> = ({ value, onChange, placeholder, error }) => {
  const ref = useRef<HTMLInputElement>(null)
  usePlacesAutocomplete(ref, onChange)
  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'Start typing address...'}
      autoComplete="off"
      className={classNames(styles.input, error && styles.inputError)}
    />
  )
}

const SignatureCanvas: FC<{
  value: string
  onChange: (dataUrl: string) => void
  error?: string
}> = ({ value, onChange, error }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true
    lastPos.current = getPos(e)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#1B2B5E'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
    lastPos.current = pos
    onChange(canvas.toDataURL())
  }

  const stopDraw = () => { drawing.current = false }

  const clear = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onChange('')
  }

  return (
    <div className={styles.signatureWrap}>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className={classNames(styles.signatureCanvas, error && styles.inputError)}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <button type="button" onClick={clear} className={styles.signatureClear}>
        Clear
      </button>
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  )
}

// ─── Owner Block ──────────────────────────────────────────────────────────────

const OwnerBlock: FC<{
  data: Owner
  onChange: (field: keyof Owner, value: string) => void
  errors: FieldError
  prefix: string
}> = ({ data, onChange, errors, prefix }) => (
  <div className={styles.ownerBlock}>
    <div className={styles.row2}>
      <Field label="First Name" required error={errors[`${prefix}.firstName`]}>
        <TextInput
          value={data.firstName}
          onChange={(e) => onChange('firstName', e.target.value.slice(0, MAX_CHARS))}
          placeholder="John"
          maxLength={MAX_CHARS}
          error={errors[`${prefix}.firstName`]}
        />
      </Field>
      <Field label="Last Name" required error={errors[`${prefix}.lastName`]}>
        <TextInput
          value={data.lastName}
          onChange={(e) => onChange('lastName', e.target.value.slice(0, MAX_CHARS))}
          placeholder="Smith"
          maxLength={MAX_CHARS}
          error={errors[`${prefix}.lastName`]}
        />
      </Field>
    </div>
    <div className={styles.row2}>
      <Field label="Phone Number" required error={errors[`${prefix}.phone`]}>
        <TextInput
          value={data.phone}
          onChange={(e) => onChange('phone', formatPhone(e.target.value))}
          placeholder="(555) 000-0000"
          inputMode="tel"
          error={errors[`${prefix}.phone`]}
        />
      </Field>
      <Field label="Email Address" required error={errors[`${prefix}.email`]}>
        <TextInput
          value={data.email}
          onChange={(e) => onChange('email', e.target.value.slice(0, MAX_CHARS))}
          placeholder="john@example.com"
          type="email"
          maxLength={MAX_CHARS}
          error={errors[`${prefix}.email`]}
        />
      </Field>
    </div>
    <Field label="Home Address" required error={errors[`${prefix}.homeAddress`]}>
      <AddressInput
        value={data.homeAddress}
        onChange={(v) => onChange('homeAddress', v)}
        error={errors[`${prefix}.homeAddress`]}
      />
    </Field>
    <div className={styles.row3}>
      <Field label="Date of Birth" required error={errors[`${prefix}.dob`]}>
        <TextInput
          value={data.dob}
          onChange={(e) => onChange('dob', e.target.value)}
          type="date"
          max={getMaxDOB()}
          min={getMinDOB()}
          error={errors[`${prefix}.dob`]}
        />
      </Field>
      <Field label="Credit Score" required error={errors[`${prefix}.creditScore`]}>
        <TextInput
          value={data.creditScore}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 3)
            onChange('creditScore', v)
          }}
          placeholder="680"
          inputMode="numeric"
          error={errors[`${prefix}.creditScore`]}
        />
      </Field>
      <Field label="Ownership %" required error={errors[`${prefix}.ownershipPct`]}>
        <div className={styles.suffixWrapper}>
          <TextInput
            value={data.ownershipPct}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 3)
              if (Number(v) > 100) return
              onChange('ownershipPct', v)
            }}
            placeholder="100"
            inputMode="numeric"
            error={errors[`${prefix}.ownershipPct`]}
            className={styles.inputSuffix}
          />
          <span className={styles.suffixSymbol}>%</span>
        </div>
      </Field>
    </div>
    <Field label="Social Security Number" required error={errors[`${prefix}.ssn`]}>
      <TextInput
        value={data.ssn}
        onChange={(e) => onChange('ssn', formatSSN(e.target.value))}
        placeholder="123-45-6789"
        inputMode="numeric"
        type="text"
        autoComplete="off"
        error={errors[`${prefix}.ssn`]}
      />
    </Field>
  </div>
)

// ─── Validation ───────────────────────────────────────────────────────────────

const NAME_REGEX = /^[a-zA-Z\s'-]+$/
const BUSINESS_NAME_REGEX = /^[a-zA-Z0-9\s'&.,()/-]+$/

const validateStep = (step: number, data: FormData): FieldError => {
  const errors: FieldError = {}
  const req = (key: string, val: string, label: string) => {
    if (!val.trim()) errors[key] = `${label} is required`
  }
  const maxLen = (key: string, val: string, label: string) => {
    if (val.length > MAX_CHARS)
      errors[key] = `${label} must be ${MAX_CHARS} characters or less`
  }

  if (step === 1) {
    req('desiredFunding', data.desiredFunding, 'Desired funding amount')
    if (!data.useOfFunds) errors['useOfFunds'] = 'Please select a use of funds'
  }

  if (step === 2) {
    req('legalBusinessName', data.legalBusinessName, 'Legal business name')
    maxLen('legalBusinessName', data.legalBusinessName, 'Legal business name')
    if (data.legalBusinessName && !BUSINESS_NAME_REGEX.test(data.legalBusinessName))
      errors['legalBusinessName'] = 'Invalid characters in business name'
    if (data.dba) maxLen('dba', data.dba, 'DBA')
    req('businessAddress', data.businessAddress, 'Business address')
    req('businessPhone', data.businessPhone, 'Business phone')
    req('entityType', data.entityType, 'Entity type')
    req('businessStartDate', data.businessStartDate, 'Business start date')
    if (data.businessStartDate) {
      const today = new Date().toISOString().split('T')[0]
      if (data.businessStartDate > today)
        errors['businessStartDate'] = 'Business start date cannot be in the future'
      if (data.businessStartDate < '1900-01-01')
        errors['businessStartDate'] = 'Please enter a valid business start date'
    }
    req('industry', data.industry, 'Industry')
    req('avgMonthlyRevenue', data.avgMonthlyRevenue, 'Avg. monthly revenue')
    req('federalTaxId', data.federalTaxId, 'Federal Tax ID')
    if (data.avgMonthlyRevenue && Number(data.avgMonthlyRevenue) > 99999999)
      errors['avgMonthlyRevenue'] = 'Amount must be below $99,999,999'
    if (data.existingLoanAmount && Number(data.existingLoanAmount) > 99999999)
      errors['existingLoanAmount'] = 'Amount must be below $99,999,999'
  }

  if (step === 3) {
    const validateOwner = (o: Owner, prefix: string) => {
      req(`${prefix}.firstName`, o.firstName, 'First name')
      maxLen(`${prefix}.firstName`, o.firstName, 'First name')
      if (o.firstName && !NAME_REGEX.test(o.firstName))
        errors[`${prefix}.firstName`] = "Only letters, spaces, hyphens and apostrophes allowed"
      req(`${prefix}.lastName`, o.lastName, 'Last name')
      maxLen(`${prefix}.lastName`, o.lastName, 'Last name')
      if (o.lastName && !NAME_REGEX.test(o.lastName))
        errors[`${prefix}.lastName`] = "Only letters, spaces, hyphens and apostrophes allowed"
      req(`${prefix}.phone`, o.phone, 'Phone')
      req(`${prefix}.email`, o.email, 'Email')
      maxLen(`${prefix}.email`, o.email, 'Email')
      if (o.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email))
        errors[`${prefix}.email`] = 'Enter a valid email address'
      req(`${prefix}.homeAddress`, o.homeAddress, 'Home address')
      req(`${prefix}.dob`, o.dob, 'Date of birth')
      if (o.dob) {
        if (o.dob > getMaxDOB())
          errors[`${prefix}.dob`] = 'Must be at least 18 years old'
        if (o.dob < getMinDOB())
          errors[`${prefix}.dob`] = 'Invalid date of birth'
      }
      req(`${prefix}.creditScore`, o.creditScore, 'Credit score')
      if (o.creditScore && (Number(o.creditScore) < 300 || Number(o.creditScore) > 850))
        errors[`${prefix}.creditScore`] = 'Must be between 300 and 850'
      req(`${prefix}.ssn`, o.ssn, 'SSN')
      if (o.ssn && !/^\d{3}-\d{2}-\d{4}$/.test(o.ssn))
        errors[`${prefix}.ssn`] = 'Format: 123-45-6789'
      req(`${prefix}.ownershipPct`, o.ownershipPct, 'Ownership %')
      if (o.ownershipPct && Number(o.ownershipPct) > 100)
        errors[`${prefix}.ownershipPct`] = 'Cannot exceed 100%'
    }

    validateOwner(data.owner1, 'owner1')

    if (data.hasSecondOwner) {
      validateOwner(data.owner2, 'owner2')
      const total = Number(data.owner1.ownershipPct) + Number(data.owner2.ownershipPct)
      if (data.owner1.ownershipPct && data.owner2.ownershipPct && total > 100) {
        errors['owner1.ownershipPct'] = `Combined ownership cannot exceed 100% (currently ${total}%)`
        errors['owner2.ownershipPct'] = `Combined ownership cannot exceed 100% (currently ${total}%)`
      }
    }
  }

  if (step === 5) {
    if (!data.signatureDataUrl) errors['signature'] = 'Please provide your signature'
    if (!data.consentAgreed) errors['consent'] = 'You must agree to the terms to submit'
  }

  return errors
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface FinancingApplicationFormProps {
  className?: string
}

const FinancingApplicationForm: FC<FinancingApplicationFormProps> = ({ className }) => {
  const dispatch = useDispatch()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<FieldError>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formStartTime = useRef<number>(Date.now())
  const [honeypot, setHoneypot] = useState('')

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const setOwner1 = useCallback((field: keyof Owner, value: string) => {
    setFormData((prev) => ({ ...prev, owner1: { ...prev.owner1, [field]: value } }))
  }, [])

  const setOwner2 = useCallback((field: keyof Owner, value: string) => {
    setFormData((prev) => ({ ...prev, owner2: { ...prev.owner2, [field]: value } }))
  }, [])

  const goNext = () => {
    const errs = validateStep(step, formData)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep((s) => s + 1)
    window.scrollTo(0, 0)
  }

  const goBack = () => {
    setErrors({})
    setStep((s) => s - 1)
    window.scrollTo(0, 0)
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      bankStatements: [...prev.bankStatements, ...newFiles].slice(0, MAX_FILES),
    }))
  }

  const removeFile = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      bankStatements: prev.bankStatements.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = async () => {
    const errs = validateStep(5, formData)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    if (honeypot) return
    const elapsed = Date.now() - formStartTime.current
    if (elapsed < 4000) { setSubmitError('Please review the form before submitting.'); return }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Convert bank statement files to base64
      const fileAttachments: IFileAttachment[] = await Promise.all(
        formData.bankStatements.map(async (file) => ({
          filename: file.name,
          content: await fileToBase64(file),
          contentType: file.type || 'application/octet-stream',
        }))
      )

      // Admin email with PDF + all bank statements attached
      await browserSendEmail({
        subject: `Financing Application — ${formData.legalBusinessName} — ${formData.owner1.firstName} ${formData.owner1.lastName}`,
        honeypot,
        timestamp: formStartTime.current,
        formData: {
          ...formData,
          bankStatementNames: formData.bankStatements.map((f) => f.name),
          bankStatements: undefined,
        } as unknown as Record<string, unknown>,
        attachments: fileAttachments,
      })

      setIsSuccess(true)
    } catch {
      setSubmitError('Submission failed. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={classNames(styles.form, className)}>
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Application Submitted!</h2>
          <p className={styles.successText}>
            Thank you, {formData.owner1.firstName}. A funding specialist will be in touch within 1 business day.
          </p>
          <button type="button" className={styles.btnPrimary} onClick={() => dispatch(closeModal())}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={classNames(styles.form, className)}>
      <input
        type="text" name="website" value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ display: 'none' }} tabIndex={-1} autoComplete="off"
      />

      {/* Progress */}
      <div className={styles.progress}>
        {STEP_TITLES.map((title, i) => (
          <div
            key={i}
            className={classNames(
              styles.progressStep,
              i + 1 === step && styles.progressStepActive,
              i + 1 < step && styles.progressStepDone,
            )}
          >
            <div className={styles.progressDot}>{i + 1 < step ? '✓' : i + 1}</div>
            <span className={styles.progressLabel}>{title}</span>
          </div>
        ))}
        <div
          className={styles.progressBar}
          style={{ width: `${((step - 1) / (STEP_TITLES.length - 1)) * 100}%` }}
        />
      </div>

      <div className={styles.body}>
        {/* STEP 1 */}
        {step === 1 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Funding Details</h3>
            <Field label="Desired Funding Amount" required error={errors.desiredFunding}>
              <CurrencyInput
                value={formData.desiredFunding}
                onChange={(v) => set('desiredFunding', v)}
                placeholder="100,000"
                max={99999999}
                error={errors.desiredFunding}
              />
            </Field>
            <Field label="Intended Use of Funds" required error={errors.useOfFunds}>
              <ButtonGroup
                options={USE_OF_FUNDS_OPTIONS}
                value={formData.useOfFunds}
                onChange={(v) => set('useOfFunds', v)}
              />
            </Field>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Business Information</h3>
            <div className={styles.row2}>
              <Field label="Legal Business Name" required error={errors.legalBusinessName}>
                <TextInput
                  value={formData.legalBusinessName}
                  onChange={(e) => set('legalBusinessName', e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Acme Corp LLC"
                  maxLength={MAX_CHARS}
                  error={errors.legalBusinessName}
                />
              </Field>
              <Field label="DBA (if applicable)">
                <TextInput
                  value={formData.dba}
                  onChange={(e) => set('dba', e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Doing Business As..."
                  maxLength={MAX_CHARS}
                />
              </Field>
            </div>
            <Field label="Business Address" required error={errors.businessAddress}>
              <AddressInput
                value={formData.businessAddress}
                onChange={(v) => set('businessAddress', v)}
                error={errors.businessAddress}
              />
            </Field>
            <div className={styles.row2}>
              <Field label="Business Phone" required error={errors.businessPhone}>
                <TextInput
                  value={formData.businessPhone}
                  onChange={(e) => set('businessPhone', formatPhone(e.target.value))}
                  placeholder="(555) 000-0000"
                  inputMode="tel"
                  error={errors.businessPhone}
                />
              </Field>
              <Field label="Federal Tax ID (EIN)" required error={errors.federalTaxId}>
                <TextInput
                  value={formData.federalTaxId}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
                    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits
                    set('federalTaxId', formatted)
                  }}
                  placeholder="12-3456789"
                  inputMode="numeric"
                  error={errors.federalTaxId}
                />
              </Field>
            </div>
            <Field label="Entity Type" required error={errors.entityType}>
              <ButtonGroup
                options={ENTITY_TYPES}
                value={formData.entityType}
                onChange={(v) => set('entityType', v)}
              />
            </Field>
            <div className={styles.row2}>
              <Field label="Business Start Date" required error={errors.businessStartDate}>
                <TextInput
                  value={formData.businessStartDate}
                  onChange={(e) => set('businessStartDate', e.target.value)}
                  type="date"
                  min="1900-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  error={errors.businessStartDate}
                />
              </Field>
              <Field label="Industry" required error={errors.industry}>
                <select
                  value={formData.industry}
                  onChange={(e) => set('industry', e.target.value)}
                  className={classNames(styles.select, errors.industry && styles.inputError)}
                >
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                {errors.industry && <span className={styles.fieldError}>{errors.industry}</span>}
              </Field>
            </div>
            <div className={styles.row2}>
              <Field label="Avg. Monthly Revenue" required error={errors.avgMonthlyRevenue}>
                <CurrencyInput
                  value={formData.avgMonthlyRevenue}
                  onChange={(v) => set('avgMonthlyRevenue', v)}
                  placeholder="50,000"
                  max={99999999}
                  error={errors.avgMonthlyRevenue}
                />
              </Field>
              <Field label="Existing Loan Amount" error={errors.existingLoanAmount}>
                <CurrencyInput
                  value={formData.existingLoanAmount}
                  onChange={(v) => set('existingLoanAmount', v)}
                  placeholder="0"
                  max={99999999}
                  error={errors.existingLoanAmount}
                />
              </Field>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Owner Information</h3>
            <OwnerBlock data={formData.owner1} onChange={setOwner1} errors={errors} prefix="owner1" />
            <div className={styles.secondOwnerToggle}>
              <button
                type="button"
                onClick={() => set('hasSecondOwner', !formData.hasSecondOwner)}
                className={classNames(styles.toggleBtn, formData.hasSecondOwner && styles.toggleBtnActive)}
              >
                {formData.hasSecondOwner ? '− Remove 2nd Owner' : '+ Add 2nd Owner'}
              </button>
            </div>
            {formData.hasSecondOwner && (
              <>
                <h4 className={styles.ownerSectionTitle}>Second Owner</h4>
                <OwnerBlock data={formData.owner2} onChange={setOwner2} errors={errors} prefix="owner2" />
              </>
            )}
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Bank Statements</h3>
            <p className={styles.stepSubtitle}>
              Upload the last 4 months of your business bank account statements.
              <br />
              <em>Optional to get started; required to get certified offers.</em>
            </p>
            <div
              className={styles.dropzone}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const files = Array.from(e.dataTransfer.files)
                setFormData((prev) => ({
                  ...prev,
                  bankStatements: [...prev.bankStatements, ...files].slice(0, MAX_FILES),
                }))
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFiles}
                style={{ display: 'none' }}
              />
              <div className={styles.dropzoneIcon}>📂</div>
              <p className={styles.dropzoneText}>Click to upload or drag & drop files here</p>
              <p className={styles.dropzoneHint}>PDF, JPG, PNG — up to {MAX_FILES} files</p>
            </div>
            {formData.bankStatements.length > 0 && (
              <ul className={styles.fileList}>
                {formData.bankStatements.map((file, idx) => (
                  <li key={idx} className={styles.fileItem}>
                    <span className={styles.fileName}>{file.name}</span>
                    <button type="button" onClick={() => removeFile(idx)} className={styles.fileRemove}>×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Review & Sign</h3>
            <div className={styles.reviewSummary}>
              <div className={styles.reviewRow}>
                <span>Business</span>
                <strong>{formData.legalBusinessName}</strong>
              </div>
              <div className={styles.reviewRow}>
                <span>Funding Requested</span>
                <strong>${Number(formData.desiredFunding).toLocaleString('en-US')}</strong>
              </div>
              <div className={styles.reviewRow}>
                <span>Use of Funds</span>
                <strong>{formData.useOfFunds}</strong>
              </div>
              <div className={styles.reviewRow}>
                <span>Primary Contact</span>
                <strong>{formData.owner1.firstName} {formData.owner1.lastName} · {formData.owner1.email}</strong>
              </div>
              <div className={styles.reviewRow}>
                <span>Bank Statements</span>
                <strong>{formData.bankStatements.length > 0 ? `${formData.bankStatements.length} file(s)` : 'None'}</strong>
              </div>
            </div>
            <Field label="Owner Signature" required error={errors.signature}>
              <p className={styles.signatureHint}>Draw your signature below using mouse or touch.</p>
              <SignatureCanvas
                value={formData.signatureDataUrl}
                onChange={(v) => set('signatureDataUrl', v)}
                error={errors.signature}
              />
            </Field>
            <div className={styles.legalText}>
              <p>
                All consumer information is kept strictly confidential. Luminar Capital takes your privacy seriously. By signing and submitting this application form, each of the above listed business and business owner/officer (individually and collectively, 'you') authorize Luminar Capital (LC) or our affiliates to contact you via telephone, mobile device (including SMS and MMS), and/or email, even if you are on a corporate, state or national Do Not Call Registry. You also authorize each of its representatives, successors, assigns and designees that may be involved with or acquire commercial loans having daily repayment features or purchases of future receivables including Merchant Cash Advance transactions, including without limitation the application therefor (collectively, 'Transactions') to obtain consumer or personal, business and investigative reports and other information about you, including credit card processor statements and bank statements, from one or more consumer reporting agencies, such as TransUnion, Experian and Equifax, Identity IQ and from other credit bureaus, banks, creditors, government agencies and other third parties (the 'Recipients'). You also authorize LC to transmit this application form, along with any of the foregoing information obtained in connection with this application, to any or all of the Recipients for the foregoing purposes. You also consent to the release, by any creditor or financial institution, of any information relating to any of you, to LC and to each of the Recipients, on its own behalf and authorize LC to communicate with the Recipients on your behalf and represent you with the Recipients. You also authorize LC and each of its Recipients to contact you via text message, automated call or email message at the contact information listed above
              </p>
            </div>
            <label className={styles.consentRow}>
              <input
                type="checkbox"
                checked={formData.consentAgreed}
                onChange={(e) => set('consentAgreed', e.target.checked)}
                className={styles.consentCheckbox}
              />
              <span>I agree to the terms above and authorize Luminar Capital to process my application.</span>
            </label>
            {errors.consent && <span className={styles.fieldError}>{errors.consent}</span>}
            {submitError && <div className={styles.submitError}>{submitError}</div>}
            <p className={styles.recaptchaNote}>
              This site is protected by reCAPTCHA. The Google{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>{' '}
              and{' '}
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Terms of Service</a>{' '}
              apply.
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className={styles.nav}>
        {step > 1 ? (
          <button type="button" onClick={goBack} className={styles.btnBack}>← Back</button>
        ) : (
          <div />
        )}
        {step < 5 ? (
          <button type="button" onClick={goNext} className={styles.btnPrimary}>Next Step →</button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={classNames(styles.btnPrimary, isSubmitting && styles.btnDisabled)}
          >
            {isSubmitting ? 'Submitting…' : 'Submit Application'}
          </button>
        )}
      </div>
    </div>
  )
}

export default FinancingApplicationForm
