import { FC, SVGProps } from 'react'
import CheckIcon from '@/ui/icons/Check'
import TargetIcon from '@/ui/icons/Target'
import BriefcaseIcon from '@/ui/icons/Briefcase'
import UsersIcon from '@/ui/icons/Users'
import HeartIcon from '@/ui/icons/Heart'
import ShieldIcon from '@/ui/icons/Shield'

type IconComponent = FC<SVGProps<SVGSVGElement>>

export const iconMap: Record<string, IconComponent> = {
  check: CheckIcon,
  target: TargetIcon,
  briefcase: BriefcaseIcon,
  users: UsersIcon,
  heart: HeartIcon,
  shield: ShieldIcon,
}

export const getIconComponent = (iconName: string): IconComponent => {
  return iconMap[iconName] || CheckIcon
}
