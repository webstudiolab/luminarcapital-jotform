import Button from '@/ui/components/Button/Button'
import Image from 'next/image'
import { useAppDispatch } from '@/hooks'
import styles from './FinancingOptionCAT.module.scss'
import { openModal } from '@/store/slices/modalSlice'

const FinancingOptionCAT = () => {
  const dispatch = useAppDispatch()

  return (
    <div className={styles['card']}>
      <div className={styles['card-content']}>
        <h3>Luminar Capital is here to help.</h3>
        <Button
          onClick={() =>
            dispatch(openModal({ modal: 'financing', size: 'xl' }))
          }
        >
          Apply for Financing
        </Button>
      </div>
      <div className={styles['card-banner']}>
        <Image
          src="/banners/financing-options-banner.svg"
          alt="Luminar Capital is here to help."
          width={0}
          height={0}
          className={styles['card-banner-item']}
        />
      </div>
    </div>
  )
}

export default FinancingOptionCAT
