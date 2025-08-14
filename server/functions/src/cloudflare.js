// server/functions/src/cloudflare.js
const axios = require('axios');

const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4';

function getCloudflareConfig() {
  return {
    apiKey: process.env.CLOUDFLARE_API_KEY,
    email: process.env.CLOUDFLARE_EMAIL,
    zoneId: process.env.CLOUDFLARE_ZONE_ID
  };
}

async function getZoneId(domain) {
  const { apiKey, email } = getCloudflareConfig();
  
  if (!apiKey || !email) {
    throw new Error('Cloudflare credentials not configured. Please set CLOUDFLARE_API_KEY and CLOUDFLARE_EMAIL in environment variables.');
  }

  try {
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
    
    if (response.data.result.length > 0) {
      return response.data.result[0].id;
    }
    
    throw new Error(`Zone not found for domain: ${domain}`);
  } catch (error) {
    console.error('Error getting zone ID:', error);
    throw error;
  }
}

async function getDNSRecords(domain) {
  const { apiKey, email } = getCloudflareConfig();
  
  if (!apiKey || !email) {
    throw new Error('Cloudflare credentials not configured. Please set CLOUDFLARE_API_KEY and CLOUDFLARE_EMAIL in environment variables.');
  }
  
  try {
    const zoneId = await getZoneId(domain);
    
    const response = await axios.get(
      `${CLOUDFLARE_API_URL}/zones/${zoneId}/dns_records`,
      {
        headers: {
          'X-Auth-Email': email,
          'X-Auth-Key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.result;
  } catch (error) {
    console.error('Cloudflare API error:', error);
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