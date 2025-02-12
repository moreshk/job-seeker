'use client'

import { useState } from 'react'
import { analyzeJob, analyzeFitForJob, generateResume } from './actions'
import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

interface AnalysisResponse {
  formattedAnalysis: string;
  initialAnalysis?: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    website: '',
    description: '',
    resume: ''
  })
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [fitAnalysis, setFitAnalysis] = useState<string | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [generatedResume, setGeneratedResume] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const formattedAnalysis = await analyzeJob(formData.website, formData.description)
      setAnalysis({ formattedAnalysis, initialAnalysis: formattedAnalysis })
      setFitAnalysis(null)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeFit = async () => {
    if (!analysis?.initialAnalysis || !formData.resume) return
    setIsLoading(true)
    try {
      const result = await analyzeFitForJob(analysis.initialAnalysis, formData.resume)
      setFitAnalysis(result)
    } catch (error) {
      console.error('Error analyzing fit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateResume = async () => {
    if (!analysis?.initialAnalysis || !formData.resume || !fitAnalysis) return
    setIsLoading(true)
    try {
      const result = await generateResume(analysis.initialAnalysis, formData.resume, additionalInfo, fitAnalysis)
      setGeneratedResume(result)
    } catch (error) {
      console.error('Error generating resume:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!generatedResume) return
    const doc = new jsPDF()
    doc.html(generatedResume, {
      callback: function (doc) {
        doc.save('optimized_resume.pdf')
      },
      x: 10,
      y: 10,
      width: 190,
      windowWidth: 650
    })
  }

  const downloadDOCX = async () => {
    if (!generatedResume) return
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = generatedResume
    
    // Extract text content
    const textContent = tempDiv.innerText
    
    // Create a new document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun(textContent)],
          }),
        ],
      }],
    })

    // Generate and save the document
    const blob = await Packer.toBlob(doc)
    saveAs(blob, 'optimized_resume.docx')
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
          <>
            <div className="mt-8 p-6 bg-gray-800 rounded-lg text-white">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              <div 
                dangerouslySetInnerHTML={{ __html: analysis.formattedAnalysis }}
                className="analysis-content [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_section]:mb-6"
              />
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Submit Your Resume for Fit Analysis</h2>
              <textarea
                value={formData.resume}
                onChange={(e) => setFormData(prev => ({ ...prev, resume: e.target.value }))}
                rows={8}
                className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-900 mb-4"
                placeholder="Paste your resume here..."
              />
              <button
                onClick={analyzeFit}
                disabled={isLoading || !formData.resume}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:bg-green-300"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Fit'}
              </button>
            </div>

            {fitAnalysis && (
              <>
                <div className="mt-8 p-6 bg-gray-700 rounded-lg text-white">
                  <h2 className="text-xl font-semibold mb-4">Fit Analysis Results</h2>
                  <div 
                    dangerouslySetInnerHTML={{ __html: fitAnalysis }}
                    className="fit-analysis [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 
                      [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_section]:mb-6"
                  />
                </div>

                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-900 mb-4"
                    placeholder="Enter any additional inputs based on the potential areas to address or any other relevant information..."
                  />
                  <button
                    onClick={handleGenerateResume}
                    disabled={isLoading || !fitAnalysis}
                    className="bg-purple-500 text-white px-6 py-2 rounded-md hover:bg-purple-600 disabled:bg-purple-300"
                  >
                    {isLoading ? 'Generating...' : 'Generate My Resume'}
                  </button>
                </div>

                {generatedResume && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Optimized Resume</h2>
                    <div 
                      dangerouslySetInnerHTML={{ __html: generatedResume }}
                      className="generated-resume bg-white p-6 rounded-lg shadow-md"
                    />
                    <div className="mt-4 space-x-4">
                      <button
                        onClick={downloadPDF}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                      >
                        Download as PDF
                      </button>
                      <button
                        onClick={downloadDOCX}
                        className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
                      >
                        Download as DOCX
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
