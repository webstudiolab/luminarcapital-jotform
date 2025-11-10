import { useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import Slider from 'react-slick'
import { cardsCarouselSettings } from '@/config/constants'
import FinancingOptionCard from '@/ui/components/FinancingOptionCard/FinancingOptionCard'
import { getIconComponent } from '@/lib/iconMap'
import styles from './BoardOfCards.module.scss'

interface IBoardOfCards {
  className?: string
  title: string
  cards: any[]
}

const BoardOfCards = ({ className, title, cards = [] }: IBoardOfCards) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(true)
  const [maxHeightOfCards, setMaxHeightOfCards] = useState<number | 'auto'>('auto')
  const [trackHeight, setTrackHeight] = useState<number | 'auto'>('auto')
  const maxHeightRef = useRef<number>(0)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDesktop(window.innerWidth > 600)
    }
  }, [])

  useEffect(() => {
    let maxHeight = 0
    cardRefs.current.forEach((card) => {
      if (card) {
        const height = card.getBoundingClientRect().height
        if (height > maxHeight) {
          maxHeight = height
        }
      }
    })
    if (maxHeight !== maxHeightRef.current) {
      maxHeightRef.current = maxHeight
      setMaxHeightOfCards(maxHeightRef.current)
    }
  }, [cards])

  // Transform WordPress data to component format
  const formattedCards = cards.map((card: any) => {
    // Get icon name from either partnerships or values
    const iconName = card.partnershipFields?.iconName || card.valueFields?.iconName || ''
    
    return {
      title: card.title,
      description: card.content?.replace(/<[^>]*>/g, '') || '',
      icon: getIconComponent(iconName),
      href: undefined
    }
  })

  if (formattedCards.length > 0) {
    return (
      <section className={classNames(styles['section'], 'p-100-0', className)}>
        <div className="content-block">
          <div
            className={classNames(
              styles['section-title'],
              'section-title text-center',
            )}
          >
            <h2 className="h1">{title}</h2>
          </div>
          <div className={styles['section-cards']}>
            {!isDesktop ? (
              <>
                <Slider
                  {...cardsCarouselSettings}
                  className="board-slider"
                  onInit={() => {
                    const track = document.querySelector(
                      '.board-slider .slick-track',
                    )
                    if (track) {
                      setTrackHeight(track.getBoundingClientRect().height)
                    }
                  }}
                >
                  {formattedCards.map(({ title, description, icon, href }, index) => (
                    <div key={`financing-card-${index}`}>
                      <div style={{ height: trackHeight }}>
                        <FinancingOptionCard
                          title={title}
                          description={description}
                          icon={icon}
                          href={href}
                          className={styles['section-cards-slide']}
                        />
                      </div>
                    </div>
                  ))}
                </Slider>
              </>
            ) : (
              <div className="row">
                {formattedCards.map(({ title, description, icon, href }, index) => (
                  <div
                    className="col-sm-12 col-md-6"
                    key={`financing-card-${index}`}
                    ref={(element) => {
                      cardRefs.current[index] = element
                    }}
                    style={{ height: maxHeightOfCards }}
                  >
                    <FinancingOptionCard
                      title={title}
                      description={description}
                      icon={icon}
                      href={href}
                      className={styles['section-cards-slide']}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }
  return null
}

export default BoardOfCards
