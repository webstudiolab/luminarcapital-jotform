import { IOption } from '@/types'

// FIXED: Remove window check that breaks during build/SSR
export const QUERY_PARAMETERS = {
  LIMIT: 9, // Use consistent limit for SSR, adjust in component if needed
  LATEST: 6,
}

export const STATUS = {
  IDLE: 'IDLE',
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
}

export const WORDPRESS_API_PATHS = {
  graphql: 'graphql',
  save: 'wp-json/api/v1',
  fetch: 'wp-json/wp/v2',
}

export const AMOUNT_OPTIONS: IOption[] = [
  { label: '< $20,000', value: '< $20,000' },
  { label: '$20,000 - $50,000', value: '$20,000 - $50,000' },
  { label: '$50,000 - $75,000', value: '$50,000 - $75,000' },
  { label: '$75,000 - $125,000', value: '$75,000 - $125,000' },
  { label: '$125,000 - $200,000', value: '$125,000 - $200,000' },
  { label: '> $200,000', value: '> $200,000' },
]

export const cardsCarouselSettings = {
  adaptiveHeight: false,
  variableWidth: false,
  dots: true,
  arrows: false,
  centerMode: false,
  padding: 0,
  slidesToShow: 1,
  slidesToScroll: 1,
  focusOnSelect: true,
  speed: 1000,
  infinite: false,
  rows: 1,
}

const LOCALSTORAGE_HOURS = 48
export const LOCALSTORAGE_EXPIRY = LOCALSTORAGE_HOURS * 60 * 60 * 1000

export const EMAIL_SUBJECT = {
  FINANCING: 'Apply for Financing',
  PARTNER: 'Become A Partner',
}
