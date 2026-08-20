// Run: node gen-icons.js
// Generates simple maroon icons for PWA
const { createCanvas } = require('canvas')
const fs = require('fs')

function makeIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#62191C'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#E0CFC2'
  ctx.font = `${size * 0.28}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('L&O', size/2, size/2)
  return canvas.toBuffer('image/png')
}

try {
  fs.writeFileSync('icon-192.png', makeIcon(192))
  fs.writeFileSync('icon-512.png', makeIcon(512))
  fs.writeFileSync('apple-icon.png', makeIcon(180))
  console.log('Icons generated!')
} catch(e) {
  console.log('canvas not available, using SVG fallback')
}
