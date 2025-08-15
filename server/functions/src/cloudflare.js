// server/functions/src/cloudflare.js
const axios = require('axios');

const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4';

function getCloudflareConfig() {
  // TEMPORARY HARDCODED FALLBACK - Remove after fixing
  const config = {
    apiKey: process.env.CLOUDFLARE_API_KEY || 'eca97f36f2d33f3225d70ba2de4ab6f20e50c',
    email: process.env.CLOUDFLARE_EMAIL || 'amanueldagnamyelew@gmail.com',
    zoneId: process.env.CLOUDFLARE_ZONE_ID || '04afc7b35b0d74949591940dc43cc0eb'
  };
  
  console.log('=== CLOUDFLARE CONFIG DEBUG ===');
  console.log('Raw env CLOUDFLARE_API_KEY:', process.env.CLOUDFLARE_API_KEY);
  console.log('Raw env CLOUDFLARE_EMAIL:', process.env.CLOUDFLARE_EMAIL);
  console.log('Config after fallback:', {
    hasApiKey: !!config.apiKey,
    apiKeyLength: config.apiKey?.length,
    apiKeyFirst5: config.apiKey?.substring(0, 5),
    apiKeyLast5: config.apiKey?.slice(-5),
    email: config.email
  });
  console.log('=== END CONFIG DEBUG ===');
  
  return config;
}

async function getZoneId(domain) {
  const { apiKey, email, zoneId } = getCloudflareConfig();
  
  // Use hardcoded zone ID for callitdns.com to bypass the issue
  if (domain === 'callitdns.com' && zoneId) {
    console.log(`Using hardcoded zone ID for ${domain}: ${zoneId}`);
    return zoneId;
  }
  
  if (!apiKey || !email) {
    throw new Error('Cloudflare credentials not configured. Please set CLOUDFLARE_API_KEY and CLOUDFLARE_EMAIL in environment variables.');
  }

  try {
    console.log(`Getting zone ID for domain: ${domain}`);
    console.log('Using credentials:', {
      email: email,
      apiKeyLength: apiKey.length,
      apiKeyPreview: `${apiKey.substring(0, 5)}...${apiKey.slice(-5)}`
    });
    
    const response = await axios.get(
      `${CLOUDFLARE_API_URL}/zones?name=${domain}`,
      {
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Cloudflare API Response:', {
      status: response.status,
      success: response.data.success,
      errors: response.data.errors
    });
    
    if (response.data.result.length > 0) {
      return response.data.result[0].id;
    }
    
    throw new Error(`Zone not found for domain: ${domain}`);
  } catch (error) {
    console.error('Error getting zone ID. Full error:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      // Log the actual headers being sent
      console.error('Request headers that failed:', {
        'X-Auth-Email': email,
        'X-Auth-Key': apiKey ? `${apiKey.substring(0, 5)}...` : 'MISSING'
      });
    }
    
    throw error;
  }
}

async function getDNSRecords(domain) {
  const { apiKey, email, zoneId } = getCloudflareConfig();
  
  if (!apiKey || !email) {
    throw new Error('Cloudflare credentials not configured');
  }
  
  try {
    // For callitdns.com, use the hardcoded zone ID directly
    let zoneIdToUse = zoneId;
    if (domain !== 'callitdns.com' || !zoneId) {
      zoneIdToUse = await getZoneId(domain);
    }
    
    console.log(`Fetching DNS records for zone: ${zoneIdToUse}`);
    
    const response = await axios.get(
      `${CLOUDFLARE_API_URL}/zones/${zoneIdToUse}/dns_records`,
      {
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`Successfully fetched ${response.data.result.length} DNS records`);
    return response.data.result;
  } catch (error) {
    console.error('Cloudflare API error:', error.response?.data || error.message);
    throw new Error('Failed to fetch DNS records from Cloudflare');
  }
}

async function createDNSRecord(zoneId, record) {
  const { apiKey, email } = getCloudflareConfig();
  
  if (!apiKey || !email) {
    throw new Error('Cloudflare credentials not configured');
  }

  const response = await axios.post(
    `${CLOUDFLARE_API_URL}/zones/${zoneId}/dns_records`,
    record,
    {
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.result;
}

async function updateDNSRecord(zoneId, recordId, record) {
  const { apiKey, email } = getCloudflareConfig();
  
  if (!apiKey || !email) {
    throw new Error('Cloudflare credentials not configured');
  }

  const response = await axios.put(
    `${CLOUDFLARE_API_URL}/zones/${zoneId}/dns_records/${recordId}`,
    record,
    {
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.result;
}

async function deleteDNSRecord(zoneId, recordId) {
  const { apiKey, email } = getCloudflareConfig();
  
  if (!apiKey || !email) {
    throw new Error('Cloudflare credentials not configured');
  }

  const response = await axios.delete(
    `${CLOUDFLARE_API_URL}/zones/${zoneId}/dns_records/${recordId}`,
    {
      headers: {
        'X-Auth-Email': email,
        'X-Auth-Key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data.result;
}

module.exports = { 
  getDNSRecords, 
  getZoneId, 
  createDNSRecord, 
  updateDNSRecord, 
  deleteDNSRecord 
};