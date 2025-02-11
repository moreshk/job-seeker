'use client'

import { useState } from 'react'
import { analyzeJob } from './actions'

interface AnalysisResponse {
  formattedAnalysis: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    website: '',
    description: ''
  })
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const formattedAnalysis = await analyzeJob(formData.website, formData.description)
      setAnalysis({ formattedAnalysis })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-2xl mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-6">Step 1: Company research and understanding job requirements</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="website" className="block text-sm font-medium mb-2">
              Company Website
            </label>
            <input
              type="text"
              id="website"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-900"
              placeholder="Enter website URL, or leave blank if not available"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Job Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={6}
              className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-900"
              placeholder="Enter the job description here..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Job'}
          </button>
        </form>

        {analysis && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg text-white">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            <div 
              dangerouslySetInnerHTML={{ __html: analysis.formattedAnalysis }}
              className="analysis-content [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_section]:mb-6"
            />
          </div>
        )}
      </main>
    </div>
  );
}
