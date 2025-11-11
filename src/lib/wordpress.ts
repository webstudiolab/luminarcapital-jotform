import { GraphQLClient } from 'graphql-request'

const endpoint =
  process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL ||
  'https://admin.luminarcapital.com/graphql'

const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
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
    benefits(first: 100) {
      nodes {
        id
        databaseId
        title
        content
        slug
      }
    }
  }
`

export const GET_PARTNERSHIPS = `
  query GetPartnerships {
    partnerships(first: 100) {
      nodes {
        id
        databaseId
        title
        content
        slug
      }
    }
  }
`

export const GET_ADVANTAGES = `
  query GetAdvantages {
    advantages(first: 100) {
      nodes {
        id
        databaseId
        title
        content
        slug
      }
    }
  }
`

export const GET_VALUES = `
  query GetValues {
    values(first: 100) {
      nodes {
        id
        databaseId
        title
        content
        slug
      }
    }
  }
`

export const GET_EXPERIENCE_CARDS = `
  query GetExperienceCards {
    experienceCards(first: 100) {
      nodes {
        id
        databaseId
        title
        content
        slug
      }
    }
  }
`

// TypeScript Interfaces
interface WordPressNode<T> {
  nodes: T[]
}

interface BaseNode {
  id: string
  databaseId: number
  title: string
  content: string
  slug: string
}

// Helper to strip HTML tags
const stripHTML = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim()
}

// API Functions
export const getPageBySlug = async (slug: string): Promise<unknown> => {
  try {
    const data: unknown = await client.request(GET_PAGE_BY_SLUG, { slug })
    return (data as { page: unknown }).page
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error)
    return null
  }
}

export const getBenefits = async () => {
  try {
    const data = (await client.request(GET_BENEFITS)) as {
      benefits: WordPressNode<BaseNode>
    }

    return data.benefits.nodes
      .sort((a, b) => a.databaseId - b.databaseId)
      .map((node) => ({
        ...node,
        benefitFields: {
          title: node.title,
          description: stripHTML(node.content),
          icon: 'check',
        },
      }))
  } catch (error) {
    console.error('Error fetching benefits:', error)
    return []
  }
}

export const getPartnerships = async () => {
  try {
    const data = (await client.request(GET_PARTNERSHIPS)) as {
      partnerships: WordPressNode<BaseNode>
    }

    return data.partnerships.nodes
      .sort((a, b) => a.databaseId - b.databaseId)
      .map((node) => ({
        ...node,
        partnershipFields: {
          title: node.title,
          description: stripHTML(node.content),
          icon: 'check',
        },
      }))
  } catch (error) {
    console.error('Error fetching partnerships:', error)
    return []
  }
}

export const getAdvantages = async () => {
  try {
    const data = (await client.request(GET_ADVANTAGES)) as {
      advantages: WordPressNode<BaseNode>
    }

    const sortedNodes = data.advantages.nodes.sort(
      (a, b) => a.databaseId - b.databaseId,
    )

    return sortedNodes.map((node, index) => {
      const title = node.title.toLowerCase()
      let imageUrl = `/banners/advantage-banner-${(index % 3) + 1}.svg`

      if (title.includes('punctual') || title.includes('time')) {
        imageUrl = '/banners/advantage-banner-1.svg'
      } else if (title.includes('rate') || title.includes('competitive')) {
        imageUrl = '/banners/advantage-banner-2.svg'
      } else if (title.includes('expert') || title.includes('guidance')) {
        imageUrl = '/banners/advantage-banner-3.svg'
      }

      return {
        ...node,
        advantageFields: {
          title: node.title,
          description: stripHTML(node.content),
          bannerImage: {
            node: {
              sourceUrl: imageUrl,
            },
          },
        },
      }
    })
  } catch (error) {
    console.error('Error fetching advantages:', error)
    return []
  }
}

export const getValues = async () => {
  try {
    const data = (await client.request(GET_VALUES)) as {
      values: WordPressNode<BaseNode>
    }

    return data.values.nodes
      .sort((a, b) => a.databaseId - b.databaseId)
      .map((node) => ({
        ...node,
        valueFields: {
          title: node.title,
          description: stripHTML(node.content),
          icon: 'check',
        },
      }))
  } catch (error) {
    console.error('Error fetching values:', error)
    return []
  }
}

export const getExperienceCards = async () => {
  try {
    const data = (await client.request(GET_EXPERIENCE_CARDS)) as {
      experienceCards: WordPressNode<BaseNode>
    }

    const sortedNodes = data.experienceCards.nodes.sort(
      (a, b) => a.databaseId - b.databaseId,
    )

    // Order by title keywords
    const orderMap: { [key: string]: number } = {
      share: 0,
      review: 1,
      secure: 2,
    }

    const orderedNodes = sortedNodes.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()

      const aOrder = Object.keys(orderMap).find((key) => aTitle.includes(key))
      const bOrder = Object.keys(orderMap).find((key) => bTitle.includes(key))

      const aIndex = aOrder !== undefined ? orderMap[aOrder] : 999
      const bIndex = bOrder !== undefined ? orderMap[bOrder] : 999

      return aIndex - bIndex
    })

    return orderedNodes.map((node, index) => {
      const title = node.title.toLowerCase()
      let imageUrl = '/banners/personalized-experience-banner-1.svg'

      if (title.includes('share') || title.includes('journey')) {
        imageUrl = '/banners/personalized-experience-banner-1.svg'
      } else if (title.includes('review') || title.includes('options')) {
        imageUrl = '/banners/personalized-experience-banner-2.svg'
      } else if (title.includes('secure') || title.includes('growth')) {
        imageUrl = '/banners/personalized-experience-banner-3.svg'
      }

      return {
        ...node,
        experienceCardFields: {
          title: node.title,
          description: stripHTML(node.content),
          image: {
            node: {
              sourceUrl: imageUrl,
            },
          },
          label: `Step ${index + 1}`,
        },
      }
    })
  } catch (error) {
    console.error('Error fetching experience cards:', error)
    return []
  }
}
