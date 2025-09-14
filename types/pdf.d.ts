declare module 'pdfjs-dist/legacy/build/pdf' {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  
  export function getDocument(source: { data: Uint8Array }): {
    promise: Promise<PDFDocumentProxy>;
  };
  
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }
  
  export interface PDFPageProxy {
    getViewport(params: { scale: number; rotation: number }): PDFPageViewport;
    render(params: {
      canvasContext: CanvasRenderingContext2D;
      viewport: PDFPageViewport;
    }): {
      promise: Promise<void>;
    };
    cleanup(): void;
  }
  
  export interface PDFPageViewport {
    width: number;
    height: number;
  }
} 