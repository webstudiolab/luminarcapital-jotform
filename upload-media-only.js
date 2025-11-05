const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const CONFIG = {
  wpUrl: 'https://admin.luminarcapital.com',
  username: '@technology',
  appPassword: 'jkwW xAXs XQI1 lBwf 1tMq QEn5',
  dataFile: './migration-data-fixed.json',
  publicFolder: './public'
};

const getAuthHeader = () => {
  const token = Buffer.from(`${CONFIG.username}:${CONFIG.appPassword}`).toString('base64');
  return {
    'Authorization': `Basic ${token}`,
    'Content-Type': 'application/json'
  };
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const log = (message, type = 'info') => {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} ${message}`);
};

async function uploadMedia(filePath, filename) {
  try {
    // Fix the path - remove leading ./ and add ./public
    const cleanPath = filePath.replace(/^\.\//, '').replace(/\/$/, '');
    const fullPath = path.join(CONFIG.publicFolder, cleanPath, filename);
    
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

async function uploadAll() {
  log('Starting media upload...\n');
  
  const migrationData = JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf8'));
  let successCount = 0;
  let failCount = 0;

  for (const mediaCategory of migrationData.mediaFiles) {
    log(`\nUploading ${mediaCategory.category} files...`);
    
    for (const filename of mediaCategory.files) {
      const mediaId = await uploadMedia(mediaCategory.source_path, filename);
      if (mediaId) {
        successCount++;
      } else {
        failCount++;
      }
      await sleep(500);
    }
  }

  log(`\n${'='.repeat(60)}`);
  log(`✅ Upload complete!`);
  log(`✅ Successful: ${successCount}`);
  log(`❌ Failed: ${failCount}`);
  log('='.repeat(60));
}

uploadAll().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
