'use client'

import { CoverLetterGeneratorProps } from '../types'
import { generateCoverLetter } from '../actions'
// import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph } from 'docx'
import { saveAs } from 'file-saver'

export default function CoverLetterGenerator({
  formData,
  analysis,
  fitAnalysis,
  additionalInfo,
  isLoading,
  setIsLoading,
  setGeneratedCoverLetter,
  generatedCoverLetter,
  coverLetterRef
}: CoverLetterGeneratorProps) {

  const handleGenerateCoverLetter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!analysis || !fitAnalysis) return

    setIsLoading(true)
    try {
      const coverLetter = await generateCoverLetter(
        formData.resume,
        analysis.formattedAnalysis,
        fitAnalysis,
        additionalInfo
      )
      setGeneratedCoverLetter(coverLetter)
      setTimeout(() => {
        if (coverLetterRef.current) {
          coverLetterRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!generatedCoverLetter) return;
    
    const element = document.createElement('div');
    element.innerHTML = generatedCoverLetter;
    element.className = 'generated-cover-letter';
    document.body.appendChild(element);
    
    const opt = {
      margin: [20, 15, 20, 15],
      filename: 'cover_letter.pdf',
      html2canvas: { scale: 1.5 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const style = document.createElement('style');
    style.textContent = `
      .generated-cover-letter {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        padding: 20px 25px;
        color: #000;
        font-size: 13px;
      }
      .generated-cover-letter p {
        margin-bottom: 0;
        padding-bottom: 1.5em;
      }
      .generated-cover-letter .header {
        padding-bottom: 2em;
      }
      .generated-cover-letter .signature {
        padding-top: 2em;
      }
    `;
    element.appendChild(style);

    // Add line breaks after each paragraph
    const paragraphs = element.getElementsByTagName('p');
    for (let i = 0; i < paragraphs.length; i++) {
      paragraphs[i].innerHTML += '<br><br>';
    }

    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().from(element).set(opt).save().then(() => {
      document.body.removeChild(element);
    });
  };

  const downloadDOCX = async () => {
    if (!generatedCoverLetter) return;
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: generatedCoverLetter.replace(/<[^>]+>/g, ''),
            spacing: { line: 360, after: 200 }
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'cover_letter.docx');
  };

  return (
    <div ref={coverLetterRef} className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Step 4: Generate Cover Letter</h2>
      <form onSubmit={handleGenerateCoverLetter} className="space-y-6">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Generating Cover Letter...' : 'Generate Cover Letter'}
        </button>
      </form>

      {generatedCoverLetter && (
        <div className="mt-6">
          <div
            className="bg-white p-6 rounded-lg shadow-md cover-letter-content"
            contentEditable={true}
            suppressContentEditableWarning={true}
            onBlur={(e) => setGeneratedCoverLetter(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: generatedCoverLetter }}
          />
          <style jsx global>{`
            .cover-letter-content {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #000000;
              font-size: 14px;
            }
            .cover-letter-content p {
              margin-bottom: 1.5rem;
            }
            .cover-letter-content .header {
              margin-bottom: 2rem;
            }
            .cover-letter-content .signature {
              margin-top: 2rem;
            }
            .cover-letter-content section {
              margin-bottom: 1.5rem;
            }
          `}</style>
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
    </div>
  )
} 