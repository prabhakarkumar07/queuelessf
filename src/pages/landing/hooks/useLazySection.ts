import { useRef, useState, useEffect } from 'react';

interface UseLazySectionOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useLazySection(options?: UseLazySectionOptions) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { threshold = 0.1, rootMargin = '100px', once = true } = options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback: if IntersectionObserver is not supported, show everything
    if (typeof window.IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
