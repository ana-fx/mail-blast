/**
 * k6 Load Test Script for MailBlast API
 * Run: k6 run tests/performance/load-test.js
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests < 500ms
    'errors': ['rate<0.01'],            // Error rate < 1%
  },
}

const BASE_URL = __ENV.API_URL || 'http://localhost:8080'
const TOKEN = __ENV.TOKEN || ''

export default function () {
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }

  // Test 1: Analytics Overview
  const analyticsRes = http.get(`${BASE_URL}/analytics/overview`, { headers })
  const analyticsCheck = check(analyticsRes, {
    'analytics status is 200': (r) => r.status === 200,
    'analytics response time < 500ms': (r) => r.timings.duration < 500,
  })
  errorRate.add(!analyticsCheck)
  sleep(1)

  // Test 2: Campaigns List
  const campaignsRes = http.get(`${BASE_URL}/campaigns`, { headers })
  const campaignsCheck = check(campaignsRes, {
    'campaigns status is 200': (r) => r.status === 200,
    'campaigns response time < 500ms': (r) => r.timings.duration < 500,
  })
  errorRate.add(!campaignsCheck)
  sleep(1)

  // Test 3: Contacts List
  const contactsRes = http.get(`${BASE_URL}/contacts`, { headers })
  const contactsCheck = check(contactsRes, {
    'contacts status is 200': (r) => r.status === 200,
    'contacts response time < 1s': (r) => r.timings.duration < 1000,
  })
  errorRate.add(!contactsCheck)
  sleep(1)
}

