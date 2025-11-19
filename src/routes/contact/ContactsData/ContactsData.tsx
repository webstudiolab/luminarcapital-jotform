'use client'
import { FC, SVGProps, createElement, useRef, useState } from 'react'
import classNames from 'classnames'
import PhoneIcon from '@/ui/icons/Phone'
import MailIcon from '@/ui/icons/Mail'
import MarkerIcon from '@/ui/icons/Marker'
import styles from './ContactsData.module.scss'

interface IContactsData {
  className?: string
  contactInfo?: {
    phone?: string
    email?: string
    address?: string
  }
}

interface IContactsDataItem {
  label: string
  href?: string
  blank: boolean
  icon: FC<SVGProps<SVGSVGElement>>
}

const ContactsDataItem = ({ data: contact }: { data: IContactsDataItem }) => {
  const labelRef = useRef<HTMLSpanElement | null>(null)

  return (
    <a
      href={contact.href}
      className={styles['link']}
      target={contact.blank ? '_blank' : '_self'}
    >
      <span className={styles['link-icon']}>{createElement(contact.icon)}</span>
      <span className={styles['link-label']} ref={labelRef}>
        {contact.label}
      </span>
    </a>
  )
}

const ContactsData = ({ className, contactInfo }: IContactsData) => {
  const defaultContacts: IContactsDataItem[] = [
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

  const contacts: IContactsDataItem[] = [
    {
      href: contactInfo?.phone
        ? `tel:${contactInfo.phone.replace(/[^0-9]/g, '')}`
        : defaultContacts[0].href,
      label: contactInfo?.phone || defaultContacts[0].label,
      blank: false,
      icon: PhoneIcon,
    },
    {
      href: contactInfo?.email
        ? `mailto:${contactInfo.email}`
        : defaultContacts[1].href,
      label: contactInfo?.email || defaultContacts[1].label,
      blank: true,
      icon: MailIcon,
    },
    {
      href: defaultContacts[2].href,
      label: contactInfo?.address || defaultContacts[2].label,
      blank: true,
      icon: MarkerIcon,
    },
  ]

  const [data] = useState<IContactsDataItem[]>(contacts)

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
