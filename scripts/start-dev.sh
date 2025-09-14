#!/bin/bash

echo "🚀 Starting AI PDF Companion in development mode..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual API keys!"
    echo "   - GROQ_API_KEY"
    echo "   - HUGGINGFACE_API_KEY"
    echo ""
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Copy PDF.js worker
echo "📄 Setting up PDF.js worker..."
node scripts/copy-worker.js

# Start development server
echo "🔥 Starting development server..."
npm run dev
