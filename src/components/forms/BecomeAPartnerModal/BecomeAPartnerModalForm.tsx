import { useState, ChangeEvent, useRef, useCallback } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
// import axios from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import Slider from 'react-slick'
import { yupResolver } from '@hookform/resolvers/yup'
import TextField from '@/ui/components/TextField/TextField'
import { EMAIL_SUBJECT } from '@/config/constants'
// import { WORDPRESS_API_PATHS } from '@/config/constants'
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

  // State to track focus status for each field. Initially, all fields are not focused.
  const [isFocused, setIsFocused] = useState({
    company_name: false,
    name: false,
    phone: false,
    email: false,
  })

  // Consent checkbox state
  const [consent, setConsent] = useState(false)

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
    adaptiveHeight: true,
  }

  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const { name } = e.target
      setValue(name as keyof IFormInput, e.target.value)
      await trigger(name as keyof IFormInput)
    },
    [setValue, trigger],
  )

  const handleCheckboxChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setConsent(e.target.checked)
    },
    [],
  )

  // Function that triggers on blur (losing focus). It updates the focus state based on whether the field has a value.
  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target
    setIsFocused((prev) => ({
      ...prev,
      [name]: !!getValues(name as keyof IFormInput),
    }))
  }

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    if (!consent) {
      alert('Please check the consent box to proceed.')
      return
    }

    setIsSubmitting(true)
    try {
      // TEMPORARY: WordPress API commented out until backend is ready
      // Once WordPress is set up, uncomment the code below and remove the direct email approach

      /*
      const response = await axios.post(
        `${process.env.WORDPRESS_API_URL!}/${WORDPRESS_API_PATHS.save}/save-partner`,
        data,
      )

      if (response.data.success && response.status === 200) {
      */

      // TEMPORARY: Send emails directly without WordPress API
      // Send email to admin
      await browserSendEmail({
        subject: EMAIL_SUBJECT.PARTNER,
        htmlMessage: messages.admin(data),
      })

      // Send confirmation email to user
      await browserSendEmail({
        to: data.email,
        subject: EMAIL_SUBJECT.PARTNER,
        htmlMessage: messages.user(),
      })

      setIsSubmittedSuccess(true)

      setTimeout(() => {
        reset()
        setIsFocused({
          company_name: false,
          name: false,
          phone: false,
          email: false,
        })
        setConsent(false)
      }, 1000)

      /*
      }
      */
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

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={classNames(styles['form'], className)}
      >
        <Slider
          ref={(slider) => {
            sliderRef.current = slider
          }}
          {...settings}
        >
          <div className={styles['form-step']}>
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
              />
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
                type="email"
                className={styles['form-body-grid-item']}
                placeholder="Email"
                error={errors.email?.message}
                isFocused={isFocused['email']}
                onBlur={handleBlur}
                onChange={handleChange}
              />
              <div className={styles['consent-container']}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={handleCheckboxChange}
                  required
                  id="consent"
                />
                <label htmlFor="consent">
                  <PPMessage />
                </label>
              </div>
            </div>
          </div>
        </Slider>

        {submittedError ? (
          <p className={classNames(styles['form-error'], styles['static'])}>
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
            disabled={isSubmitting || !consent}
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
