
import { useRef, useEffect } from 'react';
import { announceToScreenReader } from '@/utils/accessibility';

interface AccessibleChartWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  data?: any[];
  onKeyDown?: (event: React.KeyboardEvent) => void;
  ariaLabel?: string;
}

export const AccessibleChartWrapper: React.FC<AccessibleChartWrapperProps> = ({
  children,
  title,
  description,
  data = [],
  onKeyDown,
  ariaLabel
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Announce chart updates to screen readers
    if (data.length > 0) {
      announceToScreenReader(`${title} chart updated with ${data.length} data points`, 'polite');
    }
  }, [data, title]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Basic keyboard navigation for charts
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        announceToScreenReader(`Interacting with ${title}`, 'assertive');
        break;
      case 'Escape':
        event.preventDefault();
        chartRef.current?.blur();
        break;
      default:
        break;
    }
    
    onKeyDown?.(event);
  };

  return (
    <div
      ref={chartRef}
      role="img"
      tabIndex={0}
      aria-label={ariaLabel || `${title} chart`}
      aria-describedby={description ? `${title}-description` : undefined}
      onKeyDown={handleKeyDown}
      className="focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg"
    >
      {description && (
        <div id={`${title}-description`} className="sr-only">
          {description}
        </div>
      )}
      {children}
      
      {/* Screen reader table for chart data */}
      {data.length > 0 && (
        <table className="sr-only" aria-label={`Data table for ${title}`}>
          <caption>{title} data in tabular format</caption>
          <thead>
            <tr>
              {Object.keys(data[0] || {}).map(key => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, idx) => (
                  <td key={idx}>{String(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
