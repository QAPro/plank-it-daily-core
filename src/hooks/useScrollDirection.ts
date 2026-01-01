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
    // Wait for the ref to be available
    const element = containerRef?.current;
    if (!element) {
      console.log('[useScrollDirection] No container ref available yet');
      return;
    }

    console.log('[useScrollDirection] Setting up scroll listener on container');
    let ticking = false;

    const updateScrollDirection = () => {
      // Get scroll position from the container
      const scrollY = element.scrollTop;

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
      const newDirection = scrollY > lastScrollY ? 'down' : 'up';
      console.log('[useScrollDirection] Scroll detected:', { scrollY, lastScrollY, direction: newDirection });
      setScrollDirection(newDirection);
      setLastScrollY(scrollY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    // Add event listener to the container
    element.addEventListener('scroll', onScroll, { passive: true });
    console.log('[useScrollDirection] Scroll listener attached');

    return () => {
      console.log('[useScrollDirection] Cleaning up scroll listener');
      element.removeEventListener('scroll', onScroll);
    };
  }, [lastScrollY, threshold]); // Removed containerRef from dependencies to prevent re-initialization

  return scrollDirection;
};
