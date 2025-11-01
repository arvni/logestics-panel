// Simple script to generate placeholder PWA icons
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Create simple SVG icons and convert them to base64 PNG
function generateSVGIcon(size) {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1976d2"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">LP</text>
</svg>`;
}

// Generate icons
const sizes = [192, 512];
const publicDir = path.join(__dirname, 'public');

sizes.forEach(size => {
    const svg = generateSVGIcon(size);
    const filename = `pwa-${size}x${size}.svg`;
    const filepath = path.join(publicDir, filename);

    fs.writeFileSync(filepath, svg);
    console.log(`Generated ${filename}`);
});

console.log('\nSVG icons generated successfully!');
console.log('Note: For production, convert these to PNG using an online tool or image editor.');
console.log('You can use: https://svgtopng.com/ or any image conversion tool\n');
