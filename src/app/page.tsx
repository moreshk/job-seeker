/* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { analyzeJob, analyzeFitForJob, generateResume, generateCoverLetter } from './actions'
import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx'
import { saveAs } from 'file-saver'
import dynamic from 'next/dynamic'

interface AnalysisResponse {
  formattedAnalysis: string;
  initialAnalysis?: string;
}

// Dynamically import html2pdf with no SSR
const html2pdf = dynamic(() => import('html2pdf.js'), {
  ssr: false,
  loading: () => null
})

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
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const editableRef = useRef<HTMLDivElement>(null)

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

  const handleGenerateCoverLetter = async () => {
    if (!analysis?.initialAnalysis || !formData.resume || !fitAnalysis) return
    setIsLoading(true)
    try {
      const result = await generateCoverLetter(analysis.initialAnalysis, formData.resume, additionalInfo, fitAnalysis)
      setGeneratedCoverLetter(result)
    } catch (error) {
      console.error('Error generating cover letter:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!generatedResume) return;
    
    // Import html2pdf dynamically only when needed
    const html2pdfModule = await import('html2pdf.js')
    const html2pdf = html2pdfModule.default

    const element = document.createElement('div');
    element.innerHTML = generatedResume;
    element.className = 'generated-resume';
    document.body.appendChild(element);
    
    const opt = {
      margin: [25, 20, 25, 20], // [top, left, bottom, right] margins in mm
      filename: 'optimized_resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    const style = document.createElement('style');
    style.textContent = `
      .generated-resume {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        padding: 25px 30px;
        color: #000;
        max-width: 800px;
        margin: 0 auto;
      }
      .generated-resume h1 {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .generated-resume h2 {
        font-size: 20px;
        font-weight: bold;
        margin-top: 16px;
        margin-bottom: 8px;
        border-bottom: 1px solid #ccc;
        padding-bottom: 4px;
      }
      .generated-resume h3 {
        font-size: 18px;
        font-weight: bold;
        margin-top: 12px;
        margin-bottom: 4px;
      }
      .generated-resume p {
        margin-bottom: 8px;
      }
      .generated-resume ul {
        list-style-type: disc;
        padding-left: 18px;
        margin-left: 0;
        margin-bottom: 12px;
        margin-top: 8px;
      }
      .generated-resume li {
        margin-bottom: 6px;
        padding-left: 6px;
        page-break-inside: avoid;
      }
      .generated-resume section {
        margin-bottom: 20px;
      }
      .generated-resume .job {
        margin-bottom: 16px;
      }
      @page {
        margin: 25mm 20mm;
        size: A4;
      }
    `;
    element.appendChild(style);

    html2pdf().from(element).set(opt).save().then(() => {
      document.body.removeChild(element);
    });
  };

  const downloadDOCX = async () => {
    if (!generatedResume) return;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(generatedResume, 'text/html');
    
    const sections = doc.querySelectorAll('section');
    const docx = new Document({
      sections: [{
        properties: {},
        children: Array.from(sections).flatMap(section => {
          const sectionTitle = section.querySelector('h2');
          const paragraphs = section.querySelectorAll('p, ul');
          
          return [
            new Paragraph({
              text: sectionTitle ? sectionTitle.textContent || '' : '',
              heading: HeadingLevel.HEADING_2,
              thematicBreak: true,
            }),
            ...Array.from(paragraphs).map(p => {
              if (p.tagName === 'UL') {
                return Array.from(p.querySelectorAll('li')).map(li => 
                  new Paragraph({
                    text: li.textContent || '',
                    bullet: {
                      level: 0
                    }
                  })
                );
              } else {
                return new Paragraph({
                  text: p.textContent || '',
                });
              }
            }).flat(),
          ];
        }),
      }],
    });

    const blob = await Packer.toBlob(docx);
    saveAs(blob, 'optimized_resume.docx');
  }

  const downloadCoverLetterPDF = async () => {
    if (!generatedCoverLetter) return;
    
    const html2pdfModule = await import('html2pdf.js')
    const html2pdf = html2pdfModule.default

    const element = document.createElement('div');
    element.innerHTML = generatedCoverLetter;
    element.className = 'generated-cover-letter';
    document.body.appendChild(element);
    
    const opt = {
      margin: [25, 20, 25, 20],
      filename: 'cover_letter.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const style = document.createElement('style');
    style.textContent = `
      .generated-cover-letter {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        padding: 25px 30px;
        color: #000;
        max-width: 800px;
        margin: 0 auto;
      }
      .generated-cover-letter p {
        margin-bottom: 16px;
      }
      .generated-cover-letter .header {
        margin-bottom: 24px;
      }
      .generated-cover-letter .signature {
        margin-top: 24px;
      }
    `;
    element.appendChild(style);

    html2pdf().from(element).set(opt).save().then(() => {
      document.body.removeChild(element);
    });
  };

  const downloadCoverLetterDOCX = async () => {
    if (!generatedCoverLetter) return;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(generatedCoverLetter, 'text/html');
    
    const sections = doc.querySelectorAll('section');
    const docx = new Document({
      sections: [{
        properties: {},
        children: Array.from(sections).flatMap(section => {
          return Array.from(section.querySelectorAll('p')).map(p => 
            new Paragraph({
              text: p.textContent || '',
              spacing: {
                after: 300,
                line: 360,
              },
            })
          );
        }),
      }],
    });

    const blob = await Packer.toBlob(docx);
    saveAs(blob, 'cover_letter.docx');
  };

  const handleEditSection = (sectionId: string) => {
    setEditingSection(sectionId)
  }

  const handleSaveSection = useCallback(() => {
    if (!editableRef.current || !generatedResume) return
    setGeneratedResume(editableRef.current.innerHTML)
  }, [generatedResume])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editableRef.current && !editableRef.current.contains(event.target as Node)) {
        handleSaveSection()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleSaveSection])

  const EditableResumeSection = ({ html }: { html: string }) => {
    return (
      <div className="relative group">
        <div 
          dangerouslySetInnerHTML={{ __html: html }}
          className="generated-resume bg-white p-6 rounded-lg shadow-md text-gray-900"
          ref={editableRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
        />
        <style jsx global>{`
          .generated-resume {
            font-family: Arial, sans-serif;
            line-height: 1.6;
          }
          .generated-resume h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .generated-resume h2 {
            font-size: 20px;
            font-weight: bold;
            margin-top: 16px;
            margin-bottom: 8px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
          }
          .generated-resume h3 {
            font-size: 18px;
            font-weight: bold;
            margin-top: 12px;
            margin-bottom: 4px;
          }
          .generated-resume p {
            margin-bottom: 8px;
          }
          .generated-resume ul {
            list-style-type: disc;
            padding-left: 20px;
            margin-bottom: 12px;
          }
          .generated-resume li {
            margin-bottom: 4px;
          }
          .generated-resume section {
            margin-bottom: 20px;
          }
          .generated-resume .job {
            margin-bottom: 16px;
          }
          .generated-resume section:hover .edit-icon {
            opacity: 1;
          }
          .edit-icon {
            opacity: 0;
            transition: opacity 0.2s;
          }
          @media print {
            .edit-icon {
              display: none;
            }
          }
        `}</style>
        {Array.from(new DOMParser().parseFromString(html, 'text/html').querySelectorAll('section')).map((section) => {
          const sectionId = section.getAttribute('data-section-id')
          if (!sectionId) return null
          
          return (
            <button
              key={sectionId}
              className="edit-icon absolute right-2 top-2 p-2 text-gray-500 hover:text-gray-700"
              onClick={() => handleEditSection(sectionId)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-12 12a2 2 0 01-2.828 0 2 2 0 010-2.828l12-12z" />
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-12 12A2 2 0 011 18v-2l12-12z" />
              </svg>
            </button>
          )
        })}
      </div>
    )
  }

  const EditableCoverLetterSection = ({ html }: { html: string }) => {
    return (
      <div className="relative group">
        <div 
          dangerouslySetInnerHTML={{ __html: html }}
          className="generated-cover-letter bg-white p-6 rounded-lg shadow-md text-gray-900"
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={(e) => setGeneratedCoverLetter(e.currentTarget.innerHTML)}
        />
        <style jsx global>{`
          .generated-cover-letter {
            font-family: Arial, sans-serif;
            line-height: 1.6;
          }
          .generated-cover-letter .header {
            margin-bottom: 24px;
          }
          .generated-cover-letter p {
            margin-bottom: 16px;
          }
          .generated-cover-letter .signature {
            margin-top: 24px;
          }
        `}</style>
      </div>
    );
  };

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
                    <EditableResumeSection html={generatedResume} />
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

        {generatedResume && (
          <div className="mt-8">
            <button
              onClick={handleGenerateCoverLetter}
              disabled={isLoading}
              className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 disabled:bg-indigo-300"
            >
              {isLoading ? 'Generating...' : 'Generate Cover Letter'}
            </button>

            {generatedCoverLetter && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Cover Letter</h2>
                <EditableCoverLetterSection html={generatedCoverLetter} />
                <div className="mt-4 space-x-4">
                  <button
                    onClick={downloadCoverLetterPDF}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                  >
                    Download as PDF
                  </button>
                  <button
                    onClick={downloadCoverLetterDOCX}
                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
                  >
                    Download as DOCX
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
