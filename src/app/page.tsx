'use client'

import { useState } from 'react'

interface AnalysisResponse {
  companyOverview: string;
  expectations: string[];
  challenges: string[];
  resumeTips: string[];
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    website: '',
    description: ''
  })
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)

  const analyzeJob = async (website: string, description: string) => {
    try {
      const prompt = `
        Analyze this job opportunity and company. 
        Website/Company info: ${website || 'Not provided'}
        Job Description: ${description}
        
        Please provide a detailed analysis in the following areas:
        1. Company Overview: Provide a brief overview of the company, its products/services, and any relevant details specific to this role
        2. Key expectations for this role
        3. What the company is looking for in candidates
        4. Key challenges the company is facing that this role would help solve (if not directly mentioned, please infer based on the context)
        
        Format the response in clear sections.
      `

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'Be precise and detailed in your analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1024,
          stream: false
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(`API error: ${JSON.stringify(data)}`)
      }
      return data.choices[0].message.content
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }

  const formatWithOpenAI = async (rawAnalysis: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a professional job analysis assistant. Format the provided job analysis into clear, well-structured sections with proper bullet points and paragraphs."
            },
            {
              role: "user",
              content: `Please format this job analysis into clear sections with proper formatting:
              1. Company Overview (as a paragraph)
              2. Key Expectations (as bullet points)
              3. What They're Looking For (as bullet points)
              4. Key Challenges (as bullet points)

              Raw analysis: ${rawAnalysis}`
            }
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${JSON.stringify(data)}`);
      }

      const formattedContent = data.choices[0].message.content;
      
      // Parse the formatted content into sections
      return {
        companyOverview: extractOverviewFromFormatted(formattedContent),
        expectations: extractBulletPoints(formattedContent, "Key Expectations"),
        resumeTips: extractBulletPoints(formattedContent, "What They're Looking For"),
        challenges: extractBulletPoints(formattedContent, "Key Challenges"),
      };
    } catch (error) {
      console.error('Error formatting with OpenAI:', error);
      throw error;
    }
  }

  const extractOverviewFromFormatted = (text: string): string => {
    const overviewMatch = text.match(/Company Overview:?\s*([\s\S]*?)(?=\n\s*(?:Key Expectations|What They're Looking For|Key Challenges)|$)/i);
    return overviewMatch ? overviewMatch[1].trim() : '';
  }

  const extractBulletPoints = (text: string, sectionName: string): string[] => {
    const sectionRegex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n\\s*(?:Company Overview|Key Expectations|What They're Looking For|Key Challenges)|$)`, 'i');
    const sectionMatch = text.match(sectionRegex);
    
    if (!sectionMatch) return [];
    
    return sectionMatch[1]
      .split('\n')
      .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const rawAnalysis = await analyzeJob(formData.website, formData.description)
      const formattedAnalysis = await formatWithOpenAI(rawAnalysis)
      setAnalysis(formattedAnalysis)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-2xl mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-6">Company Information</h1>
        
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
              className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-900"
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
              className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-900"
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
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            
            <section className="mb-6">
              <h3 className="text-lg font-medium mb-2">Company Overview</h3>
              <p className="text-gray-700">{analysis.companyOverview}</p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-medium mb-2">Key Expectations</h3>
              <ul className="list-disc pl-5 space-y-2">
                {analysis.expectations.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-medium mb-2">What They are Looking For</h3>
              <ul className="list-disc pl-5 space-y-2">
                {analysis.resumeTips.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-2">Key Challenges</h3>
              <ul className="list-disc pl-5 space-y-2">
                {analysis.challenges.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
