'use client'

import { JobAnalysisFormProps } from '../types'
import { analyzeJob } from '../actions'

export default function JobAnalysisForm({
  formData,
  setFormData,
  isLoading,
  setIsLoading,
  setAnalysis,
  analysisRef
}: JobAnalysisFormProps) {
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const formattedAnalysis = await analyzeJob(formData.website, formData.description)
      setAnalysis({ formattedAnalysis, initialAnalysis: formattedAnalysis })
      setTimeout(() => {
        if (analysisRef.current) {
          analysisRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
  )
} 