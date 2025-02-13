'use client'

import { ResumeGeneratorProps } from '../types'
import { generateResume } from '../actions'
import { useRef } from 'react'
// import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

export default function ResumeGenerator({
  formData,
  analysis,
  fitAnalysis,
  additionalInfo,
  setAdditionalInfo,
  isLoading,
  setIsLoading,
  setGeneratedResume,
  generatedResume,
  resumeRef
}: ResumeGeneratorProps) {
  const editableRef = useRef<HTMLDivElement>(null)
  
  const handleGenerateResume = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const resume = await generateResume(
        formData.resume,
        analysis.formattedAnalysis,
        fitAnalysis,
        additionalInfo
      )
      setGeneratedResume(resume)
      setTimeout(() => {
        if (resumeRef.current) {
          resumeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!generatedResume) return;
    
    const html2pdfModule = await import('html2pdf.js')
    const html2pdf = html2pdfModule.default

    const element = document.createElement('div');
    element.innerHTML = generatedResume;
    element.className = 'generated-resume';
    document.body.appendChild(element);
    
    const opt = {
      margin: [20, 15, 20, 15],
      filename: 'optimized_resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 1.65,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait'
      }
    };

    const style = document.createElement('style');
    style.textContent = `
      .generated-resume {
        font-family: Arial, sans-serif;
        line-height: 1.4;
        padding: 20px 25px;
        color: #000;
        max-width: 800px;
        margin: 0 auto;
        font-size: 13px;
      }
      .generated-resume h1 {
        font-size: 17px;
        font-weight: bold;
        margin-bottom: 6px;
      }
      .generated-resume h2 {
        font-size: 15px;
        font-weight: bold;
        margin-top: 10px;
        margin-bottom: 5px;
        border-bottom: 1px solid #ccc;
        padding-bottom: 3px;
      }
      .generated-resume h3 {
        font-size: 14px;
        font-weight: bold;
        margin-top: 8px;
        margin-bottom: 3px;
      }
      .generated-resume p {
        margin-bottom: 5px;
      }
      .generated-resume ul {
        list-style-type: disc;
        padding-left: 15px;
        margin-bottom: 8px;
      }
      .generated-resume li {
        margin-bottom: 3px;
        page-break-inside: avoid;
      }
    `;
    element.appendChild(style);

    html2pdf().from(element).set(opt).save().then(() => {
      document.body.removeChild(element);
    });
  };

  const downloadDOCX = () => {
    if (!editableRef.current) return;
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun(editableRef.current.innerText)],
          }),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "resume.docx");
    });
  }

  return (
    <div ref={resumeRef} className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Step 3: Generate Tailored Resume</h2>
      <form onSubmit={handleGenerateResume} className="space-y-6">
        <div>
          <label htmlFor="additionalInfo" className="block text-sm font-medium mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            id="additionalInfo"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-900"
            placeholder="Add any additional information you'd like to include..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Generating Resume...' : 'Generate Resume'}
        </button>
      </form>

      {generatedResume && (
        <div className="mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div 
              ref={editableRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={() => editableRef.current && setGeneratedResume(editableRef.current.innerHTML)}
              dangerouslySetInnerHTML={{ __html: generatedResume }}
              className="generated-resume prose max-w-none text-gray-900"
            />
          </div>
          <style jsx global>{`
            .generated-resume {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              padding: 15px 20px;
              color: #000;
              max-width: 800px;
              margin: 0 auto;
              font-size: 14px;
            }
            .generated-resume h1 {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 6px;
            }
            .generated-resume h2 {
              font-size: 16px;
              font-weight: bold;
              margin-top: 12px;
              margin-bottom: 6px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 3px;
            }
            .generated-resume h3 {
              font-size: 15px;
              font-weight: bold;
              margin-top: 10px;
              margin-bottom: 3px;
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
          `}</style>
          <div className="mt-4 flex gap-4">
            <button
              onClick={downloadPDF}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Download PDF
            </button>
            <button
              onClick={downloadDOCX}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Download DOCX
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 