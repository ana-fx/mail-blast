# User Acceptance Testing (UAT) Script
## MailBlast Email Marketing Platform

**Version:** 1.0  
**Date:** 2025-01-XX  
**Prepared By:** Senior QA Lead  
**Status:** Ready for UAT Execution

---

## Table of Contents

1. [High-Level UAT Plan](#1-high-level-uat-plan)
2. [Detailed UAT Scenarios](#2-detailed-uat-scenarios)
3. [Acceptance Criteria Matrix](#3-acceptance-criteria-matrix)
4. [UAT Test Data](#4-uat-test-data)
5. [UAT Sign-off Requirements](#5-uat-sign-off-requirements)

---

## 1. High-Level UAT Plan

### 1.1 Objectives

The purpose of this User Acceptance Testing is to validate that the MailBlast email marketing platform meets business requirements and is ready for internal use. This UAT will verify:

- All core email marketing workflows function correctly
- Campaign creation and sending processes work as expected
- Contact management and segmentation features are operational
- Email tracking and analytics provide accurate insights
- System settings and user management are functional
- The platform is stable and reliable for daily operations

### 1.2 Roles Involved

| Role | Responsibility |
|------|---------------|
| **UAT Lead** | Coordinates testing, tracks progress, reports results |
| **Business Users** | Execute test scenarios, validate functionality |
| **Admin Users** | Test administrative features (user management, settings) |
| **Technical Support** | Assist with technical issues during testing |
| **Product Owner** | Review results and provide final sign-off |

### 1.3 Scope & Exclusions

#### ✅ In Scope

- User authentication and login
- Campaign creation and management
- Email content builder (basic editor)
- Contact management and import
- Contact segments/lists
- Campaign sending workflow (review, confirm, queue)
- Email tracking (opens and clicks)
- Analytics dashboard
- System settings (SMTP, sender identities)
- User profile management
- User and role management (Admin only)

#### ❌ Out of Scope

- Public-facing pages
- Customer self-service features
- Billing and subscription management
- External customer signup
- Drag-and-drop email builder (if not available)
- Advanced automation workflows
- Third-party integrations

### 1.4 Entry Criteria

Before UAT can begin, the following must be completed:

- [ ] All development work completed
- [ ] Internal QA testing passed
- [ ] Test environment configured and accessible
- [ ] Test data prepared and loaded
- [ ] User accounts created for testers
- [ ] Documentation available
- [ ] Known issues documented

### 1.5 Exit Criteria

UAT will be considered complete when:

- [ ] All critical scenarios (UAT-01 to UAT-13) executed
- [ ] At least 90% of scenarios pass
- [ ] No blocking defects remain
- [ ] All acceptance criteria met
- [ ] UAT sign-off obtained from Product Owner
- [ ] Test results documented

---

## 2. Detailed UAT Scenarios

### UAT-01: Login

**Purpose:** Verify users can successfully log in to the platform.

**Preconditions:**
- User account exists in the system
- Valid email and password credentials available
- Browser access to the platform URL

**Step-by-Step Actions:**
1. Navigate to the login page
2. Enter your email address in the email field
3. Enter your password in the password field
4. Click the "Sign In" button
5. Observe the system response

**Expected Result:**
- User is successfully logged in
- User is redirected to the Dashboard page
- User's name appears in the top navigation bar
- No error messages are displayed

**Acceptance Criteria:**
- Login completes within 3 seconds
- Dashboard loads correctly after login
- User session remains active during use

---

### UAT-02: Create Campaign

**Purpose:** Verify users can create a new email campaign with all required information.

**Preconditions:**
- User is logged in
- User has permission to create campaigns

**Step-by-Step Actions:**
1. Click on "Campaigns" in the left sidebar
2. Click the "Create Campaign" button
3. On Step 1, fill in the following:
   - Campaign Name: "UAT Test Campaign"
   - Subject: "Welcome to Our Newsletter"
   - From Name: "MailBlast Team"
   - From Email: "noreply@mailblast.test"
   - Reply-To Email: "support@mailblast.test"
4. Click "Next" to proceed to Step 2
5. On Step 2, enter email content: "This is a test email for UAT validation."
6. Click "Next" to proceed to Step 3
7. On Step 3, select a contact list from the dropdown
8. Select "Schedule for later" option
9. Choose a date and time (tomorrow at 10:00 AM)
10. Click "Finish & Schedule"

**Expected Result:**
- Campaign is created successfully
- Campaign appears in the campaigns list with status "Scheduled"
- Campaign details are saved correctly
- User is redirected to the campaign detail page

**Acceptance Criteria:**
- All campaign information is saved accurately
- Campaign can be found in the campaigns list
- Scheduled time is displayed correctly

---

### UAT-03: Edit Campaign

**Purpose:** Verify users can modify an existing campaign before sending.

**Preconditions:**
- User is logged in
- At least one draft or scheduled campaign exists

**Step-by-Step Actions:**
1. Navigate to the Campaigns page
2. Find and click on an existing campaign (draft or scheduled)
3. Click the "Edit" button
4. Modify the campaign subject to "Updated: Welcome to Our Newsletter"
5. Update the email content to "This is the updated content for UAT."
6. Click "Save Changes"
7. Return to the campaign detail page

**Expected Result:**
- Campaign is updated successfully
- Changes are reflected immediately
- Updated timestamp is shown
- Campaign status remains unchanged (draft/scheduled)

**Acceptance Criteria:**
- All edits are saved correctly
- Previous content is replaced with new content
- No data loss occurs during editing

---

### UAT-04: Send Campaign Preview

**Purpose:** Verify users can preview how the email will appear before sending.

**Preconditions:**
- User is logged in
- A campaign with content exists

**Step-by-Step Actions:**
1. Navigate to an existing campaign
2. Click the "Preview Email" button
3. Review the email preview in the modal window
4. Toggle between "Desktop View" and "Mobile View"
5. Verify the email content, subject, and sender information
6. Close the preview modal

**Expected Result:**
- Email preview opens in a modal window
- Email content displays correctly
- Subject and sender information are shown
- Desktop and mobile views toggle correctly
- Preview matches the actual email content

**Acceptance Criteria:**
- Preview renders accurately
- Mobile view is responsive
- All content is visible and formatted correctly

---

### UAT-05: Queue Campaign

**Purpose:** Verify users can send a campaign and monitor its sending progress.

**Preconditions:**
- User is logged in
- A campaign with content and audience is ready
- Campaign is in "Draft" or "Scheduled" status

**Step-by-Step Actions:**
1. Navigate to a campaign ready to send
2. Click the "Send Campaign" button
3. Review the campaign summary in the confirmation modal:
   - Verify subject line
   - Verify recipient count
   - Verify sender information
4. Read the confirmation message
5. Click "Confirm Send" in the modal
6. Observe the system response
7. Navigate to the campaign queue status page
8. Monitor the sending progress

**Expected Result:**
- Confirmation modal appears with campaign details
- Campaign is queued for sending after confirmation
- Success message: "Campaign queued for sending" is displayed
- Campaign status changes to "Sending"
- Queue status page shows:
  - Total recipients
  - Number of emails queued
  - Number of emails sent
  - Number of emails failed
  - Progress percentage
- Progress updates in real-time (every 3 seconds)

**Acceptance Criteria:**
- Campaign is queued successfully
- Progress tracking works accurately
- Status updates reflect current sending state
- No emails are lost during sending

---

### UAT-06: Import Contacts

**Purpose:** Verify users can import contacts from a CSV file.

**Preconditions:**
- User is logged in
- A CSV file with contact data is prepared (see Test Data section)
- User has permission to import contacts

**Step-by-Step Actions:**
1. Navigate to the Contacts page
2. Click the "Import CSV" button
3. Click "Choose File" or drag and drop the CSV file
4. Wait for the file to upload
5. Review the field mapping:
   - Map "Email" column to Email field
   - Map "First Name" column to First Name field
   - Map "Last Name" column to Last Name field
6. Review the preview of first 5 rows
7. Click "Import Contacts"
8. Wait for the import to complete
9. Review the import results

**Expected Result:**
- File uploads successfully
- Field mapping interface appears
- Preview shows correct data
- Import completes successfully
- Success message shows number of contacts imported
- Imported contacts appear in the contacts list
- Duplicate contacts are handled (not imported twice)
- Invalid rows are reported with errors

**Acceptance Criteria:**
- All valid contacts are imported
- Duplicates are detected and handled
- Invalid data is reported but doesn't block import
- Import completes within reasonable time (< 5 minutes for 1000 contacts)

---

### UAT-07: Create Segment

**Purpose:** Verify users can create contact segments/lists for targeted campaigns.

**Preconditions:**
- User is logged in
- Contacts exist in the system

**Step-by-Step Actions:**
1. Navigate to the Contacts page
2. Click on "Lists" or "Segments" tab
3. Click "Create List" button
4. Enter list name: "UAT Test Segment"
5. Enter description (optional): "Test segment for UAT validation"
6. Click "Create List"
7. After list is created, click "Add Contacts"
8. Search for contacts or select from the list
9. Select multiple contacts using checkboxes
10. Click "Add to List"
11. Verify contacts are added

**Expected Result:**
- List is created successfully
- List appears in the lists page
- Contacts can be added to the list
- List shows correct contact count
- List can be used when creating campaigns

**Acceptance Criteria:**
- List is saved and can be found
- Contact count is accurate
- List can be selected in campaign audience step

---

### UAT-08: Send Campaign Live

**Purpose:** Verify the complete end-to-end workflow of sending a campaign to real recipients.

**Preconditions:**
- User is logged in
- A campaign is created with content
- A contact list with at least 5 test email addresses exists
- SMTP settings are configured

**Step-by-Step Actions:**
1. Create a new campaign (follow UAT-02 steps 1-6)
2. On Step 3, select the test contact list
3. Select "Send Now" option
4. Click "Finish & Send Now"
5. Review and confirm in the confirmation modal
6. Click "Confirm Send"
7. Navigate to the queue status page
8. Wait for campaign to complete sending
9. Check your test email inbox
10. Open the received email
11. Verify email content matches campaign content
12. Check sender information (From Name and From Email)

**Expected Result:**
- Campaign is sent successfully
- All recipients receive the email
- Email content matches what was created
- Sender information is correct
- Email is delivered to inbox (not spam)
- Campaign status changes to "Sent" when complete

**Acceptance Criteria:**
- All test emails are received
- Email content is accurate
- Sender information is correct
- Delivery is timely (within 5 minutes for small list)

---

### UAT-09: Track Opens

**Purpose:** Verify the system accurately tracks when emails are opened.

**Preconditions:**
- User is logged in
- A campaign has been sent (from UAT-08)
- Test email has been received

**Step-by-Step Actions:**
1. Open the test email in your email client
2. Wait for the email to fully load (tracking pixel loads)
3. Navigate to the Analytics page in MailBlast
4. Find the campaign in the analytics dashboard
5. Check the "Opens" metric
6. Verify the open count increased
7. Navigate to the campaign detail page
8. Check the "Open Rate" statistic

**Expected Result:**
- Email open is tracked when email is opened
- Open count increases in analytics
- Open rate is calculated correctly
- Open tracking works across different email clients
- Multiple opens from same recipient are handled (counted once per day)

**Acceptance Criteria:**
- Open is tracked within 30 seconds of opening email
- Analytics show accurate open count
- Open rate calculation is correct
- Privacy mode email clients handled gracefully (no errors)

---

### UAT-10: Track Clicks

**Purpose:** Verify the system accurately tracks when links in emails are clicked.

**Preconditions:**
- User is logged in
- A campaign has been sent with at least one link
- Test email has been received

**Step-by-Step Actions:**
1. Open the test email
2. Find a link in the email content
3. Click on the link
4. Observe the redirect behavior
5. Verify you are redirected to the target URL
6. Navigate to the Analytics page in MailBlast
7. Find the campaign in analytics
8. Check the "Clicks" metric
9. Verify the click count increased
10. Navigate to "Top Clicked Links" section
11. Verify the clicked URL appears in the list

**Expected Result:**
- Link click is tracked when link is clicked
- User is redirected to the correct target URL
- Click count increases in analytics
- Clicked link appears in top links list
- Click rate is calculated correctly
- Multiple clicks on same link are handled (counted once per URL)

**Acceptance Criteria:**
- Click is tracked immediately
- Redirect works correctly
- Analytics show accurate click count
- Top links list is accurate

---

### UAT-11: View Campaign Analytics

**Purpose:** Verify users can view comprehensive analytics for their campaigns.

**Preconditions:**
- User is logged in
- At least one campaign has been sent
- Campaign has some opens and clicks (from UAT-09 and UAT-10)

**Step-by-Step Actions:**
1. Navigate to the Analytics page
2. Review the Overview Cards:
   - Total Sent
   - Total Delivered
   - Total Opened
   - Total Clicked
   - Open Rate
   - Click Rate
3. Review the Timeline Chart
4. Change the date range (7 days, 30 days, 90 days)
5. Review the Top Clicked Links table
6. Review the Recent Events feed
7. Click on a campaign to view detailed analytics
8. Review campaign-specific metrics

**Expected Result:**
- All overview cards display accurate numbers
- Timeline chart shows data points correctly
- Date range changes update the chart
- Top links table shows clicked URLs
- Recent events feed shows latest activity
- Campaign detail analytics are accurate
- All metrics match expected values

**Acceptance Criteria:**
- Analytics load within 3 seconds
- All numbers are accurate
- Charts render correctly
- Data updates reflect recent activity
- No calculation errors

---

### UAT-12: Update Settings

**Purpose:** Verify users can update system settings including SMTP configuration and sender identities.

**Preconditions:**
- User is logged in
- User has Admin role (for system settings)
- SMTP credentials are available

**Step-by-Step Actions:**

**A. Update SMTP Settings:**
1. Navigate to Settings → System Settings
2. Scroll to "Email Provider" section
3. Update SMTP configuration:
   - SMTP Host
   - SMTP Port
   - SMTP Username
   - SMTP Password
4. Click "Test Connection"
5. Verify test email is sent successfully
6. Click "Save Settings"

**B. Update Sender Identity:**
1. Navigate to Settings → System Settings
2. Find "Default Sender" section
3. Update:
   - Default From Email
   - Default From Name
   - Reply-To Email
4. Click "Save Settings"

**C. Update User Profile:**
1. Navigate to Settings → Profile
2. Update your name
3. Update your email (if allowed)
4. Click "Save Changes"

**Expected Result:**
- SMTP settings are saved successfully
- Test email is sent and received
- Sender identity is updated
- New sender identity is used in new campaigns
- User profile is updated
- Changes are reflected immediately

**Acceptance Criteria:**
- All settings save correctly
- Test email functionality works
- Changes apply to new campaigns
- No errors occur during save

---

### UAT-13: Manage Users & Roles

**Purpose:** Verify administrators can manage users and assign roles.

**Preconditions:**
- User is logged in with Admin role
- User management feature is accessible

**Step-by-Step Actions:**

**A. View Users:**
1. Navigate to Admin → Users
2. Review the users list
3. Verify columns: Email, Name, Role, Status, Last Login
4. Use search to find a specific user

**B. Create New User:**
1. Click "Add User" button
2. Fill in:
   - Full Name: "UAT Test User"
   - Email: "uat-test@mailblast.test"
   - Password: "Test123!@#"
   - Role: "Member"
3. Click "Create User"
4. Verify user appears in the list

**C. Edit User:**
1. Find a user in the list
2. Click "Edit" button
3. Change the user's role to "Editor"
4. Click "Save Changes"
5. Verify role is updated

**D. Disable User:**
1. Find a user in the list
2. Click "Disable" button
3. Confirm the action
4. Verify user status changes to "Disabled"
5. Verify disabled user cannot log in

**Expected Result:**
- Users list displays all users correctly
- New user can be created
- User details can be edited
- User role changes are saved
- Disabled users cannot access the system
- Search functionality works

**Acceptance Criteria:**
- All user management actions work correctly
- Role changes take effect immediately
- Disabled users are properly restricted
- No unauthorized access occurs

---

## 3. Acceptance Criteria Matrix

| Scenario ID | Scenario Name | Expected Result | Pass/Fail | Notes |
|-------------|---------------|-----------------|-----------|-------|
| UAT-01 | Login | User successfully logs in and sees dashboard | ⬜ | |
| UAT-02 | Create Campaign | Campaign created with all details saved correctly | ⬜ | |
| UAT-03 | Edit Campaign | Campaign edits are saved and reflected immediately | ⬜ | |
| UAT-04 | Send Campaign Preview | Email preview displays correctly in desktop and mobile views | ⬜ | |
| UAT-05 | Queue Campaign | Campaign is queued and progress tracking works | ⬜ | |
| UAT-06 | Import Contacts | Contacts imported successfully with duplicates handled | ⬜ | |
| UAT-07 | Create Segment | Segment created and contacts added successfully | ⬜ | |
| UAT-08 | Send Campaign Live | Campaign sent and all test emails received | ⬜ | |
| UAT-09 | Track Opens | Email opens are tracked accurately in analytics | ⬜ | |
| UAT-10 | Track Clicks | Link clicks are tracked and redirects work correctly | ⬜ | |
| UAT-11 | View Campaign Analytics | Analytics dashboard shows accurate metrics and charts | ⬜ | |
| UAT-12 | Update Settings | SMTP, sender identity, and profile settings save correctly | ⬜ | |
| UAT-13 | Manage Users & Roles | User management functions work correctly | ⬜ | |

**Instructions:** Mark each scenario as ✅ Pass or ❌ Fail. Add notes for any issues, deviations, or observations.

---

## 4. UAT Test Data

### 4.1 Sample Contact CSV

**File:** `uat-contacts.csv`

```csv
email,first_name,last_name,status
test1@mailblast.test,John,Doe,active
test2@mailblast.test,Jane,Smith,active
test3@mailblast.test,Bob,Johnson,active
test4@mailblast.test,Alice,Williams,active
test5@mailblast.test,Charlie,Brown,active
invalid-email,Invalid,User,active
test1@mailblast.test,Duplicate,Contact,active
```

**Usage Notes:**
- Contains 7 rows: 5 valid, 1 invalid email, 1 duplicate
- Use for UAT-06 (Import Contacts) testing
- Invalid row should be reported but not block import
- Duplicate should be detected and handled

### 4.2 Sample Campaign Content

**Campaign Name:** UAT Test Campaign

**Subject:** Welcome to MailBlast - UAT Testing

**From Name:** MailBlast Team

**From Email:** noreply@mailblast.test

**Reply-To:** support@mailblast.test

**Email Content:**
```
Hello,

This is a test email for User Acceptance Testing.

Please click the link below to verify tracking:
[Click Here](https://example.com/test-link)

Thank you for participating in UAT.

Best regards,
MailBlast Team
```

**Usage Notes:**
- Use for UAT-02, UAT-03, UAT-08
- Contains a test link for click tracking (UAT-10)

### 4.3 Sample Sender Identity

**Default From Email:** noreply@mailblast.test

**Default From Name:** MailBlast

**Reply-To Email:** support@mailblast.test

**SMTP Configuration:**
- Host: smtp.mailblast.test (use actual SMTP server)
- Port: 587
- Username: [Your SMTP username]
- Password: [Your SMTP password]

### 4.4 Demo URLs and Tracking Links

**Test Link in Email:**
- Original URL: `https://example.com/test-link`
- Tracking URL: `https://mailblast.test/track/click/{messageId}?url={encoded}`

**Expected Behavior:**
- Click redirects to original URL
- Click is tracked in analytics
- Redirect happens within 1 second

### 4.5 Expected Test Open/Click Behavior

**Test Email Addresses:**
- test1@mailblast.test
- test2@mailblast.test
- test3@mailblast.test
- test4@mailblast.test
- test5@mailblast.test

**Expected Results After Sending:**
- 5 emails sent
- 5 emails delivered (assuming valid addresses)
- Opens: Open each email once = 5 opens
- Clicks: Click link in 3 emails = 3 clicks
- Open Rate: 100% (5/5)
- Click Rate: 60% (3/5)

**Tracking Validation:**
- Each open should be tracked within 30 seconds
- Each click should be tracked immediately
- Analytics should reflect accurate counts
- Multiple opens from same email should count as 1 per day
- Multiple clicks on same link should count as 1 per URL

---

## 5. UAT Sign-off Requirements

### 5.1 Functional Validation

**Requirement:** All core functionalities must work as specified.

**Validation:**
- [ ] Login and authentication work correctly
- [ ] Campaign creation and editing function properly
- [ ] Email sending workflow completes successfully
- [ ] Contact management features are operational
- [ ] Analytics provide accurate data
- [ ] Settings can be updated and saved
- [ ] User management functions correctly (Admin only)

**Sign-off Criteria:** ✅ All items checked

---

### 5.2 Tracking Accuracy

**Requirement:** Email tracking must be accurate and reliable.

**Validation:**
- [ ] Open tracking records opens correctly
- [ ] Click tracking records clicks correctly
- [ ] Tracking data appears in analytics
- [ ] Metrics calculations are accurate
- [ ] No duplicate tracking events
- [ ] Privacy mode email clients handled gracefully

**Sign-off Criteria:** ✅ All items checked, tracking accuracy > 95%

---

### 5.3 Data Integrity

**Requirement:** All data must be stored and retrieved correctly.

**Validation:**
- [ ] Campaign data is saved accurately
- [ ] Contact data is imported correctly
- [ ] Segments maintain correct contact lists
- [ ] Analytics data is consistent
- [ ] No data loss during operations
- [ ] No data corruption observed

**Sign-off Criteria:** ✅ All items checked, no data integrity issues

---

### 5.4 UI Consistency

**Requirement:** User interface must be consistent and user-friendly.

**Validation:**
- [ ] Navigation works consistently across pages
- [ ] Buttons and links function correctly
- [ ] Forms validate input properly
- [ ] Error messages are clear and helpful
- [ ] Success messages appear when appropriate
- [ ] Loading states are shown during operations
- [ ] Mobile view is responsive (if tested)

**Sign-off Criteria:** ✅ All items checked, UI is consistent

---

### 5.5 No Blocking Defects

**Requirement:** No critical defects that prevent core functionality.

**Validation:**
- [ ] No system crashes during testing
- [ ] No data loss incidents
- [ ] No security vulnerabilities observed
- [ ] No performance issues that block usage
- [ ] All critical paths are functional
- [ ] Error handling works correctly

**Sign-off Criteria:** ✅ No blocking defects, all critical issues resolved

---

### 5.6 Final UAT Sign-off

**UAT Completion Summary:**

| Category | Status | Notes |
|----------|--------|-------|
| Functional Validation | ⬜ | |
| Tracking Accuracy | ⬜ | |
| Data Integrity | ⬜ | |
| UI Consistency | ⬜ | |
| No Blocking Defects | ⬜ | |

**Overall UAT Status:** ⬜ **PASS** / ⬜ **FAIL**

**Sign-off:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| UAT Lead | | | |
| Business User Representative | | | |
| Admin User Representative | | | |
| Product Owner | | | |

**Notes and Observations:**

```
[Space for additional notes, issues found, recommendations, etc.]
```

---

## 6. UAT Execution Guidelines

### 6.1 Before Starting

1. **Environment Setup:**
   - Ensure test environment is accessible
   - Verify all test accounts are created
   - Confirm test data is loaded

2. **Preparation:**
   - Review this UAT script
   - Prepare test data files
   - Set up test email accounts
   - Have SMTP credentials ready

3. **Communication:**
   - Notify team of UAT start
   - Establish communication channel for issues
   - Schedule daily check-ins

### 6.2 During Testing

1. **Execution:**
   - Follow scenarios in order (UAT-01 to UAT-13)
   - Document all results in Acceptance Criteria Matrix
   - Take screenshots of issues
   - Note any deviations from expected results

2. **Issue Reporting:**
   - Document issues immediately
   - Include steps to reproduce
   - Attach screenshots if applicable
   - Prioritize issues (Critical, High, Medium, Low)

3. **Progress Tracking:**
   - Update matrix daily
   - Track completion percentage
   - Report blockers immediately

### 6.3 After Testing

1. **Documentation:**
   - Complete Acceptance Criteria Matrix
   - Compile issue list
   - Prepare UAT summary report

2. **Review:**
   - Review all results with team
   - Discuss any concerns
   - Make recommendations

3. **Sign-off:**
   - Obtain required signatures
   - Finalize UAT report
   - Archive test results

---

## 7. UAT Issue Log Template

| Issue ID | Scenario | Severity | Description | Steps to Reproduce | Status |
|----------|----------|----------|-------------|-------------------|--------|
| UAT-001 | UAT-XX | Critical/High/Medium/Low | [Description] | [Steps] | Open/Resolved/Closed |

---

**Document Status:** ✅ Ready for UAT Execution  
**Last Updated:** 2025-01-XX  
**Next Steps:** Begin UAT execution following this script

