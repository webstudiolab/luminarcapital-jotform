import { useState, ChangeEvent, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
import { SubmitHandler, useForm } from 'react-hook-form'
import Slider from 'react-slick'
import { yupResolver } from '@hookform/resolvers/yup'
import TextField from '@/ui/components/TextField/TextField'
import {
  AMOUNT_OPTIONS,
  EMAIL_SUBJECT,
} from '@/config/constants'
import CheckboxField from '@/ui/components/CheckboxField/CheckboxField'
import SuccessMessage from '@/ui/components/SuccessMesasge/SuccessMessage'
import { schema } from '../ApplyForFinancingDefault/schema'
import Button from '@/ui/components/Button/Button'
import { browserSendEmail } from '@/utils/email/bowserSendEmail'
import styles from './ApplyForFinancingModalForm.module.scss'
import { messages } from '@/config/messages'
import PPMessage from '@/ui/components/PPMessage/PPMessage'

interface IApplyForFinancingModalForm {
  className?: string
}

interface IFormInput {
  name: string
  business_name: string
  business_objectives?: string
  email: string
  amount_of_financing_requested: string
  average_of_monthly_sales: string
  phone: string
}

const STORAGE_KEY = 'luminar_financing_modal_form'

const fieldsBySteps: Record<number, Array<keyof IFormInput>> = {
  0: ['amount_of_financing_requested'],
  1: ['average_of_monthly_sales'],
  2: ['name', 'business_name'],
  3: ['phone', 'email'],
}

const ApplyForFinancingModalForm = ({
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
    name: false,
    business_name: false,
    email: false,
    phone: false,
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
        subject: `${EMAIL_SUBJECT.FINANCING} - ${data.business_name}`,
        htmlMessage: messages.admin(data),
        honeypot: honeypot,
        timestamp: formStartTime.current,
      })

      await browserSendEmail({
        to: data.email,
        subject: EMAIL_SUBJECT.FINANCING,
        htmlMessage: messages.user(),
        honeypot: honeypot,
        timestamp: formStartTime.current,
      })

      setIsSubmittedSuccess(true)
      localStorage.removeItem(STORAGE_KEY)

      setTimeout(() => {
        reset()
        setIsFocused({
          name: false,
          business_name: false,
          email: false,
          phone: false,
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
    setCurrentSlide((prevState) => prevState - 1)
    sliderRef.current?.slickPrev()
  }, [])

  // Block arrow keys from scrolling page; Enter advances steps
  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.stopPropagation()
      }
      if (e.key === 'Enter' && currentSlide < 3) {
        e.preventDefault()
        await handleNext()
      }
    },
    [currentSlide, handleNext],
  )

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
          <div className={styles['form-step']}>
            <p className={classNames(styles['form-step-title'])}>
              What&apos;s the amount of financing requested?
            </p>
            <div
              className={classNames(
                styles['form-step-body'],
                styles['checkboxes'],
              )}
            >
              {AMOUNT_OPTIONS.map((option, index) => (
                <CheckboxField
                  {...register('amount_of_financing_requested')}
                  key={`financing-checkbox-0-${index}`}
                  option={option}
                />
              ))}
              {errors.amount_of_financing_requested?.message ? (
                <span className={styles['form-error']} role="alert">
                  {errors.amount_of_financing_requested.message}
                </span>
              ) : null}
            </div>
          </div>

          <div className={styles['form-step']}>
            <p className={classNames(styles['form-step-title'])}>
              What&apos;s your average monthly sales?
            </p>
            <div
              className={classNames(
                styles['form-step-body'],
                styles['checkboxes'],
              )}
            >
              {AMOUNT_OPTIONS.map((option, index) => (
                <CheckboxField
                  {...register('average_of_monthly_sales')}
                  key={`financing-checkbox-1-${index}`}
                  option={option}
                />
              ))}
              {errors.average_of_monthly_sales?.message ? (
                <span className={styles['form-error']} role="alert">
                  {errors.average_of_monthly_sales.message}
                </span>
              ) : null}
            </div>
          </div>

          <div className={styles['form-step']}>
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
              />
              <TextField
                {...register('business_name')}
                className={styles['form-body-grid-item']}
                placeholder="Business Name"
                error={errors.business_name?.message}
                isFocused={isFocused['business_name']}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles['form-step']}>
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
              />
              <TextField
                {...register('email')}
                className={styles['form-body-grid-item']}
                placeholder="Email"
                error={errors.email?.message}
                isFocused={isFocused['email']}
                onBlur={handleBlur}
                onChange={handleChange}
              />
              <label
                htmlFor="financing-modal-consent"
                className={styles['consent-container']}
              >
                <input
                  id="financing-modal-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={handleCheckboxChange}
                />{' '}
                <PPMessage />
              </label>
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
              currentSlide === 3 ? styles['hidden'] : '',
            )}
          >
            Next
          </Button>
          <Button
            className={classNames(
              styles['form-action'],
              currentSlide !== 3 ? styles['hidden'] : '',
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
      {isSubmittedSuccess ? <SuccessMessage type="financing" /> : null}
    </>
  )
}

export default ApplyForFinancingModalForm
