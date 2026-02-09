# Production Smoke Test - Draft Version 47

## Overview
This document provides a step-by-step smoke test script to validate the core functionality of the Safran Test Bench Management System after deploying Draft Version 47 to production.

## Prerequisites

- Production URL: `https://<frontend-canister-id>.ic0.app`
- Internet Identity account (or create new during test)
- Modern browser (Chrome, Firefox, Safari, or Edge)
- Browser console open for error monitoring

## Test Environment Setup

1. **Clear Browser State**
   - Clear all cookies and local storage for the production domain
   - Open browser in incognito/private mode (recommended)
   - Open developer console (F12) to monitor for errors

2. **Navigate to Application**
   - Go to production URL
   - Verify page loads without console errors
   - Confirm you see the Sign In page

## Test Suite

### Test 1: Internet Identity Sign-In Flow

**Objective**: Verify users can authenticate via Internet Identity

**Steps**:
1. On the Sign In page, click the "Sign In" button
2. Verify redirect to Internet Identity service (`identity.ic0.app`)
3. Complete Internet Identity authentication:
   - For new users: Create new Internet Identity anchor
   - For existing users: Enter anchor number and authenticate
4. Verify redirect back to the application
5. Confirm you are redirected to the Dashboard page (not Sign In page)

**Expected Results**:
- ✅ Sign In button is clickable and triggers II flow
- ✅ Redirect to Internet Identity service succeeds
- ✅ Authentication completes without errors
- ✅ Redirect back to application succeeds
- ✅ User lands on Dashboard page after successful login
- ✅ No console errors during the entire flow

**Failure Indicators**:
- ❌ "Actor not available" error
- ❌ Stuck on Sign In page after authentication
- ❌ Console errors mentioning "Internet Identity" or "authentication"
- ❌ Infinite redirect loop

**Record Results**:
- [ ] Pass / [ ] Fail
- **Notes**: _____________________________________________
- **Console Errors** (if any): _____________________________________________
- **Failed Network Requests** (if any): _____________________________________________

---

### Test 2: Protected Route Access (AuthGate)

**Objective**: Verify authenticated users can access protected routes

**Steps**:
1. After successful sign-in, verify you are on the Dashboard page
2. Navigate to Profile page (click user menu → Profile)
3. Navigate to Benches page (click "Benches" in navigation)
4. Navigate back to Dashboard
5. Verify all pages load without redirecting to Sign In

**Expected Results**:
- ✅ Dashboard page loads and displays content
- ✅ Profile page loads and displays user profile form
- ✅ Benches page loads and displays bench list (may be empty)
- ✅ Navigation between protected routes works smoothly
- ✅ No unexpected redirects to Sign In page
- ✅ No console errors during navigation

**Failure Indicators**:
- ❌ Redirect to Sign In page when accessing protected routes
- ❌ Blank pages or loading spinners that never resolve
- ❌ "Unauthorized" or "Access denied" errors
- ❌ Console errors mentioning "AuthGate" or "authentication"

**Record Results**:
- [ ] Pass / [ ] Fail
- **Notes**: _____________________________________________
- **Console Errors** (if any): _____________________________________________
- **Failed Network Requests** (if any): _____________________________________________

---

### Test 3: User Profile Setup and Persistence

**Objective**: Verify user profile can be created and persists across sessions

**Steps**:
1. Navigate to Profile page
2. If this is a new user (first login with this principal):
   - Verify profile setup modal appears
   - Fill in required fields:
     - Username: `TestUser_[timestamp]`
     - Email: `testuser@safrangroup.com`
     - Entity: `Test Entity`
   - Click "Save" button
   - Verify modal closes and profile is saved
3. If profile already exists:
   - Verify existing profile data is displayed
   - Update username to `TestUser_Updated_[timestamp]`
   - Click "Save Changes" button
   - Verify success message appears
4. Perform a **full page refresh** (F5 or Ctrl+R)
5. Verify profile data is still displayed (not lost)
6. Navigate away to Dashboard, then back to Profile
7. Verify profile data persists

**Expected Results**:
- ✅ Profile setup modal appears for new users
- ✅ Profile form is pre-filled for existing users
- ✅ Save/Save Changes button works without errors
- ✅ Success message appears after saving
- ✅ Profile data persists after full page refresh
- ✅ Profile data persists when navigating away and back
- ✅ No console errors during save operation

**Failure Indicators**:
- ❌ Profile setup modal doesn't appear for new users
- ❌ Profile setup modal appears every time (not persisting)
- ❌ Save button doesn't work or shows errors
- ❌ Profile data is lost after page refresh
- ❌ Console errors mentioning "profile" or "saveCallerUserProfile"
- ❌ Email validation fails for valid `@safrangroup.com` email

**Record Results**:
- [ ] Pass / [ ] Fail
- **Notes**: _____________________________________________
- **Console Errors** (if any): _____________________________________________
- **Failed Network Requests** (if any): _____________________________________________

---

### Test 4: Logout and Re-Login Flow

**Objective**: Verify logout clears cached data and re-login retrieves persisted profile

**Steps**:
1. While logged in, note your current username from Profile page
2. Click the "Sign Out" button (in header or user menu)
3. Verify redirect to Sign In page
4. Verify you cannot access protected routes:
   - Try navigating to `/dashboard` directly
   - Verify redirect back to Sign In page
5. Click "Sign In" button again
6. Complete Internet Identity authentication (same anchor as before)
7. Verify redirect to Dashboard after login
8. Navigate to Profile page
9. Verify your profile data is still present (same username as step 1)

**Expected Results**:
- ✅ Sign Out button works and redirects to Sign In page
- ✅ Protected routes are inaccessible after logout (redirect to Sign In)
- ✅ Re-login with same II anchor succeeds
- ✅ Profile data is retrieved after re-login (not lost)
- ✅ Username and other profile fields match previous session
- ✅ No console errors during logout or re-login

**Failure Indicators**:
- ❌ Sign Out button doesn't work
- ❌ Still able to access protected routes after logout
- ❌ Re-login fails or shows errors
- ❌ Profile data is lost after re-login (shows as new user)
- ❌ Profile setup modal appears again after re-login
- ❌ Console errors mentioning "clear" or "logout"

**Record Results**:
- [ ] Pass / [ ] Fail
- **Notes**: _____________________________________________
- **Console Errors** (if any): _____________________________________________
- **Failed Network Requests** (if any): _____________________________________________

---

### Test 5: Language Preference Persistence

**Objective**: Verify language selection persists across sessions

**Steps**:
1. Navigate to Profile page
2. Change language to "Français" (French)
3. Click "Save Changes"
4. Verify UI text changes to French
5. Perform a **full page refresh** (F5)
6. Verify UI is still in French (not reverted to English)
7. Log out and log back in
8. Verify UI is still in French after re-login

**Expected Results**:
- ✅ Language selector works and updates UI immediately
- ✅ Language preference persists after page refresh
- ✅ Language preference persists after logout/login
- ✅ All UI text is translated correctly
- ✅ No console errors during language change

**Failure Indicators**:
- ❌ Language selector doesn't update UI
- ❌ Language reverts to English after refresh
- ❌ Language reverts to English after logout/login
- ❌ Console errors mentioning "language" or "i18n"

**Record Results**:
- [ ] Pass / [ ] Fail
- **Notes**: _____________________________________________
- **Console Errors** (if any): _____________________________________________
- **Failed Network Requests** (if any): _____________________________________________

---

### Test 6: Dashboard Functionality

**Objective**: Verify dashboard loads and displays data correctly

**Steps**:
1. Navigate to Dashboard page
2. Verify all dashboard sections are visible:
   - Statistics section with charts
   - Quick actions section
   - Benches section
   - Documents section
3. Verify no "undefined" or "null" values in UI
4. Verify no infinite loading spinners
5. If benches exist, verify they are displayed correctly
6. If no benches exist, verify empty state is shown

**Expected Results**:
- ✅ Dashboard loads without errors
- ✅ All sections render correctly
- ✅ Charts display (even if empty)
- ✅ Empty states are shown when no data exists
- ✅ No console errors on Dashboard page

**Failure Indicators**:
- ❌ Dashboard shows blank screen
- ❌ Infinite loading spinners
- ❌ "undefined" or "null" displayed in UI
- ❌ Console errors mentioning "dashboard" or "query"

**Record Results**:
- [ ] Pass / [ ] Fail
- **Notes**: _____________________________________________
- **Console Errors** (if any): _____________________________________________
- **Failed Network Requests** (if any): _____________________________________________

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Internet Identity Sign-In | ⬜ Pass / ⬜ Fail | |
| 2. Protected Route Access | ⬜ Pass / ⬜ Fail | |
| 3. Profile Setup & Persistence | ⬜ Pass / ⬜ Fail | |
| 4. Logout & Re-Login | ⬜ Pass / ⬜ Fail | |
| 5. Language Preference | ⬜ Pass / ⬜ Fail | |
| 6. Dashboard Functionality | ⬜ Pass / ⬜ Fail | |

## Acceptance Criteria

Deployment is considered successful if:
- ✅ All 6 smoke tests pass
- ✅ No console errors during normal usage
- ✅ Profile data persists across refresh and re-login
- ✅ Authentication flow works end-to-end
- ✅ Protected routes are properly guarded

## Failure Diagnostics Requirements

**If any test fails, you MUST capture the following information**:

### 1. Test Details
- **Failing Test Name**: _____________________________________________
- **Reproduction Steps**: _____________________________________________
- **Expected Behavior**: _____________________________________________
- **Actual Behavior**: _____________________________________________

### 2. Browser Information
- **Browser Name and Version**: _____________________________________________
- **Operating System**: _____________________________________________
- **Incognito Mode**: [ ] Yes / [ ] No

### 3. Console Errors
- **Copy all console errors** (red text in developer console):
  ```
  [Paste console errors here]
  ```
- **Copy any warnings** (yellow text):
  ```
  [Paste warnings here]
  ```
- **Include timestamps**: _____________________________________________

### 4. Network Activity
- **Open Network tab in developer tools**
- **Filter by "Fetch/XHR"**
- **Failed Requests** (red status codes):
  - URL: _____________________________________________
  - Status Code: _____________________________________________
  - Response: _____________________________________________

### 5. Screenshots
- [ ] Screenshot of the error state attached
- [ ] Screenshot of browser console attached

## Troubleshooting

### Common Issues and Solutions

**Issue**: "Actor not available" error
- **Check**: Verify `CANISTER_ID_BACKEND` in `env.json` is correct
- **Check**: Verify backend canister is deployed and healthy
- **Check**: Test backend query call: `dfx canister --network ic call backend getAllowedEmailDomain`

**Issue**: Profile setup modal appears every login
- **Check**: Verify `saveCallerUserProfile` backend call succeeds
- **Check**: Check browser console for errors during profile save
- **Check**: Verify backend canister has sufficient cycles

**Issue**: Infinite redirect loop
- **Check**: Verify `II_URL` points to production (`https://identity.ic0.app`)
- **Check**: Clear browser cookies and local storage
- **Check**: Try in incognito/private mode

**Issue**: Language doesn't persist
- **Check**: Verify `setLanguageTag` backend call succeeds
- **Check**: Check browser console for errors during language save

---

**Test Date**: _____________  
**Tested By**: _____________  
**Browser**: _____________  
**Result**: ⬜ Pass / ⬜ Fail  
**Notes**: _____________
