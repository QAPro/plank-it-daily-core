# Notification Audit - InnerFire Push Notifications

## Problem Statement

User received a notification that only said **"Innerfire"** with no context about why they received it. This is terrible UX.

---

## Current Notification System Architecture

### 1. Message Templates (`src/config/notificationMessages.ts`)

**Good news:** We have excellent, personalized message templates with clear titles and bodies:

**Workout Reminders:**
- ✅ "Morning, {firstName}!" / "Ready to start your day strong? Your plank session is waiting! 💪"
- ✅ "Midday boost, {firstName}?" / "A quick plank break can recharge your afternoon! 💪"
- ✅ "Evening plank time, {firstName}!" / "End your day on a strong note. Let's do this! 🌙"

**Streak Protection:**
- ✅ "Don't lose it, {firstName}!" / "You're on a {streakDays}-day streak! Keep it alive with a quick workout! 🔥"

**Achievements:**
- ✅ "Achievement unlocked, {firstName}! 🏆" / "You've earned {achievementName}! Check it out!"

**Re-engagement:**
- ✅ "We miss you, {firstName}!" / "It's been 3 days. Ready to jump back in? Your progress is waiting! 💪"

### 2. Service Worker (`public/sw.js`)

**The Problem:** Service worker has fallback defaults that are too generic:

**Line 208-213:**
```javascript
let title = 'Plank Coach';  // ← Generic fallback
let notificationType = 'reminder';
let category = 'reminder';

let options = {
  body: 'Time for your workout!',  // ← Generic fallback
  icon: '/icons/notification-workout.png',
  ...
};
```

**What happens:**
1. Push notification arrives
2. Service worker tries to parse data
3. **If parsing fails or data is missing** → Falls back to "Plank Coach" + "Time for your workout!"
4. **If title/body are missing from payload** → Uses these generic defaults

### 3. Edge Functions

**`send-push-notification`:**
- Receives `title` and `body` from caller
- Sends them in payload
- **If caller doesn't provide title/body** → No defaults, sends empty

**`schedule-re-engagement-notifications`:**
- Uses templates from edge function (duplicated, not from config file)
- Personalizes with firstName
- **Should be using the shared config**

---

## Root Cause Analysis

### Scenario 1: Empty Payload (Most Likely)
**What happened:**
1. Edge function called without title/body
2. Payload sent with empty or missing title/body
3. Service worker received push event
4. Tried to parse data, found nothing
5. Fell back to "Plank Coach" + "Time for your workout!"
6. **But on some devices, only app name shows** → "InnerFire"

### Scenario 2: Test Notification
**What happened:**
1. Test notification sent with `notification_type: 'test'`
2. Edge function sends **empty payload** for test notifications (line in send-push-notification)
3. Service worker receives empty data
4. Falls back to defaults
5. Device shows only app name

### Scenario 3: Parsing Error
**What happened:**
1. Payload sent with title/body
2. Service worker failed to parse JSON
3. Caught error, fell back to defaults
4. Device shows only app name

---

## The Fix

### Problem 1: Generic Fallbacks in Service Worker

**Current:**
```javascript
let title = 'Plank Coach';
let options = {
  body: 'Time for your workout!',
  ...
};
```

**Should be:**
```javascript
let title = 'InnerFire';  // Use actual app name
let options = {
  body: 'Open the app to see your workout reminder',  // More descriptive
  ...
};
```

### Problem 2: Test Notifications Send Empty Payload

**Current (line ~XXX in send-push-notification):**
```javascript
const isTestNotification = notification_type === 'test';
const payloadToSend = isTestNotification ? '' : payload;  // ← Empty for tests!
```

**Should be:**
```javascript
// Always send payload with title/body, even for tests
const payloadToSend = payload;
```

### Problem 3: No Validation on Edge Function

**Current:**
- Edge function accepts any title/body
- No validation that they're non-empty
- No defaults if missing

**Should be:**
```javascript
// Validate title and body
if (!title || !body) {
  return new Response(
    JSON.stringify({ 
      error: 'title and body are required',
      success: false 
    }),
    { status: 400 }
  );
}
```

---

## Recommended Changes

### 1. Update Service Worker Fallbacks

**File:** `public/sw.js`

**Change line 208:**
```javascript
let title = 'InnerFire Workout Reminder';
```

**Change line 213:**
```javascript
body: 'You have a new notification. Open the app to see details.',
```

**Rationale:** If something goes wrong, at least give user SOME context

### 2. Remove Empty Payload for Test Notifications

**File:** `supabase/functions/send-push-notification/index.ts`

**Find and remove:**
```javascript
const isTestNotification = notification_type === 'test';
const payloadToSend = isTestNotification ? '' : payload;
```

**Replace with:**
```javascript
// Always send full payload
const payloadToSend = payload;
```

**Rationale:** Test notifications should look like real notifications

### 3. Add Validation to Edge Function

**File:** `supabase/functions/send-push-notification/index.ts`

**Add after parsing request:**
```javascript
// Validate required fields
if (!title || title.trim() === '') {
  throw new Error('Notification title is required and cannot be empty');
}

if (!body || body.trim() === '') {
  throw new Error('Notification body is required and cannot be empty');
}
```

**Rationale:** Prevent sending notifications without content

### 4. Improve Logging

**File:** `public/sw.js`

**Add more detailed logging:**
```javascript
if (event.data) {
  try {
    const rawText = event.data.text();
    console.log('[SW] Raw push data:', rawText);
    
    if (!rawText || rawText.trim() === '') {
      console.warn('[SW] Empty push data received, using fallback');
    }
    
    const data = JSON.parse(rawText);
    console.log('[SW] Parsed push data:', data);
    
    if (!data.title || !data.body) {
      console.warn('[SW] Missing title or body in push data:', data);
    }
    
    // ... rest of parsing
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
  }
}
```

**Rationale:** Better debugging for future issues

---

## Testing Plan

### 1. Test Notification
- Send test notification with full title/body
- Verify it shows correctly on device

### 2. Workout Reminder
- Wait for scheduled reminder
- Verify title/body are personalized
- Verify icon is correct

### 3. Streak Protection
- Trigger streak notification
- Verify streak count is shown
- Verify urgency is communicated

### 4. Achievement
- Earn achievement
- Verify achievement name is shown
- Verify celebration tone

### 5. Re-engagement
- Wait 3 days without workout
- Verify re-engagement message is clear
- Verify firstName is personalized

---

## Summary

**Root cause:** Service worker has generic fallbacks + test notifications send empty payloads

**Fix:**
1. ✅ Improve service worker fallback messages
2. ✅ Remove empty payload for test notifications
3. ✅ Add validation to edge function
4. ✅ Improve logging for debugging

**Result:** Users will always see clear, contextual notifications explaining why they received them.
