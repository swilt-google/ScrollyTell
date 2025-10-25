import { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver(
  options: IntersectionObserverInit = { threshold: 0.6, rootMargin: "-10% 0px -40% 0px" }
) {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return [ref, isIntersecting] as const;
}
