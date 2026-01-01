import { useState, useEffect, RefObject } from 'react';

export type ScrollDirection = 'up' | 'down' | 'none';

interface UseScrollDirectionOptions {
  threshold?: number; // Minimum scroll distance to trigger direction change
  containerRef?: RefObject<HTMLElement>; // Optional scroll container ref
}

export const useScrollDirection = ({ 
  threshold = 10,
  containerRef 
}: UseScrollDirectionOptions = {}) => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('none');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const scrollElement = containerRef?.current || window;
    let ticking = false;

    const updateScrollDirection = () => {
      // Get scroll position based on element type
      const scrollY = containerRef?.current 
        ? containerRef.current.scrollTop 
        : window.scrollY;

      // If we're at the top, always show header
      if (scrollY <= 0) {
        setScrollDirection('none');
        setLastScrollY(scrollY);
        ticking = false;
        return;
      }

      // Only update if we've scrolled past the threshold
      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false;
        return;
      }

      // Determine direction
      if (scrollY > lastScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }

      setLastScrollY(scrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    // Add event listener to the appropriate element
    if (containerRef?.current) {
      containerRef.current.addEventListener('scroll', onScroll, { passive: true });
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    return () => {
      if (containerRef?.current) {
        containerRef.current.removeEventListener('scroll', onScroll);
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    };
  }, [lastScrollY, threshold, containerRef]);

  return scrollDirection;
};
