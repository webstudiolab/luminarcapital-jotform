import { ChangeEvent, forwardRef, TextareaHTMLAttributes } from 'react'
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
    return (
      <label className={classNames(styles['textField-container'], className)}>
        <textarea
          ref={ref}
          className={classNames(
            styles['textField-area'],
            error ? styles['error'] : null,
          )}
          onBlur={onBlur}
          {...props}
        />
        {placeholder ? (
          <span
            className={classNames(
              styles['textField-placeholder'],
              isFocused ? styles['textField-placeholder-active'] : '',
            )}
          >
            {placeholder}
          </span>
        ) : null}
        {error ? (
          <span className={styles['textField-error']}>{error}</span>
        ) : null}
      </label>
    )
  },
)

export default TextAreaField
