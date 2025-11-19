/**
 * WordPress Content Import Script
 * 
 * This script imports all content from migration-data.json into WordPress
 * 
 * SETUP:
 * 1. Make sure you have Node.js installed
 * 2. Install dependencies: npm install axios form-data
 * 3. Update the configuration below with your credentials
 * 4. Run: node wordpress-import.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const CONFIG = {
  wpUrl: 'https://admin.luminarcapital.com',
  username: '@technology',
  appPassword: 'jkwW xAXs XQI1 lBwf 1tMq QEn5',
  dataFile: './migration-data-fixed.json',
  publicFolder: './public'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Create authorization header
const getAuthHeader = () => {
  const token = Buffer.from(`${CONFIG.username}:${CONFIG.appPassword}`).toString('base64');
  return {
    'Authorization': `Basic ${token}`,
    'Content-Type': 'application/json'
  };
};

// Sleep function for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Log with timestamp
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

// ============================================
// MEDIA UPLOAD FUNCTIONS
// ============================================

async function uploadMedia(filePath, filename) {
  try {
    const fullPath = path.join(CONFIG.publicFolder, filePath, filename);
    
    if (!fs.existsSync(fullPath)) {
      log(`File not found: ${fullPath}`, 'error');
      return null;
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(fullPath));

    const response = await axios.post(
      `${CONFIG.wpUrl}/wp-json/wp/v2/media`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          ...formData.getHeaders()
        }
      }
    );

    log(`Uploaded: ${filename} (ID: ${response.data.id})`, 'success');
    return response.data.id;
  } catch (error) {
    log(`Error uploading ${filename}: ${error.message}`, 'error');
    return null;
  }
}

// ============================================
// CUSTOM POST TYPE CREATION
// ============================================

async function createBenefit(benefit, iconMediaId) {
  try {
    const postData = {
      title: benefit.title,
      content: benefit.content,
      status: 'publish',
      meta: {
        order: benefit.order,
        icon_svg: iconMediaId || ''
      }
    };

    const response = await axios.post(
      `${CONFIG.wpUrl}/wp-json/wp/v2/benefit`,
      postData,
      { headers: getAuthHeader() }
    );

    log(`Created Benefit: ${benefit.title} (ID: ${response.data.id})`, 'success');
    return response.data.id;
  } catch (error) {
    log(`Error creating benefit "${benefit.title}": ${error.response?.data?.message || error.message}`, 'error');
    return null;
  }
}

async function createPartnership(partnership) {
  try {
    const postData = {
      title: partnership.title,
      content: partnership.content,
      status: 'publish',
      meta: {
        order: partnership.order,
        icon_name: partnership.icon_name
      }
    };

    const response = await axios.post(
      `${CONFIG.wpUrl}/wp-json/wp/v2/partnership`,
      postData,
      { headers: getAuthHeader() }
    );

    log(`Created Partnership: ${partnership.title} (ID: ${response.data.id})`, 'success');
    return response.data.id;
  } catch (error) {
    log(`Error creating partnership "${partnership.title}": ${error.response?.data?.message || error.message}`, 'error');
    return null;
  }
}

async function createAdvantage(advantage, bannerMediaId) {
  try {
    const postData = {
      title: advantage.title,
      content: advantage.content,
      status: 'publish',
      featured_media: bannerMediaId || 0,
      meta: {
        order: advantage.order,
        banner_image: bannerMediaId || ''
      }
    };

    const response = await axios.post(
      `${CONFIG.wpUrl}/wp-json/wp/v2/advantage`,
      postData,
      { headers: getAuthHeader() }
    );

    log(`Created Advantage: ${advantage.title} (ID: ${response.data.id})`, 'success');
    return response.data.id;
  } catch (error) {
    log(`Error creating advantage "${advantage.title}": ${error.response?.data?.message || error.message}`, 'error');
    return null;
  }
}

async function createValue(value) {
  try {
    const postData = {
      title: value.title,
      content: value.content,
      status: 'publish',
      meta: {
        order: value.order
      }
    };

    const response = await axios.post(
      `${CONFIG.wpUrl}/wp-json/wp/v2/value`,
      postData,
      { headers: getAuthHeader() }
    );

    log(`Created Value: ${value.title} (ID: ${response.data.id})`, 'success');
    return response.data.id;
  } catch (error) {
    log(`Error creating value "${value.title}": ${error.response?.data?.message || error.message}`, 'error');
    return null;
  }
}

async function createExperienceCard(card, bannerMediaId) {
  try {
    const postData = {
      title: card.title,
      content: card.content,
      status: 'publish',
      featured_media: bannerMediaId || 0,
      meta: {
        order: card.order,
        label: card.label,
        banner_image: bannerMediaId || ''
      }
    };

    const response = await axios.post(
      `${CONFIG.wpUrl}/wp-json/wp/v2/experience_card`,
      postData,
      { headers: getAuthHeader() }
    );

    log(`Created Experience Card: ${card.title} (ID: ${response.data.id})`, 'success');
    return response.data.id;
  } catch (error) {
    log(`Error creating experience card "${card.title}": ${error.response?.data?.message || error.message}`, 'error');
    return null;
  }
}

// ============================================
// PAGE CREATION
// ============================================

async function createOrUpdatePage(pageSlug, pageData) {
  try {
    // Check if page already exists
    const existingPages = await axios.get(
      `${CONFIG.wpUrl}/wp-json/wp/v2/pages?slug=${pageSlug}`,
      { headers: getAuthHeader() }
    );

    let pageId;
    
    if (existingPages.data.length > 0) {
      // Update existing page
      pageId = existingPages.data[0].id;
      log(`Updating existing page: ${pageSlug}`);
    } else {
      // Create new page
      const newPage = await axios.post(
        `${CONFIG.wpUrl}/wp-json/wp/v2/pages`,
        {
          title: pageData.hero_title || pageSlug,
          status: 'publish',
          slug: pageSlug
        },
        { headers: getAuthHeader() }
      );
      pageId = newPage.data.id;
      log(`Created new page: ${pageSlug} (ID: ${pageId})`);
    }

    // Update ACF fields
    const acfData = {
      fields: pageData
    };

    await axios.post(
      `${CONFIG.wpUrl}/wp-json/acf/v3/pages/${pageId}`,
      acfData,
      { headers: getAuthHeader() }
    );

    log(`Updated ACF fields for: ${pageSlug}`, 'success');
    return pageId;
  } catch (error) {
    log(`Error with page "${pageSlug}": ${error.response?.data?.message || error.message}`, 'error');
    return null;
  }
}

// ============================================
// MAIN IMPORT FUNCTION
// ============================================

async function runImport() {
  log('='.repeat(60));
  log('STARTING WORDPRESS IMPORT');
  log('='.repeat(60));

  // Load migration data
  const migrationData = JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf8'));
  const mediaIdMap = {}; // Store uploaded media IDs

  // ============================================
  // STEP 1: UPLOAD MEDIA FILES
  // ============================================
  log('\n📤 STEP 1: Uploading Media Files...\n');
  
  for (const mediaCategory of migrationData.mediaFiles) {
    log(`\nUploading ${mediaCategory.category} files...`);
    
    for (const filename of mediaCategory.files) {
      const mediaId = await uploadMedia(mediaCategory.source_path, filename);
      if (mediaId) {
        mediaIdMap[filename] = mediaId;
      }
      await sleep(500); // Rate limiting
    }
  }

  log(`\n✅ Media upload complete! Uploaded ${Object.keys(mediaIdMap).length} files.\n`);

  // ============================================
  // STEP 2: CREATE BENEFITS
  // ============================================
  log('\n💼 STEP 2: Creating Benefits...\n');
  
  for (const benefit of migrationData.benefits) {
    const iconMediaId = mediaIdMap[benefit.icon_svg_filename];
    await createBenefit(benefit, iconMediaId);
    await sleep(1000);
  }

  // ============================================
  // STEP 3: CREATE PARTNERSHIPS
  // ============================================
  log('\n🤝 STEP 3: Creating Partnerships...\n');
  
  for (const partnership of migrationData.partnerships) {
    await createPartnership(partnership);
    await sleep(1000);
  }

  // ============================================
  // STEP 4: CREATE ADVANTAGES
  // ============================================
  log('\n⭐ STEP 4: Creating Advantages...\n');
  
  for (const advantage of migrationData.advantages) {
    const bannerMediaId = mediaIdMap[advantage.banner_image_filename];
    await createAdvantage(advantage, bannerMediaId);
    await sleep(1000);
  }

  // ============================================
  // STEP 5: CREATE VALUES
  // ============================================
  log('\n💎 STEP 5: Creating Values...\n');
  
  for (const value of migrationData.values) {
    await createValue(value);
    await sleep(1000);
  }

  // ============================================
  // STEP 6: CREATE EXPERIENCE CARDS
  // ============================================
  log('\n🎯 STEP 6: Creating Experience Cards...\n');
  
  for (const card of migrationData.experienceCards) {
    const bannerMediaId = mediaIdMap[card.banner_image_filename];
    await createExperienceCard(card, bannerMediaId);
    await sleep(1000);
  }

  // ============================================
  // STEP 7: CREATE/UPDATE PAGES
  // ============================================
  log('\n📄 STEP 7: Creating/Updating Pages...\n');
  
  await createOrUpdatePage('home', migrationData.pages.home);
  await sleep(1000);
  
  await createOrUpdatePage('financing-options', migrationData.pages.financingOptions);
  await sleep(1000);
  
  await createOrUpdatePage('partners', migrationData.pages.partners);
  await sleep(1000);
  
  await createOrUpdatePage('why-luminar', migrationData.pages.whyLuminar);
  await sleep(1000);
  
  await createOrUpdatePage('contact', migrationData.pages.contact);
  await sleep(1000);

  // ============================================
  // COMPLETE
  // ============================================
  log('\n' + '='.repeat(60));
  log('✅ IMPORT COMPLETE!', 'success');
  log('='.repeat(60));
  log('\nNext Steps:');
  log('1. Visit your WordPress admin to verify all content');
  log('2. Check that ACF fields are populated correctly');
  log('3. Set Home page as front page (Settings → Reading)');
  log('4. Test all pages in WordPress admin');
  log('\n');
}

// ============================================
// RUN THE IMPORT
// ============================================

runImport().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
