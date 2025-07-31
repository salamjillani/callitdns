// Save this as test-gemini.js in your server/functions directory
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Your API key
const API_KEY = 'AIzaSyCKYBAPVNr1X82pKc_LT8el8snla4PTN6s';

async function testGemini() {
  try {
    console.log('Testing Gemini API key...');
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Say hello in one sentence');
    const response = await result.response;
    const text = response.text();
    
    console.log('Success! Gemini response:', text);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('API key not valid')) {
      console.log('\nYour API key is invalid. Please create a new one.');
    } else if (error.message.includes('PROJECT_NUMBER')) {
      console.log('\nThe API key is from a different project.');
    }
  }
}

testGemini();