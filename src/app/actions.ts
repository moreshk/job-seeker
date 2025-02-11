'use server'

export async function analyzeJob(website: string, description: string): Promise<string> {
  const prompt = `
    Analyze this job opportunity and company. 
    Website/Company info: ${website || 'Not provided'}
    Job Description: ${description}
    
    Please provide an analysis that covers the following points, highlighting the key items the recruiter is looking for in an applicants resume:
    1. Company Overview: Provide a brief overview of the company, its products/services, and any relevant details specific to this role
    2. Key expectations for this role
    3. What the company is looking for in candidates
    4. Key challenges the company is facing that this role would help solve (if not directly mentioned, please infer based on the context)
    
    Format the response in HTML with the following structure:
    <div class="analysis">
      <section class="company-overview">
        <h3>Company Overview</h3>
        <p>[Company overview content]</p>
      </section>
      <section class="key-expectations">
        <h3>Key Expectations</h3>
        <ul>
          <li>[Expectation 1]</li>
          <li>[Expectation 2]</li>
          ...
        </ul>
      </section>
      <section class="looking-for">
        <h3>What They're Looking For</h3>
        <ul>
          <li>[Requirement 1]</li>
          <li>[Requirement 2]</li>
          ...
        </ul>
      </section>
      <section class="key-challenges">
        <h3>Key Challenges</h3>
        <ul>
          <li>[Challenge 1]</li>
          <li>[Challenge 2]</li>
          ...
        </ul>
      </section>
    </div>
  `

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a professional job analysis assistant. Provide a detailed analysis and format the output in HTML as specified.'
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