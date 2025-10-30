import { createElement, useCallback } from 'react'
import classNames from 'classnames'
import Link from 'next/link'
import Image from 'next/image'
import { useAppDispatch } from '@/hooks'
import { IModalPayload } from '@/types'
import { openModal } from '@/store/slices/modalSlice'
import { navData } from './navData'
import styles from './Footer.module.scss'

interface IFooter {
  className?: string
}

const renderLink = (
  link: { href?: string; modal?: IModalPayload; label: string },
  // eslint-disable-next-line no-unused-vars
  handleModalTrigger: (payload: IModalPayload) => void,
) => {
  if (link.href) {
    return (
      <Link
        href={link.href}
        title={link.label}
        className={styles['footer-link']}
      >
        {link.label}
      </Link>
    )
  }
  if (link.modal) {
    return (
      <span
        className={styles['footer-link']}
        onClick={() =>
          handleModalTrigger({
            modal: link.modal!.modal,
            size: link.modal!.size,
          })
        }
      >
        {link.label}
      </span>
    )
  }
  return null
}

const Footer = ({ className }: IFooter) => {
  const dispatch = useAppDispatch()

  const handleModalTrigger = useCallback(
    ({ modal, size }: IModalPayload) => {
      dispatch(openModal({ modal, size }))
    },
    [dispatch],
  )

  return (
    <footer className={classNames(styles['footer'], className)}>
      <div className="content-block">
        <div className="row">
          <div className="col-md-5 col-gutter-lr">
            <div className={styles['footer-body']}>
              <Link href="/" className={styles['footer-logo']}>
                <Image src="/color_logo.svg" alt="Luminar Capital" fill />
              </Link>
              <p className={styles['footer-body-description']}>
                <strong>When you succeed, we succeed.</strong> At Luminar
                Capital, we are focused on delivering custom financing solutions
                with exceptional customer service. Our relationships with our
                customers are intimate, not robotic. We view you as a partner
                and not a transaction.
              </p>
              <div className={styles['footer-social']}>
                {navData.socials.map((social, index) => (
                  <a
                    key={`social-icon-${index}`}
                    href={social.href}
                    target="_blank"
                    title={social.title}
                    className={styles['footer-social-icon']}
                  >
                    {createElement(social.icon)}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="col-md-7 col-gutter-lr">
            <div className={styles['footer-nav']}>
              {navData.main.map((navGroup, index) => (
                <div
                  key={`footer-nav-group-${index}`}
                  className={styles['footer-nav-item']}
                >
                  <h4 className={styles['footer-nav-title']}>
                    {navGroup.title}
                  </h4>
                  <ul className={styles['footer-nav-group']}>
                    {navGroup.nav.map((link, i) => (
                      <li key={`footer-link-${i}`}>
                        {renderLink(link, handleModalTrigger)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles['footer-copyright']}>
          <p className={styles['footer-copyright-item']}>
            Copyright &copy; {new Date().getFullYear()} Luminar Capital LLC. All
            rights reserved.
          </p>
          <div className={styles['footer-secondaryNav']}>
            {navData.secondary.map((link, index) => (
              <Link
                key={`footer-link-secondary-${index}`}
                href={link.href}
                className={styles['footer-link-secondary']}
                title={link.title}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
