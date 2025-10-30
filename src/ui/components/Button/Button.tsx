import { createElement, FC, ReactNode, SVGProps } from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import styles from './Button.module.scss'

interface IButton {
  variant?: 'solid' | 'outlined' | 'link'
  color?: 'primary' | 'secondary' | 'white'
  size?: 'xl' | 'lg' | 'md'
  disabled?: boolean
  icon?: FC<SVGProps<SVGSVGElement>>
  iconPosition?: 'left' | 'right'
  className?: string
  children: string | ReactNode
  target?: string
  asDefaultLink?: boolean
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
}

const Button = ({
  className,
  children,
  variant = 'solid',
  color = 'primary',
  size = 'lg',
  href,
  icon,
  iconPosition = 'right',
  disabled,
  target,
  asDefaultLink = false,
  onClick,
  type = 'button',
  ...props
}: IButton) => {
  const classes = classNames(
    styles['button'],
    styles[variant],
    styles[color],
    styles[size],
    {
      [styles['icon']]: icon,
      [styles[iconPosition]]: icon,
      [styles['disabled']]: disabled,
    },
    className,
  )

  const renderIcon = () =>
    icon && <span className={styles['button-icon']}>{createElement(icon)}</span>

  const content = (
    <>
      <span className={styles['button-label']}>{children}</span>
      {renderIcon()}
    </>
  )

  if (href && !asDefaultLink) {
    return (
      <Link {...props} href={href} className={classes}>
        {content}
      </Link>
    )
  }

  if (asDefaultLink && href) {
    return (
      <a {...props} href={href as string} target={target} className={classes}>
        {content}
      </a>
    )
  }

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {content}
    </button>
  )
}

export default Button
