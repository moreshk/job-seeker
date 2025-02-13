'use client'

import { AnalysisResultsProps } from '../types'

export default function AnalysisResults({ analysis, analysisRef }: AnalysisResultsProps) {
  return (
    <div ref={analysisRef} className="mt-8 p-6 bg-gray-800 rounded-lg text-white">
      <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
      <div 
        dangerouslySetInnerHTML={{ __html: analysis.formattedAnalysis }}
        className="analysis-content [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_section]:mb-6"
      />
    </div>
  )
} 