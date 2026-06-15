import classNames from 'classnames'
import { ITab } from '@/types'
import styles from './Tabs.module.scss'

interface ITabs {
  className?: string
  data: ITab[]
  activeTab?: string
  onSwitch: (t: string) => void // eslint-disable-line no-unused-vars
}

const Tabs = ({ className, data, activeTab, onSwitch }: ITabs) => {
  return (
    <div className={classNames(styles['tabs'], className)}>
      <div className={styles['tabs-panel']} role="tablist">
        {data.map((tab, index) => (
          <button
            key={`tab-${index}`}
            type="button"
            role="tab"
            aria-selected={Number(activeTab) === tab.value}
            className={classNames(
              styles['tab'],
              Number(activeTab) === tab.value && styles['active'],
            )}
            onClick={() => onSwitch(String(tab.value))}
          >
            {tab.title}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Tabs
