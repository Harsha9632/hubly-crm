const axios = require('axios');

async function testLogin() {
  try {
    console.log(' Testing Login API...\n');
    
    const response = await axios.post('http://localhost:8001/api/auth/login', {
      email: 'harsha@hubly.com',
      password: 'Admin123'
    });
    
    console.log(' Login successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log(' Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();