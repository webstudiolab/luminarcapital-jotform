import { forwardRef, InputHTMLAttributes } from 'react'
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
    return (
      <label className={classNames(styles['textField-container'], className)}>
        <input
          ref={ref}
          className={classNames(
            styles['textField-item'],
            error ? styles['error'] : null,
          )}
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

export default TextField
