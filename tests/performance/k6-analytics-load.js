/**
 * k6 Load Test: Analytics Endpoints
 * 
 * Tests analytics queries under normal load
 * 
 * Usage:
 *   export API_URL=http://localhost:8080
 *   export TOKEN=your-jwt-token
 *   k6 run k6-analytics-load.js
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')
const BASE_URL = __ENV.API_URL || 'http://localhost:8080'
const TOKEN = __ENV.TOKEN || ''

export const options = {
  stages: [
    { duration: '2m', target: 20 },   // Ramp up
    { duration: '5m', target: 50 },  // Normal load (50 req/min)
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% < 500ms
    'http_req_duration': ['p(99)<1000'], // 99% < 1s
    'errors': ['rate<0.001'],
  },
}

const endpoints = [
  '/analytics/overview',
  '/analytics/timeline?range=7d',
  '/analytics/timeline?range=30d',
  '/analytics/timeline?range=90d',
  '/analytics/top-links?limit=10',
  '/analytics/events/recent?limit=25',
]

export default function () {
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
  }

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
  const res = http.get(`${BASE_URL}${endpoint}`, { headers })

  const checkResult = check(res, {
    'analytics status is 200': (r) => r.status === 200,
    'analytics response time < 500ms': (r) => r.timings.duration < 500,
    'analytics has data': (r) => {
      try {
        const body = JSON.parse(r.body)
        return body.data !== undefined
      } catch {
        return false
      }
    },
  })

  errorRate.add(!checkResult)
  
  if (!checkResult) {
    console.error(`Analytics failed: ${res.status} - ${res.body}`)
  }
  
  sleep(2) // ~30 req/min per VU
}

