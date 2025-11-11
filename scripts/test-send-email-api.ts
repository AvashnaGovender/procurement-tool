async function testSendEmailAPI() {
  try {
    console.log('Testing /api/send-email endpoint...')
    
    const response = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'agovender@theinnoverse.co.za',
        subject: 'Test Email from API',
        content: 'This is a test email to verify the API works.',
        supplierName: 'Test Supplier',
        businessType: 'Test Business'
      })
    })
    
    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('Response text (first 500 chars):', responseText.substring(0, 500))
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(responseText)
        console.log('✅ JSON response:', jsonData)
      } catch (e) {
        console.log('❌ Response is not JSON')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testSendEmailAPI()





