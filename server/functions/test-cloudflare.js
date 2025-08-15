// test-cloudflare.js
// Run this locally to test your Cloudflare credentials
// Usage: node test-cloudflare.js

const axios = require('axios');

const CLOUDFLARE_API_KEY = 'eca97f36f2d33f3225d70ba2de4ab6f20e50c';
const CLOUDFLARE_EMAIL = 'amanueldagnamyelew@gmail.com';
const DOMAIN = 'callitdns.com';

async function testCloudflareAccess() {
  console.log('Testing Cloudflare API access...\n');
  
  try {
    // Test 1: Verify credentials
    console.log('1. Testing credential validity...');
    const verifyResponse = await axios.get(
      'https://api.cloudflare.com/client/v4/user',
      {
        headers: {
          'X-Auth-Email': CLOUDFLARE_EMAIL,
          'X-Auth-Key': CLOUDFLARE_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (verifyResponse.data.success) {
      console.log('✅ Credentials are valid!');
      console.log(`   User: ${verifyResponse.data.result.email}`);
    } else {
      console.log('❌ Invalid credentials:', verifyResponse.data.errors);
      return;
    }
    
    // Test 2: List zones
    console.log('\n2. Listing your zones...');
    const zonesResponse = await axios.get(
      'https://api.cloudflare.com/client/v4/zones',
      {
        headers: {
          'X-Auth-Email': CLOUDFLARE_EMAIL,
          'X-Auth-Key': CLOUDFLARE_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (zonesResponse.data.success) {
      console.log('✅ Found zones:');
      zonesResponse.data.result.forEach(zone => {
        console.log(`   - ${zone.name} (ID: ${zone.id})`);
      });
    }
    
    // Test 3: Get specific zone
    console.log(`\n3. Looking for zone: ${DOMAIN}...`);
    const zoneResponse = await axios.get(
      `https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}`,
      {
        headers: {
          'X-Auth-Email': CLOUDFLARE_EMAIL,
          'X-Auth-Key': CLOUDFLARE_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (zoneResponse.data.success && zoneResponse.data.result.length > 0) {
      const zone = zoneResponse.data.result[0];
      console.log(`✅ Found zone: ${zone.name}`);
      console.log(`   Zone ID: ${zone.id}`);
      
      // Test 4: Get DNS records
      console.log('\n4. Fetching DNS records...');
      const recordsResponse = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${zone.id}/dns_records`,
        {
          headers: {
            'X-Auth-Email': CLOUDFLARE_EMAIL,
            'X-Auth-Key': CLOUDFLARE_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (recordsResponse.data.success) {
        console.log(`✅ Found ${recordsResponse.data.result.length} DNS records`);
        console.log('\n   First 5 records:');
        recordsResponse.data.result.slice(0, 5).forEach(record => {
          console.log(`   - ${record.type} ${record.name} -> ${record.content}`);
        });
      }
    } else {
      console.log(`❌ Zone ${DOMAIN} not found in your account`);
      console.log('   Make sure the domain is added to your Cloudflare account');
    }
    
    console.log('\n✅ All tests passed! Your credentials are working correctly.');
    
  } catch (error) {
    console.error('\n❌ Error testing Cloudflare API:');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(error.response.data)}`);
      
      if (error.response.status === 400) {
        console.error('\n   This usually means the API key format is invalid.');
        console.error('   Please check that you copied the entire key.');
      } else if (error.response.status === 403) {
        console.error('\n   This means the API key doesn\'t have the required permissions.');
      }
    } else {
      console.error(`   ${error.message}`);
    }
  }
}

// Run the test
testCloudflareAccess();