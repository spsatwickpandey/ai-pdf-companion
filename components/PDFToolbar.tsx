'use client'

interface PDFToolbarProps {
  activeTool: string
  onToolChange: (tool: string) => void
  onToggleSidebar: () => void
  onSave?: () => void
  onExport?: () => void
}

export default function PDFToolbar({ activeTool, onToolChange, onToggleSidebar, onSave, onExport }: PDFToolbarProps) {
  const tools = [
    { id: 'view', icon: '👁️', label: 'View' },
    { id: 'text', icon: '📝', label: 'Text' },
    { id: 'draw', icon: '✏️', label: 'Draw' },
    { id: 'rect', icon: '⬜', label: 'Rectangle' },
    { id: 'circle', icon: '⭕', label: 'Circle' },
    { id: 'line', icon: '📏', label: 'Line' },
    { id: 'image', icon: '🖼️', label: 'Image' },
    { id: 'highlight', icon: '🖌️', label: 'Highlight' },
    { id: 'comment', icon: '💬', label: 'Comment' },
  ]

  return (
    <div className="bg-white border-b border-gray-200 p-2">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Toggle Sidebar"
          >
            ☰
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center space-x-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onToolChange(activeTool === tool.id ? '' : tool.id)}
                className={`p-2 hover:bg-gray-100 rounded-lg flex items-center space-x-1 ${
                  activeTool === tool.id ? 'bg-gray-100' : ''
                }`}
                title={tool.label}
              >
                <span>{tool.icon}</span>
                <span className="text-sm">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            title="Save Changes"
          >
            Save
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            title="Export Annotations"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  )
} 