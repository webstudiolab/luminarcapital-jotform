import { GraphQLClient } from 'graphql-request'

const endpoint =
  process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL ||
  'https://admin.luminarcapital.com/graphql'

const client = new GraphQLClient(endpoint, {
  headers: {},
})

// GraphQL Queries
export const GET_PAGE_BY_SLUG = `
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      id
      title
      content
      slug
      homePageFields {
        heroTitle
        heroSubtitle
        heroCtaText
        heroCtaSecondaryText
        heroBannerImage {
          node {
            sourceUrl
          }
        }
        heroLottieJson {
          node {
            mediaItemUrl
          }
        }
        financingSectionTitle
        financingSectionDescription
        reviewsSectionTitle
        personalizedExperienceSectionTitle
      }
      financingOptionsPageFields {
        heroTitle
        heroDescription
        heroBannerImage {
          node {
            sourceUrl
          }
        }
        heroLottieJson {
          node {
            mediaItemUrl
          }
        }
        benefitsSectionTitle
        ctaTitle
        ctaDescription
      }
      partnersPageFields {
        heroTitle
        heroDescription
        heroBannerImage {
          node {
            sourceUrl
          }
        }
        heroLottieJson {
          node {
            mediaItemUrl
          }
        }
        portfolioSectionTitle
      }
      whyLuminarPageFields {
        heroTitle
        heroDescription
        heroBannerImage {
          node {
            sourceUrl
          }
        }
        heroLottieJson {
          node {
            mediaItemUrl
          }
        }
        advantagesSectionTitle
        valuesSectionTitle
        valuesSectionDescription
      }
      contactPageFields {
        phone
        email
        address
        googleMapsEmbedUrl
      }
    }
  }
`

export const GET_BENEFITS = `
  query GetBenefits {
    benefits {
      nodes {
        id
        title
        benefitFields {
          title
          description
          icon
          order
        }
      }
    }
  }
`

export const GET_PARTNERSHIPS = `
  query GetPartnerships {
    partnerships {
      nodes {
        id
        title
        partnershipFields {
          title
          description
          icon
          order
        }
      }
    }
  }
`

export const GET_ADVANTAGES = `
  query GetAdvantages {
    advantages {
      nodes {
        id
        title
        advantageFields {
          title
          description
          bannerImage {
            node {
              sourceUrl
            }
          }
          order
        }
      }
    }
  }
`

export const GET_VALUES = `
  query GetValues {
    values {
      nodes {
        id
        title
        valueFields {
          title
          description
          icon
          order
        }
      }
    }
  }
`

export const GET_EXPERIENCE_CARDS = `
  query GetExperienceCards {
    experienceCards {
      nodes {
        id
        title
        experienceCardFields {
          title
          label
          description
          image {
            node {
              sourceUrl
            }
          }
          order
        }
      }
    }
  }
`

// TypeScript Interfaces
interface WordPressNode<T> {
  nodes: T[]
}

interface BenefitNode {
  id: string
  title: string
  benefitFields?: {
    title?: string
    description?: string
    icon?: string
    order?: number
  }
}

interface PartnershipNode {
  id: string
  title: string
  partnershipFields?: {
    title?: string
    description?: string
    icon?: string
    order?: number
  }
}

interface AdvantageNode {
  id: string
  title: string
  advantageFields?: {
    title?: string
    description?: string
    bannerImage?: {
      node?: {
        sourceUrl?: string
      }
    }
    order?: number
  }
}

interface ValueNode {
  id: string
  title: string
  valueFields?: {
    title?: string
    description?: string
    icon?: string
    order?: number
  }
}

interface ExperienceCardNode {
  id: string
  title: string
  experienceCardFields?: {
    title?: string
    label?: string
    description?: string
    image?: {
      node?: {
        sourceUrl?: string
      }
    }
    order?: number
  }
}

// API Functions
export const getPageBySlug = async (slug: string): Promise<unknown> => {
  try {
    const data: unknown = await client.request(GET_PAGE_BY_SLUG, { slug })
    console.log('=== PAGE DATA DEBUG ===')
    console.log('Full pageData:', JSON.stringify(data, null, 2))
    console.log('======================')
    return (data as { page: unknown }).page
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error)
    return null
  }
}

export const getBenefits = async (): Promise<BenefitNode[]> => {
  try {
    const data = (await client.request(GET_BENEFITS)) as {
      benefits: WordPressNode<BenefitNode>
    }
    return data.benefits.nodes
      .sort(
        (a, b) =>
          (a.benefitFields?.order || 999) - (b.benefitFields?.order || 999),
      )
      .map((node) => ({
        ...node,
        icon: node.benefitFields?.icon || 'check',
      }))
  } catch (error) {
    console.error('Error fetching benefits:', error)
    return []
  }
}

export const getPartnerships = async (): Promise<PartnershipNode[]> => {
  try {
    const data = (await client.request(GET_PARTNERSHIPS)) as {
      partnerships: WordPressNode<PartnershipNode>
    }
    return data.partnerships.nodes
      .sort(
        (a, b) =>
          (a.partnershipFields?.order || 999) -
          (b.partnershipFields?.order || 999),
      )
      .map((node) => ({
        ...node,
        icon: node.partnershipFields?.icon || 'check',
      }))
  } catch (error) {
    console.error('Error fetching partnerships:', error)
    return []
  }
}

export const getAdvantages = async (): Promise<AdvantageNode[]> => {
  try {
    const data = (await client.request(GET_ADVANTAGES)) as {
      advantages: WordPressNode<AdvantageNode>
    }
    return data.advantages.nodes.sort(
      (a, b) =>
        (a.advantageFields?.order || 999) - (b.advantageFields?.order || 999),
    )
  } catch (error) {
    console.error('Error fetching advantages:', error)
    return []
  }
}

export const getValues = async (): Promise<ValueNode[]> => {
  try {
    const data = (await client.request(GET_VALUES)) as {
      values: WordPressNode<ValueNode>
    }
    return data.values.nodes.sort(
      (a, b) => (a.valueFields?.order || 999) - (b.valueFields?.order || 999),
    )
  } catch (error) {
    console.error('Error fetching values:', error)
    return []
  }
}

export const getExperienceCards = async (): Promise<ExperienceCardNode[]> => {
  try {
    const data = (await client.request(GET_EXPERIENCE_CARDS)) as {
      experienceCards: WordPressNode<ExperienceCardNode>
    }
    return data.experienceCards.nodes.sort(
      (a, b) =>
        (a.experienceCardFields?.order || 999) -
        (b.experienceCardFields?.order || 999),
    )
  } catch (error) {
    console.error('Error fetching experience cards:', error)
    return []
  }
}
