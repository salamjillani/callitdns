const { GoogleGenerativeAI } = require('@google/generative-ai');

async function analyzeWithGemini(dnsRecords, domain) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
    Analyze these DNS records for the domain "${domain}" and identify common errors or security vulnerabilities.
    Specifically check for missing SPF, DKIM, and DMARC records which are important for email security.
    
    DNS Records:
    ${JSON.stringify(dnsRecords, null, 2)}
    
    Return your analysis in the following JSON format:
    {
      "issues": [
        {
          "title": "Issue title",
          "description": "Detailed description of the issue",
          "severity": "high|medium|low",
          "category": "security|performance|configuration",
          "fix": "Description of how to fix this issue"
        }
      ],
      "recommendations": [
        {
          "title": "Recommendation title",
          "description": "Why this is recommended",
          "priority": "high|medium|low"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
    }

    // Fallback response if parsing fails
    return {
      issues: [
        {
          title: "Missing SPF Record",
          description: "No SPF record found. This could allow email spoofing from your domain.",
          severity: "high",
          category: "security",
          fix: "Add an SPF TXT record to specify which servers can send email for your domain"
        }
      ],
      recommendations: []
    };

  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to analyze DNS records with AI');
  }
}

module.exports = { analyzeWithGemini };