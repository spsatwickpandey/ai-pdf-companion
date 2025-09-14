const fs = require('fs')
const path = require('path')

// Source and destination paths
const sourcePath = path.join(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js')
const destPath = path.join(__dirname, '../public/pdf.worker.min.js')

// Create public directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, '../public'))) {
  fs.mkdirSync(path.join(__dirname, '../public'))
}

// Copy the worker file
fs.copyFileSync(sourcePath, destPath)
console.log('PDF.js worker file copied successfully!') 