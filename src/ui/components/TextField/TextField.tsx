import { forwardRef, InputHTMLAttributes, useId } from 'react'
import classNames from 'classnames'
import styles from './TextField.module.scss'

interface ITextField extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
  placeholder?: string
  error?: string | null
  isFocused?: boolean
}

const TextField = forwardRef<HTMLInputElement, ITextField>(
  (
    { className, placeholder, error = null, isFocused, ...props }: ITextField,
    ref,
  ) => {
    const id = useId()

    return (
      <label
        htmlFor={id}
        className={classNames(styles['textField-container'], className)}
      >
        <input
          id={id}
          ref={ref}
          aria-label={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={classNames(
            styles['textField-item'],
            error ? styles['error'] : null,
          )}
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
          <span
            id={`${id}-error`}
            role="alert"
            className={styles['textField-error']}
          >
            {error}
          </span>
        ) : null}
      </label>
    )
  },
)

TextField.displayName = 'TextField'

export default TextField
