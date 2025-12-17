// Generate placeholder assets for Expo app
const Jimp = require('jimp').default || require('jimp');
const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Color scheme matching app (dark blue/slate)
const backgroundColor = 0x020617FF; // #020617
const foregroundColor = 0x38BDF8FF; // #38bdf8 (brand-400)

async function createImage(name, width, height, isIcon = false) {
  try {
    // Create image with background color
    const image = new Jimp(width, height, backgroundColor);
    
    // Add a simple design - centered circle/square for icons
    if (isIcon) {
      const size = Math.min(width, height) * 0.6;
      const x = (width - size) / 2;
      const y = (height - size) / 2;
      
      // Draw a simple shield-like shape (rounded rectangle)
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const relX = i / size;
          const relY = j / size;
          
          // Create a rounded rectangle shape
          if (
            (relX > 0.1 && relX < 0.9 && relY > 0.1 && relY < 0.9) ||
            (relX > 0.2 && relX < 0.8 && relY > 0.05 && relY < 0.95)
          ) {
            const px = Math.floor(x + i);
            const py = Math.floor(y + j);
            if (px >= 0 && px < width && py >= 0 && py < height) {
              image.setPixelColor(foregroundColor, px, py);
            }
          }
        }
      }
    } else {
      // For splash, add centered text/logo area
      const centerX = width / 2;
      const centerY = height / 2;
      const logoSize = Math.min(width, height) * 0.3;
      
      // Draw a simple centered square/logo placeholder
      const startX = Math.floor(centerX - logoSize / 2);
      const startY = Math.floor(centerY - logoSize / 2);
      
      for (let i = 0; i < logoSize; i++) {
        for (let j = 0; j < logoSize; j++) {
          const px = startX + i;
          const py = startY + j;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            image.setPixelColor(foregroundColor, px, py);
          }
        }
      }
    }
    
    // Write the image
    const filePath = path.join(assetsDir, name);
    await image.writeAsync(filePath);
    console.log(`✓ Created ${name} (${width}x${height})`);
  } catch (error) {
    console.error(`✗ Failed to create ${name}:`, error.message);
  }
}

async function generateAssets() {
  console.log('Generating placeholder assets...\n');
  
  // Generate all required images
  await createImage('icon.png', 1024, 1024, true);
  await createImage('splash.png', 2048, 2048, false);
  await createImage('adaptive-icon.png', 1024, 1024, true);
  await createImage('favicon.png', 32, 32, true);
  
  console.log('\n✅ All assets generated successfully!');
  console.log('\n⚠️  NOTE: These are placeholder images.');
  console.log('Replace them with actual designed images before production release.');
}

generateAssets().catch(console.error);
