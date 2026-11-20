import { useState, useRef, useCallback, useEffect, FC } from 'react'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import { browserSendEmail, IFileAttachment } from '@/utils/email/bowserSendEmail'
import {
  Owner,
  FieldError,
  EMPTY_OWNER,
  MAX_CHARS,
  MAX_TOTAL_ATTACHMENT_BYTES,
  BUSINESS_NAME_REGEX,
  LEGAL_CONSENT_TEXT,
  Field,
  TextInput,
  OwnerBlock,
  SignatureCanvas,
  validateOwner,
  fileToBase64,
  formatMB,
} from '@/components/forms/FinancingApplicationForm/FinancingApplicationForm'
import formStyles from '@/components/forms/FinancingApplicationForm/FinancingApplicationForm.module.scss'
import styles from './AdditionalOwnerForm.module.scss'

// Standalone form for an owner who was not on the original application.
// Reached only by direct link (/apply/additional-owner), never from a button.
// Staff can prefill the business name: /apply/additional-owner?business=Acme%20LLC

type LicenceSide = 'front' | 'back'

interface AdditionalOwnerData {
  legalBusinessName: string
  owner: Owner
  licenceFront: File | null
  licenceBack: File | null
  signatureDataUrl: string
  consentAgreed: boolean
}

const INITIAL: AdditionalOwnerData = {
  legalBusinessName: '',
  owner: { ...EMPTY_OWNER },
  licenceFront: null,
  licenceBack: null,
  signatureDataUrl: '',
  consentAgreed: false,
}

const LICENCE_ACCEPT = 'image/jpeg,image/png,image/heic,image/heif,application/pdf'

// Phone photos of a licence are often several MB each. Resize to a
// readable size and re-encode as JPEG before upload so both sides fit
// comfortably inside the attachment limit. PDFs pass through unchanged.
// If the browser cannot decode the image (e.g. HEIC on desktop Chrome),
// the original file is kept and the size check below still applies.
const MAX_IMAGE_EDGE = 1800
const JPEG_QUALITY = 0.85

const compressImage = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    )
    if (!blob || blob.size >= file.size) return file
    const base = file.name.replace(/\.[^.]+$/, '')
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' })
  } catch {
    return file
  }
}

const safeName = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '') || 'Owner'

const validate = (data: AdditionalOwnerData): FieldError => {
  const errors: FieldError = {}
  const name = data.legalBusinessName.trim()
  if (!name) errors.legalBusinessName = 'Legal business name is required'
  else if (name.length > MAX_CHARS)
    errors.legalBusinessName = `Legal business name must be ${MAX_CHARS} characters or less`
  else if (!BUSINESS_NAME_REGEX.test(name))
    errors.legalBusinessName = 'Invalid characters in business name'

  validateOwner(data.owner, 'owner', errors)

  if (!data.licenceFront) errors.licenceFront = "Please upload the front of your driver's license"
  if (!data.licenceBack) errors.licenceBack = "Please upload the back of your driver's license"
  if (!data.signatureDataUrl) errors.signature = 'Please provide your signature'
  if (!data.consentAgreed) errors.consent = 'You must agree to the terms to submit'
  return errors
}

const LicenceUpload: FC<{
  label: string
  file: File | null
  error?: string
  busy: boolean
  onSelect: (file: File) => void
  onRemove: () => void
}> = ({ label, file, error, busy, onSelect, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <Field label={label} required error={error}>
      {file ? (
        <ul className={formStyles.fileList}>
          <li className={formStyles.fileItem}>
            <span className={formStyles.fileName}>
              {file.name} ({formatMB(file.size)})
            </span>
            <button
              type="button"
              onClick={onRemove}
              className={formStyles.fileRemove}
              aria-label={`Remove ${label}`}
            >
              ×
            </button>
          </li>
        </ul>
      ) : (
        <button
          type="button"
          className={classNames(formStyles.dropzone, styles.licenceDropzone)}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const dropped = e.dataTransfer.files?.[0]
            if (dropped) onSelect(dropped)
          }}
          disabled={busy}
        >
          <input
            ref={inputRef}
            type="file"
            accept={LICENCE_ACCEPT}
            onChange={(e) => {
              const picked = e.target.files?.[0]
              if (picked) onSelect(picked)
              e.target.value = ''
            }}
            style={{ display: 'none' }}
          />
          <div className={formStyles.dropzoneIcon} aria-hidden="true">🪪</div>
          <p className={formStyles.dropzoneText}>
            {busy ? 'Preparing image…' : 'Take a photo or upload a file'}
          </p>
          <p className={formStyles.dropzoneHint}>JPG, PNG, HEIC or PDF</p>
        </button>
      )}
    </Field>
  )
}

const AdditionalOwnerForm: FC = () => {
  const router = useRouter()
  const [data, setData] = useState<AdditionalOwnerData>(INITIAL)
  const [errors, setErrors] = useState<FieldError>({})
  const [fileError, setFileError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<LicenceSide | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState('')
  const formStartTime = useRef<number>(Date.now())
  const formRef = useRef<HTMLDivElement>(null)

  // Prefill the business name from ?business= once, if staff included it.
  useEffect(() => {
    if (!router.isReady) return
    const business = router.query.business
    if (typeof business === 'string' && business.trim()) {
      setData((prev) =>
        prev.legalBusinessName
          ? prev
          : { ...prev, legalBusinessName: business.trim().slice(0, MAX_CHARS) },
      )
    }
  }, [router.isReady, router.query.business])

  const setOwner = useCallback((field: keyof Owner, value: string) => {
    setData((prev) => ({ ...prev, owner: { ...prev.owner, [field]: value } }))
  }, [])

  const setSignature = useCallback((v: string) => {
    setData((prev) => ({ ...prev, signatureDataUrl: v }))
  }, [])

  const selectLicence = async (side: LicenceSide, raw: File) => {
    setProcessing(side)
    const file = await compressImage(raw)
    setProcessing(null)
    setData((prev) => {
      const other = side === 'front' ? prev.licenceBack : prev.licenceFront
      const total = file.size + (other?.size || 0)
      if (total > MAX_TOTAL_ATTACHMENT_BYTES) {
        setFileError(
          `These files total ${formatMB(total)}, which is too large to send ` +
            `(limit ~${formatMB(MAX_TOTAL_ATTACHMENT_BYTES)}). Please upload a smaller photo or scan.`,
        )
        return prev
      }
      setFileError(null)
      return side === 'front' ? { ...prev, licenceFront: file } : { ...prev, licenceBack: file }
    })
  }

  const removeLicence = (side: LicenceSide) => {
    setFileError(null)
    setData((prev) =>
      side === 'front' ? { ...prev, licenceFront: null } : { ...prev, licenceBack: null },
    )
  }

  const handleSubmit = async () => {
    const errs = validate(data)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setSubmitError('Please correct the highlighted fields.')
      setTimeout(() => {
        formRef.current
          ?.querySelector(`.${formStyles.fieldError}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
      return
    }
    if (honeypot) return
    if (Date.now() - formStartTime.current < 4000) {
      setSubmitError('Please review the form before submitting.')
      return
    }

    setErrors({})
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const lastName = safeName(data.owner.lastName)
      const toAttachment = async (file: File, side: string): Promise<IFileAttachment> => {
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
        return {
          filename: `Drivers-License-${side}-${lastName}.${ext}`,
          content: await fileToBase64(file),
          contentType: file.type || 'application/octet-stream',
        }
      }
      const attachments = await Promise.all([
        toAttachment(data.licenceFront as File, 'Front'),
        toAttachment(data.licenceBack as File, 'Back'),
      ])

      const businessName = data.legalBusinessName.trim()
      await browserSendEmail({
        subject: `Additional Owner — ${businessName} — ${data.owner.firstName} ${data.owner.lastName}`,
        honeypot,
        timestamp: formStartTime.current,
        formData: {
          legalBusinessName: businessName,
          owner: data.owner,
          signatureDataUrl: data.signatureDataUrl,
          licenceFileNames: attachments.map((a) => a.filename),
        },
        attachments,
      })

      setIsSuccess(true)
      window.scrollTo(0, 0)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      const reason = error.response?.data?.error
      console.error('Additional owner submission failed:', err)
      setSubmitError(
        reason
          ? `Submission failed: ${reason}`
          : 'Submission failed. Please try again or contact us directly.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={formStyles.form}>
        <div className={formStyles.success}>
          <div className={formStyles.successIcon}>✓</div>
          <h2 className={formStyles.successTitle}>Information Submitted</h2>
          <p className={formStyles.successText}>
            Thank you, {data.owner.firstName}. Your details have been added to the application for{' '}
            {data.legalBusinessName.trim()}. A member of our team will be in touch if anything else is needed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={formStyles.form} ref={formRef}>
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className={formStyles.body}>
        <div className={formStyles.step}>
          <h2 className={formStyles.stepTitle}>Business</h2>
          <Field label="Legal Business Name" required error={errors.legalBusinessName}>
            <TextInput
              value={data.legalBusinessName}
              onChange={(e) =>
                setData((prev) => ({ ...prev, legalBusinessName: e.target.value.slice(0, MAX_CHARS) }))
              }
              placeholder="Acme Corp LLC"
              maxLength={MAX_CHARS}
              error={errors.legalBusinessName}
            />
          </Field>

          <h2 className={classNames(formStyles.stepTitle, styles.sectionGap)}>Your Information</h2>
          <OwnerBlock data={data.owner} onChange={setOwner} errors={errors} prefix="owner" />

          <h2 className={classNames(formStyles.stepTitle, styles.sectionGap)}>Driver&apos;s License</h2>
          <p className={formStyles.stepSubtitle}>
            Please upload a clear photo or scan of the front and back of your driver&apos;s license.
          </p>
          <div className={formStyles.row2}>
            <LicenceUpload
              label="Front"
              file={data.licenceFront}
              error={errors.licenceFront}
              busy={processing === 'front'}
              onSelect={(f) => selectLicence('front', f)}
              onRemove={() => removeLicence('front')}
            />
            <LicenceUpload
              label="Back"
              file={data.licenceBack}
              error={errors.licenceBack}
              busy={processing === 'back'}
              onSelect={(f) => selectLicence('back', f)}
              onRemove={() => removeLicence('back')}
            />
          </div>
          {fileError && (
            <span className={formStyles.fieldError} role="alert">
              {fileError}
            </span>
          )}

          <h2 className={classNames(formStyles.stepTitle, styles.sectionGap)}>Sign</h2>
          <Field label="Owner Signature" required error={errors.signature}>
            <p className={formStyles.signatureHint}>
              Draw your signature below, or switch to Type to sign with your name.
            </p>
            <SignatureCanvas
              value={data.signatureDataUrl}
              onChange={setSignature}
              error={errors.signature}
            />
          </Field>
          <div className={formStyles.legalText}>
            <p>{LEGAL_CONSENT_TEXT}</p>
          </div>
          <label className={formStyles.consentRow}>
            <input
              type="checkbox"
              checked={data.consentAgreed}
              onChange={(e) => setData((prev) => ({ ...prev, consentAgreed: e.target.checked }))}
              className={formStyles.consentCheckbox}
            />
            <span>I agree to the terms above and authorize Luminar Capital to process this application.</span>
          </label>
          {errors.consent && <span className={formStyles.fieldError}>{errors.consent}</span>}
          {submitError && <div className={formStyles.submitError}>{submitError}</div>}
        </div>
      </div>

      <div className={classNames(formStyles.nav, styles.navEnd)}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || processing !== null}
          className={classNames(
            formStyles.btnPrimary,
            (isSubmitting || processing !== null) && formStyles.btnDisabled,
          )}
        >
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </div>
  )
}

export default AdditionalOwnerForm
