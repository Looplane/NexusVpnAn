// Generate simple placeholder assets using sharp (more reliable)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const backgroundColor = '#020617'; // Dark slate
const overlayColor = '#38bdf8'; // Brand blue

async function createImage(name, width, height) {
  try {
    // Create a simple image with background and a centered square
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
        <rect x="${width * 0.25}" y="${height * 0.25}" 
              width="${width * 0.5}" height="${height * 0.5}" 
              fill="${overlayColor}" rx="${width * 0.1}"/>
      </svg>
    `;
    
    const filePath = path.join(assetsDir, name);
    await sharp(Buffer.from(svg))
      .png()
      .resize(width, height)
      .toFile(filePath);
    
    console.log(`✓ Created ${name} (${width}x${height})`);
  } catch (error) {
    console.error(`✗ Failed to create ${name}:`, error.message);
    // Fallback: create minimal valid PNG
    const minimalPNG = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(path.join(assetsDir, name), minimalPNG);
    console.log(`  Created minimal fallback for ${name}`);
  }
}

async function generateAssets() {
  console.log('Generating placeholder assets...\n');
  
  await createImage('icon.png', 1024, 1024);
  await createImage('splash.png', 2048, 2048);
  await createImage('adaptive-icon.png', 1024, 1024);
  await createImage('favicon.png', 32, 32);
  
  console.log('\n✅ Assets ready for build!');
  console.log('⚠️  Replace with actual designs before production.');
}

generateAssets().catch(console.error);

