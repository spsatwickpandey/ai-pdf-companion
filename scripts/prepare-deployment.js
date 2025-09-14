#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing AI PDF Companion for Render deployment...\n');

// Check if required environment variables are set
const requiredEnvVars = ['GROQ_API_KEY', 'HUGGINGFACE_API_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('⚠️  Warning: The following environment variables are not set:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Make sure to set these in your Render dashboard after deployment.\n');
}

// Ensure public directory exists
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created public directory');
}

// Copy PDF.js worker file
const sourcePath = path.join(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js');
const destPath = path.join(__dirname, '../public/pdf.worker.min.js');

if (fs.existsSync(sourcePath)) {
  fs.copyFileSync(sourcePath, destPath);
  console.log('✅ Copied PDF.js worker file');
} else {
  console.log('⚠️  PDF.js worker file not found. Make sure pdfjs-dist is installed.');
}

// Create a simple health check endpoint
const healthCheckContent = `export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AI PDF Companion'
  });
}`;

const apiDir = path.join(__dirname, '../pages/api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

const healthCheckPath = path.join(apiDir, 'health.js');
fs.writeFileSync(healthCheckPath, healthCheckContent);
console.log('✅ Created health check endpoint');

// Check package.json scripts
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (!packageJson.scripts.start) {
  packageJson.scripts.start = 'next start';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Added start script to package.json');
}

console.log('\n🎉 Deployment preparation complete!');
console.log('\n📋 Next steps:');
console.log('1. Push your code to GitHub');
console.log('2. Connect your GitHub repo to Render');
console.log('3. Set the following environment variables in Render dashboard:');
console.log('   - GROQ_API_KEY');
console.log('   - HUGGINGFACE_API_KEY');
console.log('4. Deploy! 🚀\n');
