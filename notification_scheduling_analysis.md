# Notification Scheduling Analysis

## User's Problem

**Yesterday:** Enabled notifications → Received some  
**Today (9am):** Should have received scheduled notification → Got nothing

## How It's Supposed to Work

### Cron Job (Line 61-71 in migration)
```sql
cron.schedule(
  'notification-daily-reminders',
  '* * * * *',  -- Runs EVERY MINUTE
  call notification-events function with task="daily_reminders"
);
```

### Daily Reminders Function (Line 385-520)

**Step 1: Query schedules**
```typescript
const { data: schedulesNew } = await supabase
  .from('user_notification_schedules')
  .select('user_id, slot, send_time, enabled')
  .eq('enabled', true);
```

**Step 2: Check user preferences**
```typescript
const { data: prefsList } = await supabase
  .from('user_preferences')
  .select('user_id, push_notifications_enabled, notification_types, time_zone');
```

**Step 3: Filter users (Line 460-461)**
```typescript
if (prefs.push_notifications_enabled === false) continue;  // ← CRITICAL!
if (prefs.notification_types?.reminders === false) continue;
```

**Step 4: Check if it's time to send (Line 464-470)**
```typescript
const localNowMin = getLocalMinutes(tz);  // Current time in user's timezone
const [hh, mm] = sched.send_time.split(':');  // e.g., "09:00:00"
const targetMin = hh * 60 + mm;  // Convert to minutes
const diff = Math.abs(localNowMin - targetMin);

if (diff > 15) continue;  // ← Only send if within 15 minutes of scheduled time
```

**Step 5: Check if already sent today (Line 473-482)**
```typescript
const { data: recent } = await supabase
  .from('notification_logs')
  .select('id')
  .eq('user_id', sched.user_id)
  .eq('notification_type', 'reminders')
  .contains('data', { slot: sched.slot })
  .gte('sent_at', dayStartUtc)  // Since midnight today
  .limit(1);

if (recent?.length) continue;  // ← Skip if already sent today
```

**Step 6: Send notification (Line 488-513)**
```typescript
await supabase.functions.invoke('send-push-notification', {
  body: {
    user_id: sched.user_id,
    title: message.title,
    body: message.body,
    first_name: firstName,
    notification_type: 'reminders',
    data: { type: 'daily_reminder', slot: sched.slot },
  },
});
```

---

## Potential Failure Points

### 1. `user_notification_schedules` Table Missing/Empty

**Check:**
- Does the table exist?
- Does the user have a row with `enabled = true`?
- Is `send_time` set to '09:00:00'?

**If missing:** User never set up notification schedule

### 2. `user_preferences.push_notifications_enabled` is FALSE

**Line 460:**
```typescript
if (prefs.push_notifications_enabled === false) continue;
```

**This is the MOST LIKELY issue!**

When user enables notifications via the toggle:
- ✅ Browser subscription created
- ✅ Subscription saved to `push_subscriptions` table
- ❌ **`user_preferences.push_notifications_enabled` NOT updated**

**The function checks `user_preferences`, not `push_subscriptions`!**

### 3. `user_preferences.notification_types.reminders` is FALSE

**Line 461:**
```typescript
if (prefs.notification_types?.reminders === false) continue;
```

**Check:**
- Is `notification_types` column a JSONB with `{ "reminders": true }`?
- Default value might be missing or wrong

### 4. Timezone Issues

**Line 464:**
```typescript
const tz = prefs.time_zone || 'UTC';
const localNowMin = getLocalMinutes(tz);
```

**If user's timezone is wrong:**
- 9am Berlin time = 8am UTC
- If timezone is set to UTC, it will send at 9am UTC (10am Berlin)

### 5. Cron Job Not Running

**Check:**
- Is `pg_cron` extension enabled?
- Is the cron job actually scheduled?
- Are there errors in Supabase logs?

### 6. `send-push-notification` Function Failing

**Even if everything above works, the send function might fail:**
- No active subscription in `push_subscriptions` table
- Subscription expired or invalid
- VAPID keys missing
- Network error

---

## Root Cause (Most Likely)

**The toggle in `PushNotificationManager` creates a browser subscription, but does NOT update `user_preferences.push_notifications_enabled`.**

**The daily reminders function checks `user_preferences.push_notifications_enabled`, not `push_subscriptions.is_active`.**

**Result:** User has a valid subscription, but the cron job skips them because `push_notifications_enabled = false`.

---

## The Fix

### Option 1: Update `user_preferences` when subscribing (Recommended)

**In `usePushNotifications.ts` subscribe function (Line 454):**

**Before:**
```typescript
// Update state
setIsSubscribed(true);
setSubscription({...});

toast.success("Notifications Enabled!");
```

**After:**
```typescript
// Update state
setIsSubscribed(true);
setSubscription({...});

// ← ADD THIS: Update user_preferences
await supabase
  .from('user_preferences')
  .update({ push_notifications_enabled: true })
  .eq('user_id', user.id);

toast.success("Notifications Enabled!");
```

**Also update unsubscribe function (Line 531):**

**Before:**
```typescript
// Update state
setIsSubscribed(false);
setSubscription(null);

toast.success("Notifications Disabled");
```

**After:**
```typescript
// Update state
setIsSubscribed(false);
setSubscription(null);

// ← ADD THIS: Update user_preferences
await supabase
  .from('user_preferences')
  .update({ push_notifications_enabled: false })
  .eq('user_id', user.id);

toast.success("Notifications Disabled");
```

### Option 2: Change daily reminders to check `push_subscriptions` table

**In `notification-events/index.ts` (Line 460):**

**Before:**
```typescript
if (prefs.push_notifications_enabled === false) continue;
```

**After:**
```typescript
// Check if user has active push subscription
const { data: subscription } = await supabase
  .from('push_subscriptions')
  .select('id')
  .eq('user_id', sched.user_id)
  .eq('is_active', true)
  .limit(1);

if (!subscription?.length) continue;
```

**Drawback:** Extra database query for every user, every minute

### Option 3: Hybrid (Best)

**Do both:**
1. Update `user_preferences` when subscribing/unsubscribing
2. Check `push_subscriptions` as fallback

**Benefits:**
- Fast (uses existing preferences query)
- Reliable (checks actual subscription)
- Backwards compatible

---

## Additional Issues to Fix

### 1. Default Notification Schedule

**User enables notifications, but no schedule exists in `user_notification_schedules`.**

**Fix:** Create default schedule when user enables notifications:

```typescript
// After successful subscription
await supabase
  .from('user_notification_schedules')
  .upsert({
    user_id: user.id,
    slot: 'morning',
    send_time: '09:00:00',
    enabled: true
  }, {
    onConflict: 'user_id,slot'
  });
```

### 2. Default Notification Types

**User enables notifications, but `notification_types` is empty or missing `reminders: true`.**

**Fix:** Ensure defaults when creating user_preferences:

```typescript
notification_types: {
  reminders: true,
  achievements: true,
  streaks: true,
  progress: true
}
```

---

## Testing Plan

1. **Check database state:**
   - Query `push_subscriptions` for your user_id
   - Query `user_preferences` for your user_id
   - Query `user_notification_schedules` for your user_id
   - Check if `push_notifications_enabled = true`
   - Check if `notification_types.reminders = true`
   - Check if schedule exists with `send_time = '09:00:00'` and `enabled = true`

2. **Check cron job:**
   - Query `cron.job` table to see if job exists
   - Check Supabase logs for cron execution
   - Check if `notification-events` function is being called

3. **Manual test:**
   - Call `notification-events` function manually with `{"task": "daily_reminders"}`
   - Check if notification is sent
   - Check `notification_logs` table

---

## Implementation Priority

1. ✅ **Fix `user_preferences.push_notifications_enabled` sync** (Critical)
2. ✅ **Create default notification schedule** (Critical)
3. ✅ **Ensure default notification_types** (Critical)
4. ✅ **Fix toggle persistence UI** (High)
5. ✅ **Remove setup toasts** (Medium)
6. ✅ **Add logging for debugging** (Medium)
