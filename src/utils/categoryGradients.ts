export const categoryGradients: Record<string, { gradient: string; shadow: string }> = {
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
  shadow: 'shadow-[0_4px_12px_rgba(255,107,53,0.3)]'
};

export const getCategoryGradient = (categoryName: string) => {
  return categoryGradients[categoryName] || defaultGradient;
};
