/**
 * k6 Stress Test: Tracking Endpoints
 * 
 * Tests /track/open and /track/click endpoints under high load
 * 
 * Usage:
 *   export API_URL=http://localhost:8080
 *   k6 run k6-tracking-stress.js
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js'

const errorRate = new Rate('errors')
const BASE_URL = __ENV.API_URL || 'http://localhost:8080'

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp up to 100 req/s
    { duration: '5m', target: 500 },   // Stay at 500 req/s (30k/min)
    { duration: '1m', target: 1000 },  // Spike to 1000 req/s
    { duration: '2m', target: 1000 },  // Sustain spike
    { duration: '1m', target: 500 },   // Back to normal
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<50'],  // 95% < 50ms
    'http_req_duration': ['p(99)<100'], // 99% < 100ms
    'errors': ['rate<0.0001'],          // Error rate < 0.01%
  },
}

// Helper to encode URL to base64
function encodeBase64(str) {
  return Buffer.from(str, 'utf-8').toString('base64')
}

export default function () {
  const messageId = `test-${randomString(10)}-${Date.now()}`
  
  // 60% open tracking, 40% click tracking
  const isOpen = Math.random() < 0.6
  
  let res
  if (isOpen) {
    // Open tracking
    res = http.get(`${BASE_URL}/track/open/${messageId}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (LoadTest) AppleWebKit/537.36',
      },
    })
  } else {
    // Click tracking
    const targetUrl = 'https://example.com/test'
    const encodedUrl = encodeBase64(targetUrl)
    res = http.get(`${BASE_URL}/track/click/${messageId}`, {
      params: { url: encodedUrl },
    })
  }

  const checkResult = check(res, {
    'tracking status is 200 or 302': (r) => [200, 302].includes(r.status),
    'tracking response time < 50ms': (r) => r.timings.duration < 50,
  })

  errorRate.add(!checkResult)
  
  if (!checkResult) {
    console.error(`Tracking failed: ${res.status} - ${res.body}`)
  }
  
  sleep(0.1) // 10 req/s per VU
}

