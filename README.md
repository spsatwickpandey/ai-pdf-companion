# AI PDF Companion

A modern web application that allows you to interact with your PDFs using AI. Features include:

- PDF Upload and Management
- Chat with PDFs using GROQ's AI
- Generate summaries of PDFs
- Voice commands for hands-free operation
- Modern, responsive UI

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- GROQ AI
- PDF.js
- IndexedDB for storage

## Prerequisites

- Node.js 18 or later
- npm or yarn
- GROQ API key

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-pdf-companion.git
cd ai-pdf-companion
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your GROQ API key:
```
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### PDF Upload
- Drag and drop interface
- File size validation
- Progress indicators
- Error handling

### PDF Chat
- Natural language interaction with PDFs
- Context-aware responses
- Message history
- Loading states

### PDF Summarization
- Generate concise summaries
- Multiple summary lengths
- Copy to clipboard
- Loading states

### Voice Assistant
- Voice commands for navigation
- Natural language processing
- Real-time feedback
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 