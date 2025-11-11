import { GraphQLClient } from 'graphql-request'

const endpoint =
  process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL ||
  'https://admin.luminarcapital.com/graphql'

const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
})

// GraphQL Queries - CORRECTED to match actual WordPress structure
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

// These queries only get basic fields that exist
export const GET_BENEFITS = `
  query GetBenefits {
    benefits {
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
    partnerships {
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
    advantages {
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
    values {
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
    experienceCards {
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
  return html.replace(/<[^>]*>/g, '').replace(/&#8217;/g, "'")
}

// Helper to get image path based on database ID
const getImagePath = (type: string, databaseId: number): string => {
  // Map database IDs to image paths
  const imageMap: { [key: string]: { [key: number]: string } } = {
    experienceCard: {
      226: '/banners/personalized-experience-banner-1.svg',
      227: '/banners/personalized-experience-banner-2.svg',
      228: '/banners/personalized-experience-banner-3.svg',
    },
    advantage: {
      219: '/banners/advantage-banner-1.svg',
      220: '/banners/advantage-banner-2.svg',
      221: '/banners/advantage-banner-3.svg',
    },
  }

  return imageMap[type]?.[databaseId] || ''
}

// Helper to get step label based on index
const getStepLabel = (index: number): string => {
  return `Step ${index + 1}`
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
    
    // Transform to match component expectations
    return data.benefits.nodes
      .sort((a, b) => a.databaseId - b.databaseId)
      .map((node) => ({
        ...node,
        // Components expect benefitFields structure but we don't have it
        // So we keep basic structure and let components handle it
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
    
    // Transform to match BoardChessOrder component expectations
    return data.advantages.nodes
      .sort((a, b) => a.databaseId - b.databaseId)
      .map((node) => ({
        ...node,
        advantageFields: {
          title: node.title,
          description: stripHTML(node.content),
          bannerImage: {
            node: {
              sourceUrl: getImagePath('advantage', node.databaseId),
            },
          },
        },
      }))
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
    
    // Transform to match BoardChessOrder component expectations
    return data.experienceCards.nodes
      .sort((a, b) => a.databaseId - b.databaseId)
      .map((node, index) => ({
        ...node,
        experienceCardFields: {
          title: node.title,
          description: stripHTML(node.content),
          image: {
            node: {
              sourceUrl: getImagePath('experienceCard', node.databaseId),
            },
          },
          label: getStepLabel(index),
        },
      }))
  } catch (error) {
    console.error('Error fetching experience cards:', error)
    return []
  }
}
