// Single source of truth for the business details (NAP).
// Keep this identical to the Google Business Profile, BBB and Trustpilot.
export const BUSINESS = {
  name: 'Luminar Capital',
  legalName: 'Luminar Capital LLC',
  url: 'https://www.luminarcapital.com',
  logo: 'https://www.luminarcapital.com/Luminar-Logo.jpg',
  description:
    'Luminar Capital provides revenue based financing, term loans and working capital to small and mid sized businesses across the United States.',
  phoneDisplay: '(305) 307-0190',
  phoneHref: 'tel:+13053070190',
  phoneSchema: '+1-305-307-0190',
  address: {
    street: '601 N Federal Hwy, Ste 301',
    city: 'Hallandale Beach',
    region: 'FL',
    postalCode: '33009',
    country: 'US',
  },
  addressDisplay: '601 N Federal Hwy, Ste 301, Hallandale Beach, FL 33009',
  // Google Business Profile (CID link stays valid if the listing address changes)
  googleProfileUrl: 'https://maps.google.com/?cid=11369310067210040364',
  sameAs: [
    'https://maps.google.com/?cid=11369310067210040364',
    'https://www.linkedin.com/company/luminar-capital/',
    'https://www.trustpilot.com/review/luminarcapital.com',
    'https://www.bbb.org/us/fl/miami/profile/business-loans/luminar-capital-llc-0633-92057797',
    'https://www.facebook.com/share/1K71fM8RP1/?mibextid=wwXIfr',
    'https://www.instagram.com/luminarcapital/',
    'https://x.com/luminarcapital',
  ],
}
