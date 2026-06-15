import { useId } from 'react'
import classNames from 'classnames'
import Select, { Props } from 'react-select'
import { customStyles } from '@/ui/components/SelectField/styles'
import { IOption } from '@/types'
import styles from './SelectField.module.scss'

interface ISelectField extends Props<IOption> {
  className?: string
  error?: string
}

const SelectField = ({ className, error, placeholder, ...props }: ISelectField) => {
  const generatedId = useId()
  const inputId = props.inputId || generatedId

  return (
    <div
      className={classNames(
        styles['select'],
        error ? styles['error'] : null,
        className,
      )}
    >
      <Select
        {...props}
        inputId={inputId}
        placeholder={placeholder}
        aria-label={typeof placeholder === 'string' ? placeholder : undefined}
        styles={customStyles}
        isSearchable={false}
        isMulti={false}
      />
      {error ? (
        <span role="alert" className={styles['select-error']}>
          {error}
        </span>
      ) : null}
    </div>
  )
}

export default SelectField
