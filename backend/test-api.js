const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing backend API...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test demo endpoint
    const demoResponse = await axios.get('http://localhost:3001/api/v1/recommendations/demo');
    console.log('✅ Demo endpoint:', demoResponse.data.message);
    
    console.log('\n🎉 Backend API is working correctly!');
    console.log('Frontend should be able to connect now.');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Solution: Make sure backend is running');
      console.log('Run: cd backend && npm run dev');
    }
  }
}

testAPI();