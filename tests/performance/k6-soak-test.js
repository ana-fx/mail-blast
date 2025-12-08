/**
 * k6 Soak Test: Long-Duration Stability
 * 
 * Tests system stability over 12 hours
 * 
 * Usage:
 *   export API_URL=http://localhost:8080
 *   export TOKEN=your-jwt-token
 *   k6 run --duration 12h k6-soak-test.js
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const errorRate = new Rate('errors')
const responseTime = new Trend('response_time')
const BASE_URL = __ENV.API_URL || 'http://localhost:8080'
const TOKEN = __ENV.TOKEN || ''

export const options = {
  stages: [
    { duration: '10m', target: 50 },   // Ramp up
    { duration: '11h50m', target: 50 }, // Sustain for 12 hours
    { duration: '10m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<200'], // 95% < 200ms
    'errors': ['rate<0.001'],           // Error rate < 0.1%
    'http_req_failed': ['rate<0.001'],
  },
}

const endpoints = [
  { method: 'GET', path: '/campaigns' },
  { method: 'GET', path: '/analytics/overview' },
  { method: 'GET', path: '/contacts' },
  { method: 'POST', path: '/campaigns', body: {
    name: `Soak Test ${Date.now()}`,
    subject: 'Soak Test',
    from_name: 'Test',
    from_email: 'test@example.com',
  }},
]

export default function () {
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
  
  let res
  if (endpoint.method === 'POST') {
    res = http.post(
      `${BASE_URL}${endpoint.path}`,
      JSON.stringify(endpoint.body),
      { headers }
    )
  } else {
    res = http.get(`${BASE_URL}${endpoint.path}`, { headers })
  }

  responseTime.add(res.timings.duration)

  const checkResult = check(res, {
    'status is 200 or 201': (r) => [200, 201].includes(r.status),
    'response time < 500ms': (r) => r.timings.duration < 500,
  })

  errorRate.add(!checkResult)
  
  if (!checkResult) {
    console.error(`Request failed: ${res.status} - ${res.body}`)
  }
  
  sleep(Math.random() * 3 + 1) // Random sleep 1-4 seconds
}

