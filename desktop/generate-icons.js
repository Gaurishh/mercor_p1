#!/usr/bin/env node

/**
 * Icon Generation Script for Inciteful Desktop App
 * 
 * This script helps generate the required icon files from the SVG base.
 * You'll need to install additional packages for full functionality.
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Inciteful Desktop App - Icon Generator');
console.log('==========================================\n');

// Check if SVG base exists
const svgPath = path.join(__dirname, 'assets', 'icon.svg');
if (!fs.existsSync(svgPath)) {
  console.error('❌ Error: icon.svg not found in assets directory');
  console.log('Please ensure the SVG base file exists before running this script.\n');
  process.exit(1);
}

console.log('✅ Found icon.svg base file');
console.log('📁 Assets directory structure:');

// List current assets
const assetsDir = path.join(__dirname, 'assets');
const files = fs.readdirSync(assetsDir);
files.forEach(file => {
  const stats = fs.statSync(path.join(assetsDir, file));
  const size = stats.size;
  console.log(`   ${file} (${size} bytes)`);
});

console.log('\n📋 Required icon files:');
console.log('   ✅ icon.svg - Base design (exists)');
console.log('   ⏳ icon.png - 512x512 PNG for Linux');
console.log('   ⏳ icon.ico - Windows icon (256x256+)');
console.log('   ⏳ icon.icns - macOS icon (512x512+)');

console.log('\n🛠️  Next steps to generate icons:');
console.log('\n1. Convert SVG to PNG:');
console.log('   - Online: https://convertio.co/svg-png/');
console.log('   - Desktop: GIMP, Inkscape, or Photoshop');
console.log('   - Command line: ImageMagick (convert icon.svg icon.png)');

console.log('\n2. Convert PNG to ICO (Windows):');
console.log('   - Online: https://convertio.co/png-ico/');
console.log('   - Desktop: IcoFX or Greenfish Icon Editor Pro');
console.log('   - Command line: ImageMagick (convert icon.png -resize 256x256 icon.ico)');

console.log('\n3. Convert PNG to ICNS (macOS):');
console.log('   - Online: https://cloudconvert.com/png-to-icns');
console.log('   - Desktop: Icon Composer (Xcode) or Image2Icon');
console.log('   - Note: ICNS is a container format with multiple sizes');

console.log('\n4. Alternative: Use specialized tools');
console.log('   - Figma: Design and export in multiple formats');
console.log('   - Adobe Illustrator: Professional vector editing');
console.log('   - Sketch: macOS design tool');

console.log('\n📖 For detailed specifications, see: assets/icon-specifications.md');

console.log('\n🎯 Quick conversion commands (if you have ImageMagick installed):');
console.log('   npm install -g sharp');
console.log('   npx sharp icon.svg resize 512 512 icon.png');
console.log('   convert icon.png -resize 256x256 icon.ico');

console.log('\n✅ Once you have all icon files, you can proceed with:');
console.log('   npm run build:win    # Build for Windows');
console.log('   npm run build:mac    # Build for macOS');
console.log('   npm run build:linux  # Build for Linux');
console.log('   npm run build:all    # Build for all platforms');

console.log('\n🚀 Happy icon generation!'); 