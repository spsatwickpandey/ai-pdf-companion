'use client'

import { useState } from 'react'
import PDFEditor from '@/components/PDFEditor'
import PDFToolbar from '@/components/PDFToolbar'
import PDFSidebar from '@/components/PDFSidebar'

export default function EditorPage() {
  const [activeTool, setActiveTool] = useState('view')
  const [showSidebar, setShowSidebar] = useState(true)
  const [selectedAnnotation, setSelectedAnnotation] = useState<any>(null)

  const handleUpdateAnnotation = (updatedAnnotation: any) => {
    setSelectedAnnotation(updatedAnnotation)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <PDFToolbar 
          activeTool={activeTool} 
          onToolChange={setActiveTool}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
        />

        {/* Editor Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          {showSidebar && (
            <PDFSidebar 
              activeTool={activeTool}
              onToolChange={setActiveTool}
              selectedAnnotation={selectedAnnotation}
              onUpdateAnnotation={handleUpdateAnnotation}
            />
          )}

          {/* PDF Editor */}
          <div className="flex-1 overflow-auto">
            <PDFEditor 
              activeTool={activeTool} 
              selectedAnnotation={selectedAnnotation}
              onUpdateAnnotation={handleUpdateAnnotation}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 