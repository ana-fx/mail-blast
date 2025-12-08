# UAT Test Data and Resources

This directory contains test data and resources for User Acceptance Testing.

## Files

- **uat-contacts.csv** - Sample contact data for import testing
- **uat-issue-log.md** - Template for tracking UAT issues

## Test Data Usage

### Contact CSV Import

Use `uat-contacts.csv` for UAT-06 (Import Contacts) testing.

**File Contents:**
- 5 valid contacts
- 1 invalid email (for error handling test)
- 1 duplicate email (for duplicate detection test)

**Expected Results:**
- 5 contacts imported successfully
- 1 invalid row reported with error
- 1 duplicate detected and handled

## Test Accounts

### Admin User
- **Email:** admin@mailblast.test
- **Password:** [Provided separately]
- **Role:** Admin

### Member User
- **Email:** member@mailblast.test
- **Password:** [Provided separately]
- **Role:** Member

## Test Email Addresses

Use these addresses for testing email delivery and tracking:

- test1@mailblast.test
- test2@mailblast.test
- test3@mailblast.test
- test4@mailblast.test
- test5@mailblast.test

**Note:** These should be real email addresses that you can access to verify delivery and tracking.

## SMTP Configuration

For UAT-12 (Update Settings), use your test SMTP server:

- **Host:** [Your SMTP host]
- **Port:** 587
- **Username:** [Your SMTP username]
- **Password:** [Your SMTP password]

## Tracking Test Links

When creating test campaigns, include this link for click tracking:

```
https://example.com/test-link
```

This link will be tracked when clicked, allowing you to verify UAT-10 (Track Clicks).

## UAT Execution

1. Review the main UAT script: `docs/uat-acceptance-script.md`
2. Use test data from this directory
3. Log issues in `uat-issue-log.md`
4. Complete the Acceptance Criteria Matrix
5. Obtain sign-off from stakeholders

