'use client'

import { FC, SVGProps, createElement, useRef, useState, useEffect } from 'react'
import classNames from 'classnames'
import PhoneIcon from '@/ui/icons/Phone'
import MailIcon from '@/ui/icons/Mail'
import MarkerIcon from '@/ui/icons/Marker'
import styles from './ContactsData.module.scss'

interface IContactsData {
  className?: string
}

interface IContactsDataItem {
  label: string
  href?: string
  blank: boolean
  icon: FC<SVGProps<SVGSVGElement>>
}

const contacts: IContactsDataItem[] = [
  {
    href: 'tel:3053070190',
    label: '(305) 307-0190',
    blank: false,
    icon: PhoneIcon,
  },
  {
    href: 'mailto:support@luminarcapital.com',
    label: 'support@luminarcapital.com',
    blank: true,
    icon: MailIcon,
  },
  {
    href: 'https://maps.app.goo.gl/XDnwr6xX7NtxSoUn6',
    label: '25 SE 2nd Ave Ste 550-789 Miami, FL 33131',
    blank: true,
    icon: MarkerIcon,
  },
]

const ContactsDataItem = ({ data: contact }: { data: IContactsDataItem }) => {
  const labelRef = useRef<HTMLSpanElement | null>(null)

  // const handleCopy = useCallback(async (value: string) => {
  //   if (navigator.clipboard) {
  //     try {
  //       await navigator.clipboard.writeText(value)
  //
  //       if (labelRef.current) {
  //         const range = document.createRange()
  //         range.selectNodeContents(labelRef.current)
  //
  //         const sel = window.getSelection()
  //         if (sel) {
  //           sel.removeAllRanges()
  //           sel.addRange(range)
  //         }
  //       }
  //     } catch (err) {
  //       console.error('Failed to copy text: ', err)
  //     }
  //   }
  // }, [])

  return (
    <a
      href={contact.href}
      className={styles['link']}
      target={contact.blank ? '_blank' : '_self'}
    >
      <span
        className={styles['link-icon']}
        // onClick={() => handleCopy(contact.label)}
      >
        {createElement(contact.icon)}
      </span>
      <span className={styles['link-label']} ref={labelRef}>
        {contact.label}
      </span>
    </a>
  )
}

const ContactsData = ({ className }: IContactsData) => {
  const [data] = useState<IContactsDataItem[]>(contacts)

  useEffect(() => {
    // if (typeof window !== 'undefined' && window.innerWidth > 990) {
    //   setData(
    //     contacts.map((contact) => ({
    //       ...contact,
    //       href: undefined,
    //     })),
    //   )
    // }
  }, [])

  return (
    <section className={classNames(styles['section'], className)}>
      <div className="content-block">
        <div className={styles['section-panel']}>
          {data.map((contact, index) => (
            <ContactsDataItem data={contact} key={`contact-link-${index}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ContactsData
