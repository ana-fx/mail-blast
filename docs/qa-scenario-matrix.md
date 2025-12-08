# QA Scenario Matrix - MailBlast Platform

**Version:** 1.0  
**Date:** 2025-01-XX  
**QA Engineer:** Senior QA Team  
**System:** MailBlast Email Marketing Platform (Backend Go + Frontend Next.js)

---

## Table of Contents

1. [E2E Test Matrix](#1-e2e-test-matrix)
2. [Edge Cases & Failure Scenarios](#2-edge-cases--failure-scenarios)
3. [Performance Tests](#3-performance-tests)
4. [Browser Compatibility](#4-browser-compatibility)
5. [Security Validation](#5-security-validation)
6. [Final QA Checklist](#6-final-qa-checklist)
7. [Test Data & Automation](#7-test-data--automation)

---

## 1. E2E Test Matrix

### 1.1 Authentication & RBAC

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|--------|
| AUTH-001 | Successful Login | 1. Navigate to `/login`<br>2. Enter valid email/password<br>3. Click "Sign In" | User redirected to `/dashboard`<br>JWT stored in memory<br>User data displayed in topbar | P0 | ⬜ |
| AUTH-002 | Failed Login (Invalid Credentials) | 1. Navigate to `/login`<br>2. Enter invalid email/password<br>3. Click "Sign In" | Error message displayed<br>User remains on login page<br>No JWT stored | P0 | ⬜ |
| AUTH-003 | Token Refresh Flow | 1. Login successfully<br>2. Wait for token near expiry<br>3. Make API call | Token automatically refreshed<br>Request succeeds<br>No logout triggered | P0 | ⬜ |
| AUTH-004 | Logged-Out Redirection | 1. Login successfully<br>2. Clear JWT from memory<br>3. Navigate to protected route | User redirected to `/login`<br>Previous route stored for redirect after login | P0 | ⬜ |
| AUTH-005 | Role Permissions - Admin | 1. Login as Admin<br>2. Navigate to `/admin/users`<br>3. Access `/settings/system` | All admin routes accessible<br>Admin UI elements visible | P0 | ⬜ |
| AUTH-006 | Role Permissions - Member | 1. Login as Member<br>2. Navigate to `/admin/users`<br>3. Access `/settings/system` | Redirected to `/dashboard` or shown "Access Denied"<br>Admin UI elements hidden | P0 | ⬜ |
| AUTH-007 | Protected Routes - Frontend | 1. Not logged in<br>2. Navigate to `/campaigns` | Redirected to `/login`<br>Route protected by `<Protected>` component | P0 | ⬜ |
| AUTH-008 | Protected Routes - Backend | 1. Make API call without JWT<br>2. Make API call with invalid JWT | Returns 401 Unauthorized<br>Frontend redirects to login | P0 | ⬜ |
| AUTH-009 | Session Timeout | 1. Login successfully<br>2. Wait for token expiry<br>3. Make API call | 401 received<br>User logged out<br>Redirected to login | P1 | ⬜ |
| AUTH-010 | Concurrent Login Sessions | 1. Login from Browser A<br>2. Login from Browser B (same user) | Both sessions active<br>Token refresh works independently | P2 | ⬜ |

### 1.2 Campaign Builder

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|--------|
| CAM-001 | Create Campaign - Full Flow | 1. Navigate to `/campaigns`<br>2. Click "Create Campaign"<br>3. Fill Step 1 (Details)<br>4. Fill Step 2 (Content)<br>5. Fill Step 3 (Audience)<br>6. Click "Finish & Schedule" | Campaign created in DB<br>Status: "draft" or "scheduled"<br>Redirected to campaign detail page | P0 | ⬜ |
| CAM-002 | Save Draft Campaign | 1. Start creating campaign<br>2. Fill Step 1 only<br>3. Navigate away | Campaign saved as draft<br>Can resume later<br>Data persisted in Zustand store | P0 | ⬜ |
| CAM-003 | Update Campaign | 1. Open existing campaign<br>2. Edit subject/content<br>3. Click "Save" | Campaign updated in DB<br>Changes reflected immediately<br>Updated timestamp changed | P0 | ⬜ |
| CAM-004 | Schedule Campaign | 1. Create campaign<br>2. Select "Schedule Later"<br>3. Set date/time<br>4. Click "Schedule" | Campaign status: "scheduled"<br>send_at field set<br>Appears in scheduled campaigns list | P0 | ⬜ |
| CAM-005 | Template Builder - Text Mode | 1. Open campaign editor<br>2. Select "Text Editor"<br>3. Type content<br>4. Save | Content saved as plain text<br>No HTML tags<br>Preview renders correctly | P0 | ⬜ |
| CAM-006 | Template Builder - HTML Mode | 1. Open campaign editor<br>2. Select "HTML Mode"<br>3. Enter HTML<br>4. Save | HTML sanitized<br>Unsafe tags removed<br>Content saved | P0 | ⬜ |
| CAM-007 | Template Builder - Variables | 1. Add variable `{{name}}`<br>2. Save template<br>3. Preview | Variable placeholder shown<br>Replaced with actual data on send | P1 | ⬜ |
| CAM-008 | Add Recipients - Manual | 1. Open campaign<br>2. Go to Audience step<br>3. Add email addresses manually<br>4. Save | Recipients added to campaign<br>Count displayed correctly<br>Duplicates prevented | P0 | ⬜ |
| CAM-009 | Add Recipients - Segment | 1. Open campaign<br>2. Go to Audience step<br>3. Select contact list/segment<br>4. Save | All contacts from segment added<br>Unsubscribed contacts excluded<br>Count matches segment size | P0 | ⬜ |
| CAM-010 | Validation - Missing Sender | 1. Create campaign<br>2. Leave "From Email" empty<br>3. Try to proceed | Validation error shown<br>Cannot proceed to next step<br>Field highlighted in red | P0 | ⬜ |
| CAM-011 | Validation - Missing Subject | 1. Create campaign<br>2. Leave "Subject" empty<br>3. Try to proceed | Validation error shown<br>Cannot proceed to next step | P0 | ⬜ |
| CAM-012 | Validation - Invalid Email | 1. Create campaign<br>2. Enter invalid "From Email"<br>3. Try to proceed | Validation error shown<br>Email format validated<br>Cannot proceed | P0 | ⬜ |
| CAM-013 | Duplicate Campaign | 1. Create campaign<br>2. Click "Duplicate"<br>3. Edit duplicate | New campaign created<br>Content copied<br>Status: "draft" | P1 | ⬜ |
| CAM-014 | Delete Campaign | 1. Open campaign<br>2. Click "Delete"<br>3. Confirm deletion | Campaign deleted from DB<br>Redirected to campaigns list<br>Success toast shown | P0 | ⬜ |
| CAM-015 | Campaign Preview | 1. Open campaign<br>2. Click "Preview"<br>3. Toggle mobile/desktop view | Preview modal opens<br>Content rendered correctly<br>Mobile view responsive | P1 | ⬜ |

### 1.3 Email Sending

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|--------|
| SEND-001 | Queue Worker Processing | 1. Create campaign<br>2. Click "Send Now"<br>3. Monitor queue status | Campaign status: "sending"<br>Queue worker picks up job<br>Emails sent progressively | P0 | ⬜ |
| SEND-002 | SES Success Response | 1. Send campaign<br>2. Monitor SES responses | Delivery events logged<br>Status updated to "delivered"<br>Analytics updated | P0 | ⬜ |
| SEND-003 | SES Soft Bounce | 1. Send to invalid email (soft bounce)<br>2. Monitor events | Bounce event logged<br>Contact status: "bounced"<br>Retry scheduled | P0 | ⬜ |
| SEND-004 | SES Hard Bounce | 1. Send to non-existent domain<br>2. Monitor events | Hard bounce logged<br>Contact status: "bounced"<br>No retry attempted | P0 | ⬜ |
| SEND-005 | Worker Retry Logic | 1. Send campaign<br>2. Simulate worker failure<br>3. Worker restarts | Failed jobs retried<br>Max retry limit enforced<br>Final status: "failed" if all retries fail | P0 | ⬜ |
| SEND-006 | Failed Delivery Tracking | 1. Send campaign<br>2. Some emails fail<br>3. Check campaign stats | Failed count displayed<br>Failed recipients listed<br>Error messages logged | P0 | ⬜ |
| SEND-007 | Bulk Send - 10k Emails | 1. Create campaign with 10k recipients<br>2. Send campaign<br>3. Monitor progress | Queue processes in batches<br>Progress bar updates<br>All emails sent within SLA | P1 | ⬜ |
| SEND-008 | Scheduled Send | 1. Schedule campaign for future<br>2. Wait for scheduled time<br>3. Monitor | Campaign auto-sends at scheduled time<br>Status changes to "sending"<br>Emails queued | P0 | ⬜ |
| SEND-009 | Cancel Scheduled Campaign | 1. Schedule campaign<br>2. Before send time, cancel<br>3. Verify | Campaign status: "draft"<br>send_at cleared<br>Not sent | P1 | ⬜ |
| SEND-010 | Rate Limiting | 1. Send multiple campaigns rapidly<br>2. Monitor API responses | Rate limit enforced<br>429 responses handled<br>Retry with backoff | P1 | ⬜ |

### 1.4 Tracking

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|--------|
| TRACK-001 | Open Pixel - First Load | 1. Send email<br>2. Open email in client<br>3. Check tracking | Pixel loaded<br>Open event logged<br>Timestamp recorded | P0 | ⬜ |
| TRACK-002 | Open Pixel - Multiple Opens | 1. Open email multiple times<br>2. Check events | Only one open event per day<br>Duplicate opens ignored<br>Idempotency working | P0 | ⬜ |
| TRACK-003 | Click Redirect | 1. Send email with link<br>2. Click link<br>3. Verify redirect | Redirected to target URL<br>Click event logged<br>URL tracked correctly | P0 | ⬜ |
| TRACK-004 | Click - Same URL Multiple Times | 1. Click same link multiple times<br>2. Check events | Only one click event per URL<br>Duplicate clicks ignored | P0 | ⬜ |
| TRACK-005 | Privacy Mode Browser (Apple Mail) | 1. Open email in Apple Mail<br>2. Check tracking | Pixel may not load<br>No error thrown<br>Graceful degradation | P1 | ⬜ |
| TRACK-006 | Open Redirect Prevention | 1. Try to use tracking URL with malicious redirect<br>2. Verify | Invalid URLs rejected<br>Only http/https allowed<br>No javascript: or data: allowed | P0 | ⬜ |
| TRACK-007 | Tracking Pixel Caching | 1. Open email<br>2. Refresh email view<br>3. Check events | Caching handled correctly<br>No duplicate events<br>Browser cache respected | P1 | ⬜ |
| TRACK-008 | Missing Message ID | 1. Access tracking endpoint without messageId<br>2. Verify | 404 or 400 error<br>No event logged<br>Error handled gracefully | P0 | ⬜ |
| TRACK-009 | SNS Webhook - Delivery | 1. Send email via SES<br>2. Receive SNS delivery event<br>3. Verify | Event processed<br>Status updated<br>No duplicate processing | P0 | ⬜ |
| TRACK-010 | SNS Webhook - Idempotency | 1. Receive same SNS event twice<br>2. Verify | Only one event logged<br>SNS MessageId used as key<br>Duplicate ignored | P0 | ⬜ |

### 1.5 Analytics

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|--------|
| ANAL-001 | Overview Metrics | 1. Navigate to `/analytics`<br>2. Check overview cards | All metrics displayed<br>Numbers accurate<br>Sparklines render | P0 | ⬜ |
| ANAL-002 | Timeline - Daily View | 1. Open analytics<br>2. Select "7d" range<br>3. Check chart | Daily data points shown<br>Chart renders correctly<br>Tooltip works | P0 | ⬜ |
| ANAL-003 | Timeline - Weekly View | 1. Select "30d" range<br>2. Check chart | Weekly aggregation<br>Data accurate<br>Performance acceptable | P0 | ⬜ |
| ANAL-004 | Timeline - Custom Range | 1. Select custom date range<br>2. Check chart | Custom range data loaded<br>Chart updates<br>Cache invalidated | P1 | ⬜ |
| ANAL-005 | Top Links Table | 1. Navigate to analytics<br>2. Check top links | Links sorted by click count<br>URLs truncated correctly<br>Clickable to view details | P0 | ⬜ |
| ANAL-006 | Cache Validity | 1. View analytics<br>2. Wait for cache TTL<br>3. Refresh | Data refreshed after TTL<br>Stale data not shown<br>Loading state displayed | P1 | ⬜ |
| ANAL-007 | Compare Before/After Open | 1. Send campaign<br>2. Check analytics before opens<br>3. Open emails<br>4. Check analytics after | Metrics update correctly<br>Open rate increases<br>Real-time updates work | P0 | ⬜ |
| ANAL-008 | Empty Analytics | 1. New account with no campaigns<br>2. Navigate to analytics | Empty state shown<br>Helpful message displayed<br>No errors | P1 | ⬜ |
| ANAL-009 | Large Dataset | 1. Account with 100k events<br>2. Load analytics | Query performs well<br>Pagination works<br>No timeout | P1 | ⬜ |
| ANAL-010 | Event Details Modal | 1. Click on event in feed<br>2. View modal | Full event details shown<br>Campaign info displayed<br>Recipient info shown | P1 | ⬜ |

### 1.6 Contacts / Audience

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|--------|
| CONT-001 | Create Contact | 1. Navigate to `/contacts`<br>2. Click "Add Contact"<br>3. Fill form<br>4. Save | Contact created<br>Appears in list<br>Status: "active" | P0 | ⬜ |
| CONT-002 | Import CSV | 1. Navigate to contacts<br>2. Click "Import CSV"<br>3. Upload file<br>4. Map fields<br>5. Import | Contacts imported<br>Success count shown<br>Errors reported<br>Duplicates handled | P0 | ⬜ |
| CONT-003 | Duplicate Detection | 1. Import CSV with duplicate emails<br>2. Verify | Duplicates detected<br>Only one contact created<br>Warning shown | P0 | ⬜ |
| CONT-004 | Segments - AND Rules | 1. Create segment with AND conditions<br>2. Add contacts to segment<br>3. Verify | Only contacts matching all conditions included<br>Filter works correctly | P0 | ⬜ |
| CONT-005 | Segments - OR Rules | 1. Create segment with OR conditions<br>2. Add contacts to segment<br>3. Verify | Contacts matching any condition included<br>Filter works correctly | P0 | ⬜ |
| CONT-006 | Bulk Delete | 1. Select multiple contacts<br>2. Click "Delete Selected"<br>3. Confirm | Selected contacts deleted<br>Success message shown<br>List updated | P0 | ⬜ |
| CONT-007 | Contact Search | 1. Navigate to contacts<br>2. Enter search term<br>3. Verify | Results filtered<br>Search works in real-time<br>Case-insensitive | P0 | ⬜ |
| CONT-008 | Contact Status Filter | 1. Filter by status (e.g., "bounced")<br>2. Verify | Only contacts with that status shown<br>Filter persists<br>Count accurate | P0 | ⬜ |
| CONT-009 | Virtual Scrolling | 1. Load 10k+ contacts<br>2. Scroll list<br>3. Verify | Virtual scrolling active<br>Performance smooth<br>All contacts accessible | P1 | ⬜ |
| CONT-010 | Contact Detail View | 1. Click on contact<br>2. View detail sidebar | Contact info displayed<br>Events shown<br>Lists shown<br>Actions available | P0 | ⬜ |

### 1.7 Automation Flows

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|--------|
| AUTO-001 | Trigger Accuracy | 1. Create automation with trigger<br>2. Trigger event occurs<br>3. Verify | Automation fires correctly<br>Trigger condition met<br>Action executed | P0 | ⬜ |
| AUTO-002 | Time Delays | 1. Create automation with delay<br>2. Trigger automation<br>3. Wait for delay<br>4. Verify | Delay respected<br>Action executed after delay<br>Timing accurate | P0 | ⬜ |
| AUTO-003 | Condition Branches | 1. Create automation with if/else<br>2. Trigger with condition true<br>3. Trigger with condition false | Correct branch executed<br>Conditions evaluated correctly | P0 | ⬜ |
| AUTO-004 | Multiple Active Workflows | 1. Create multiple automations<br>2. Trigger all<br>3. Verify | All workflows execute<br>No conflicts<br>Each workflow independent | P1 | ⬜ |
| AUTO-005 | Automation Pause/Resume | 1. Pause automation<br>2. Trigger event<br>3. Resume automation<br>4. Trigger event | Paused: No execution<br>Resumed: Execution works | P1 | ⬜ |

### 1.8 Settings

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|--------|
| SET-001 | Update SMTP Settings | 1. Navigate to `/settings/system`<br>2. Update SMTP config<br>3. Save<br>4. Send test email | Settings saved<br>Test email sent successfully<br>Config validated | P0 | ⬜ |
| SET-002 | Update Sending Identity | 1. Update "From Email"<br>2. Update "From Name"<br>3. Save | Settings saved<br>Used in new campaigns<br>Validation works | P0 | ⬜ |
| SET-003 | Admin-Only Restrictions | 1. Login as Member<br>2. Try to access `/settings/system` | Access denied<br>Redirected or shown error<br>Settings not editable | P0 | ⬜ |
| SET-004 | Test Email Validation | 1. Update SMTP<br>2. Click "Test Email"<br>3. Verify | Test email sent<br>Success/error shown<br>Connection validated | P0 | ⬜ |
| SET-005 | Tracking Settings | 1. Toggle open tracking<br>2. Toggle click tracking<br>3. Save | Settings saved<br>Tracking enabled/disabled<br>Applied to new campaigns | P0 | ⬜ |

---

## 2. Edge Cases & Failure Scenarios

### 2.1 Network & Connectivity

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|--------|
| EDGE-001 | Network Loss Mid-Campaign | 1. Start creating campaign<br>2. Disconnect network<br>3. Try to save | Error message shown<br>Data preserved in store<br>Retry option available | P0 | ⬜ |
| EDGE-002 | API 401 During Refresh | 1. Token expires<br>2. Refresh fails (401)<br>3. Verify | User logged out<br>Redirected to login<br>No infinite loop | P0 | ⬜ |
| EDGE-003 | Slow Network | 1. Throttle network to 3G<br>2. Load dashboard<br>3. Verify | Loading states shown<br>No crashes<br>Data loads eventually | P1 | ⬜ |
| EDGE-004 | Request Timeout | 1. Make API call<br>2. Simulate timeout<br>3. Verify | Timeout error shown<br>Retry option available<br>User-friendly message | P0 | ⬜ |

### 2.2 Race Conditions & Concurrency

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|--------|
| EDGE-005 | Campaign Duplicate Submission | 1. Click "Send" twice rapidly<br>2. Verify | Only one send job created<br>Idempotency key prevents duplicates<br>No duplicate emails sent | P0 | ⬜ |
| EDGE-006 | Concurrent Campaign Updates | 1. User A edits campaign<br>2. User B edits same campaign<br>3. Both save | Last write wins<br>Conflict handled<br>No data corruption | P1 | ⬜ |
| EDGE-007 | Multiple Tab Sessions | 1. Open app in multiple tabs<br>2. Perform actions in each<br>3. Verify | Each tab independent<br>Token refresh works<br>No conflicts | P1 | ⬜ |

### 2.3 Worker & Queue Failures

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|-------- |
| EDGE-008 | Worker Crash Mid-Event | 1. Send campaign<br>2. Kill worker process<br>3. Restart worker | Failed jobs retried<br>No data loss<br>Queue state preserved | P0 | ⬜ |
| EDGE-009 | Queue Overflow | 1. Queue 100k jobs<br>2. Monitor worker<br>3. Verify | Queue processes correctly<br>No memory leaks<br>Performance acceptable | P1 | ⬜ |
| EDGE-010 | Dead Letter Queue | 1. Create job that always fails<br>2. Exceed retry limit<br>3. Verify | Job moved to DLQ<br>Admin notified<br>Can manually retry | P1 | ⬜ |

### 2.4 Data Validation & Corruption

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|--------|
| EDGE-011 | Malformed Tracking Link | 1. Create link with invalid URL<br>2. Click link<br>3. Verify | Invalid URL rejected<br>Error handled<br>No redirect to malicious site | P0 | ⬜ |
| EDGE-012 | Corrupted CSV Upload | 1. Upload CSV with corrupted rows<br>2. Import<br>3. Verify | Valid rows imported<br>Errors reported<br>Corrupted rows skipped<br>Error log provided | P0 | ⬜ |
| EDGE-013 | Invalid HTML in Template | 1. Enter malformed HTML<br>2. Save template<br>3. Verify | HTML sanitized<br>Invalid tags removed<br>Template saves<br>Preview works | P0 | ⬜ |
| EDGE-014 | XSS in Email Content | 1. Add `<script>alert('XSS')</script>`<br>2. Send email<br>3. Verify | Script sanitized<br>No XSS executed<br>Content safe | P0 | ⬜ |
| EDGE-015 | SQL Injection Attempt | 1. Try SQL injection in search<br>2. Verify | Input sanitized<br>No SQL executed<br>Safe query used | P0 | ⬜ |

### 2.5 Boundary Conditions

| Scenario ID | Test Case | Steps | Expected Result | Priority | Status |
|------------|-----------|-------|-----------------|----------|--------|
| EDGE-016 | Empty Campaign List | 1. New account<br>2. Navigate to campaigns | Empty state shown<br>"Create Campaign" button visible<br>No errors | P1 | ⬜ |
| EDGE-017 | Maximum Recipients | 1. Try to add 1M recipients<br>2. Verify | Validation prevents or warns<br>Performance acceptable<br>Or pagination used | P1 | ⬜ |
| EDGE-018 | Very Long Subject Line | 1. Enter 500-char subject<br>2. Save<br>3. Verify | Validation or truncation<br>Email clients handle correctly<br>No errors | P1 | ⬜ |
| EDGE-019 | Special Characters | 1. Use emojis, unicode in content<br>2. Send email<br>3. Verify | Characters preserved<br>Encoding correct<br>Email renders properly | P1 | ⬜ |

---

## 3. Performance Tests

### 3.1 Load Tests

| Test ID | Scenario | Load | Metrics | Target | Status |
|---------|----------|------|---------|--------|--------|
| PERF-001 | Campaign List - 10k Campaigns | 10,000 campaigns | p95 latency < 500ms<br>Memory < 500MB<br>Error rate < 0.1% | ✅ | ⬜ |
| PERF-002 | Contacts List - 100k Entries | 100,000 contacts | Virtual scrolling active<br>p95 latency < 1s<br>Memory < 1GB | ✅ | ⬜ |
| PERF-003 | Bulk Send - 50k Emails | 50,000 emails | Queue processes in < 1 hour<br>No worker crashes<br>Memory stable | ✅ | ⬜ |
| PERF-004 | Tracking Endpoint - 5k req/min | 5,000 requests/minute | p95 latency < 100ms<br>Error rate < 0.01%<br>No database locks | ✅ | ⬜ |
| PERF-005 | Analytics Query Stress | 1M events, complex query | Query completes < 2s<br>Cache hit rate > 80%<br>No timeout | ✅ | ⬜ |

### 3.2 Stress Tests

| Test ID | Scenario | Stress Level | Expected Behavior | Status |
|---------|----------|--------------|-------------------|--------|
| PERF-006 | Concurrent Campaign Creation | 100 concurrent users | All campaigns created<br>No data corruption<br>Response time acceptable | ⬜ |
| PERF-007 | Rapid API Calls | 1000 calls/second | Rate limiting active<br>No server crash<br>Graceful degradation | ⬜ |
| PERF-008 | Large CSV Import | 100k rows | Import completes<br>Progress shown<br>No memory leak | ⬜ |

### 3.3 Memory & Resource Tests

| Test ID | Scenario | Duration | Expected | Status |
|---------|----------|----------|----------|--------|
| PERF-009 | Long-Running Worker | 24 hours | Memory stable<br>No leaks<br>Queue processes correctly | ⬜ |
| PERF-010 | Frontend Memory | 8 hours usage | Memory stable<br>No leaks<br>Performance maintained | ⬜ |

---

## 4. Browser Compatibility

### 4.1 Desktop Browsers

| Browser | Version | Test Areas | Status | Notes |
|---------|---------|------------|--------|-------|
| Chrome | Latest stable | All features | ⬜ | Primary browser |
| Safari | Latest stable | All features | ⬜ | WebKit specific |
| Firefox | Latest stable | All features | ⬜ | Gecko engine |
| Edge | Latest stable | All features | ⬜ | Chromium-based |

### 4.2 Mobile Browsers

| Browser | Version | Test Areas | Status | Notes |
|---------|---------|------------|--------|-------|
| iOS Safari | Latest | Responsive layout, touch | ⬜ | Privacy mode testing |
| Android Chrome | Latest | Responsive layout, touch | ⬜ | Standard testing |

### 4.3 Specific Test Cases

| Test ID | Feature | Browsers | Expected | Status |
|---------|---------|----------|----------|--------|
| BROWSER-001 | Drag & Drop Builder | All | Works in all browsers<br>Touch support on mobile | ⬜ |
| BROWSER-002 | File Upload (CSV) | All | File picker works<br>Upload succeeds | ⬜ |
| BROWSER-003 | Date/Time Picker | All | Native or custom picker works | ⬜ |
| BROWSER-004 | Email Preview | All | Renders correctly<br>Mobile toggle works | ⬜ |
| BROWSER-005 | Charts (Recharts) | All | Charts render<br>Tooltips work | ⬜ |

---

## 5. Security Validation

### 5.1 Authentication & Authorization

| Test ID | Security Check | Steps | Expected | Status |
|---------|----------------|-------|----------|--------|
| SEC-001 | JWT in Memory Only | 1. Login<br>2. Check localStorage<br>3. Check sessionStorage | No JWT in storage<br>Only in memory | ⬜ |
| SEC-002 | Sensitive Data Storage | 1. Check all storage APIs<br>2. Verify | No sensitive data stored<br>Only UI state | ⬜ |
| SEC-003 | XSS Prevention | 1. Inject script in input<br>2. Verify | Script sanitized<br>Not executed | ⬜ |
| SEC-004 | CSRF Protection | 1. Make POST request<br>2. Verify headers | CSRF token or SameSite cookie<br>Request validated | ⬜ |
| SEC-005 | CORS Enforcement | 1. Request from unauthorized origin<br>2. Verify | CORS error<br>Request blocked | ⬜ |
| SEC-006 | Role-Based Route Protection | 1. Try to access admin route as member<br>2. Verify | Access denied<br>Redirected or error shown | ⬜ |
| SEC-007 | Tracking Endpoint Abuse | 1. Try malicious redirect<br>2. Verify | Invalid URLs rejected<br>Only http/https allowed | ⬜ |
| SEC-008 | SQL Injection | 1. Try SQL in search<br>2. Verify | Input sanitized<br>Parameterized queries used | ⬜ |
| SEC-009 | JWT Expiry | 1. Wait for token expiry<br>2. Make request | 401 received<br>User logged out | ⬜ |
| SEC-010 | Password Security | 1. Check password requirements<br>2. Verify | Strong password enforced<br>Hashed in DB | ⬜ |

---

## 6. Final QA Checklist

### 6.1 UI Consistency

- [ ] All pages use consistent layout (Sidebar + Topbar)
- [ ] Color scheme consistent across pages
- [ ] Typography consistent (font sizes, weights)
- [ ] Spacing consistent (padding, margins)
- [ ] Button styles consistent
- [ ] Form styles consistent
- [ ] Card styles consistent
- [ ] Modal/Dialog styles consistent

### 6.2 Loading, Empty, Error States

- [ ] All data-fetching pages have loading states
- [ ] All empty states have helpful messages
- [ ] All error states have retry buttons
- [ ] Skeleton loaders match content layout
- [ ] Error messages are user-friendly
- [ ] Network errors handled gracefully

### 6.3 Responsive Design

- [ ] Mobile breakpoint (375px) tested
- [ ] Tablet breakpoint (768px) tested
- [ ] Desktop breakpoint (1024px+) tested
- [ ] Sidebar collapses on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Forms stack vertically on mobile
- [ ] Touch targets ≥ 44px on mobile

### 6.4 Animations & Transitions

- [ ] Page transitions smooth (Framer Motion)
- [ ] No janky animations
- [ ] Loading spinners smooth
- [ ] Modal open/close animations
- [ ] Reduced motion respected
- [ ] No animation on slow devices

### 6.5 API & Network

- [ ] All API calls have error handling
- [ ] Retry logic works
- [ ] Request cancellation works
- [ ] Timeout handling works
- [ ] Offline state handled
- [ ] Loading states during API calls

### 6.6 Accessibility (A11y)

- [ ] Keyboard navigation works
- [ ] Focus rings visible
- [ ] ARIA labels present
- [ ] Screen reader tested
- [ ] Color contrast AA compliant
- [ ] Skip navigation works
- [ ] Alt text for images

### 6.7 Performance

- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse Best Practices ≥ 90
- [ ] Lighthouse SEO ≥ 90
- [ ] Initial bundle < 200KB
- [ ] Code splitting works
- [ ] Images optimized
- [ ] Fonts optimized

### 6.8 Browser & Device

- [ ] Chrome tested
- [ ] Safari tested
- [ ] Firefox tested
- [ ] Edge tested
- [ ] iOS Safari tested
- [ ] Android Chrome tested
- [ ] Tablet tested
- [ ] Mobile tested

---

## 7. Test Data & Automation

### 7.1 Test Data

#### Users
```json
{
  "admin": {
    "email": "admin@mailblast.test",
    "password": "Admin123!@#",
    "role": "admin"
  },
  "member": {
    "email": "member@mailblast.test",
    "password": "Member123!@#",
    "role": "member"
  }
}
```

#### Campaigns
- 10 test campaigns (various statuses)
- 1 campaign with 10k recipients
- 1 scheduled campaign
- 1 draft campaign

#### Contacts
- 1000 test contacts
- Various statuses (active, bounced, unsubscribed)
- Multiple lists/segments

#### CSV Import Sample
```csv
email,first_name,last_name,status
test1@example.com,John,Doe,active
test2@example.com,Jane,Smith,active
```

### 7.2 Automation Scripts

#### Playwright E2E Tests

```typescript
// Example: Campaign Creation Test
test('Create Campaign Flow', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'admin@mailblast.test')
  await page.fill('[name="password"]', 'Admin123!@#')
  await page.click('button[type="submit"]')
  
  await page.goto('/campaigns')
  await page.click('text=Create Campaign')
  
  // Step 1
  await page.fill('[name="name"]', 'Test Campaign')
  await page.fill('[name="subject"]', 'Test Subject')
  await page.click('text=Next')
  
  // Step 2
  await page.fill('[contenteditable="true"]', 'Test content')
  await page.click('text=Next')
  
  // Step 3
  await page.selectOption('[name="listId"]', { index: 0 })
  await page.click('text=Finish & Schedule')
  
  await expect(page.locator('text=Test Campaign')).toBeVisible()
})
```

#### Cypress Alternative

```javascript
describe('Campaign Creation', () => {
  it('creates a campaign successfully', () => {
    cy.visit('/login')
    cy.get('[name="email"]').type('admin@mailblast.test')
    cy.get('[name="password"]').type('Admin123!@#')
    cy.get('button[type="submit"]').click()
    
    cy.visit('/campaigns')
    cy.contains('Create Campaign').click()
    
    // Fill form and verify
    cy.get('[name="name"]').type('Test Campaign')
    cy.contains('Next').click()
    // ... continue
  })
})
```

### 7.3 Performance Test Scripts

#### Load Test (k6)

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const res = http.get('https://api.mailblast.test/analytics/overview', {
    headers: { 'Authorization': 'Bearer ' + __ENV.TOKEN },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### 7.4 Test Execution Plan

1. **Smoke Tests** (30 min)
   - Critical paths only
   - Run before each deployment

2. **Regression Tests** (2 hours)
   - Full test matrix
   - Run before major releases

3. **Performance Tests** (1 hour)
   - Load and stress tests
   - Run weekly

4. **Security Tests** (1 hour)
   - Security validation suite
   - Run before production

5. **Browser Tests** (2 hours)
   - Cross-browser compatibility
   - Run before major releases

---

## 8. Test Execution Log

| Date | Test Suite | Executed By | Passed | Failed | Notes |
|------|------------|-------------|--------|--------|-------|
| YYYY-MM-DD | Smoke Tests | QA Team | X/Y | X/Y | - |
| YYYY-MM-DD | Regression | QA Team | X/Y | X/Y | - |

---

## 9. Known Issues & Limitations

| Issue ID | Description | Severity | Status | Workaround |
|----------|-------------|----------|--------|------------|
| - | - | - | - | - |

---

**Document Status:** ✅ Ready for QA Execution  
**Last Updated:** 2025-01-XX  
**Next Review:** After UAT

