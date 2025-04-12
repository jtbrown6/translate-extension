const fs = require('fs');
const { createCanvas } = require('canvas');

// Function to draw the icon at different sizes
function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#4285F4'; // Google blue
  ctx.fillRect(0, 0, size, size);
  
  // Border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = Math.max(1, size / 16);
  ctx.strokeRect(0, 0, size, size);
  
  // "T" letter for translator
  ctx.fillStyle = '#FFFFFF';
  
  // Horizontal bar of T
  ctx.fillRect(size * 0.2, size * 0.2, size * 0.6, size * 0.15);
  
  // Vertical bar of T
  ctx.fillRect(size * 0.4, size * 0.2, size * 0.2, size * 0.6);
  
  // Draw a small arrow at the bottom
  ctx.beginPath();
  ctx.moveTo(size * 0.3, size * 0.75);
  ctx.lineTo(size * 0.5, size * 0.85);
  ctx.lineTo(size * 0.7, size * 0.75);
  ctx.fill();
  
  return canvas.toBuffer('image/png');
}

// Create icons at different sizes
const sizes = [16, 48, 128];

sizes.forEach(size => {
  const iconBuffer = createIcon(size);
  fs.writeFileSync(`icon${size}.png`, iconBuffer);
  console.log(`Created icon${size}.png`);
});

console.log('All icons created successfully!');
