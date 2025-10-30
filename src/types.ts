import { FC, SVGProps } from 'react'

export interface IFinancingOptionCard {
  className?: string
  title: string
  description: string
  href?: string
  icon?: FC<SVGProps<SVGSVGElement>>
}

export interface IGoogleReview {
  id: string
  author_name: string
  author_url: string
  language: string
  original_language: string
  profile_photo_url: string
  rating: number
  relative_time_description: string
  text: string
  time: number
  translated: boolean
}

export interface ISlickArrow {
  className?: string
  onClick?: () => void
  style?: {
    [key: string]: string
  }
}

export interface IPost {
  id: number
  date: string
  date_gmt: string
  guid: {
    rendered: string
  }
  modified: string
  modified_gmt: string
  slug: string
  status: string
  type: string
  link: string
  title: {
    rendered: string
  }
  excerpt: {
    rendered: string
    protected: boolean
  }
  author: number
  featured_media: number
  comment_status: string
  ping_status: string
  sticky: boolean
  template: string
  format: string
  meta: {
    footnotes: string
  }
  categories: number[]
  tags: unknown[]
  class_list: string[]
  featured_image_src: string
  featured_image_src_medium: string
  post_categories: {
    term_id: number
    name: string
    link: string
    slug: string
  }[]
  _links: {
    self: { href: string }[]
    collection: { href: string }[]
    about: { href: string }[]
    author: {
      embeddable: boolean
      href: string
    }[]
    replies: {
      embeddable: boolean
      href: string
    }[]
    'version-history': {
      count: number
      href: string
    }[]
    'predecessor-version': {
      id: number
      href: string
    }[]
    'wp:featuredmedia': {
      embeddable: boolean
      href: string
    }[]
    'wp:attachment': {
      href: string
    }[]
    'wp:term': {
      taxonomy: string
      embeddable: boolean
      href: string
    }[]
    curies: {
      name: string
      href: string
      templated: boolean
    }[]
  }
  content: {
    rendered: string | TrustedHTML
    protected: boolean
  }
}

export interface ICategory {
  id: number | string | null
  count?: number
  description?: string
  link?: string
  name: string
  slug: string
  taxonomy?: string
  parent?: number
  meta?: unknown[]
  _links?: {
    self: {
      href: string
    }[]
    collection: {
      href: string
    }[]
    about: {
      href: string
    }[]
    'wp:post_type': {
      href: string
    }[]
    curies: {
      name: string
      href: string
      templated: boolean
    }[]
  }
}

export interface IPageInfo {
  total: string | number
  totalPages: string | number
}

export interface ITab {
  title: string
  value: string | number
}

export interface IOption {
  value: string
  label: string
  isDisabled?: boolean
  isFocused?: boolean
  isSelected?: boolean
}

export interface IModalState {
  isOpen: boolean
  modal: 'partner' | 'financing' | null
  size: 'xl' | 'lg' | 'md'
}

export interface IModalPayload {
  modal: 'partner' | 'financing'
  size: 'xl' | 'lg' | 'md'
}

export interface IBenefit {
  title: string
  description: string
  banner: string
}

export interface IBoardChessOrderCard {
  title: string
  description: string
  image: string
  label?: string
}

export interface IPostsState {
  data: {
    nodes: IPost[]
    pageInfo: IPageInfo
  }
  status: string
  error: string | null | unknown
  filter: IFetchPosts
}

export interface IFetchPosts {
  categories?: number | string | null
  page: number
  per_page?: number
  order_by?: string | null
  order?: string | null
}
