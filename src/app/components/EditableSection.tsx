'use client'

import { useState, useRef, useEffect } from 'react'

interface EditableSectionProps {
  title: string
  content: string
  setContent: (content: string) => void
  className?: string
  renderHTML?: boolean
}

export default function EditableSection({
  title,
  content,
  setContent,
  className = '',
  renderHTML = false
}: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditing, content])

  const handleDownload = (format: 'txt' | 'docx') => {
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `generated-content.${format}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-500 hover:text-blue-600"
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
          <button
            onClick={() => handleDownload('txt')}
            className="text-blue-500 hover:text-blue-600"
          >
            Download TXT
          </button>
          <button
            onClick={() => handleDownload('docx')}
            className="text-blue-500 hover:text-blue-600"
          >
            Download DOCX
          </button>
        </div>
      </div>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-900"
          rows={10}
        />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className={`prose max-w-none ${renderHTML ? 'cover-letter-content' : ''}`}>
            {renderHTML ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              content.split('\n').map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))
            )}
          </div>
          <style jsx global>{`
            .cover-letter-content {
              color: #000000;
              font-family: Arial, sans-serif;
            }
            .cover-letter-content p {
              margin-bottom: 1.5rem;
              line-height: 1.6;
            }
            .cover-letter-content .header {
              margin-bottom: 2rem;
            }
            .cover-letter-content .signature {
              margin-top: 2rem;
            }
          `}</style>
        </div>
      )}
    </div>
  )
} 