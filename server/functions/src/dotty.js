// server/functions/src/dotty.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createDNSRecord, updateDNSRecord, deleteDNSRecord, getZoneId } = require('./cloudflare');

async function processDottyCommand(command, domain, existingRecords) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in environment variables.');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are Dotty, an AI DNS assistant. Convert the following natural language command into DNS record operations.
    
    User Command: "${command}"
    Domain: "${domain}"
    Current DNS Records: ${JSON.stringify(existingRecords, null, 2)}
    
    IMPORTANT RULES:
    1. To modify MX records, you must DELETE existing ones first, then CREATE new ones
    2. Never use "update" for MX records - always use "delete" then "create"
    3. Include the record ID from existingRecords when deleting
    4. For creating records, do NOT include an ID field
    
    Analyze the command and return a JSON response with the following structure:
    {
      "interpretation": "What you understood from the command",
      "actions": [
        {
          "type": "create|delete",
          "record": {
            "id": "record-id-here", // ONLY for delete actions
            "type": "A|AAAA|CNAME|MX|TXT|NS|SOA|PTR",
            "name": "subdomain or @ for root or full domain",
            "content": "value",
            "ttl": 3600,
            "priority": 10, // for MX records
            "proxied": false // for A/AAAA/CNAME records
          }
        }
      ],
      "warnings": ["any warnings or suggestions"],
      "confirmationMessage": "Message to show user before applying changes"
    }
    
    Common commands to understand:
    - "Set up email for Gmail/Outlook" → Delete existing MX records, then create new MX records
    - "Point to Vercel/Netlify" → Create/update A/CNAME records
    - "Add subdomain for blog" → Create CNAME record
    - "Enable email authentication" → Create SPF, DKIM, DMARC records
    - "Set up load balancing" → Multiple A records
    - "Redirect www to root" → CNAME record
    
    For Gmail setup, use these MX records:
    - aspmx.l.google.com (priority: 1)
    - alt1.aspmx.l.google.com (priority: 5)
    - alt2.aspmx.l.google.com (priority: 5)
    - alt3.aspmx.l.google.com (priority: 10)
    - alt4.aspmx.l.google.com (priority: 10)
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
  
  console.log(`Executing ${actions.length} actions for domain ${domain}`);
  
  for (const action of actions) {
    try {
      let result;
      
      console.log(`Executing action: ${action.type}`, action.record);
      
      switch (action.type) {
        case 'create':
          // Ensure record has correct structure for creation
          const createRecord = {
            type: action.record.type,
            name: action.record.name === '@' ? domain : action.record.name,
            content: action.record.content,
            ttl: action.record.ttl || 3600,
            proxied: action.record.proxied || false
          };
          
          // Add priority for MX records
          if (action.record.type === 'MX') {
            createRecord.priority = action.record.priority;
          }
          
          console.log('Creating record:', createRecord);
          result = await createDNSRecord(zoneId, createRecord);
          break;
          
        case 'update':
          // This should rarely be used - prefer delete + create
          if (!action.record.id) {
            throw new Error('Record ID required for update action');
          }
          result = await updateDNSRecord(zoneId, action.record.id, action.record);
          break;
          
        case 'delete':
          if (!action.record.id) {
            throw new Error('Record ID required for delete action');
          }
          console.log(`Deleting record with ID: ${action.record.id}`);
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
      console.error(`Error executing ${action.type} action:`, error.message);
      results.push({
        success: false,
        action: action.type,
        record: action.record,
        error: error.message
      });
    }
  }
  
  console.log(`Completed ${results.length} actions`);
  return results;
}

module.exports = { processDottyCommand, executeDottyActions };