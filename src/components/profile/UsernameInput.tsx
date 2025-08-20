
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Check, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateUsernameFormat, generateUsernameSuggestions } from '@/utils/usernameValidation';
import { useUsernameAvailability } from '@/hooks/useUsernameAvailability';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  currentUsername?: string;
  className?: string;
  placeholder?: string;
}

const UsernameInput = ({ 
  value, 
  onChange, 
  currentUsername, 
  className,
  placeholder = "Username (without @) — letters, numbers, underscores"
}: UsernameInputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [showHelp, setShowHelp] = useState(false);

  const formatValidation = validateUsernameFormat(inputValue);
  const availability = useUsernameAvailability(inputValue, currentUsername);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/^@/, '').trim();
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
  };

  const getInputState = () => {
    // If currently same as existing username, neutral state
    if (currentUsername && inputValue.toLowerCase() === currentUsername.toLowerCase()) {
      return 'neutral';
    }

    // If format is invalid, show error
    if (inputValue && !formatValidation.isValid) {
      return 'invalid';
    }

    // If format is valid but we're checking availability
    if (formatValidation.isValid && availability.isChecking) {
      return 'checking';
    }

    // If there's an availability error
    if (availability.error) {
      return 'error';
    }

    // If format is valid and we have availability result
    if (formatValidation.isValid && availability.isAvailable !== null) {
      return availability.isAvailable ? 'available' : 'unavailable';
    }

    return 'neutral';
  };

  const inputState = getInputState();

  const getStatusIcon = () => {
    switch (inputState) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'available':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'unavailable':
      case 'invalid':
        return <X className="w-4 h-4 text-red-500" />;
      case 'error':
        return (
          <button
            type="button"
            onClick={availability.retry}
            className="flex items-center text-orange-500 hover:text-orange-600"
            title="Retry check"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        );
      default:
        return null;
    }
  };

  const getHelperText = () => {
    // Show format error first
    if (inputValue && !formatValidation.isValid) {
      return formatValidation.error;
    }

    // Show availability checking
    if (inputState === 'checking') {
      return 'Checking availability...';
    }

    // Show availability error
    if (availability.error) {
      return availability.error;
    }

    // Show availability result
    if (inputState === 'available') {
      return `✓ @${inputValue} is available`;
    }

    if (inputState === 'unavailable') {
      return `✗ @${inputValue} is already taken`;
    }

    // Default help text
    if (showHelp || !inputValue) {
      return 'Username can contain letters, numbers, and underscores (3-30 characters)';
    }

    return '';
  };

  const getHelperTextColor = () => {
    switch (inputState) {
      case 'invalid':
      case 'unavailable':
        return 'text-red-500';
      case 'available':
        return 'text-green-600';
      case 'checking':
        return 'text-blue-500';
      case 'error':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const getBorderColor = () => {
    switch (inputState) {
      case 'available':
        return 'border-green-500 focus:border-green-500';
      case 'unavailable':
      case 'invalid':
        return 'border-red-500 focus:border-red-500';
      case 'checking':
        return 'border-blue-500 focus:border-blue-500';
      case 'error':
        return 'border-orange-500 focus:border-orange-500';
      default:
        return 'border-white/30 focus:border-white';
    }
  };

  // Generate suggestions if username is unavailable
  const suggestions = inputState === 'unavailable' && inputValue 
    ? generateUsernameSuggestions(inputValue).slice(0, 3)
    : formatValidation.suggestions?.slice(0, 3) || [];

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowHelp(true)}
          onBlur={() => setShowHelp(false)}
          placeholder={placeholder}
          className={cn(
            "bg-white/20 text-white placeholder:text-orange-100 pr-10",
            getBorderColor(),
            className
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>

      {/* Helper text */}
      <div className={cn("text-sm min-h-[1.25rem]", getHelperTextColor())}>
        {getHelperText()}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm text-orange-100/90">Try these instead:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-2 py-1 text-sm bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
              >
                @{suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsernameInput;
