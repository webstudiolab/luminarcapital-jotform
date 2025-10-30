import classNames from 'classnames'
import Select, { Props } from 'react-select'
import { customStyles } from '@/ui/components/SelectField/styles'
import { IOption } from '@/types'
import styles from './SelectField.module.scss'

interface ISelectField extends Props<IOption> {
  className?: string
  error?: string
}

const SelectField = ({ className, error, ...props }: ISelectField) => {
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
        styles={customStyles}
        isSearchable={false}
        isMulti={false}
      />
      {error ? <span className={styles['select-error']}>{error}</span> : null}
    </div>
  )
}

export default SelectField
