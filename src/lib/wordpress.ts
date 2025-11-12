import { GraphQLClient } from 'graphql-request'

const endpoint =
  process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL ||
  'https://admin.luminarcapital.com/graphql'

const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
})

// GraphQL Queries with ALL ACF fields
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
        portfolioBannerImage {
          node {
            sourceUrl
          }
        }
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
        experienceCardFields {
          order
          bannerImage {
            node {
              sourceUrl
            }
          }
          label
        }
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
        partnershipFields {
          order
          iconName
        }
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
        valueFields {
          order
          iconName
        }
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
        advantageFields {
          order
          bannerImage {
            node {
              sourceUrl
            }
          }
        }
      }
    }
  }
`

const stripHTML = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim()
}

export const getPageBySlug = async (slug: string) => {
  try {
    const data: any = await client.request(GET_PAGE_BY_SLUG, { slug })
    return data.page
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error)
    return null
  }
}

export const getExperienceCards = async () => {
  try {
    const data: any = await client.request(GET_EXPERIENCE_CARDS)
    return data.experienceCards.nodes
      .sort((a: any, b: any) => 
        (a.experienceCardFields?.order || 0) - (b.experienceCardFields?.order || 0)
      )
      .map((node: any) => ({
        id: node.id,
        title: node.title,
        description: stripHTML(node.content),
        image: node.experienceCardFields?.bannerImage?.node?.sourceUrl || '',
        label: node.experienceCardFields?.label || '',
      }))
  } catch (error) {
    console.error('Error fetching experience cards:', error)
    return []
  }
}

export const getPartnerships = async () => {
  try {
    const data: any = await client.request(GET_PARTNERSHIPS)
    return data.partnerships.nodes
      .sort((a: any, b: any) => 
        (a.partnershipFields?.order || 0) - (b.partnershipFields?.order || 0)
      )
      .map((node: any) => ({
        id: node.id,
        title: node.title,
        description: stripHTML(node.content),
        iconName: node.partnershipFields?.iconName || 'CreditCard',
      }))
  } catch (error) {
    console.error('Error fetching partnerships:', error)
    return []
  }
}

export const getValues = async () => {
  try {
    const data: any = await client.request(GET_VALUES)
    return data.values.nodes
      .sort((a: any, b: any) => 
        (a.valueFields?.order || 0) - (b.valueFields?.order || 0)
      )
      .map((node: any) => ({
        id: node.id,
        title: node.title,
        description: stripHTML(node.content),
        iconName: node.valueFields?.iconName || 'CreditCard',
      }))
  } catch (error) {
    console.error('Error fetching values:', error)
    return []
  }
}

export const getAdvantages = async () => {
  try {
    const data: any = await client.request(GET_ADVANTAGES)
    return data.advantages.nodes
      .sort((a: any, b: any) => 
        (a.advantageFields?.order || 0) - (b.advantageFields?.order || 0)
      )
      .map((node: any) => ({
        id: node.id,
        title: node.title,
        description: stripHTML(node.content),
        image: node.advantageFields?.bannerImage?.node?.sourceUrl || '',
      }))
  } catch (error) {
    console.error('Error fetching advantages:', error)
    return []
  }
}
