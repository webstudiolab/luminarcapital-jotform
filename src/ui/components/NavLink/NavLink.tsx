import { ReactNode } from 'react'
import Link, { LinkProps } from 'next/link'
import classNames from 'classnames'
import ArrowRightIcon from '@/ui/icons/ArrowRight'
import styles from './NavLink.module.scss'

interface INavLink extends LinkProps {
  className?: string
  children?: string | ReactNode
  isActive?: boolean
}

const NavLink = ({ className, children, isActive, ...props }: INavLink) => {
  return (
    <Link
      {...props}
      className={classNames(
        styles['navLink'],
        isActive ? styles['active'] : null,
        className,
      )}
    >
      {children}
      <ArrowRightIcon className={styles['navLink-icon']} />
    </Link>
  )
}

export default NavLink
