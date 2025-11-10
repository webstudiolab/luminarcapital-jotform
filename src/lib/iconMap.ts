import MoneyIcon from '@/ui/icons/Money'
import DiscountIcon from '@/ui/icons/Discount'
import LikeIcon from '@/ui/icons/Like'
import CreditCardIcon from '@/ui/icons/CreditCard'
import ClockIcon from '@/ui/icons/Clock'
import CustomerIcon from '@/ui/icons/Customer'
import ReloadIcon from '@/ui/icons/Reload'

export const iconMap: { [key: string]: any } = {
  Money: MoneyIcon,
  Discount: DiscountIcon,
  Like: LikeIcon,
  CreditCard: CreditCardIcon,
  Clock: ClockIcon,
  Customer: CustomerIcon,
  Reload: ReloadIcon,
}

export function getIconComponent(iconName: string) {
  return iconMap[iconName] || null
}
