import { useState, useRef, useCallback, FC } from 'react'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'
import { closeModal } from '@/store/slices/modalSlice'
import { browserSendEmail } from '@/utils/email'
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
  // Step 1
  desiredFunding: string
  useOfFunds: string[]
  desiredTerm: string
  // Step 2
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
  // Step 3
  owner1: Owner
  hasSecondOwner: boolean
  owner2: Owner
  // Step 4
  bankStatements: File[]
  // Step 5
  signatureDataUrl: string
  consentAgreed: boolean
}

interface FieldError {
  [key: string]: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

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

const TERM_OPTIONS = [
  '3 months',
  '6 months',
  '12 months',
  '18 months',
  '24 months',
  '36 months',
  '48 months',
  '60 months',
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
  useOfFunds: [],
  desiredTerm: '',
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const buildEmailHtml = (data: FormData): string => {
  const o1 = data.owner1
  const o2 = data.owner2
  const ssnMask = (s: string) => s ? `***-**-${s.slice(-4)}` : '—'

  return `
<div style="font-family:Inter,Arial,sans-serif;max-width:700px;margin:0 auto;color:#1a1f36;">
  <h2 style="background:#1B2B5E;color:#fff;padding:20px 24px;margin:0;border-radius:8px 8px 0 0;">
    New Financing Application
  </h2>
  <div style="border:1px solid #e0e4ef;border-top:none;border-radius:0 0 8px 8px;padding:24px;">

    <h3 style="color:#1B2B5E;border-bottom:2px solid #e0e4ef;padding-bottom:8px;">Funding Details</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;width:40%;color:#666;">Desired Funding Amount</td><td style="padding:6px 0;font-weight:600;">$${Number(data.desiredFunding).toLocaleString('en-US')}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Use of Funds</td><td style="padding:6px 0;font-weight:600;">${data.useOfFunds.join(', ') || '—'}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Desired Term</td><td style="padding:6px 0;font-weight:600;">${data.desiredTerm || '—'}</td></tr>
    </table>

    <h3 style="color:#1B2B5E;border-bottom:2px solid #e0e4ef;padding-bottom:8px;margin-top:24px;">Business Information</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;width:40%;color:#666;">Legal Business Name</td><td style="padding:6px 0;font-weight:600;">${data.legalBusinessName}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">DBA</td><td style="padding:6px 0;font-weight:600;">${data.dba || '—'}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Business Address</td><td style="padding:6px 0;font-weight:600;">${data.businessAddress}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Business Phone</td><td style="padding:6px 0;font-weight:600;">${data.businessPhone}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Entity Type</td><td style="padding:6px 0;font-weight:600;">${data.entityType}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Business Start Date</td><td style="padding:6px 0;font-weight:600;">${data.businessStartDate}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Industry</td><td style="padding:6px 0;font-weight:600;">${data.industry}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Avg. Monthly Revenue</td><td style="padding:6px 0;font-weight:600;">$${Number(data.avgMonthlyRevenue).toLocaleString('en-US')}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Existing Loan Amount</td><td style="padding:6px 0;font-weight:600;">${data.existingLoanAmount ? '$' + Number(data.existingLoanAmount).toLocaleString('en-US') : 'None'}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Federal Tax ID</td><td style="padding:6px 0;font-weight:600;">${data.federalTaxId}</td></tr>
    </table>

    <h3 style="color:#1B2B5E;border-bottom:2px solid #e0e4ef;padding-bottom:8px;margin-top:24px;">Primary Owner</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;width:40%;color:#666;">Name</td><td style="padding:6px 0;font-weight:600;">${o1.firstName} ${o1.lastName}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;font-weight:600;">${o1.phone}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;font-weight:600;">${o1.email}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Home Address</td><td style="padding:6px 0;font-weight:600;">${o1.homeAddress}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Date of Birth</td><td style="padding:6px 0;font-weight:600;">${o1.dob}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Credit Score</td><td style="padding:6px 0;font-weight:600;">${o1.creditScore}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">SSN</td><td style="padding:6px 0;font-weight:600;">${ssnMask(o1.ssn)}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Ownership %</td><td style="padding:6px 0;font-weight:600;">${o1.ownershipPct}%</td></tr>
    </table>

    ${data.hasSecondOwner ? `
    <h3 style="color:#1B2B5E;border-bottom:2px solid #e0e4ef;padding-bottom:8px;margin-top:24px;">Second Owner</h3>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;width:40%;color:#666;">Name</td><td style="padding:6px 0;font-weight:600;">${o2.firstName} ${o2.lastName}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;font-weight:600;">${o2.phone}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;font-weight:600;">${o2.email}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Home Address</td><td style="padding:6px 0;font-weight:600;">${o2.homeAddress}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Date of Birth</td><td style="padding:6px 0;font-weight:600;">${o2.dob}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Credit Score</td><td style="padding:6px 0;font-weight:600;">${o2.creditScore}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">SSN</td><td style="padding:6px 0;font-weight:600;">${ssnMask(o2.ssn)}</td></tr>
      <tr><td style="padding:6px 0;color:#666;">Ownership %</td><td style="padding:6px 0;font-weight:600;">${o2.ownershipPct}%</td></tr>
    </table>` : ''}

    <h3 style="color:#1B2B5E;border-bottom:2px solid #e0e4ef;padding-bottom:8px;margin-top:24px;">Bank Statements</h3>
    <p style="margin:4px 0;">${data.bankStatements.length > 0 ? `${data.bankStatements.length} file(s) attached` : 'None uploaded'}</p>

    <p style="margin-top:24px;font-size:12px;color:#999;">Submitted via Luminar Capital website · ${new Date().toLocaleString('en-US')}</p>
  </div>
</div>`
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

const TextInput: FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: string }> = ({
  error, className, ...props
}) => (
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
  error?: string
}> = ({ options, value, onChange, error }) => (
  <div className={styles.buttonGroup}>
    {options.map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={classNames(styles.buttonGroupItem, value === opt && styles.buttonGroupItemActive)}
      >
        {opt}
      </button>
    ))}
    {error && <span className={classNames(styles.fieldError, styles.fieldErrorFull)}>{error}</span>}
  </div>
)

const MultiButtonGroup: FC<{
  options: string[]
  value: string[]
  onChange: (v: string[]) => void
  error?: string
}> = ({ options, value, onChange, error }) => {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])
  }
  return (
    <div className={styles.buttonGroup}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={classNames(styles.buttonGroupItem, value.includes(opt) && styles.buttonGroupItemActive)}
        >
          {opt}
        </button>
      ))}
      {error && <span className={classNames(styles.fieldError, styles.fieldErrorFull)}>{error}</span>}
    </div>
  )
}

// ─── Signature Canvas ─────────────────────────────────────────────────────────

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
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true
    lastPos.current = getPos(e)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return
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
        width={560}
        height={140}
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
          onChange={(e) => onChange('firstName', e.target.value)}
          placeholder="John"
          error={errors[`${prefix}.firstName`]}
        />
      </Field>
      <Field label="Last Name" required error={errors[`${prefix}.lastName`]}>
        <TextInput
          value={data.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
          placeholder="Smith"
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
          error={errors[`${prefix}.phone`]}
          inputMode="tel"
        />
      </Field>
      <Field label="Email Address" required error={errors[`${prefix}.email`]}>
        <TextInput
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="john@example.com"
          type="email"
          error={errors[`${prefix}.email`]}
        />
      </Field>
    </div>
    <Field label="Home Address" required error={errors[`${prefix}.homeAddress`]}>
      <TextInput
        value={data.homeAddress}
        onChange={(e) => onChange('homeAddress', e.target.value)}
        placeholder="123 Main St, City, State, ZIP"
        error={errors[`${prefix}.homeAddress`]}
      />
    </Field>
    <div className={styles.row3}>
      <Field label="Date of Birth" required error={errors[`${prefix}.dob`]}>
        <TextInput
          value={data.dob}
          onChange={(e) => onChange('dob', e.target.value)}
          type="date"
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
        type="password"
        autoComplete="off"
        error={errors[`${prefix}.ssn`]}
      />
    </Field>
  </div>
)

// ─── Validation ───────────────────────────────────────────────────────────────

const validateStep = (step: number, data: FormData): FieldError => {
  const errors: FieldError = {}
  const req = (key: string, val: string, label: string) => {
    if (!val.trim()) errors[key] = `${label} is required`
  }

  if (step === 1) {
    req('desiredFunding', data.desiredFunding, 'Desired funding amount')
    if (!data.useOfFunds.length) errors['useOfFunds'] = 'Select at least one use of funds'
    req('desiredTerm', data.desiredTerm, 'Desired term')
  }

  if (step === 2) {
    req('legalBusinessName', data.legalBusinessName, 'Legal business name')
    req('businessAddress', data.businessAddress, 'Business address')
    req('businessPhone', data.businessPhone, 'Business phone')
    req('entityType', data.entityType, 'Entity type')
    req('businessStartDate', data.businessStartDate, 'Business start date')
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
      req(`${prefix}.lastName`, o.lastName, 'Last name')
      req(`${prefix}.phone`, o.phone, 'Phone')
      req(`${prefix}.email`, o.email, 'Email')
      if (o.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email))
        errors[`${prefix}.email`] = 'Enter a valid email address'
      req(`${prefix}.homeAddress`, o.homeAddress, 'Home address')
      req(`${prefix}.dob`, o.dob, 'Date of birth')
      req(`${prefix}.creditScore`, o.creditScore, 'Credit score')
      if (o.creditScore && (Number(o.creditScore) < 300 || Number(o.creditScore) > 850))
        errors[`${prefix}.creditScore`] = 'Must be between 300 and 850'
      req(`${prefix}.ssn`, o.ssn, 'SSN')
      if (o.ssn && !/^\d{3}-\d{2}-\d{4}$/.test(o.ssn))
        errors[`${prefix}.ssn`] = 'Format: 123-45-6789'
      req(`${prefix}.ownershipPct`, o.ownershipPct, 'Ownership %')
    }
    validateOwner(data.owner1, 'owner1')
    if (data.hasSecondOwner) validateOwner(data.owner2, 'owner2')
  }

  if (step === 5) {
    if (!data.signatureDataUrl) errors['signature'] = 'Please provide your signature'
    if (!data.consentAgreed) errors['consent'] = 'You must agree to the terms to submit'
  }

  return errors
}

// ─── Main Component ───────────────────────────────────────────────────────────

declare global {
  interface Window {
    grecaptcha: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>
      ready: (callback: () => void) => void
    }
  }
}

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

  // ── field helpers ──────────────────────────────────────────────────────────

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const setOwner1 = useCallback((field: keyof Owner, value: string) => {
    setFormData((prev) => ({ ...prev, owner1: { ...prev.owner1, [field]: value } }))
  }, [])

  const setOwner2 = useCallback((field: keyof Owner, value: string) => {
    setFormData((prev) => ({ ...prev, owner2: { ...prev.owner2, [field]: value } }))
  }, [])

  // ── navigation ─────────────────────────────────────────────────────────────

  const goNext = () => {
    const errs = validateStep(step, formData)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStep((s) => s + 1)
    window.scrollTo(0, 0)
  }

  const goBack = () => {
    setErrors({})
    setStep((s) => s - 1)
    window.scrollTo(0, 0)
  }

  // ── file upload ────────────────────────────────────────────────────────────

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      bankStatements: [...prev.bankStatements, ...newFiles].slice(0, 8),
    }))
  }

  const removeFile = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      bankStatements: prev.bankStatements.filter((_, i) => i !== idx),
    }))
  }

  // ── submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const errs = validateStep(5, formData)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    if (honeypot) return // spam trap

    const elapsed = Date.now() - formStartTime.current
    if (elapsed < 4000) {
      setSubmitError('Please review the form before submitting.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      let recaptchaToken = ''
      if (window.grecaptcha) {
        recaptchaToken = await window.grecaptcha.execute(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string,
          { action: 'financing_application' },
        )
      }

      await browserSendEmail({
        subject: `Financing Application — ${formData.legalBusinessName} — ${formData.owner1.firstName} ${formData.owner1.lastName}`,
        htmlMessage: buildEmailHtml(formData),
        recaptchaToken,
        honeypot,
        timestamp: formStartTime.current,
      })

      // Confirmation to applicant
      await browserSendEmail({
        to: formData.owner1.email,
        subject: 'Your Luminar Capital Application Has Been Received',
        htmlMessage: `
<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1f36;">
  <h2 style="background:#1B2B5E;color:#fff;padding:20px 24px;margin:0;border-radius:8px 8px 0 0;">Application Received</h2>
  <div style="border:1px solid #e0e4ef;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
    <p>Hi ${formData.owner1.firstName},</p>
    <p>Thank you for submitting your financing application to Luminar Capital. We've received your information and a funding specialist will be in touch with you within <strong>1 business day</strong>.</p>
    <p><strong>Application Summary</strong><br/>
    Business: ${formData.legalBusinessName}<br/>
    Funding Requested: $${Number(formData.desiredFunding).toLocaleString('en-US')}<br/>
    Submitted: ${new Date().toLocaleString('en-US')}</p>
    <p>If you have any questions, please contact us at <a href="mailto:clientsuccess@luminarcapital.com">clientsuccess@luminarcapital.com</a>.</p>
    <p>The Luminar Capital Team</p>
  </div>
</div>`,
        recaptchaToken,
        honeypot: '',
        timestamp: formStartTime.current,
      })

      setIsSuccess(true)
    } catch {
      setSubmitError('Submission failed. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── success screen ─────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <div className={classNames(styles.form, className)}>
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Application Submitted!</h2>
          <p className={styles.successText}>
            Thank you, {formData.owner1.firstName}. A funding specialist will be in touch within 1 business day.
          </p>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => dispatch(closeModal())}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className={classNames(styles.form, className)}>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
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
            <div className={styles.progressDot}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span className={styles.progressLabel}>{title}</span>
          </div>
        ))}
        <div
          className={styles.progressBar}
          style={{ width: `${((step - 1) / (STEP_TITLES.length - 1)) * 100}%` }}
        />
      </div>

      {/* Step content */}
      <div className={styles.body}>

        {/* ── STEP 1: Funding Details ───────────────────────────────────── */}
        {step === 1 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Funding Details</h3>

            <Field label="Desired Funding Amount" required error={errors.desiredFunding}>
              <CurrencyInput
                value={formData.desiredFunding}
                onChange={(v) => set('desiredFunding', v)}
                placeholder="100,000"
                max={9999999}
                error={errors.desiredFunding}
              />
            </Field>

            <Field label="Intended Use of Funds" required error={errors.useOfFunds}>
              <MultiButtonGroup
                options={USE_OF_FUNDS_OPTIONS}
                value={formData.useOfFunds}
                onChange={(v) => set('useOfFunds', v)}
                error={errors.useOfFunds}
              />
            </Field>

            <Field label="Desired Term Length" required error={errors.desiredTerm}>
              <ButtonGroup
                options={TERM_OPTIONS}
                value={formData.desiredTerm}
                onChange={(v) => set('desiredTerm', v)}
                error={errors.desiredTerm}
              />
            </Field>
          </div>
        )}

        {/* ── STEP 2: Business Information ─────────────────────────────── */}
        {step === 2 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Business Information</h3>

            <div className={styles.row2}>
              <Field label="Legal Business Name" required error={errors.legalBusinessName}>
                <TextInput
                  value={formData.legalBusinessName}
                  onChange={(e) => set('legalBusinessName', e.target.value)}
                  placeholder="Acme Corp LLC"
                  error={errors.legalBusinessName}
                />
              </Field>
              <Field label="DBA (if applicable)" error={errors.dba}>
                <TextInput
                  value={formData.dba}
                  onChange={(e) => set('dba', e.target.value)}
                  placeholder="Doing Business As..."
                />
              </Field>
            </div>

            <Field label="Business Address" required error={errors.businessAddress}>
              <TextInput
                value={formData.businessAddress}
                onChange={(e) => set('businessAddress', e.target.value)}
                placeholder="123 Main St, City, State, ZIP"
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
                    const formatted = digits.length > 2
                      ? `${digits.slice(0, 2)}-${digits.slice(2)}`
                      : digits
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
                error={errors.entityType}
              />
            </Field>

            <div className={styles.row2}>
              <Field label="Business Start Date" required error={errors.businessStartDate}>
                <TextInput
                  value={formData.businessStartDate}
                  onChange={(e) => set('businessStartDate', e.target.value)}
                  type="date"
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

        {/* ── STEP 3: Owner Information ─────────────────────────────────── */}
        {step === 3 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Owner Information</h3>

            <OwnerBlock
              data={formData.owner1}
              onChange={setOwner1}
              errors={errors}
              prefix="owner1"
            />

            <div className={styles.secondOwnerToggle}>
              <button
                type="button"
                onClick={() => set('hasSecondOwner', !formData.hasSecondOwner)}
                className={classNames(
                  styles.toggleBtn,
                  formData.hasSecondOwner && styles.toggleBtnActive,
                )}
              >
                {formData.hasSecondOwner ? '− Remove 2nd Owner' : '+ Add 2nd Owner'}
              </button>
            </div>

            {formData.hasSecondOwner && (
              <>
                <h4 className={styles.ownerSectionTitle}>Second Owner</h4>
                <OwnerBlock
                  data={formData.owner2}
                  onChange={setOwner2}
                  errors={errors}
                  prefix="owner2"
                />
              </>
            )}
          </div>
        )}

        {/* ── STEP 4: Bank Statements ───────────────────────────────────── */}
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
                  bankStatements: [...prev.bankStatements, ...files].slice(0, 8),
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
              <p className={styles.dropzoneHint}>PDF, JPG, PNG — up to 8 files</p>
            </div>

            {formData.bankStatements.length > 0 && (
              <ul className={styles.fileList}>
                {formData.bankStatements.map((file, idx) => (
                  <li key={idx} className={styles.fileItem}>
                    <span className={styles.fileName}>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className={styles.fileRemove}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── STEP 5: Review & Sign ─────────────────────────────────────── */}
        {step === 5 && (
          <div className={styles.step}>
            <h3 className={styles.stepTitle}>Review & Sign</h3>

            {/* Summary */}
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
                <span>Term</span>
                <strong>{formData.desiredTerm}</strong>
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

            {/* Signature */}
            <Field label="Owner Signature" required error={errors.signature}>
              <p className={styles.signatureHint}>Draw your signature below using mouse or touch.</p>
              <SignatureCanvas
                value={formData.signatureDataUrl}
                onChange={(v) => set('signatureDataUrl', v)}
                error={errors.signature}
              />
            </Field>

            {/* Legal */}
            <div className={styles.legalText}>
              <p>
                All consumer information is kept strictly confidential. By signing and submitting, you authorize
                Luminar Capital and/or our affiliates to contact you via telephone, mobile device (including SMS
                and MMS), and/or email, even if your telephone number is listed on a Do Not Call registry. You
                also authorize us to obtain consumer or personal, business, and investigative reports including
                credit card processor statements and bank statements from consumer reporting agencies, and for
                any and all lawful purposes.
              </p>
            </div>

            <label className={styles.consentRow}>
              <input
                type="checkbox"
                checked={formData.consentAgreed}
                onChange={(e) => set('consentAgreed', e.target.checked)}
                className={styles.consentCheckbox}
              />
              <span>
                I agree to the terms above and authorize Luminar Capital to process my application.
              </span>
            </label>
            {errors.consent && <span className={styles.fieldError}>{errors.consent}</span>}

            {submitError && (
              <div className={styles.submitError}>{submitError}</div>
            )}

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
          <button type="button" onClick={goBack} className={styles.btnBack}>
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button type="button" onClick={goNext} className={styles.btnPrimary}>
            Next Step →
          </button>
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
