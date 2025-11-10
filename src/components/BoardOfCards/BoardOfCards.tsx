import { createElement } from 'react'
import classNames from 'classnames'
import styles from './BoardOfCards.module.scss'
import { getIconComponent } from '@/lib/iconMap'

interface IBoardOfCards {
  title: string
  cards: any[]
  className?: string
  columns?: 'auto'
}

const getCardType = (card: any): 'partnership' | 'value' | 'benefit' | null => {
  if (card.partnershipFields) return 'partnership'
  if (card.valueFields) return 'value'
  if (card.benefitFields) return 'benefit'
  return null
}

const getCardFields = (card: any): any => {
  const type = getCardType(card)
  if (type === 'partnership') return card.partnershipFields
  if (type === 'value') return card.valueFields
  if (type === 'benefit') return card.benefitFields
  return undefined
}

interface ICard {
  data: any
  className?: string
}

const Card = ({ data, className }: ICard) => {
  const fields = getCardFields(data)
  const iconName = fields?.icon || 'check'
  const IconComponent = getIconComponent(iconName)

  return (
    <div className={classNames(styles['card'], className)}>
      <div className={styles['card-icon']}>{createElement(IconComponent)}</div>
      <div className={styles['card-content']}>
        <h3 className={styles['card-title']}>{fields?.title}</h3>
        <p className={styles['card-description']}>{fields?.description}</p>
      </div>
    </div>
  )
}

const BoardOfCards = ({
  cards,
  title,
  className,
  columns = 'auto',
}: IBoardOfCards) => {
  return (
    <section className={classNames(styles['section'], className)}>
      <div className="content-block">
        <div className={styles['section-panel']}>
          <h2 className="h1">{title}</h2>
        </div>
        <div
          className={classNames(
            styles['section-panel'],
            styles[`section-panel--columns-${columns}`],
          )}
        >
          <div className="row">
            {cards.map((card, index) => (
              <div key={`card-${index}`} className="col-xs-12 col-lg-6">
                <Card data={card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BoardOfCards
