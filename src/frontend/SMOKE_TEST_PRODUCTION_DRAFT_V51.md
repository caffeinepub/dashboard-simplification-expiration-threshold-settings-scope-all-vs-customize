# Production Smoke Test Script - Draft Version 51

## Overview
This document provides detailed smoke test procedures for **Draft Version 51** deployed to production (Internet Computer mainnet).

**Test Environment:** Production (mainnet)  
**Application URL:** `https://<CANISTER_ID_FRONTEND>.ic0.app`  
**Version:** Draft Version 51

## Pre-Test Setup

### Required Information
- [ ] Production URL confirmed
- [ ] Test user Internet Identity available
- [ ] Browser(s) ready for testing (Chrome, Firefox, Safari recommended)
- [ ] Mobile device(s) available for responsive testing (optional but recommended)
- [ ] Results template ready (`frontend/SMOKE_TEST_PRODUCTION_RESULTS_V48.md`)

### Test Data Requirements
- Valid Internet Identity for authentication
- Test email with allowed domain (@safrangroup.com)
- Test username for profile setup

## Test Execution Instructions

For each test section below:
1. Execute all test steps in order
2. Record **PASS** or **FAIL** in results document
3. If **FAIL**, capture required diagnostics:
   - Exact reproduction steps
   - Expected vs actual behavior
   - Browser and OS version
   - Console errors (full stack trace)
   - Failed network requests (URL, status, response)
   - Screenshots (if applicable)

---

## Test Section 1: Authentication & Initial Access

### Test 1.1: Application Load
**Objective:** Verify application loads correctly on production URL

**Steps:**
1. Open browser (Chrome recommended)
2. Navigate to production URL: `https://<CANISTER_ID_FRONTEND>.ic0.app`
3. Wait for page to fully load

**Expected Results:**
- [ ] Page loads without errors
- [ ] Sign-in page displays correctly
- [ ] No console errors
- [ ] Safran logo visible
- [ ] "Sign In" button visible and enabled

**Failure Diagnostics Required:**
- Browser console errors
- Network tab showing failed requests
- Screenshot of error state

---

### Test 1.2: Internet Identity Authentication
**Objective:** Verify Internet Identity login flow works correctly

**Steps:**
1. From sign-in page, click "Sign In" button
2. Internet Identity modal/redirect appears
3. Complete authentication with test Internet Identity
4. Wait for redirect back to application

**Expected Results:**
- [ ] Internet Identity interface loads
- [ ] Authentication completes successfully
- [ ] Redirect back to application occurs
- [ ] User is authenticated (no longer on sign-in page)

**Failure Diagnostics Required:**
- Console errors during authentication
- Network requests to II_URL
- Authentication error messages
- Screenshot of failure point

---

## Test Section 2: Profile Setup & Persistence

### Test 2.1: First-Time Profile Setup
**Objective:** Verify new user profile creation flow

**Steps:**
1. After successful authentication (if first login with this identity)
2. Profile setup modal should appear
3. Enter test username (e.g., "TestUser51")
4. Enter test email with allowed domain (e.g., "test@safrangroup.com")
5. Select entity (or enter new entity)
6. Click "Save" or "Continue"

**Expected Results:**
- [ ] Profile setup modal appears for new users
- [ ] All required fields accept input
- [ ] Email validation works (rejects invalid domains)
- [ ] Save completes successfully
- [ ] Modal closes after save
- [ ] User redirected to dashboard

**Failure Diagnostics Required:**
- Console errors during save
- Network request to `saveCallerUserProfile`
- Validation error messages
- Screenshot of error state

---

### Test 2.2: Profile Persistence
**Objective:** Verify user profile persists across sessions

**Steps:**
1. Navigate to Profile page (click user avatar/menu → Profile)
2. Verify profile information displays correctly
3. Note current username and email
4. Make a small change (e.g., update bio or entity)
5. Click "Save Changes"
6. Refresh browser page (F5)
7. Navigate back to Profile page

**Expected Results:**
- [ ] Profile page loads with saved data
- [ ] Username and email display correctly
- [ ] Changes persist after save
- [ ] Changes persist after page refresh
- [ ] No data loss

**Failure Diagnostics Required:**
- Console errors
- Network requests to profile endpoints
- Data shown before/after refresh
- Screenshot showing data loss

---

## Test Section 3: Sign Out & Re-authentication

### Test 3.1: Sign Out Flow
**Objective:** Verify sign-out clears session correctly

**Steps:**
1. From any authenticated page, click user menu
2. Click "Sign Out" or "Logout"
3. Wait for sign-out to complete

**Expected Results:**
- [ ] Sign-out completes successfully
- [ ] User redirected to sign-in page
- [ ] No authenticated content visible
- [ ] Session cleared (no cached data)

**Failure Diagnostics Required:**
- Console errors during sign-out
- Network requests during sign-out
- Screenshot if sign-out fails

---

### Test 3.2: Re-authentication After Sign Out
**Objective:** Verify user can sign back in after signing out

**Steps:**
1. From sign-in page (after Test 3.1)
2. Click "Sign In" button
3. Complete Internet Identity authentication
4. Wait for redirect to dashboard

**Expected Results:**
- [ ] Authentication succeeds
- [ ] User redirected to dashboard
- [ ] Profile data loads correctly (no profile setup modal)
- [ ] Previous user data visible (benches, components, etc.)

**Failure Diagnostics Required:**
- Console errors during re-authentication
- Network requests
- Screenshot of failure

---

## Test Section 4: Language Preferences

### Test 4.1: Language Selection
**Objective:** Verify language switching works correctly

**Steps:**
1. Navigate to Profile page
2. Locate language selector dropdown
3. Note current language (should default to English)
4. Select a different language (e.g., French, Spanish)
5. Click "Save Changes"
6. Observe UI text changes

**Expected Results:**
- [ ] Language selector displays available languages
- [ ] Language selection updates immediately in UI
- [ ] Save completes successfully
- [ ] UI text translates to selected language
- [ ] Navigation labels update
- [ ] Button text updates

**Failure Diagnostics Required:**
- Console errors
- Network request to `setLanguageTag`
- Screenshot showing untranslated text
- Selected language vs displayed language

---

### Test 4.2: Language Persistence
**Objective:** Verify language preference persists across sessions

**Steps:**
1. After Test 4.1, note selected language
2. Refresh browser page (F5)
3. Navigate through application (Dashboard, Benches, Profile)
4. Sign out
5. Sign back in
6. Verify language preference

**Expected Results:**
- [ ] Language persists after page refresh
- [ ] Language persists after sign-out/sign-in
- [ ] All pages display in selected language
- [ ] No reversion to default language

**Failure Diagnostics Required:**
- Console errors
- Language shown before/after refresh
- Language shown before/after re-authentication
- Screenshot showing language reversion

---

## Test Section 5: Dashboard Functionality

### Test 5.1: Dashboard Load
**Objective:** Verify dashboard loads with all sections

**Steps:**
1. Navigate to Dashboard (should be default after login)
2. Wait for all sections to load
3. Scroll through entire dashboard

**Expected Results:**
- [ ] Dashboard loads without errors
- [ ] Statistics section displays
- [ ] Charts render correctly (no blank charts)
- [ ] Benches section displays
- [ ] Documents section displays (if applicable)
- [ ] Quick actions section displays
- [ ] No loading spinners stuck
- [ ] No console errors

**Failure Diagnostics Required:**
- Console errors
- Network requests that failed
- Screenshot of missing/broken sections
- Specific section that failed to load

---

### Test 5.2: Dashboard Interactions
**Objective:** Verify dashboard interactive elements work

**Steps:**
1. From Dashboard, test chart type toggle (Bar/Line) if available
2. Test section reordering (drag-and-drop) if available
3. Click on a bench card to navigate to detail page
4. Use browser back button to return to dashboard
5. Test any quick action buttons

**Expected Results:**
- [ ] Chart type toggle works (charts re-render)
- [ ] Section reordering works (order persists)
- [ ] Navigation to bench detail works
- [ ] Back button returns to dashboard correctly
- [ ] Quick actions execute without errors

**Failure Diagnostics Required:**
- Console errors during interactions
- Network requests that failed
- Screenshot of broken interaction
- Specific feature that failed

---

## Test Section 6: Benches & Components

### Test 6.1: Bench List
**Objective:** Verify bench list page loads and displays benches

**Steps:**
1. Navigate to Benches page (from navigation menu)
2. Wait for bench list to load
3. Verify bench cards display
4. Test search functionality (if benches exist)

**Expected Results:**
- [ ] Benches page loads without errors
- [ ] Bench cards display with photos
- [ ] Bench names and metadata visible
- [ ] Search filters benches correctly
- [ ] No console errors

**Failure Diagnostics Required:**
- Console errors
- Network request to `getAllTestBenches`
- Screenshot of error state
- Number of benches expected vs displayed

---

### Test 6.2: Bench Detail Page
**Objective:** Verify bench detail page loads with all tabs

**Steps:**
1. From bench list, click on a bench card
2. Wait for bench detail page to load
3. Verify all tabs are present (Health Book, Documents, History)
4. Click through each tab
5. Verify components table displays (if components exist)

**Expected Results:**
- [ ] Bench detail page loads without errors
- [ ] Bench photo and metadata display
- [ ] All tabs are clickable
- [ ] Health Book tab shows components table
- [ ] Documents tab shows associated documents
- [ ] History tab shows change history
- [ ] No console errors

**Failure Diagnostics Required:**
- Console errors
- Network requests that failed
- Screenshot of missing data
- Specific tab that failed to load

---

## Post-Test Checklist

After completing all test sections:

- [ ] All test results recorded in `frontend/SMOKE_TEST_PRODUCTION_RESULTS_V48.md`
- [ ] All failures documented with required diagnostics
- [ ] Screenshots captured for visual issues
- [ ] Console errors copied with full stack traces
- [ ] Network failures documented with request/response details
- [ ] Browser and OS versions noted
- [ ] Test completion time recorded

---

## Critical Issues

If any of the following critical issues are found, **STOP TESTING** and escalate immediately:

- Application fails to load (white screen, infinite loading)
- Authentication completely broken (cannot sign in)
- Data loss (user profiles deleted, benches missing)
- Security issues (unauthorized access, exposed data)
- Canister errors (backend traps, out of cycles)

---

## Test Summary Template

**Test Date:** _________________  
**Tested By:** _________________  
**Browser(s):** _________________  
**OS:** _________________  
**Overall Result:** ☐ PASS ☐ FAIL ☐ PARTIAL

**Critical Issues Found:** _________________

**Non-Critical Issues Found:** _________________

**Notes:**
