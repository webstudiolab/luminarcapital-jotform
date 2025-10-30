import { IFinancingOptionCard } from '@/types'
import CreditCardIcon from '@/ui/icons/CreditCard'
import ClockIcon from '@/ui/icons/Clock'
import CustomerIcon from '@/ui/icons/Customer'
import ReloadIcon from '@/ui/icons/Reload'

export const valuesData: IFinancingOptionCard[] = [
  {
    title: 'Unmatched Flexibility',
    description:
      'Every business is different and so is every one of our offerings. Instead of following a standardized approach, we prefer to work with each customer delivering the financing they need to grow.',
    icon: CreditCardIcon,
  },
  {
    title: 'Exceptional Speed',
    description:
      'Business opportunities emerge and disappear in an instant. Our objective is to deliver financing within 24 hours once you apply to ensure you can take advantage of growth prospects.',
    icon: ClockIcon,
  },
  {
    title: 'Unparalleled Support',
    description:
      'Our experienced team will be there to assist you from the beginning to the end of the financing process. We value knowing your niche, strengths and potential to make sure we can provide the best support possible.',
    icon: CustomerIcon,
  },
  {
    title: 'Incomparable Trust',
    description:
      'We believe in providing complete visibility in our business practices as honesty is the key to any successful relationship.',
    icon: ReloadIcon,
  },
]
