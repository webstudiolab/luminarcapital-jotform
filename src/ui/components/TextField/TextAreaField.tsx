import { ChangeEvent, forwardRef, TextareaHTMLAttributes, useId } from 'react'
import classNames from 'classnames'
import styles from './TextField.module.scss'

interface ITextAreaField extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
  placeholder?: string
  error?: string | null
  isFocused?: boolean
  onBlur?: (e: ChangeEvent<HTMLTextAreaElement>) => void // eslint-disable-line no-unused-vars
}

const TextAreaField = forwardRef<HTMLTextAreaElement, ITextAreaField>(
  (
    {
      className,
      placeholder,
      error = null,
      isFocused,
      onBlur,
      ...props
    }: ITextAreaField,
    ref,
  ) => {
    const id = useId()

    return (
      <label htmlFor={id} className={classNames(styles['textField-container'], className)}>
        <textarea
          id={id}
          ref={ref}
          aria-label={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={classNames(
            styles['textField-area'],
            error ? styles['error'] : null,
          )}
          onBlur={onBlur}
          {...props}
        />
        {placeholder ? (
          <span
            aria-hidden="true"
            className={classNames(
              styles['textField-placeholder'],
              isFocused ? styles['textField-placeholder-active'] : '',
            )}
          >
            {placeholder}
          </span>
        ) : null}
        {error ? (
          <span id={`${id}-error`} role="alert" className={styles['textField-error']}>{error}</span>
        ) : null}
      </label>
    )
  },
)

TextAreaField.displayName = 'TextAreaField'

export default TextAreaField
