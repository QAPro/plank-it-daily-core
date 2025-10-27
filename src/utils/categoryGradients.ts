export const categoryGradients: Record<string, { gradient: string; shadow: string; glow?: string; confettiColors?: string[] }> = {
  // Achievement Categories
  'Consistency': {
    gradient: 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900',
    shadow: 'shadow-[0_4px_12px_rgba(147,51,234,0.3)]',
    glow: 'shadow-[0_0_30px_rgba(147,51,234,0.5)]',
    confettiColors: ['bg-purple-400', 'bg-purple-500', 'bg-indigo-400', 'bg-violet-500']
  },
  'Milestones': {
    gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-yellow-600',
    shadow: 'shadow-[0_4px_12px_rgba(255,107,53,0.3)]',
    glow: 'shadow-[0_0_30px_rgba(255,107,53,0.5)]',
    confettiColors: ['bg-orange-400', 'bg-yellow-400', 'bg-amber-400', 'bg-orange-500']
  },
  'Momentum': {
    gradient: 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600',
    shadow: 'shadow-[0_4px_12px_rgba(148,163,184,0.3)]',
    glow: 'shadow-[0_0_25px_rgba(148,163,184,0.5)]',
    confettiColors: ['bg-slate-400', 'bg-slate-500', 'bg-gray-400', 'bg-slate-600']
  },
  'Performance': {
    gradient: 'bg-gradient-to-br from-purple-600 via-purple-700 to-amber-600',
    shadow: 'shadow-[0_4px_12px_rgba(147,51,234,0.3)]',
    glow: 'shadow-[0_0_35px_rgba(147,51,234,0.5)]',
    confettiColors: ['bg-purple-400', 'bg-amber-400', 'bg-violet-400', 'bg-yellow-400']
  },
  'Social': {
    gradient: 'bg-gradient-to-br from-slate-200 via-slate-300 to-white',
    shadow: 'shadow-[0_4px_12px_rgba(148,163,184,0.3)]',
    glow: 'shadow-[0_0_20px_rgba(148,163,184,0.5)]',
    confettiColors: ['bg-slate-300', 'bg-slate-400', 'bg-gray-300', 'bg-slate-500']
  },
  'Special': {
    gradient: 'bg-gradient-to-br from-purple-600 via-purple-700 to-amber-500',
    shadow: 'shadow-[0_4px_12px_rgba(147,51,234,0.3)]',
    glow: 'shadow-[0_0_40px_rgba(147,51,234,0.5)]',
    confettiColors: ['bg-purple-400', 'bg-amber-400', 'bg-pink-400', 'bg-violet-500']
  },
  
  // High intensity categories - Orange
  'High Intensity': {
    gradient: 'bg-gradient-to-br from-[#FF6B35] to-[#FDB961]',
    shadow: 'shadow-[0_4px_12px_rgba(255,107,53,0.3)]'
  },
  'HIIT': {
    gradient: 'bg-gradient-to-br from-[#FF6B35] to-[#FDB961]',
    shadow: 'shadow-[0_4px_12px_rgba(255,107,53,0.3)]'
  },
  'Cardio': {
    gradient: 'bg-gradient-to-br from-[#FF6B35] to-[#FDB961]',
    shadow: 'shadow-[0_4px_12px_rgba(255,107,53,0.3)]'
  },
  
  // Flexibility categories - Blue
  'Flexibility': {
    gradient: 'bg-gradient-to-br from-[#03B7EE] to-[#35C9F5]',
    shadow: 'shadow-[0_4px_12px_rgba(3,183,238,0.3)]'
  },
  'Mobility': {
    gradient: 'bg-gradient-to-br from-[#03B7EE] to-[#35C9F5]',
    shadow: 'shadow-[0_4px_12px_rgba(3,183,238,0.3)]'
  },
  'Yoga': {
    gradient: 'bg-gradient-to-br from-[#03B7EE] to-[#35C9F5]',
    shadow: 'shadow-[0_4px_12px_rgba(3,183,238,0.3)]'
  },
  
  // Strength categories - Purple
  'Strength': {
    gradient: 'bg-gradient-to-br from-[#9B59B6] to-[#C39BD3]',
    shadow: 'shadow-[0_4px_12px_rgba(155,89,182,0.3)]'
  },
  'Power': {
    gradient: 'bg-gradient-to-br from-[#9B59B6] to-[#C39BD3]',
    shadow: 'shadow-[0_4px_12px_rgba(155,89,182,0.3)]'
  },
  'Resistance': {
    gradient: 'bg-gradient-to-br from-[#9B59B6] to-[#C39BD3]',
    shadow: 'shadow-[0_4px_12px_rgba(155,89,182,0.3)]'
  },
  
  // Recovery categories - Green
  'Recovery': {
    gradient: 'bg-gradient-to-br from-[#27AE60] to-[#52BE80]',
    shadow: 'shadow-[0_4px_12px_rgba(39,174,96,0.3)]'
  },
  'Wellness': {
    gradient: 'bg-gradient-to-br from-[#27AE60] to-[#52BE80]',
    shadow: 'shadow-[0_4px_12px_rgba(39,174,96,0.3)]'
  },
  'Stretching': {
    gradient: 'bg-gradient-to-br from-[#27AE60] to-[#52BE80]',
    shadow: 'shadow-[0_4px_12px_rgba(39,174,96,0.3)]'
  },
};

// Default gradient if category not found
export const defaultGradient = {
  gradient: 'bg-gradient-to-br from-[#FF6B35] to-[#FDB961]',
  shadow: 'shadow-[0_4px_12px_rgba(255,107,53,0.3)]',
  glow: 'shadow-[0_0_25px_rgba(255,107,53,0.5)]',
  confettiColors: ['bg-orange-400', 'bg-yellow-400', 'bg-red-400']
};

export const getCategoryGradient = (categoryName: string) => {
  return categoryGradients[categoryName] || defaultGradient;
};

export const getCategoryGlow = (categoryName: string): string => {
  return (categoryGradients[categoryName] || defaultGradient).glow || '';
};

export const getCategoryConfettiColors = (categoryName: string): string[] => {
  return (categoryGradients[categoryName] || defaultGradient).confettiColors || ['bg-orange-400', 'bg-yellow-400'];
};
