# MailBlast Test Suite

## Overview

This directory contains all test files for the MailBlast platform, including E2E tests, integration tests, performance tests, and security tests.

## Test Structure

```
tests/
├── e2e/              # End-to-end tests (Playwright)
├── integration/      # Integration tests
├── performance/      # Performance/load tests (k6)
├── security/         # Security validation tests
└── README.md         # This file
```

## Prerequisites

### E2E Tests (Playwright)

```bash
npm install -D @playwright/test
npx playwright install
```

### Performance Tests (k6)

```bash
# Install k6
brew install k6  # macOS
# or download from https://k6.io/docs/getting-started/installation/
```

## Running Tests

### E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/campaign-creation.spec.ts

# Run in UI mode
npx playwright test --ui

# Run in headed mode
npx playwright test --headed
```

### Performance Tests

```bash
# Set environment variables
export API_URL=http://localhost:8080
export TOKEN=your-jwt-token

# Run load test
k6 run tests/performance/load-test.js
```

### Security Tests

```bash
npx playwright test tests/security/
```

## Test Data

Test users and data are defined in `docs/qa-scenario-matrix.md`.

## CI/CD Integration

Tests are configured to run in CI/CD pipelines:

- **Smoke Tests**: Run on every PR
- **Full Regression**: Run before merge to main
- **Performance Tests**: Run weekly
- **Security Tests**: Run before production deployment

## Writing New Tests

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login, etc.
  })

  test('should do something', async ({ page }) => {
    // Test steps
    await page.goto('/path')
    await expect(page.locator('selector')).toBeVisible()
  })
})
```

### Performance Test Template

```javascript
import http from 'k6/http'
import { check } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 100 },
  ],
}

export default function () {
  const res = http.get('https://api.example.com/endpoint')
  check(res, {
    'status is 200': (r) => r.status === 200,
  })
}
```

## Test Coverage Goals

- **E2E Coverage**: 80% of critical user flows
- **Integration Coverage**: 70% of API endpoints
- **Performance**: All critical endpoints tested
- **Security**: All security checks validated

## Reporting

Test results are generated in:
- `playwright-report/` - HTML reports for E2E tests
- `k6-results/` - JSON/CSV results for performance tests

## Troubleshooting

### Tests failing locally

1. Ensure backend is running: `cd backend && go run cmd/server/main.go`
2. Ensure frontend is running: `cd frontend && npm run dev`
3. Check test data exists in database
4. Verify environment variables are set

### Performance tests timing out

1. Check API URL is correct
2. Verify token is valid
3. Reduce load if testing on local machine
4. Check backend resources (CPU, memory)

## Contributing

When adding new features:
1. Add corresponding E2E tests
2. Update test matrix in `docs/qa-scenario-matrix.md`
3. Ensure tests pass before submitting PR

