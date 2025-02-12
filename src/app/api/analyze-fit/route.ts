import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { jobAnalysis, resume } = await request.json()

    const prompt = `
      Based on the following job analysis and resume, evaluate if the candidate is a good fit for the role.
      Format your response in HTML using the following guidelines:
      - Use <h3> tags for section headings
      - Use <p> tags for paragraphs
      - Use <ul> and <li> tags for lists of points
      - Use <strong> tags for emphasis
      - Structure your response with these sections:
        1. Overall Assessment
        2. Matching Skills/Experience
        3. Gaps/Areas for Improvement (if any)
        4. Recommendations (if needed)

      Job Analysis:
      ${jobAnalysis}

      Resume:
      ${resume}

      Provide a detailed analysis maintaining the HTML formatting.
    `

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
    })

    return NextResponse.json({ analysis: completion.choices[0].message.content })
  } catch (error) {
    console.error('Error in analyze-fit:', error)
    return NextResponse.json({ error: 'Failed to analyze fit' }, { status: 500 })
  }
} 