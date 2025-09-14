import { PDFDocument } from 'pdf-lib'

export interface PDFMetadata {
  title: string
  author: string
  subject: string
  keywords: string[]
  creationDate: Date
  modificationDate: Date
  pageCount: number
  fileSize: number
}

export async function processPDF(file: File): Promise<{
  content: string
  metadata: PDFMetadata
}> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    
    // Extract metadata
    const metadata: PDFMetadata = {
      title: pdfDoc.getTitle() || file.name,
      author: pdfDoc.getAuthor() || 'Unknown',
      subject: pdfDoc.getSubject() || '',
      keywords: (() => {
        const k = pdfDoc.getKeywords();
        if (Array.isArray(k)) return k as string[];
        if (typeof k === 'string') return [k];
        return [];
      })(),
      creationDate: pdfDoc.getCreationDate() || new Date(),
      modificationDate: pdfDoc.getModificationDate() || new Date(),
      pageCount: pdfDoc.getPageCount(),
      fileSize: file.size
    }

    // For now, we'll just return the file name as content
    // In a real implementation, you'd want to extract text from the PDF
    const content = file.name

    return {
      content,
      metadata
    }
  } catch (error) {
    console.error('Error processing PDF:', error)
    throw new Error('Failed to process PDF file')
  }
} 