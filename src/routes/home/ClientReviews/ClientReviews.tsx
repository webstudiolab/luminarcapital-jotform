import { useState } from 'react'
import classNames from 'classnames'
import Slider from 'react-slick'
import ReviewBox from '@/ui/components/ReviewBox/ReviewBox'
import Button from '@/ui/components/Button/Button'
import GoogleIcon from '@/ui/icons/Google'
import SlickNextArrow from '@/ui/components/Carousel/SlickArrow/SlickNextArrow'
import SlickPrevArrow from '@/ui/components/Carousel/SlickArrow/SlickPrevArrow'
import { IGoogleReview } from '@/types'
import styles from './ClientReviews.module.scss'

interface IClientReviews {
  className?: string
  data: IGoogleReview[]
}

const ClientReviews = ({ className, data }: IClientReviews) => {
  const [activeSlide, setActiveSlide] = useState(0)
  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <SlickNextArrow />,
    prevArrow: <SlickPrevArrow />,
    autoplay: true,
    autoplaySpeed: 3500,
    pauseOnHover: true,
    pauseOnFocus: true,
    responsive: [
      {
        breakpoint: 901,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 601,
        settings: {
          slidesToShow: 1,
          variableWidth: true,
        },
      },
    ],
    afterChange: (current: number) => setActiveSlide(current),
  }

  return (
    <section className={classNames(styles['section'], 'p-100-0', className)}>
      <div className="content-block">
        <h3 className="h1 section-title text-center">
          Industry Leading Client Success
        </h3>
        {data.length > 0 ? (
          <>
            <Slider
              {...settings}
              className={classNames(styles['carousel'], 'reviews-carousel')}
            >
              {data.map((review, index) => (
                <ReviewBox
                  key={`google-review-${index}`}
                  data={review}
                  className={classNames(styles['carousel-slide'])}
                  isActive={index === activeSlide}
                />
              ))}
            </Slider>
            <div className={styles['carousel-action']}>
              <Button
                href="https://www.google.com/maps/search/?api=1&query=Google&query_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4"
                icon={GoogleIcon}
                variant="outlined"
                size="xl"
                asDefaultLink
                target="_blank"
              >
                See our reviews on
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default ClientReviews
