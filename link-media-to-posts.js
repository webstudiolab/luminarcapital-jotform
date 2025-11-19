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

// Media ID mappings from upload
const mediaMap = {
  'benefit-1.svg': 227,
  'benefit-2.svg': 228,
  'benefit-3.svg': 229,
  'benefit-4.svg': 230,
  'benefit-5.svg': 231,
  'benefit-6.svg': 232,
  'benefit-7.svg': 233,
  'advantage-banner-1.svg': 234,
  'advantage-banner-2.svg': 235,
  'advantage-banner-3.svg': 236,
  'advantage-banner-4.svg': 237,
  'personalized-experience-banner-1.svg': 238,
  'personalized-experience-banner-2.svg': 239,
  'personalized-experience-banner-3.svg': 240
};

async function updatePostMedia(postType, postId, mediaId, fieldName) {
  try {
    await axios.post(
      `${CONFIG.wpUrl}/wp-json/acf/v3/${postType}/${postId}`,
      { fields: { [fieldName]: mediaId } },
      { headers: getAuthHeader() }
    );
    console.log(`✅ Updated ${postType} ${postId} with media ${mediaId}`);
  } catch (error) {
    console.log(`❌ Error updating ${postType} ${postId}: ${error.message}`);
  }
}

async function linkAllMedia() {
  console.log('🔗 Linking media to posts...\n');

  // Get all posts
  const benefits = await axios.get(`${CONFIG.wpUrl}/wp-json/wp/v2/benefit?per_page=100`, { headers: getAuthHeader() });
  const advantages = await axios.get(`${CONFIG.wpUrl}/wp-json/wp/v2/advantage?per_page=100`, { headers: getAuthHeader() });
  const experienceCards = await axios.get(`${CONFIG.wpUrl}/wp-json/wp/v2/experience_card?per_page=100`, { headers: getAuthHeader() });

  // Link Benefits (order 1-7 to benefit-1.svg through benefit-7.svg)
  console.log('Linking Benefits...');
  for (const benefit of benefits.data) {
    const order = benefit.acf?.order || benefit.meta?.order;
    if (order) {
      const mediaId = mediaMap[`benefit-${order}.svg`];
      if (mediaId) {
        await updatePostMedia('benefit', benefit.id, mediaId, 'icon_svg');
      }
    }
  }

  // Link Advantages
  console.log('\nLinking Advantages...');
  for (const advantage of advantages.data) {
    const order = advantage.acf?.order || advantage.meta?.order;
    if (order) {
      const mediaId = mediaMap[`advantage-banner-${order}.svg`];
      if (mediaId) {
        await updatePostMedia('advantage', advantage.id, mediaId, 'banner_image');
        // Also set as featured image
        await axios.post(
          `${CONFIG.wpUrl}/wp-json/wp/v2/advantage/${advantage.id}`,
          { featured_media: mediaId },
          { headers: getAuthHeader() }
        );
      }
    }
  }

  // Link Experience Cards
  console.log('\nLinking Experience Cards...');
  for (const card of experienceCards.data) {
    const order = card.acf?.order || card.meta?.order;
    if (order) {
      const mediaId = mediaMap[`personalized-experience-banner-${order}.svg`];
      if (mediaId) {
        await updatePostMedia('experience_card', card.id, mediaId, 'banner_image');
        // Also set as featured image
        await axios.post(
          `${CONFIG.wpUrl}/wp-json/wp/v2/experience_card/${card.id}`,
          { featured_media: mediaId },
          { headers: getAuthHeader() }
        );
      }
    }
  }

  console.log('\n✅ Media linking complete!');
}

linkAllMedia().catch(error => {
  console.log(`❌ Fatal error: ${error.message}`);
  process.exit(1);
});
