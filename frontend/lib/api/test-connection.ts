// Test connection to backend API
export async function testBackendConnection(): Promise<boolean> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.ok
  } catch (error) {
    console.error('Backend connection test failed:', error)
    return false
  }
}

