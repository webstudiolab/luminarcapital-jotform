import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL || 'https://admin.luminarcapital.com/graphql';

export const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});

// Query for Benefits
export const GET_BENEFITS = `
  query GetBenefits {
    benefits(first: 100) {
      nodes {
        id
        title
        content
        benefitFields {
          order
          iconSvg {
            node {
              sourceUrl
            }
          }
        }
      }
    }
  }
`;

// Query for Partnerships
export const GET_PARTNERSHIPS = `
  query GetPartnerships {
    partnerships(first: 100) {
      nodes {
        id
        title
        content
        partnershipFields {
          order
          iconName
        }
      }
    }
  }
`;

// Query for Advantages
export const GET_ADVANTAGES = `
  query GetAdvantages {
    advantages(first: 100) {
      nodes {
        id
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
`;

// Query for Values
export const GET_VALUES = `
  query GetValues {
    values(first: 100) {
      nodes {
        id
        title
        content
        valueFields {
          order
          iconName
        }
      }
    }
  }
`;

// Query for Experience Cards
export const GET_EXPERIENCE_CARDS = `
  query GetExperienceCards {
    experienceCards(first: 100) {
      nodes {
        id
        title
        content
        experienceCardFields {
          order
          label
          bannerImage {
            node {
              sourceUrl
            }
          }
        }
      }
    }
  }
`;

// Query for Page content
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
`;

// Fetch function for pages
export async function getPageBySlug(slug: string) {
  try {
    const data: any = await graphQLClient.request(GET_PAGE_BY_SLUG, { slug })
    return data.page
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error)
    return null
  }
}

// Fetch functions
export async function getBenefits() {
  try {
    const data: any = await graphQLClient.request(GET_BENEFITS);
    return data.benefits.nodes.sort((a: any, b: any) => 
      (a.benefitFields?.order || 999) - (b.benefitFields?.order || 999)
    );
  } catch (error) {
    console.error('Error fetching benefits:', error);
    return [];
  }
}

export async function getPartnerships() {
  try {
    const data: any = await graphQLClient.request(GET_PARTNERSHIPS);
    return data.partnerships.nodes.sort((a: any, b: any) => 
      (a.partnershipFields?.order || 999) - (b.partnershipFields?.order || 999)
    );
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return [];
  }
}

export async function getAdvantages() {
  try {
    const data: any = await graphQLClient.request(GET_ADVANTAGES);
    return data.advantages.nodes.sort((a: any, b: any) => 
      (a.advantageFields?.order || 999) - (b.advantageFields?.order || 999)
    );
  } catch (error) {
    console.error('Error fetching advantages:', error);
    return [];
  }
}

export async function getValues() {
  try {
    const data: any = await graphQLClient.request(GET_VALUES);
    return data.values.nodes.sort((a: any, b: any) => 
      (a.valueFields?.order || 999) - (b.valueFields?.order || 999)
    );
  } catch (error) {
    console.error('Error fetching values:', error);
    return [];
  }
}

export async function getExperienceCards() {
  try {
    const data: any = await graphQLClient.request(GET_EXPERIENCE_CARDS);
    return data.experienceCards.nodes.sort((a: any, b: any) => 
      (a.experienceCardFields?.order || 999) - (b.experienceCardFields?.order || 999)
    );
  } catch (error) {
    console.error('Error fetching experience cards:', error);
    return [];
  }
}
