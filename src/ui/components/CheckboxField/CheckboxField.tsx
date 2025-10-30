import { forwardRef, InputHTMLAttributes } from 'react'
import classNames from 'classnames'
import styles from './CheckboxField.module.scss'
import { IOption } from '@/types'

interface ICheckboxField extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
  option: IOption
  type?: 'radio' | 'checkbox'
}

const CheckboxField = forwardRef<HTMLInputElement, ICheckboxField>(
  ({ className, type = 'radio', option, ...props }: ICheckboxField, ref) => {
    return (
      <label className={classNames(styles['checkbox'], className)}>
        <input
          type={type}
          ref={ref}
          className={styles['checkbox-item']}
          value={option.value}
          {...props}
        />
        <span className={styles['checkbox-background']}></span>
        <span className={styles['checkbox-icon']}></span>
        <span className={styles['checkbox-label']}>{option.label}</span>
      </label>
    )
  },
)

export default CheckboxField
