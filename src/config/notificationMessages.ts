export interface MessageTemplate {
  title: string;
  body: string;
}

export interface MessageTemplates {
  workout_reminder: {
    morning: MessageTemplate[];
    afternoon: MessageTemplate[];
    evening: MessageTemplate[];
  };
  streak_protection: MessageTemplate[];
  achievement: MessageTemplate[];
  milestone: MessageTemplate[];
  social: MessageTemplate[];
  re_engagement: {
    days_3: MessageTemplate[];
    days_7: MessageTemplate[];
    days_14: MessageTemplate[];
  };
}

export const messageTemplates: MessageTemplates = {
  workout_reminder: {
    morning: [
      { 
        title: "Morning, {firstName}!", 
        body: "Ready to start your day strong? Your plank session is waiting! 💪" 
      },
      { 
        title: "Rise and shine, {firstName}!", 
        body: "Let's make today count with a quick core workout! ☀️" 
      },
      { 
        title: "Good morning, {firstName}!", 
        body: "Your body is ready. Let's do this! 🔥" 
      },
      { 
        title: "Hey {firstName}!", 
        body: "Time to energize your morning with some core work! ⚡" 
      },
      { 
        title: "Wake up and plank, {firstName}!", 
        body: "Your morning workout is the perfect way to start the day! 🌅" 
      }
    ],
    afternoon: [
      { 
        title: "Midday boost, {firstName}?", 
        body: "A quick plank break can recharge your afternoon! 💪" 
      },
      { 
        title: "Hey {firstName}!", 
        body: "Time for an afternoon core session. Let's go! 🚀" 
      },
      { 
        title: "Afternoon check-in, {firstName}!", 
        body: "Your workout is calling. Ready to answer? 💯" 
      },
      { 
        title: "Power through, {firstName}!", 
        body: "A quick plank session will keep you energized! ⚡" 
      },
      { 
        title: "Break time, {firstName}!", 
        body: "Take 5 minutes for your core. You've got this! 🎯" 
      }
    ],
    evening: [
      { 
        title: "Evening plank time, {firstName}!", 
        body: "End your day on a strong note. Let's do this! 🌙" 
      },
      { 
        title: "Wind down with strength, {firstName}!", 
        body: "A quick evening session to finish the day right! 💪" 
      },
      { 
        title: "Before bed, {firstName}?", 
        body: "Your evening core workout awaits! 🌟" 
      },
      { 
        title: "Last call, {firstName}!", 
        body: "Cap off your day with a powerful plank session! 🔥" 
      },
      { 
        title: "Evening strength, {firstName}!", 
        body: "One quick workout to close out your day perfectly! ✨" 
      }
    ]
  },
  
  streak_protection: [
    { 
      title: "Don't lose it, {firstName}!", 
      body: "You're on a {streakDays}-day streak! Keep it alive with a quick workout! 🔥" 
    },
    { 
      title: "Streak alert, {firstName}!", 
      body: "{streakDays} days strong! Don't break the chain now! 💪" 
    },
    { 
      title: "Your streak needs you, {firstName}!", 
      body: "{streakDays} consecutive days! Just one quick session to keep it going! ⚡" 
    },
    { 
      title: "Protect your progress, {firstName}!", 
      body: "{streakDays}-day streak at stake! A few minutes is all it takes! 🛡️" 
    },
    { 
      title: "Keep the fire burning, {firstName}!", 
      body: "{streakDays} days of consistency! Don't let it end today! 🔥" 
    }
  ],
  
  achievement: [
    { 
      title: "Achievement unlocked, {firstName}! 🏆", 
      body: "You've earned {achievementName}! Check it out!" 
    },
    { 
      title: "Congrats, {firstName}! 🎉", 
      body: "New achievement: {achievementName}! You're crushing it!" 
    },
    { 
      title: "You did it, {firstName}! ⭐", 
      body: "{achievementName} is yours! Keep up the amazing work!" 
    },
    { 
      title: "Level up, {firstName}! 🚀", 
      body: "Achievement earned: {achievementName}! You're unstoppable!" 
    }
  ],
  
  milestone: [
    { 
      title: "Milestone reached, {firstName}! 🎯", 
      body: "{milestoneName}! You're making incredible progress!" 
    },
    { 
      title: "Major win, {firstName}! 💪", 
      body: "You've hit {milestoneName}! That's huge!" 
    },
    { 
      title: "Celebration time, {firstName}! 🎊", 
      body: "{milestoneName} complete! Your dedication is paying off!" 
    },
    { 
      title: "You're amazing, {firstName}! ⭐", 
      body: "Milestone unlocked: {milestoneName}! Keep going!" 
    }
  ],
  
  social: [
    { 
      title: "{friendName} cheered for you! 👏", 
      body: "Your workout inspired {friendName}!" 
    },
    { 
      title: "New comment, {firstName}!", 
      body: "{friendName} left a comment on your activity!" 
    },
    { 
      title: "Friend activity, {firstName}!", 
      body: "{friendName} just completed a workout! Check it out!" 
    },
    { 
      title: "Your workout motivated someone! 💪", 
      body: "{friendName} is following your lead!" 
    }
  ],
  
  re_engagement: {
    days_3: [
      { 
        title: "We miss you, {firstName}!", 
        body: "It's been 3 days. Ready to jump back in? Your progress is waiting! 💪" 
      },
      { 
        title: "Time to return, {firstName}!", 
        body: "Your core hasn't felt the burn in 3 days. Let's fix that! 🔥" 
      },
      { 
        title: "Come back stronger, {firstName}!", 
        body: "3 days away is enough. Your next workout is calling! 💯" 
      }
    ],
    days_7: [
      { 
        title: "A week away, {firstName}?", 
        body: "Your progress is too valuable to lose! Let's get back on track! 🎯" 
      },
      { 
        title: "Your comeback starts now, {firstName}!", 
        body: "7 days is a long time. But you can restart today! 💪" 
      },
      { 
        title: "We believe in you, {firstName}!", 
        body: "It's been a week. Ready to reclaim your routine? 🚀" 
      }
    ],
    days_14: [
      { 
        title: "Fresh start, {firstName}?", 
        body: "Two weeks is behind you. Today is day 1 of your new journey! 🌟" 
      },
      { 
        title: "Welcome back, {firstName}!", 
        body: "No judgment, just opportunity. Let's start fresh today! 💪" 
      },
      { 
        title: "New beginning, {firstName}!", 
        body: "The best time to restart? Right now. Your core awaits! 🔥" 
      }
    ]
  }
};

/**
 * Get a random template from an array of templates
 */
export function getRandomTemplate(templates: MessageTemplate[]): MessageTemplate {
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

/**
 * Replace placeholders in a template with actual values
 */
export function personalizeMessage(
  template: MessageTemplate,
  context: {
    firstName?: string;
    username?: string;
    streakDays?: number;
    achievementName?: string;
    milestoneName?: string;
    friendName?: string;
  }
): MessageTemplate {
  let { title, body } = template;
  
  // Replace firstName with fallback: firstName → username → "friend"
  const displayName = context.firstName || context.username || 'friend';
  title = title.replace(/{firstName}/g, displayName);
  body = body.replace(/{firstName}/g, displayName);
  
  // Replace streakDays
  if (context.streakDays !== undefined) {
    title = title.replace(/{streakDays}/g, String(context.streakDays));
    body = body.replace(/{streakDays}/g, String(context.streakDays));
  }
  
  // Replace achievementName
  if (context.achievementName) {
    title = title.replace(/{achievementName}/g, context.achievementName);
    body = body.replace(/{achievementName}/g, context.achievementName);
  }
  
  // Replace milestoneName
  if (context.milestoneName) {
    title = title.replace(/{milestoneName}/g, context.milestoneName);
    body = body.replace(/{milestoneName}/g, context.milestoneName);
  }
  
  // Replace friendName
  if (context.friendName) {
    title = title.replace(/{friendName}/g, context.friendName);
    body = body.replace(/{friendName}/g, context.friendName);
  }
  
  return { title, body };
}

/**
 * Get time of day based on current hour
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else {
    return 'evening';
  }
}

/**
 * Get display name with fallback hierarchy: firstName → username → "friend"
 */
export function getDisplayName(firstName?: string, username?: string): string {
  return firstName || username || 'friend';
}
