import { ChangeEvent, useCallback, useState, useRef } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
import { useForm, SubmitHandler } from 'react-hook-form'
import TextField from '@/ui/components/TextField/TextField'
import Button from '@/ui/components/Button/Button'
import { yupResolver } from '@hookform/resolvers/yup'
import { EMAIL_SUBJECT } from '@/config/constants'
import SuccessMessage from '@/ui/components/SuccessMesasge/SuccessMessage'
import { schema } from './schema'
import { browserSendEmail } from '@/utils/email/bowserSendEmail'
import styles from './BecomeAPartnerDefault.module.scss'
import { messages } from '@/config/messages'
import PPMessage from '@/ui/components/PPMessage/PPMessage'

interface IBecomeAPartnerDefault {
  className?: string
}

interface IFormInput {
  name: string
  email: string
  company_name: string
  phone: string
}

const BecomeAPartnerDefaultForm = ({ className }: IBecomeAPartnerDefault) => {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm<IFormInput>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false)
  const [submittedError, setSubmittedError] = useState<string | null>(null)

  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    company_name: false,
    phone: false,
  })

  const [consent, setConsent] = useState(false)

  // SPAM PROTECTION
  const [honeypot, setHoneypot] = useState('')
  const formStartTime = useRef<number>(Date.now())

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target
    setIsFocused((prev) => ({
      ...prev,
      [name]: !!getValues(name as keyof IFormInput),
    }))
  }

  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const { name } = e.target
      setValue(name as keyof IFormInput, e.target.value)
      await trigger(name as keyof IFormInput)
    },
    [setValue, trigger],
  )

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    if (!consent) {
      alert('Please check the consent box to proceed.')
      return
    }

    setIsSubmitting(true)
    try {
      // Send email to admin
      await browserSendEmail({
        subject: EMAIL_SUBJECT.PARTNER,
        htmlMessage: messages.admin(data),
        honeypot: honeypot,
        timestamp: formStartTime.current,
      })

      // Send confirmation email to user
      await browserSendEmail({
        to: data.email,
        subject: EMAIL_SUBJECT.PARTNER,
        htmlMessage: messages.user(),
        honeypot: honeypot,
        timestamp: formStartTime.current,
      })

      setIsSubmittedSuccess(true)

      setTimeout(() => {
        reset()
        setIsFocused({
          name: false,
          email: false,
          company_name: false,
          phone: false,
        })
        setConsent(false)
        formStartTime.current = Date.now()
      }, 1000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setSubmittedError(error.response?.data?.message || 'Submission failed')
      setTimeout(() => setSubmittedError(null), 3000)
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setIsSubmittedSuccess(false), 5000)
    }
  }

  const fields: {
    name: keyof IFormInput
    placeholder: string
    error?: string
  }[] = [
    {
      name: 'name',
      placeholder: 'Full Name',
      error: errors.name?.message,
    },
    {
      name: 'email',
      placeholder: 'Email',
      error: errors.email?.message,
    },
    {
      name: 'company_name',
      placeholder: 'Company Name',
      error: errors.company_name?.message,
    },
    {
      name: 'phone',
      placeholder: 'Phone Number',
      error: errors.phone?.message,
    },
  ]

  return (
    <>
      <div className={classNames(styles['form'], className)}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles['form-body']}>
          {/* HONEYPOT - Hidden spam trap */}
          <div
            style={{ position: 'absolute', left: '-9999px' }}
            aria-hidden="true"
          >
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {fields.map((field) => (
            <TextField
              key={field.name}
              {...register(field.name)}
              className={styles['form-body-grid-item']}
              placeholder={field.placeholder}
              error={field.error}
              isFocused={isFocused[field.name]}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          ))}

          <div className={styles['form-body-grid-item']}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                margin: '12px 0',
              }}
            >
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                style={{ marginTop: '4px' }}
              />
              <span style={{ lineHeight: 1.4 }}>
                <PPMessage />
              </span>
            </label>
          </div>

          <Button
            className={styles['form-action']}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <div className={styles['form-action-icon']}>
                <Image src="/animated-spinner.svg" alt="submitting" fill />
              </div>
            )}
            Submit
          </Button>

          {submittedError && (
            <p className={styles['form-error']}>{submittedError}</p>
          )}
        </form>
      </div>
      {isSubmittedSuccess && <SuccessMessage type="partner" />}
    </>
  )
}

export default BecomeAPartnerDefaultForm
