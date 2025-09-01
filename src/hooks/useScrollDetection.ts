import { useState, useEffect, useRef } from 'react';

export const useScrollDetection = () => {
  const [hasScrollableContent, setHasScrollableContent] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScrollable = () => {
      const isScrollable = container.scrollHeight > container.clientHeight;
      setHasScrollableContent(isScrollable);
    };

    // Check immediately
    checkScrollable();

    // Check on resize
    const resizeObserver = new ResizeObserver(checkScrollable);
    resizeObserver.observe(container);

    // Check when content changes
    const mutationObserver = new MutationObserver(checkScrollable);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return { hasScrollableContent, containerRef };
};