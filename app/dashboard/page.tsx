'use client'

import { useState } from 'react'
import PDFUpload from '@/components/PDFUpload'
import PDFList from '@/components/PDFList'
import PDFChat from '@/components/PDFChat'
import PDFSummarizer from '@/components/PDFSummarizer'
import VoiceAssistant from '@/components/VoiceAssistant'
import PDFEditor from '@/components/PDFEditor'
import PDFToolbar from '@/components/PDFToolbar'
import PDFSidebar from '@/components/PDFSidebar'
import { usePDF } from '@/contexts/PDFContext'

const navigation = [
  { name: 'Upload', id: 'upload', icon: '📤' },
  { name: 'Documents', id: 'documents', icon: '📚' },
  { name: 'Editor', id: 'editor', icon: '✏️' },
  { name: 'Chat', id: 'chat', icon: '💬' },
  { name: 'Summarize', id: 'summarize', icon: '📝' },
  { name: 'Voice', id: 'voice', icon: '🎤' },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('upload')
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeTool, setActiveTool] = useState('view')
  const [selectedDocsForAI, setSelectedDocsForAI] = useState<string[]>([])
  const [selectedAnnotation, setSelectedAnnotation] = useState<any>(null)
  const { selectedPDF, setSelectedPDF, documents } = usePDF()
  const selectedDoc = documents.find(doc => doc.id === selectedPDF)

  const handleEditPDF = (id: string) => {
    setSelectedPDF(id)
    setActiveTab('editor')
  }

  const handleSelectForAI = (ids: string[]) => {
    setSelectedDocsForAI(ids)
  }

  const handleUpdateAnnotation = (updatedAnnotation: any) => {
    setSelectedAnnotation(updatedAnnotation)
  }

  const isAIMode = ['chat', 'summarize', 'voice'].includes(activeTab)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-900">AI PDF Companion</h1>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === item.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'upload' && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload PDF</h2>
              <PDFUpload />
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Documents</h2>
              <PDFList 
                onEditPDF={handleEditPDF}
                mode="edit"
              />
            </div>
          )}

          {activeTab === 'editor' && selectedPDF ? (
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">PDF Editor</h2>
                <p className="text-gray-600">Editing: {selectedDoc ? selectedDoc.name : selectedPDF}</p>
              </div>
              <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
                <PDFToolbar 
                  activeTool={activeTool}
                  onToolChange={setActiveTool}
                  onToggleSidebar={() => setShowSidebar(!showSidebar)}
                  onSave={() => {
                    // Save annotations - this will be handled by PDFEditor
                    const event = new CustomEvent('saveAnnotations')
                    window.dispatchEvent(event)
                  }}
                  onExport={() => {
                    // Export annotations - this will be handled by PDFEditor
                    const event = new CustomEvent('exportAnnotations')
                    window.dispatchEvent(event)
                  }}
                />
                <div className="flex-1 flex overflow-hidden">
                  {showSidebar && (
                    <PDFSidebar 
                      activeTool={activeTool}
                      onToolChange={setActiveTool}
                      selectedAnnotation={selectedAnnotation}
                      onUpdateAnnotation={handleUpdateAnnotation}
                    />
                  )}
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
          ) : activeTab === 'editor' ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No PDF Selected</h2>
                <p className="text-gray-600">Please select a PDF from your documents to edit</p>
              </div>
            </div>
          ) : null}

          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat with PDF</h2>
              <div className="mb-6">
                <PDFList 
                  mode="ai"
                  onSelectForAI={handleSelectForAI}
                />
              </div>
              {selectedDocsForAI.length > 0 && (
                <PDFChat selectedDocs={selectedDocsForAI} />
              )}
            </div>
          )}

          {activeTab === 'summarize' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Summarize PDF</h2>
              <div className="mb-6">
                <PDFList 
                  mode="ai"
                  onSelectForAI={handleSelectForAI}
                />
              </div>
              {selectedDocsForAI.length > 0 && (
                <PDFSummarizer selectedDocs={selectedDocsForAI} />
              )}
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Voice Assistant</h2>
              <div className="mb-6">
                <PDFList 
                  mode="ai"
                  onSelectForAI={handleSelectForAI}
                />
              </div>
              {selectedDocsForAI.length > 0 && (
                <VoiceAssistant selectedDocs={selectedDocsForAI} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 