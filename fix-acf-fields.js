const axios = require('axios');

const CONFIG = {
  wpUrl: 'https://admin.luminarcapital.com',
  username: '@technology',
  appPassword: 'jkwW xAXs XQI1 lBwf 1tMq QEn5'
};

const getAuthHeader = () => {
  const token = Buffer.from(`${CONFIG.username}:${CONFIG.appPassword}`).toString('base64');
  return { 'Authorization': `Basic ${token}`, 'Content-Type': 'application/json' };
};

// Media IDs from upload
const mediaMap = {
  'benefit-1.svg': 227,
  'benefit-2.svg': 228,
  'benefit-3.svg': 229,
  'benefit-4.svg': 230,
  'benefit-5.svg': 231,
  'benefit-6.svg': 232,
  'benefit-7.svg': 233,
};

// Benefits with their correct order
const benefitOrders = {
  'Versatile Applications': { order: 1, icon: 227 },
  'Swift Access to Capital': { order: 2, icon: 228 },
  'Collaborative Approach': { order: 3, icon: 229 },
  'Performance Based Financing': { order: 4, icon: 230 },
  'Industry Leading Repayment Discounts': { order: 5, icon: 231 },
  'Leverage Recurring Financing': { order: 6, icon: 232 },
  'Affordable Financing Solutions': { order: 7, icon: 233 }
};

async function fixBenefits() {
  console.log('🔧 Fixing Benefits ACF fields...\n');
  
  // Get all benefits
  const response = await axios.get(
    `${CONFIG.wpUrl}/wp-json/wp/v2/benefit?per_page=100`,
    { headers: getAuthHeader() }
  );

  for (const benefit of response.data) {
    const title = benefit.title.rendered;
    const data = benefitOrders[title];
    
    if (data) {
      try {
        // Update using ACF REST API
        await axios.put(
          `${CONFIG.wpUrl}/wp-json/wp/v2/benefit/${benefit.id}`,
          {
            acf: {
              order: data.order,
              icon_svg: data.icon
            }
          },
          { headers: getAuthHeader() }
        );
        console.log(`✅ Fixed: ${title} (Order: ${data.order}, Icon: ${data.icon})`);
      } catch (error) {
        console.log(`❌ Error fixing ${title}: ${error.message}`);
      }
    }
  }
  
  console.log('\n✅ Benefits fixed! Test GraphQL again.');
}

fixBenefits().catch(error => {
  console.log(`❌ Fatal error: ${error.message}`);
  process.exit(1);
});
