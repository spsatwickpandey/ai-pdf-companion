import * as pdfjsLib from 'pdfjs-dist'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function extractTextFromPDF(pdfPath: string) {
  try {
    // Use the CommonJS worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.js')

    // Read PDF file
    const data = new Uint8Array(fs.readFileSync(pdfPath))
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data })
    const pdf = await loadingTask.promise
    
    console.log(`PDF loaded: ${pdf.numPages} pages`)

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`\nProcessing page ${pageNum}...`)
      
      const page = await pdf.getPage(pageNum)
      
      // Get text content
      const textContent = await page.getTextContent()
      const text = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim()

      if (text) {
        console.log(`\nPage ${pageNum} text:`, text)
      } else {
        console.log(`\nNo text found on page ${pageNum}`)
      }
    }

    console.log('\nText extraction completed')
  } catch (error) {
    console.error('Error extracting text:', error)
  }
}

// Run the extraction
const pdfPath = path.join(__dirname, '../unit1.pdf')
extractTextFromPDF(pdfPath) 