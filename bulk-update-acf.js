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

// Mapping data
const benefitData = {
  'Versatile Applications': { order: 1, icon: 227 },
  'Swift Access to Capital': { order: 2, icon: 228 },
  'Collaborative Approach': { order: 3, icon: 229 },
  'Performance Based Financing': { order: 4, icon: 230 },
  'Industry Leading Repayment Discounts': { order: 5, icon: 231 },
  'Leverage Recurring Financing': { order: 6, icon: 232 },
  'Affordable Financing Solutions': { order: 7, icon: 233 }
};

const advantageData = {
  'Established Footprint': { order: 1, banner: 234 },
  'Customer Focused Financing': { order: 2, banner: 235 },
  'Growth Oriented': { order: 3, banner: 236 },
  'Punctual Financing': { order: 4, banner: 237 }
};

const experienceData = {
  'Share Your Business Journey': { order: 1, label: 'Step 1', banner: 238 },
  'Review Unique Financing Options': { order: 2, label: 'Step 2', banner: 239 },
  'Secure Financing and Kickstart Your Growth': { order: 3, label: 'Step 3', banner: 240 }
};

const partnershipData = {
  'Personalized Financing Options': { order: 1, icon: 'Money' },
  'Attractive Referral Fees': { order: 2, icon: 'Discount' },
  'Efficient Process': { order: 3, icon: 'Like' },
  'Dedicated Customer Service': { order: 4, icon: 'CreditCard' }
};

const valueData = {
  'Unmatched Flexibility': { order: 1 },
  'Exceptional Speed': { order: 2 },
  'Unparalleled Support': { order: 3 },
  'Incomparable Trust': { order: 4 }
};

async function updatePost(postType, postId, acfFields) {
  try {
    await axios.put(
      `${CONFIG.wpUrl}/wp-json/wp/v2/${postType}/${postId}`,
      { acf: acfFields },
      { headers: getAuthHeader() }
    );
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function bulkUpdate() {
  console.log('🚀 Starting bulk ACF update...\n');

  // Benefits
  console.log('📋 Updating Benefits...');
  const benefits = await axios.get(`${CONFIG.wpUrl}/wp-json/wp/v2/benefit?per_page=100`, { headers: getAuthHeader() });
  for (const benefit of benefits.data) {
    const title = benefit.title.rendered;
    const data = benefitData[title];
    if (data) {
      const success = await updatePost('benefit', benefit.id, {
        order: data.order,
        icon_svg: data.icon
      });
      if (success) console.log(`✅ ${title}`);
    }
  }

  // Partnerships
  console.log('\n🤝 Updating Partnerships...');
  const partnerships = await axios.get(`${CONFIG.wpUrl}/wp-json/wp/v2/partnership?per_page=100`, { headers: getAuthHeader() });
  for (const partnership of partnerships.data) {
    const title = partnership.title.rendered;
    const data = partnershipData[title];
    if (data) {
      const success = await updatePost('partnership', partnership.id, {
        order: data.order,
        icon_name: data.icon
      });
      if (success) console.log(`✅ ${title}`);
    }
  }

  // Advantages
  console.log('\n⭐ Updating Advantages...');
  const advantages = await axios.get(`${CONFIG.wpUrl}/wp-json/wp/v2/advantage?per_page=100`, { headers: getAuthHeader() });
  for (const advantage of advantages.data) {
    const title = advantage.title.rendered;
    const data = advantageData[title];
    if (data) {
      const success = await updatePost('advantage', advantage.id, {
        order: data.order,
        banner_image: data.banner
      });
      if (success) console.log(`✅ ${title}`);
      
      // Set featured image
      await axios.put(
        `${CONFIG.wpUrl}/wp-json/wp/v2/advantage/${advantage.id}`,
        { featured_media: data.banner },
        { headers: getAuthHeader() }
      );
    }
  }

  // Values
  console.log('\n💎 Updating Values...');
  const values = await axios.get(`${CONFIG.wpUrl}/wp-json/wp/v2/value?per_page=100`, { headers: getAuthHeader() });
  for (const value of values.data) {
    const title = value.title.rendered;
    const data = valueData[title];
    if (data) {
      const success = await updatePost('value', value.id, {
        order: data.order
      });
      if (success) console.log(`✅ ${title}`);
    }
  }

  // Experience Cards
  console.log('\n🎯 Updating Experience Cards...');
  const cards = await axios.get(`${CONFIG.wpUrl}/wp-json/wp/v2/experience_card?per_page=100`, { headers: getAuthHeader() });
  for (const card of cards.data) {
    const title = card.title.rendered;
    const data = experienceData[title];
    if (data) {
      const success = await updatePost('experience_card', card.id, {
        order: data.order,
        label: data.label,
        banner_image: data.banner
      });
      if (success) console.log(`✅ ${title}`);
      
      // Set featured image
      await axios.put(
        `${CONFIG.wpUrl}/wp-json/wp/v2/experience_card/${card.id}`,
        { featured_media: data.banner },
        { headers: getAuthHeader() }
      );
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ BULK UPDATE COMPLETE!');
  console.log('='.repeat(60));
  console.log('\nTest GraphQL queries to verify all data is populated.');
}

bulkUpdate().catch(error => {
  console.log(`❌ Fatal error: ${error.message}`);
  process.exit(1);
});
