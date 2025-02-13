'use client'

import { FitAnalysisProps } from '../types'
import { analyzeFitForJob } from '../actions'

export default function FitAnalysis({
  formData,
  setFormData,
  isLoading,
  setIsLoading,
  analysis,
  setFitAnalysis,
  fitAnalysis,
  fitAnalysisRef
}: FitAnalysisProps) {
  
  const handleResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await analyzeFitForJob(formData.resume, analysis.formattedAnalysis)
      setFitAnalysis(result)
      setTimeout(() => {
        if (fitAnalysisRef.current) {
          fitAnalysisRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Step 2: Analyze your fit for the role</h2>
      <form onSubmit={handleResumeSubmit} className="space-y-6">
        <div>
          <label htmlFor="resume" className="block text-sm font-medium mb-2">
            Your Resume
          </label>
          <textarea
            id="resume"
            value={formData.resume}
            onChange={(e) => setFormData(prev => ({ ...prev, resume: e.target.value }))}
            rows={6}
            className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-900"
            placeholder="Paste your current resume here..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Analyzing Fit...' : 'Analyze Fit'}
        </button>
      </form>

      {fitAnalysis && (
        <div ref={fitAnalysisRef} className="mt-8 p-6 bg-gray-700 rounded-lg text-white">
          <h2 className="text-xl font-semibold mb-4">Fit Analysis Results</h2>
          <div 
            dangerouslySetInnerHTML={{ __html: fitAnalysis }}
            className="fit-analysis [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 
              [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_section]:mb-6"
          />
        </div>
      )}
    </div>
  )
} 