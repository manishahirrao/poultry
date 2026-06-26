# QA-001 — Cross-Browser Testing Matrix Checklist
# Phase 13: Final QA & Launch
# Version: v1.0 | June 2026

---

## BROWSERS TO TEST (all at latest stable version)

- [ ] Chrome (Windows + macOS + Android)
- [ ] Firefox (Windows + macOS)
- [ ] Safari (macOS + iOS 16+)
- [ ] Samsung Internet (Android — important for Indian market)
- [ ] Edge (Windows)

---

## DEVICES TO TEST (physical devices if possible)

- [ ] iPhone 14 Pro (iOS 17, Safari)
- [ ] iPhone SE 3rd gen (iOS 16, small screen)
- [ ] Samsung Galaxy A54 (Android 13, mid-range — most common in UP)
- [ ] Samsung Galaxy S23 (Android 14, high-end)
- [ ] iPad Air 5th gen (Safari, tablet)
- [ ] Desktop 1920×1080 (Chrome)
- [ ] Desktop 1280×800 (Chrome — smaller laptop screen)

---

## TEST PROTOCOL PER DEVICE

For each device/browser combination, complete the following tests:

### 1. Homepage Load Test
- [ ] Load homepage — check hero renders correctly
- [ ] Check text doesn't overflow
- [ ] Verify all images load
- [ ] Check no console errors

### 2. Homepage Scroll Test
- [ ] Scroll full homepage
- [ ] Check all animations work
- [ ] Verify no jank/stuttering
- [ ] Check smooth scrolling

### 3. CTA Navigation Test
- [ ] Click "Start Free Trial" button
- [ ] Verify redirect to /signup
- [ ] Check URL is correct
- [ ] Verify page loads without errors

### 4. Signup Step 1 Test
- [ ] Complete signup Step 1
- [ ] Check phone input works with numeric keyboard
- [ ] Verify input validation
- [ ] Check error messages display correctly

### 5. Language Toggle Test
- [ ] Switch language toggle
- [ ] Check Hindi fonts load
- [ ] Verify layout doesn't break
- [ ] Check content translates correctly
- [ ] Switch back to English

### 6. WhatsApp Log Feature Test
- [ ] Navigate to /features/whatsapp-log
- [ ] Check animations work
- [ ] Verify content renders correctly
- [ ] Check no console errors

### 7. Pricing Page Test
- [ ] Navigate to /pricing
- [ ] Check comparison table horizontal scroll on mobile
- [ ] Verify pricing cards display correctly
- [ ] Check toggle functionality (annual/monthly)

### 8. Accuracy Page Test
- [ ] Navigate to /accuracy
- [ ] Check charts render correctly
- [ ] Verify data displays
- [ ] Check interactive elements work

### 9. Footer Test
- [ ] Check footer is visible
- [ ] Verify no broken links
- [ ] Check social links work
- [ ] Verify legal links work

---

## PERFORMANCE TESTING

### WebPageTest.org Setup
- [ ] Visit https://www.webpagetest.org/
- [ ] Test Location: Mumbai, India (or closest available)
- [ ] Browser: Chrome (Desktop) and Chrome (Mobile)
- [ ] Connection: Mobile 4G (3 Mbps)
- [ ] Number of Tests: 3 (for consistency)

### Pages to Test
- [ ] Homepage (/)
- [ ] Pricing (/pricing)
- [ ] WhatsApp Log Feature (/features/whatsapp-log)
- [ ] Farm Management (/features/farm-management)
- [ ] Price Intelligence (/features/price-intel)
- [ ] Accuracy (/accuracy)
- [ ] Solutions/Integrators (/solutions/integrators)
- [ ] Solutions/Farms (/solutions/farms)
- [ ] Signup (/signup)

### Performance Thresholds
- [ ] Largest Contentful Paint (LCP): < 3.0s
- [ ] Cumulative Layout Shift (CLS): < 0.05
- [ ] First Contentful Paint (FCP): < 2.0s
- [ ] Time to Interactive (TTI): < 5.0s
- [ ] Speed Index: < 4.0s

---

## ACCESSIBILITY TESTING

### aXe DevTools Setup
- [ ] Install aXe DevTools browser extension (Chrome)
- [ ] Run on: homepage
- [ ] Run on: /pricing
- [ ] Run on: /features/whatsapp-log
- [ ] Run on: /signup

### Accessibility Pass Criteria
- [ ] Zero critical violations
- [ ] Zero serious violations
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] All links have discernible text
- [ ] Proper heading hierarchy
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Page language declared
- [ ] ARIA landmarks used correctly

---

## AUTOMATED TEST RESULTS

### Playwright E2E Tests
- [ ] Run: npm run test:e2e
- [ ] All tests pass on chromium-desktop
- [ ] All tests pass on firefox
- [ ] All tests pass on webkit (Safari)
- [ ] All tests pass on iphone-14-pro
- [ ] All tests pass on galaxy-s23
- [ ] All tests pass on galaxy-a54

### Accessibility Tests
- [ ] Run: npm run test:e2e qa-001-accessibility.spec.ts
- [ ] All accessibility tests pass

---

## KNOWN ISSUES & WORKAROUNDS

Document any browser-specific issues found during testing:

### Chrome
- [ ] No issues
- [ ] Issue: _______________________
  - Workaround: ___________________

### Firefox
- [ ] No issues
- [ ] Issue: _______________________
  - Workaround: ___________________

### Safari
- [ ] No issues
- [ ] Issue: _______________________
  - Workaround: ___________________

### Samsung Internet
- [ ] No issues
- [ ] Issue: _______________________
  - Workaround: ___________________

### Edge
- [ ] No issues
- [ ] Issue: _______________________
  - Workaround: ___________________

---

## SIGN-OFF

### Tester Information
- **Tester Name:** ___________________
- **Date:** ___________________
- **Browsers Tested:** ___________________
- **Devices Tested:** ___________________

### Overall Assessment
- [ ] All tests passed
- [ ] Minor issues found (documented above)
- [ ] Critical issues found (BLOCKING LAUNCH)

### Approval
- [ ] Approved for launch
- [ ] Approved with minor issues
- [ ] Not approved — requires fixes

### Notes
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________

---

## REFERENCE

- Task Reference: QA-001 in Phase 13
- Design Reference: FlockIQ_PreLogin_Design_Master_v3.md
- Requirements Reference: FlockIQ_PreLogin_Requirements_v3.md
- Tasks Reference: FlockIQ_PreLogin_Tasks_v3.md
