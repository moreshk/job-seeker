// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useRef } from 'react'
import JobAnalysisForm from './components/JobAnalysisForm'
import AnalysisResults from './components/AnalysisResults'
import FitAnalysis from './components/FitAnalysis'
import ResumeGenerator from './components/ResumeGenerator'
import CoverLetterGenerator from './components/CoverLetterGenerator'
import { AnalysisResponse, FormData } from './types'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    website: '',
    description: '',
    resume: ''
  })
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [fitAnalysis, setFitAnalysis] = useState<string | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [generatedResume, setGeneratedResume] = useState<string | null>(null)
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null)

  const analysisRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>
  const fitAnalysisRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>
  const resumeRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>
  const coverLetterRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-2xl mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-6">Job Application Assistant</h1>
        
        <JobAnalysisForm
          formData={formData}
          setFormData={setFormData}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setAnalysis={setAnalysis}
          analysisRef={analysisRef}
        />

        {analysis && (
          <>
            <AnalysisResults analysis={analysis} analysisRef={analysisRef} />

            <FitAnalysis
              formData={formData}
              setFormData={setFormData}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              analysis={analysis}
              setFitAnalysis={setFitAnalysis}
              fitAnalysis={fitAnalysis}
              fitAnalysisRef={fitAnalysisRef}
            />

            {fitAnalysis && (
              <ResumeGenerator
                formData={formData}
                analysis={analysis}
                fitAnalysis={fitAnalysis}
                additionalInfo={additionalInfo}
                setAdditionalInfo={setAdditionalInfo}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setGeneratedResume={setGeneratedResume}
                generatedResume={generatedResume}
                resumeRef={resumeRef}
              />
            )}

            {generatedResume && (
              <CoverLetterGenerator
                formData={formData}
                analysis={analysis}
                fitAnalysis={fitAnalysis}
                additionalInfo={additionalInfo}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setGeneratedCoverLetter={setGeneratedCoverLetter}
                generatedCoverLetter={generatedCoverLetter}
                coverLetterRef={coverLetterRef}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
