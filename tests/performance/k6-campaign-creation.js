/**
 * k6 Load Test: Campaign Creation API
 * 
 * Usage:
 *   export API_URL=http://localhost:8080
 *   export TOKEN=your-jwt-token
 *   k6 run k6-campaign-creation.js
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')
const BASE_URL = __ENV.API_URL || 'http://localhost:8080'
const TOKEN = __ENV.TOKEN || ''

export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<150'], // 95% of requests < 150ms
    'http_req_duration': ['p(99)<300'], // 99% of requests < 300ms
    'errors': ['rate<0.001'],           // Error rate < 0.1%
    'http_req_failed': ['rate<0.001'],
  },
}

export default function () {
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }

  // Create campaign
  const campaignPayload = JSON.stringify({
    name: `Load Test Campaign ${__VU}-${__ITER}`,
    subject: 'Load Test Subject',
    from_name: 'Test Sender',
    from_email: 'test@example.com',
    content: '<p>Test content for load testing</p>',
  })

  const res = http.post(`${BASE_URL}/campaigns`, campaignPayload, { headers })
  
  const checkResult = check(res, {
    'campaign created status is 201': (r) => r.status === 201,
    'campaign created response time < 200ms': (r) => r.timings.duration < 200,
    'campaign has ID': (r) => {
      try {
        const body = JSON.parse(r.body)
        return body.data && body.data.id
      } catch {
        return false
      }
    },
  })

  errorRate.add(!checkResult)
  
  if (!checkResult) {
    console.error(`Campaign creation failed: ${res.status} - ${res.body}`)
  }
  
  sleep(1)
}

