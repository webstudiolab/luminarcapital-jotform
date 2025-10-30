'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAppDispatch } from '@/hooks'
import classNames from 'classnames'
import Link from 'next/link'
import Image from 'next/image'
import { useAnimate, stagger, motion } from 'framer-motion'
import Button from '@/ui/components/Button/Button'
import NavLink from '@/ui/components/NavLink/NavLink'
import Burger from '@/ui/components/Burger/Burger'
import { openModal } from '@/store/slices/modalSlice'
import { IModalPayload } from '@/types'
import { debounce } from '@/utils/debounce'
import styles from './Header.module.scss'

interface IHeader {
  className?: string
}

const nav = [
  {
    label: 'Financing Options',
    href: '/financing-options',
  },
  {
    label: 'Learning Center',
    href: '/learning-center',
  },
  {
    label: 'Partners',
    href: '/partners',
  },
  {
    label: 'Why Luminar',
    href: '/why-luminar',
  },
  {
    label: 'Contact Us',
    href: '/contact',
  },
]

const staggerMenuItems = stagger(0.05, { startDelay: 0.15 })

const useMenuAnimation = (isOpen: boolean) => {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    animate(
      'button',
      isOpen ? { opacity: 1, y: '0rem' } : { opacity: 0, y: '5rem' },
      {
        duration: 0.3,
        delay: isOpen ? staggerMenuItems : 0,
      },
    )

    animate(
      'li',
      isOpen ? { opacity: 1, x: '0rem' } : { opacity: 0, x: '-5rem' },
      {
        duration: 0.3,
        delay: isOpen ? staggerMenuItems : 0,
      },
    )
  }, [animate, isOpen])

  return scope
}

const Header = ({ className }: IHeader) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [isScrolling, setIsScrolling] = useState<boolean>(false)
  const scope = useMenuAnimation(isMenuOpen)

  const onScroll = debounce(() => {
    const { scrollY } = window
    setIsScrolling(scrollY > 0)
  }, 100)

  const handleModalTrigger = useCallback(
    ({ modal, size }: IModalPayload) => {
      // Open modal window
      dispatch(openModal({ modal, size }))
      // Close navigation
      setIsMenuOpen(false)
    },
    [dispatch],
  )

  // Detect scroll for sticky
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', onScroll, { passive: true })

      return () => {
        window.removeEventListener('scroll', onScroll)
      }
    }
  }, [onScroll])

  // Close navigation on page change
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      setIsMenuOpen(false)
    }
  }, [router.pathname])

  return (
    <header
      id="header"
      className={classNames(
        styles['header'],
        isScrolling ? styles['scrolling'] : null,
        className,
      )}
    >
      <div className="content-block">
        <div className={styles['header-panel']}>
          <Link href="/" className={styles['header-panel-logo']}>
            <Image src="/color_logo.svg" alt="Luminar Capital" fill />
          </Link>
          <nav
            ref={scope}
            className={classNames(
              styles['header-panel-nav'],
              isMenuOpen ? styles['active'] : null,
            )}
          >
            <motion.ul className={styles['header-navigation']}>
              {nav.map((link, index) => (
                <motion.li key={`nav-${index}`}>
                  <NavLink
                    href={link.href}
                    isActive={router.pathname == link.href}
                  >
                    {link.label}
                  </NavLink>
                </motion.li>
              ))}
            </motion.ul>
            <div className={styles['header-actions']}>
              <Button
                variant="outlined"
                className={styles['header-actions-item']}
                onClick={() =>
                  handleModalTrigger({ modal: 'partner', size: 'lg' })
                }
              >
                Become a Partner
              </Button>
              <Button
                className={styles['header-actions-item']}
                onClick={() =>
                  handleModalTrigger({ modal: 'financing', size: 'xl' })
                }
              >
                Apply for Financing
              </Button>
            </div>
          </nav>
          <div className={styles['header-burger']}>
            <Burger
              isActive={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
