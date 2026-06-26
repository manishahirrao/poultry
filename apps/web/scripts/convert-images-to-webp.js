// Image Conversion Script - Convert PNG to WebP
// Task: PERF-001 - Image Optimisation Checklist

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

const imagesToConvert = [
  {
    input: path.join(publicDir, 'logo.png'),
    output: path.join(publicDir, 'logo.webp'),
    width: 400,
    height: 400,
  },
  {
    input: path.join(publicDir, 'brand-name.png'),
    output: path.join(publicDir, 'brand-name.webp'),
    width: 1200,
    height: 400,
  },
];

async function convertImages() {
  for (const image of imagesToConvert) {
    try {
      if (!fs.existsSync(image.input)) {
        console.log(`Skipping ${image.input} - file not found`);
        continue;
      }

      console.log(`Converting ${image.input} to WebP...`);
      
      await sharp(image.input)
        .resize(image.width, image.height, { fit: 'inside' })
        .webp({ quality: 82 })
        .toFile(image.output);
      
      console.log(`✓ Converted to ${image.output}`);
      
      // Get file sizes for comparison
      const originalSize = fs.statSync(image.input).size;
      const webpSize = fs.statSync(image.output).size;
      const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
      
      console.log(`  Original: ${(originalSize / 1024).toFixed(1)} KB`);
      console.log(`  WebP: ${(webpSize / 1024).toFixed(1)} KB`);
      console.log(`  Savings: ${savings}%\n`);
      
    } catch (error) {
      console.error(`Error converting ${image.input}:`, error.message);
    }
  }
  
  console.log('Image conversion complete!');
}

convertImages();
