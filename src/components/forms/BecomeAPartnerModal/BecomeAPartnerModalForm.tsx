import { useState, ChangeEvent, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
import { SubmitHandler, useForm } from 'react-hook-form'
import Slider from 'react-slick'
import { yupResolver } from '@hookform/resolvers/yup'
import TextField from '@/ui/components/TextField/TextField'
import { EMAIL_SUBJECT } from '@/config/constants'
import SuccessMessage from '@/ui/components/SuccessMesasge/SuccessMessage'
import { schema } from '../BecomeAPartnerDefault/schema'
import Button from '@/ui/components/Button/Button'
import { browserSendEmail } from '@/utils/email/bowserSendEmail'
import styles from '../ApplyForFinancingModal/ApplyForFinancingModalForm.module.scss'
import { messages } from '@/config/messages'
import PPMessage from '@/ui/components/PPMessage/PPMessage'

interface IApplyForFinancingModalForm {
  className?: string
}

interface IFormInput {
  company_name: string
  name: string
  phone: string
  email: string
}

const STORAGE_KEY = 'luminar_partner_modal_form'

const fieldsBySteps: Record<number, Array<keyof IFormInput>> = {
  0: ['company_name'],
  1: ['name'],
  2: ['phone', 'email'],
}

const BecomeAPartnerModalForm = ({
  className,
}: IApplyForFinancingModalForm) => {
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IFormInput>({ resolver: yupResolver(schema) })

  const sliderRef = useRef<Slider | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false)
  const [submittedError, setSubmittedError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState<number>(0)

  const [isFocused, setIsFocused] = useState({
    company_name: false,
    name: false,
    phone: false,
    email: false,
  })

  const [consent, setConsent] = useState(false)

  // SPAM PROTECTION
  const [honeypot, setHoneypot] = useState('')
  const formStartTime = useRef<number>(Date.now())

  // Restore saved form state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        Object.entries(parsed).forEach(([key, val]) => {
          if (val) {
            setValue(key as keyof IFormInput, val as string)
            setIsFocused((prev) => ({ ...prev, [key]: true }))
          }
        })
      }
    } catch {}
  }, [setValue])

  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getValues()))
    } catch {}
  }, [getValues])

  const settings = {
    accessibility: false,
    swipe: false,
    touchMove: false,
    fade: true,
    infinite: false,
    speed: 200,
    slidesToShow: 1,
    slidesToScroll: 1,
    className: classNames(styles['form-slider'], 'modal-slider'),
    arrows: false,
    customPaging: (i: number) => {
      return (
        <span className={classNames(styles['dot-item'], 'modal-slider-dot')}>
          {i + 1}
        </span>
      )
    },
    dots: true,
    dotsClass: classNames(styles['form-slider-dots'], 'modal-slider-dots'),
  }

  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const { name } = e.target
      setValue(name as keyof IFormInput, e.target.value)
      await trigger(name as keyof IFormInput)
      saveToStorage()
    },
    [setValue, trigger, saveToStorage],
  )

  const handleCheckboxChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setConsent(e.target.checked)
    },
    [],
  )

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target
    setIsFocused((prev) => ({
      ...prev,
      [name]: !!getValues(name as keyof IFormInput),
    }))
  }

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsSubmitting(true)
    try {
      await browserSendEmail({
        subject: `${EMAIL_SUBJECT.PARTNER} - ${data.company_name}`,
        htmlMessage: messages.admin(data),
        honeypot: honeypot,
        timestamp: formStartTime.current,
      })

      await browserSendEmail({
        to: data.email,
        subject: EMAIL_SUBJECT.PARTNER,
        htmlMessage: messages.user(),
        honeypot: honeypot,
        timestamp: formStartTime.current,
      })

      setIsSubmittedSuccess(true)
      localStorage.removeItem(STORAGE_KEY)

      setTimeout(() => {
        reset()
        setIsFocused({
          company_name: false,
          name: false,
          phone: false,
          email: false,
        })
        setConsent(false)
        formStartTime.current = Date.now()
      }, 1000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setSubmittedError(
        error.response?.data?.message || 'Submission failed. Please try again.',
      )
      setTimeout(() => setSubmittedError(null), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = useCallback(async () => {
    const currentFields =
      fieldsBySteps[currentSlide as keyof typeof fieldsBySteps]
    const isValid = await trigger(currentFields)
    if (isValid) {
      sliderRef.current?.slickNext()
      setCurrentSlide((prevState) => prevState + 1)
    }
  }, [currentSlide, trigger])

  const handlePrevious = useCallback(() => {
    sliderRef.current?.slickPrev()
    setCurrentSlide((prevState) => prevState - 1)
  }, [])

  // Block arrow keys from scrolling page; Enter advances steps
  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.stopPropagation()
      }
      if (e.key === 'Enter' && currentSlide < 2) {
        e.preventDefault()
        await handleNext()
      }
    },
    [currentSlide, handleNext],
  )

  // tabIndex helper — hidden slides must not be focusable
  const ti = (slide: number) => currentSlide === slide ? 0 : -1

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={classNames(styles['form'], className)}
        onKeyDown={handleKeyDown}
      >
        {/* HONEYPOT - Hidden spam trap */}
        <div
          style={{ position: 'absolute', left: '-9999px' }}
          aria-hidden="true"
        >
          <input
            aria-hidden="true"
            aria-label="leave blank"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <Slider
          ref={(slider) => {
            sliderRef.current = slider
          }}
          {...settings}
        >
          <div className={styles['form-step']} aria-hidden={currentSlide !== 0}>
            <p className={classNames(styles['form-step-title'])}>
              What&apos;s the name of your company?
            </p>
            <div className={styles['form-step-body']}>
              <TextField
                {...register('company_name')}
                className={styles['form-body-grid-item']}
                placeholder="Company Name"
                error={errors.company_name?.message}
                isFocused={isFocused['company_name']}
                onBlur={handleBlur}
                onChange={handleChange}
                tabIndex={ti(0)}
              />
            </div>
          </div>

          <div className={styles['form-step']} aria-hidden={currentSlide !== 1}>
            <p className={classNames(styles['form-step-title'])}>
              Tell us about yourself
            </p>
            <div className={styles['form-step-body']}>
              <TextField
                {...register('name')}
                className={styles['form-body-grid-item']}
                placeholder="Full Name"
                error={errors.name?.message}
                isFocused={isFocused['name']}
                onBlur={handleBlur}
                onChange={handleChange}
                tabIndex={ti(1)}
              />
            </div>
          </div>

          <div className={styles['form-step']} aria-hidden={currentSlide !== 2}>
            <p className={classNames(styles['form-step-title'])}>
              How can we connect?
            </p>
            <div className={styles['form-step-body']}>
              <TextField
                {...register('phone')}
                className={styles['form-body-grid-item']}
                placeholder="Phone Number"
                error={errors.phone?.message}
                isFocused={isFocused['phone']}
                onBlur={handleBlur}
                onChange={handleChange}
                tabIndex={ti(2)}
              />
              <TextField
                {...register('email')}
                type="email"
                className={styles['form-body-grid-item']}
                placeholder="Email"
                error={errors.email?.message}
                isFocused={isFocused['email']}
                onBlur={handleBlur}
                onChange={handleChange}
                tabIndex={ti(2)}
              />
              <div className={styles['consent-container']}>
                <input
                  id="partner-modal-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={handleCheckboxChange}
                  tabIndex={ti(2)}
                />
                <label htmlFor="partner-modal-consent">
                  <PPMessage />
                </label>
              </div>
            </div>
          </div>
        </Slider>

        {submittedError ? (
          <p className={classNames(styles['form-error'], styles['static'])} role="alert">
            {submittedError}
          </p>
        ) : null}

        <div className={styles['form-navigation']}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            className={classNames(
              styles['form-navigation-item'],
              styles['prev'],
              currentSlide === 0 ? styles['hidden'] : '',
            )}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            className={classNames(
              styles['form-navigation-item'],
              styles['next'],
              currentSlide === 2 ? styles['hidden'] : '',
            )}
          >
            Next
          </Button>
          <Button
            className={classNames(
              styles['form-action'],
              currentSlide !== 2 ? styles['hidden'] : '',
            )}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className={styles['form-action-icon']}>
                <Image src="/animated-spinner.svg" alt="submitting" fill />
              </div>
            ) : null}
            Submit
          </Button>
        </div>
      </form>
      {isSubmittedSuccess ? <SuccessMessage type="partner" /> : null}
    </>
  )
}

export default BecomeAPartnerModalForm
