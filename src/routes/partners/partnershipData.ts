import MoneyIcon from '@/ui/icons/Money'
import DiscountIcon from '@/ui/icons/Discount'
import LikeIcon from '@/ui/icons/Like'
import CreditCardIcon from '@/ui/icons/CreditCard'
import { IFinancingOptionCard } from '@/types'

export const partnershipData: IFinancingOptionCard[] = [
  {
    title: 'Personalized Financing Options',
    description:
      'We are mindful that every business has their own unique story and scenario which allows us to take a creative approach in providing customized financing solutions. We continuously iterate our knowledge base across all industries which helps us understand potential business bottlenecks and how our financing can be beneficial over the long term.',
    icon: MoneyIcon,
  },
  {
    title: 'Attractive Referral Fees',
    description:
      'We provide our referral partners the highest compensation the market has to offer and even have a special program for our strongest relationships. We recognize the effort that is applied to secure financing for your customers, at Luminar we ensure that our referral partners are compensated appropriately.',
    icon: DiscountIcon,
  },
  {
    title: 'Efficient Process',
    description:
      "Time is everyone's most valuable asset. That is why we simplified our process by ensuring we deliver swift and firm approvals that are seamlessly completed without any hassle.",
    icon: LikeIcon,
  },
  {
    title: 'Dedicated Customer Service',
    description:
      'Experience customer service like never before with our thoughtful and skilled team. We prioritize personalized support and clear communication every step of the way to our clients and referral partner relationships.',
    icon: CreditCardIcon,
  },
]
