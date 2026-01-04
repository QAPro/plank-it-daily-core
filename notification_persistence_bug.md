# Notification Toggle Persistence Bug

## Problem

User enables push notifications in App Settings, but when they close and reopen the app, the toggle shows as **disabled** even though:
1. The subscription still exists in the database
2. The browser still has the push subscription
3. The notification preferences (WHICH notifications) persist correctly

## Root Cause Analysis

### Current Flow

**PushNotificationManager.tsx:**
```typescript
const { isSubscribed } = usePushNotifications();

<Switch
  checked={isSubscribed}  // ← Reads from hook state
  onCheckedChange={handleToggle}
/>
```

**usePushNotifications.ts:**
```typescript
const [isSubscribed, setIsSubscribed] = useState(false);  // ← Starts as false!

useEffect(() => {
  if (swReady && user) {
    checkSubscriptionStatus();  // ← Checks subscription
  }
}, [swReady, user]);

const checkSubscriptionStatus = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    setIsSubscribed(true);  // ← Sets to true if found
  } else {
    setIsSubscribed(false);  // ← Sets to false if not found
  }
};
```

### The Bug

**Scenario 1: Service Worker Not Ready Fast Enough**
1. User opens app
2. `usePushNotifications` initializes with `isSubscribed = false`
3. Component renders with toggle OFF
4. Service worker becomes ready (takes a few ms)
5. `checkSubscriptionStatus()` runs
6. Finds subscription, sets `isSubscribed = true`
7. Toggle flickers from OFF → ON

**Scenario 2: Service Worker Check Fails**
1. User opens app
2. `usePushNotifications` initializes with `isSubscribed = false`
3. Service worker check fails or times out
4. Toggle stays OFF
5. User sees notifications as disabled

**Scenario 3: Race Condition**
1. User opens app
2. Multiple checks happen simultaneously
3. State updates conflict
4. Toggle shows incorrect state

### Why Notification Preferences Persist

**EnhancedNotificationPreferences** uses `useUserPreferences()` which:
- Loads from `user_preferences` table in database
- Persists correctly because it's stored in database
- Not dependent on service worker state

**PushNotificationManager** uses `usePushNotifications()` which:
- Depends on service worker `pushManager.getSubscription()`
- Not stored in database (only subscription endpoint is stored)
- Dependent on browser state and service worker timing

## The Fix

### Option A: Store Subscription State in Database (Recommended)

**Add column to `user_preferences` table:**
```sql
ALTER TABLE user_preferences 
ADD COLUMN push_notifications_enabled BOOLEAN DEFAULT false;
```

**Update `usePushNotifications` to:**
1. Check database for `push_notifications_enabled` flag
2. Use that as initial state
3. Sync with browser subscription status
4. Update database when user toggles

**Benefits:**
- ✅ Persistent across sessions
- ✅ Fast initial load (no waiting for service worker)
- ✅ Single source of truth
- ✅ Can be checked server-side

**Drawbacks:**
- Requires database migration
- Need to keep database and browser in sync

### Option B: Better Loading State (Quick Fix)

**Show loading state while checking:**
```typescript
const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

// In component:
<Switch
  checked={isSubscribed}
  disabled={isCheckingSubscription}  // ← Disable while checking
  onCheckedChange={handleToggle}
/>
```

**Benefits:**
- ✅ Quick fix, no database changes
- ✅ Clear UX (user sees loading state)

**Drawbacks:**
- ❌ Still flickers/changes after load
- ❌ Doesn't fix root cause

### Option C: Check Database Subscription Table

**Query `push_subscriptions` table on load:**
```typescript
const checkDatabaseSubscription = async () => {
  const { data } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();
  
  if (data) {
    setIsSubscribed(true);
  }
};
```

**Benefits:**
- ✅ No schema changes needed
- ✅ Uses existing data
- ✅ Fast initial load

**Drawbacks:**
- ❌ Subscription in DB might not match browser state
- ❌ Need to sync both sources

## Recommended Solution

**Hybrid Approach (Option A + C):**

1. **Check database first** (fast, immediate UI update)
2. **Then check browser** (verify subscription still exists)
3. **Sync if mismatch** (update database if browser subscription is gone)

**Implementation:**
```typescript
useEffect(() => {
  if (user) {
    // Step 1: Check database immediately
    checkDatabaseSubscription();
  }
}, [user]);

useEffect(() => {
  if (swReady && user) {
    // Step 2: Verify with browser
    checkBrowserSubscription();
  }
}, [swReady, user]);

const checkDatabaseSubscription = async () => {
  const { data } = await supabase
    .from('push_subscriptions')
    .select('is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();
  
  if (data) {
    setIsSubscribed(true);  // ← Fast initial state
  }
};

const checkBrowserSubscription = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    // Browser has subscription, ensure database is in sync
    if (!isSubscribed) {
      setIsSubscribed(true);
    }
  } else {
    // Browser lost subscription, update database
    if (isSubscribed) {
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id);
      setIsSubscribed(false);
    }
  }
};
```

**Benefits:**
- ✅ Fast initial load (database check)
- ✅ Accurate state (browser verification)
- ✅ Auto-sync (fixes mismatches)
- ✅ No schema changes needed

---

## Setup Toasts Issue

### Current Behavior

When user enables notifications, they see 6 toasts:
1. "Setting up notifications..." / "Step 1: Requesting permission"
2. "Setting up notifications..." / "Step 2: Preparing service worker"
3. "Setting up notifications..." / "Step 3: Fetching server configuration"
4. "Setting up notifications..." / "Step 5: Creating subscription"
5. "Setting up notifications..." / "Step 6: Saving configuration"
6. "Notifications Enabled!" / "Push notifications have been set up successfully."

**Lines in usePushNotifications.ts:**
- Line 347-349: Step 1 toast
- Line 360-362: Step 2 toast
- Line 367-369: Step 3 toast
- Line 407-409: Step 5 toast
- Line 421-423: Step 6 toast
- Line 467-469: Success toast

### The Fix

**Remove all setup toasts, keep only final result:**

**Before:**
```typescript
toast("Setting up notifications...", { 
  description: "Step 1: Requesting permission"
});
// ... more toasts ...
toast.success("Notifications Enabled!", { 
  description: "Push notifications have been set up successfully."
});
```

**After:**
```typescript
// Remove all intermediate toasts
// Keep only final success/error
toast.success("Notifications Enabled!", { 
  description: "You'll now receive workout reminders and achievement alerts."
});
```

**Rationale:**
- ✅ Less noise
- ✅ Faster UX
- ✅ User doesn't need to know about internal steps
- ✅ Consistent with our "silent success" philosophy

---

## Implementation Plan

1. ✅ Fix persistence bug (hybrid approach)
2. ✅ Remove setup toasts (keep only final result)
3. ✅ Test on PWA and desktop browser
4. ✅ Deploy to staging
5. ✅ Deploy to production
