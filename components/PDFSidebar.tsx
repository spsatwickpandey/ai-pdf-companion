'use client'

import { useState, useEffect, useRef } from 'react'

interface PDFSidebarProps {
  activeTool: string
  onToolChange: (tool: string) => void
  selectedAnnotation?: any
  onUpdateAnnotation?: (props: any) => void
}

export default function PDFSidebar({ activeTool, onToolChange, selectedAnnotation, onUpdateAnnotation }: PDFSidebarProps) {
  // Text properties
  const [textInput, setTextInput] = useState('')
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [fontColor, setFontColor] = useState('#000000')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  
  // Shape properties
  const [strokeColor, setStrokeColor] = useState('#1976d2')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [fillColor, setFillColor] = useState('transparent')
  const [fillOpacity, setFillOpacity] = useState(1)
  
  // Highlight properties
  const [highlightColor, setHighlightColor] = useState('#ffff00')
  const [highlightOpacity, setHighlightOpacity] = useState(0.3)
  
  // Image properties
  const [imageWidth, setImageWidth] = useState(200)
  const [imageHeight, setImageHeight] = useState(150)
  
  // Comment properties
  const [commentText, setCommentText] = useState('')
  
  // Draw properties
  const [drawColor, setDrawColor] = useState('#d32f2f')
  const [drawWidth, setDrawWidth] = useState(3)

  // Update local state when selected annotation changes
  useEffect(() => {
    if (selectedAnnotation) {
      if (selectedAnnotation.type === 'text') {
        setTextInput(selectedAnnotation.text || '')
        setFontSize(selectedAnnotation.fontSize || 16)
        setFontFamily(selectedAnnotation.fontFamily || 'Arial')
        setFontColor(selectedAnnotation.color || '#000000')
        setBold(selectedAnnotation.bold || false)
        setItalic(selectedAnnotation.italic || false)
        setUnderline(selectedAnnotation.underline || false)
      } else if (selectedAnnotation.type === 'rect' || selectedAnnotation.type === 'circle') {
        setStrokeColor(selectedAnnotation.color || '#1976d2')
        setStrokeWidth(selectedAnnotation.borderWidth || 2)
        setFillColor(selectedAnnotation.fill || 'transparent')
        setFillOpacity(selectedAnnotation.fillOpacity || 1)
      } else if (selectedAnnotation.type === 'line') {
        setStrokeColor(selectedAnnotation.color || '#1976d2')
        setStrokeWidth(selectedAnnotation.width || 2)
      } else if (selectedAnnotation.type === 'highlight') {
        setHighlightColor(selectedAnnotation.color || '#ffff00')
        setHighlightOpacity(selectedAnnotation.opacity || 0.3)
      } else if (selectedAnnotation.type === 'image') {
        setImageWidth(selectedAnnotation.width || 200)
        setImageHeight(selectedAnnotation.height || 150)
      } else if (selectedAnnotation.type === 'comment') {
        setCommentText(selectedAnnotation.text || '')
      } else if (selectedAnnotation.type === 'draw') {
        setDrawColor(selectedAnnotation.color || '#d32f2f')
        setDrawWidth(selectedAnnotation.width || 3)
      }
    }
  }, [selectedAnnotation])

  const handleTextUpdate = () => {
    if (selectedAnnotation && selectedAnnotation.type === 'text' && onUpdateAnnotation) {
      onUpdateAnnotation({
        ...selectedAnnotation,
        text: textInput,
        fontSize,
        fontFamily,
        color: fontColor,
        bold,
        italic,
        underline
      })
    }
  }

  const handleShapeUpdate = () => {
    if (selectedAnnotation && onUpdateAnnotation) {
      if (selectedAnnotation.type === 'rect' || selectedAnnotation.type === 'circle') {
        onUpdateAnnotation({
          ...selectedAnnotation,
          color: strokeColor,
          borderWidth: strokeWidth,
          fill: fillColor === 'transparent' ? undefined : fillColor,
          fillOpacity: fillColor === 'transparent' ? undefined : fillOpacity
        })
      } else if (selectedAnnotation.type === 'line') {
        onUpdateAnnotation({
          ...selectedAnnotation,
          color: strokeColor,
          width: strokeWidth
        })
      }
    }
  }

  const handleHighlightUpdate = () => {
    if (selectedAnnotation && selectedAnnotation.type === 'highlight' && onUpdateAnnotation) {
      onUpdateAnnotation({
        ...selectedAnnotation,
        color: highlightColor,
        opacity: highlightOpacity
      })
    }
  }

  const handleImageUpdate = () => {
    if (selectedAnnotation && selectedAnnotation.type === 'image' && onUpdateAnnotation) {
      onUpdateAnnotation({
        ...selectedAnnotation,
        width: imageWidth,
        height: imageHeight
      })
    }
  }

  const handleCommentUpdate = () => {
    if (selectedAnnotation && selectedAnnotation.type === 'comment' && onUpdateAnnotation) {
      onUpdateAnnotation({
        ...selectedAnnotation,
        text: commentText
      })
    }
  }

  const handleDrawUpdate = () => {
    if (selectedAnnotation && selectedAnnotation.type === 'draw' && onUpdateAnnotation) {
      onUpdateAnnotation({
        ...selectedAnnotation,
        color: drawColor,
        width: drawWidth
      })
    }
  }

  const handleDeleteAnnotation = () => {
    if (selectedAnnotation && onUpdateAnnotation) {
      onUpdateAnnotation(null) // Signal to delete
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Properties</h3>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {selectedAnnotation ? (
          <>
            {/* Text Annotation Properties */}
            {selectedAnnotation.type === 'text' && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📝 Text Properties</h4>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Content</label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                    rows={3}
                    placeholder="Enter text..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      min="8"
                      max="72"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className="w-full h-10 rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Style</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setBold(!bold)}
                      className={`px-3 py-1 rounded text-sm ${
                        bold ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Bold
                    </button>
                    <button
                      onClick={() => setItalic(!italic)}
                      className={`px-3 py-1 rounded text-sm ${
                        italic ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Italic
                    </button>
                    <button
                      onClick={() => setUnderline(!underline)}
                      className={`px-3 py-1 rounded text-sm ${
                        underline ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Underline
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleTextUpdate}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 text-sm font-medium"
                >
                  Update Text
                </button>
              </div>
            )}

            {/* Shape Annotation Properties (Rectangle, Circle, Line) */}
            {(selectedAnnotation.type === 'rect' || selectedAnnotation.type === 'circle' || selectedAnnotation.type === 'line') && (
              <div className="space-y-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">
                    {selectedAnnotation.type === 'rect' && '⬜ Rectangle Properties'}
                    {selectedAnnotation.type === 'circle' && '⭕ Circle Properties'}
                    {selectedAnnotation.type === 'line' && '📏 Line Properties'}
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stroke Color</label>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-full h-10 rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stroke Width</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1px</span>
                    <span className="font-medium">{strokeWidth}px</span>
                    <span>10px</span>
                  </div>
                </div>

                {(selectedAnnotation.type === 'rect' || selectedAnnotation.type === 'circle') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fill Color</label>
                      <input
                        type="color"
                        value={fillColor}
                        onChange={(e) => setFillColor(e.target.value)}
                        className="w-full h-10 rounded-md border-gray-300 shadow-sm"
                      />
                    </div>

                    {fillColor !== 'transparent' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fill Opacity</label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={fillOpacity}
                          onChange={(e) => setFillOpacity(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>10%</span>
                          <span className="font-medium">{Math.round(fillOpacity * 100)}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={handleShapeUpdate}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 text-sm font-medium"
                >
                  Update Shape
                </button>
              </div>
            )}

            {/* Highlight Annotation Properties */}
            {selectedAnnotation.type === 'highlight' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">🖌️ Highlight Properties</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highlight Color</label>
                  <input
                    type="color"
                    value={highlightColor}
                    onChange={(e) => setHighlightColor(e.target.value)}
                    className="w-full h-10 rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opacity</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={highlightOpacity}
                    onChange={(e) => setHighlightOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10%</span>
                    <span className="font-medium">{Math.round(highlightOpacity * 100)}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <button
                  onClick={handleHighlightUpdate}
                  className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 text-sm font-medium"
                >
                  Update Highlight
                </button>
              </div>
            )}

            {/* Image Annotation Properties */}
            {selectedAnnotation.type === 'image' && (
              <div className="space-y-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">🖼️ Image Properties</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                    <input
                      type="number"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(Number(e.target.value))}
                      className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      min="50"
                      max="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                    <input
                      type="number"
                      value={imageHeight}
                      onChange={(e) => setImageHeight(Number(e.target.value))}
                      className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      min="50"
                      max="1000"
                    />
                  </div>
                </div>

                <button
                  onClick={handleImageUpdate}
                  className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 text-sm font-medium"
                >
                  Update Image
                </button>
              </div>
            )}

            {/* Comment Annotation Properties */}
            {selectedAnnotation.type === 'comment' && (
              <div className="space-y-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">💬 Comment Properties</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment Text</label>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                    rows={3}
                    placeholder="Enter comment..."
                  />
                </div>

                <button
                  onClick={handleCommentUpdate}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 text-sm font-medium"
                >
                  Update Comment
                </button>
              </div>
            )}

            {/* Draw Annotation Properties */}
            {selectedAnnotation.type === 'draw' && (
              <div className="space-y-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">✏️ Draw Properties</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Draw Color</label>
                  <input
                    type="color"
                    value={drawColor}
                    onChange={(e) => setDrawColor(e.target.value)}
                    className="w-full h-10 rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Line Width</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={drawWidth}
                    onChange={(e) => setDrawWidth(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1px</span>
                    <span className="font-medium">{drawWidth}px</span>
                    <span>10px</span>
                  </div>
                </div>

                <button
                  onClick={handleDrawUpdate}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 text-sm font-medium"
                >
                  Update Draw
                </button>
              </div>
            )}

            {/* Delete Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleDeleteAnnotation}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 text-sm font-medium"
              >
                🗑️ Delete Annotation
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">🎨</div>
            <p className="text-sm font-medium mb-2">Select an annotation to edit its properties</p>
            <div className="mt-4 text-xs text-gray-400">
              <p className="font-medium mb-2">Available tools:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li className="flex items-center"><span className="mr-2">📝</span> Text - Add text annotations</li>
                <li className="flex items-center"><span className="mr-2">✏️</span> Draw - Freehand drawing</li>
                <li className="flex items-center"><span className="mr-2">⬜</span> Rectangle - Draw rectangles</li>
                <li className="flex items-center"><span className="mr-2">⭕</span> Circle - Draw circles</li>
                <li className="flex items-center"><span className="mr-2">📏</span> Line - Draw lines</li>
                <li className="flex items-center"><span className="mr-2">🖼️</span> Image - Add images</li>
                <li className="flex items-center"><span className="mr-2">🖌️</span> Highlight - Highlight text</li>
                <li className="flex items-center"><span className="mr-2">💬</span> Comment - Add comments</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 