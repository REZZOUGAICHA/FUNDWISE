// test-rate-limiting.js
const axios = require('axios');

// Configuration
const API_GATEWAY_URL = 'http://localhost:3001';
const VERIFICATION_ENDPOINT = '/api/verification/pending';
const REQUESTS_TO_SEND = 15; // Number of requests to send (exceeds our limit of 10)
const DELAY_MS = 100; // Small delay between requests

// Helper to create a delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to send a single request and return the result
async function sendRequest(index) {
  const startTime = Date.now(); 
  try {
    console.log(`Sending request #${index+1}...`);
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExMTExMS1hYWFhLTRhYWEtYmJiYi0xMTExMTExMTExMTIiLCJyb2xlIjoiYXVkaXRvciIsImlhdCI6MTc0NzU2MTkxNSwiZXhwIjoxNzQ3NjQ4MzE1fQ.3K5wuPOyVczPX6ZwRnQFpDhGiwu3EQKEIjYsAO_tc3Y'; 
    const response = await axios.get(`${API_GATEWAY_URL}${VERIFICATION_ENDPOINT}`, {
        headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    const duration = Date.now() - startTime;
    return {
      index: index + 1,
      status: response.status,
      duration,
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      index: index + 1,
      status: error.response?.status,
      duration: Date.now() - startTime,
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Main function to run the test
async function runTest() {
  console.log(`Starting rate limit test against ${API_GATEWAY_URL}${VERIFICATION_ENDPOINT}`);
  console.log(`Sending ${REQUESTS_TO_SEND} requests with ${DELAY_MS}ms delay between them\n`);
  
  const results = [];
  
  // Send requests in sequence with a small delay
  for (let i = 0; i < REQUESTS_TO_SEND; i++) {
    const result = await sendRequest(i);
    results.push(result);
    
    // Log the result
    if (result.success) {
      console.log(`Request #${result.index}: Status ${result.status} (${result.duration}ms)`);
    } else {
      console.log(`Request #${result.index}: Status ${result.status} (${result.duration}ms) - ${JSON.stringify(result.error)}`);
    }
    
    // Add a small delay between requests
    if (i < REQUESTS_TO_SEND - 1) {
      await delay(DELAY_MS);
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const throttled = results.filter(r => r.status === 429).length;
  const otherErrors = results.filter(r => !r.success && r.status !== 429).length;
  
  console.log('\n--- TEST SUMMARY ---');
  console.log(`Total requests: ${REQUESTS_TO_SEND}`);
  console.log(`Successful responses: ${successful}`);
  console.log(`Throttled responses (429): ${throttled}`);
  console.log(`Other errors: ${otherErrors}`);
  
  if (throttled > 0) {
    console.log('\nRate limiting is working!');
  } else {
    console.log('\nNo requests were throttled. Rate limiting might not be working correctly.');
  }
}

// Run the test
runTest().catch(error => {
  console.error('Test failed:', error);
});