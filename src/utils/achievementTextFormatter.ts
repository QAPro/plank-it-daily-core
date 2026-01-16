/**
 * Utility functions for formatting achievement text based on completion status
 */

/**
 * Converts achievement description from present tense to past tense
 * for earned/completed achievements
 * 
 * @param description - The original achievement description (e.g., "Complete a 1-minute workout")
 * @param isEarned - Whether the achievement has been earned by the user
 * @returns The formatted description (e.g., "Completed a 1-minute workout")
 */
export const formatAchievementDescription = (description: string, isEarned: boolean): string => {
  if (!isEarned || !description) {
    return description;
  }

  // Common verb transformations for achievement descriptions
  const verbTransformations: [RegExp, string][] = [
    // Complete -> Completed
    [/^Complete /i, 'Completed '],
    
    // Log -> Logged
    [/^Log /i, 'Logged '],
    
    // Reach -> Reached
    [/^Reach /i, 'Reached '],
    
    // Earn -> Earned
    [/^Earn /i, 'Earned '],
    
    // Achieve -> Achieved
    [/^Achieve /i, 'Achieved '],
    
    // Finish -> Finished
    [/^Finish /i, 'Finished '],
    
    // Hit -> Hit (no change, already past tense)
    // Maintain -> Maintained
    [/^Maintain /i, 'Maintained '],
    
    // Build -> Built
    [/^Build /i, 'Built '],
    
    // Get -> Got
    [/^Get /i, 'Got '],
    
    // Unlock -> Unlocked
    [/^Unlock /i, 'Unlocked '],
    
    // Win -> Won
    [/^Win /i, 'Won '],
    
    // Beat -> Beat (no change, already past tense)
    
    // Set -> Set (no change, already past tense)
    
    // Break -> Broke
    [/^Break /i, 'Broke '],
    
    // Make -> Made
    [/^Make /i, 'Made '],
    
    // Do -> Did
    [/^Do /i, 'Did '],
    
    // Perform -> Performed
    [/^Perform /i, 'Performed '],
    
    // Join -> Joined
    [/^Join /i, 'Joined '],
    
    // Start -> Started
    [/^Start /i, 'Started '],
    
    // Begin -> Began
    [/^Begin /i, 'Began '],
    
    // Work out -> Worked out
    [/^Work out /i, 'Worked out '],
    
    // Train -> Trained
    [/^Train /i, 'Trained '],
    
    // Exercise -> Exercised
    [/^Exercise /i, 'Exercised '],
  ];

  let formattedDescription = description;

  // Apply transformations
  for (const [pattern, replacement] of verbTransformations) {
    if (pattern.test(formattedDescription)) {
      formattedDescription = formattedDescription.replace(pattern, replacement);
      break; // Only apply the first matching transformation
    }
  }

  return formattedDescription;
};
