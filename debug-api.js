// Debug API client
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('API_BASE_URL would be:', process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1");

// Test the exact same call that the frontend makes
const axios = require('axios');

const testFrontendAPICall = async () => {
  try {
    console.log('Testing frontend-style API call...');
    
    const client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const response = await client.post("/auth/register", {
      firstName: "Test",
      lastName: "User",
      email: "debug@example.com",
      password: "password123"
    });

    console.log('Frontend-style call successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Frontend-style call failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Request URL:', error.config?.url);
      console.error('Request Method:', error.config?.method);
      console.error('Base URL:', error.config?.baseURL);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testFrontendAPICall();
