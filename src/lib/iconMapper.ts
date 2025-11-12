import { FC, SVGProps } from 'react'
import MoneyIcon from '@/ui/icons/Money'
import DiscountIcon from '@/ui/icons/Discount'
import LikeIcon from '@/ui/icons/Like'
import CreditCardIcon from '@/ui/icons/CreditCard'
import ClockIcon from '@/ui/icons/Clock'
import CustomerIcon from '@/ui/icons/Customer'
import ReloadIcon from '@/ui/icons/Reload'

// Map icon names from WordPress to React components
export const iconMap: { [key: string]: FC<SVGProps<SVGSVGElement>> } = {
  Money: MoneyIcon,
  Discount: DiscountIcon,
  Like: LikeIcon,
  CreditCard: CreditCardIcon,
  Clock: ClockIcon,
  Customer: CustomerIcon,
  Reload: ReloadIcon,
}

export const getIconComponent = (iconName: string): FC<SVGProps<SVGSVGElement>> => {
  return iconMap[iconName] || CreditCardIcon // Default to CreditCard if not found
}
