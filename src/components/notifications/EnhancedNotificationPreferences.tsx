import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Clock, Globe, Bell, BellOff, Shield } from "lucide-react"
import { useUserPreferences } from "@/hooks/useUserPreferences"
import { useNotificationSchedules } from "@/hooks/useNotificationSchedules"
import { toast } from "@/hooks/use-toast"

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
]

const SLOT_LABELS = {
  morning: 'Morning',
  lunch: 'Lunch',
  evening: 'Evening',
  last_chance: 'Last Chance'
}

const SLOT_DESCRIPTIONS = {
  morning: 'Start your day with energy',
  lunch: 'Midday boost',
  evening: 'Wind down strong',
  last_chance: 'Don\'t miss today'
}

export function EnhancedNotificationPreferences() {
  const { preferences, updatePreferences, loading } = useUserPreferences()
  const { schedules, streakProtection, upsertSchedule, loading: schedulesLoading } = useNotificationSchedules()
  
  // Local state for immediate UI updates
  const [localNotificationTypes, setLocalNotificationTypes] = useState(
    preferences?.notification_types || {
      reminders: true,
      achievements: true,
      streaks: true,
      milestones: true,
      social: false,
      re_engagement: false,
    }
  )

  const [localTimezone, setLocalTimezone] = useState<string | null>(null)
  const [localNotificationFrequency, setLocalNotificationFrequency] = useState<'minimal' | 'normal' | 'frequent' | null>(null)

  // Sync local state when preferences load from database
  useEffect(() => {
    if (!loading && preferences) {
      setLocalNotificationTypes(preferences.notification_types || {
        reminders: true,
        achievements: true,
        streaks: true,
        milestones: true,
        social: false,
        re_engagement: false,
      })
    }
  }, [loading, preferences])

  useEffect(() => {
    if (!loading && preferences) {
      const tz = preferences.time_zone || 'UTC'
      setLocalTimezone(tz)
    }
  }, [loading, preferences])

  useEffect(() => {
    if (!loading && preferences) {
      const freq = preferences.notification_frequency || 'normal'
      setLocalNotificationFrequency(freq)
    }
  }, [loading, preferences])

  // Helper to normalize time format (strip seconds if present)
  const normalizeTimeFormat = (time: string | undefined): string => {
    if (!time) return '09:00'
    // Strip seconds if present (22:00:00 -> 22:00)
    return time.substring(0, 5)
  }

  if (loading || schedulesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="h-8 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleNotificationTypeChange = async (type: string, enabled: boolean) => {
    const currentTypes = localNotificationTypes || {
      reminders: true,
      achievements: true,
      streaks: true,
      milestones: true,
      social: false,
      re_engagement: false,
    }
    const newTypes = { ...currentTypes, [type]: enabled }
    setLocalNotificationTypes(newTypes)
    
    try {
      await updatePreferences({ notification_types: newTypes })
      toast({
        title: "Notification preferences updated",
        description: `${type} notifications ${enabled ? 'enabled' : 'disabled'}`,
      })
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      })
      // Revert local state on error
      setLocalNotificationTypes(localNotificationTypes)
    }
  }

  const handleMilestoneGroupChange = async (enabled: boolean) => {
    // When "Milestone Celebrations" is toggled, update both achievements and milestones
    const currentTypes = localNotificationTypes || {
      reminders: true,
      achievements: true,
      streaks: true,
      milestones: true,
      social: false,
      re_engagement: false,
    }
    const newTypes = {
      ...currentTypes,
      achievements: enabled,
      milestones: enabled,
    }
    setLocalNotificationTypes(newTypes)
    
    try {
      await updatePreferences({ notification_types: newTypes })
      toast({
        title: "Notification preferences updated",
        description: `Milestone celebrations ${enabled ? 'enabled' : 'disabled'}`,
      })
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      })
      setLocalNotificationTypes(localNotificationTypes)
    }
  }

  const handleFrequencyChange = async (frequency: 'minimal' | 'normal' | 'frequent') => {
    setLocalNotificationFrequency(frequency)
    
    try {
      await updatePreferences({ notification_frequency: frequency })
      toast({
        title: "Notification frequency updated",
        description: `Set to ${frequency}`,
      })
    } catch (error) {
      console.error('Error updating notification frequency:', error)
      setLocalNotificationFrequency(preferences?.notification_frequency || 'normal')
      toast({
        title: "Error", 
        description: "Failed to update notification frequency",
        variant: "destructive",
      })
    }
  }

  const handleTimezoneChange = async (timezone: string) => {
    setLocalTimezone(timezone)
    
    try {
      await updatePreferences({ time_zone: timezone })
      toast({
        title: "Timezone updated",
        description: `Set to ${TIMEZONE_OPTIONS.find(tz => tz.value === timezone)?.label || timezone}`,
      })
    } catch (error) {
      console.error('Error updating timezone:', error)
      setLocalTimezone(preferences?.time_zone || 'UTC')
      toast({
        title: "Error",
        description: "Failed to update timezone",
        variant: "destructive",
      })
    }
  }

  const handleQuietHoursChange = async (field: 'start' | 'end', value: string) => {
    try {
      const update = field === 'start' 
        ? { quiet_hours_start: value }
        : { quiet_hours_end: value }
      
      await updatePreferences(update)
      toast({
        title: "Quiet hours updated",
        description: `${field === 'start' ? 'Start' : 'End'} time set to ${value}`,
      })
    } catch (error) {
      console.error('Error updating quiet hours:', error)
      toast({
        title: "Error",
        description: "Failed to update quiet hours",
        variant: "destructive",
      })
    }
  }

  const handleScheduleChange = async (slot: string, field: 'enabled' | 'send_time', value: boolean | string) => {
    try {
      const currentSchedule = schedules[slot] || { slot, send_time: '18:00', enabled: false }
      const updatedSchedule = { ...currentSchedule, [field]: value }
      
      await upsertSchedule(slot as any, updatedSchedule)
      toast({
        title: "Schedule updated",
        description: `${SLOT_LABELS[slot]} reminder ${field === 'enabled' ? (value ? 'enabled' : 'disabled') : 'time updated'}`,
      })
    } catch (error) {
      console.error('Error updating schedule:', error)
      toast({
        title: "Error",
        description: "Failed to update reminder schedule",
        variant: "destructive",
      })
    }
  }

  const handleStreakProtectionChange = async (field: 'enabled' | 'send_time', value: boolean | string) => {
    try {
      const updatedSchedule = { [field]: value }
      
      await upsertSchedule('streak_protection' as any, updatedSchedule, 'streak_protection')
      toast({
        title: "Streak protection updated",
        description: `Streak protection ${field === 'enabled' ? (value ? 'enabled' : 'disabled') : 'time updated'}`,
      })
    } catch (error) {
      console.error('Error updating streak protection:', error)
      toast({
        title: "Error",
        description: "Failed to update streak protection",
        variant: "destructive",
      })
    }
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
          hour: 'numeric', 
          minute: '2-digit' 
        })
        options.push({ value: timeString, label: displayTime })
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  // Check if either achievements or milestones is enabled for the group toggle
  const isMilestoneGroupEnabled = localNotificationTypes.achievements || localNotificationTypes.milestones

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timezone Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Globe className="h-4 w-4" />
            Timezone
          </Label>
          <Select 
            value={localTimezone || 'UTC'} 
            onValueChange={handleTimezoneChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Daily Reminder Slots */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Daily Reminder Slots
          </Label>
          <div className="space-y-3">
            {Object.entries(SLOT_LABELS).map(([slot, label]) => {
              const schedule = schedules[slot] || { enabled: false, send_time: '18:00' }
              return (
                <div key={slot} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(enabled) => handleScheduleChange(slot, 'enabled', enabled)}
                    />
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-muted-foreground">{SLOT_DESCRIPTIONS[slot]}</div>
                    </div>
                  </div>
                  {schedule.enabled && (
                    <Select
                      value={normalizeTimeFormat(schedule.send_time)}
                      onValueChange={(time) => handleScheduleChange(slot, 'send_time', time)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Streak Protection Timing */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4" />
            Streak Protection
          </Label>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Switch
                checked={streakProtection?.enabled ?? true}
                onCheckedChange={(enabled) => handleStreakProtectionChange('enabled', enabled)}
              />
              <div>
                <div className="font-medium">Daily Streak Check</div>
                <div className="text-sm text-muted-foreground">
                  We'll remind you if you haven't worked out yet today
                </div>
              </div>
            </div>
            {streakProtection?.enabled && (
              <Select
                value={normalizeTimeFormat(streakProtection?.send_time)}
                onValueChange={(time) => handleStreakProtectionChange('send_time', time)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <Separator />

        {/* Notification Types (Consolidated) */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Notification Types</Label>
          <div className="space-y-3">
            {[
              { 
                key: 'reminders', 
                label: '✅ Daily Reminders', 
                description: 'Get reminders at your scheduled times',
                single: true,
              },
              { 
                key: 'milestone_celebrations', 
                label: '🎉 Milestone Celebrations', 
                description: 'Achievements, level-ups, and progress milestones',
                single: false, // This is a group
              },
              { 
                key: 'streaks', 
                label: '🔥 Streak Protection', 
                description: 'Alerts to keep your streak alive',
                single: true,
              },
              { 
                key: 'social', 
                label: '👥 Social Updates', 
                description: 'Activity from people you follow',
                single: true,
              },
            ].map((type) => (
              <div key={type.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{type.label}</Label>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </div>
                <Switch
                  checked={
                    type.single 
                      ? (localNotificationTypes[type.key] || false)
                      : isMilestoneGroupEnabled
                  }
                  onCheckedChange={(checked) => 
                    type.single 
                      ? handleNotificationTypeChange(type.key, checked)
                      : handleMilestoneGroupChange(checked)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Notification Frequency */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Notification Frequency</Label>
          <Select 
            value={localNotificationFrequency || 'normal'} 
            onValueChange={handleFrequencyChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Minimal - Only essential notifications</SelectItem>
              <SelectItem value="normal">Normal - Balanced notification delivery</SelectItem>
              <SelectItem value="frequent">Frequent - All available notifications</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Quiet Hours */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <BellOff className="h-4 w-4" />
            Quiet Hours
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Start Time</Label>
              <Select 
                value={normalizeTimeFormat(preferences?.quiet_hours_start) || '22:00'} 
                onValueChange={(value) => handleQuietHoursChange('start', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">End Time</Label>
              <Select 
                value={normalizeTimeFormat(preferences?.quiet_hours_end) || '08:00'} 
                onValueChange={(value) => handleQuietHoursChange('end', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
