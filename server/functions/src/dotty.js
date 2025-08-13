const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createDNSRecord, updateDNSRecord, deleteDNSRecord } = require('./cloudflare');

async function processDottyCommand(command, domain, existingRecords) {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are Dotty, an AI DNS assistant. Convert the following natural language command into DNS record operations.
    
    User Command: "${command}"
    Domain: "${domain}"
    Current DNS Records: ${JSON.stringify(existingRecords, null, 2)}
    
    Analyze the command and return a JSON response with the following structure:
    {
      "interpretation": "What you understood from the command",
      "actions": [
        {
          "type": "create|update|delete",
          "record": {
            "type": "A|AAAA|CNAME|MX|TXT|NS|SOA|PTR",
            "name": "subdomain or @ for root",
            "content": "value",
            "ttl": 3600,
            "priority": 10 // for MX records
          }
        }
      ],
      "warnings": ["any warnings or suggestions"],
      "confirmationMessage": "Message to show user before applying changes"
    }
    
    Common commands to understand:
    - "Set up email for Gmail/Outlook" → Create MX records
    - "Point to Vercel/Netlify" → Create A/CNAME records
    - "Add subdomain for blog" → Create CNAME record
    - "Enable email authentication" → Create SPF, DKIM, DMARC records
    - "Set up load balancing" → Multiple A records
    - "Redirect www to root" → CNAME record
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid response format from AI');
  } catch (error) {
    console.error('Dotty AI error:', error);
    throw error;
  }
}

async function executeDottyActions(actions, domain, zoneId) {
  const results = [];
  
  for (const action of actions) {
    try {
      let result;
      switch (action.type) {
        case 'create':
          result = await createDNSRecord(zoneId, action.record);
          break;
        case 'update':
          result = await updateDNSRecord(zoneId, action.record.id, action.record);
          break;
        case 'delete':
          result = await deleteDNSRecord(zoneId, action.record.id);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
      
      results.push({
        success: true,
        action: action.type,
        record: action.record,
        result
      });
    } catch (error) {
      results.push({
        success: false,
        action: action.type,
        record: action.record,
        error: error.message
      });
    }
  }
  
  return results;
}

module.exports = { processDottyCommand, executeDottyActions };