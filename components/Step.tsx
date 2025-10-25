import React, { useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface Props {
  id: string;
  onInView: (id: string) => void;
  children: React.ReactNode;
  isLast?: boolean;
}

const Step: React.FC<Props> = ({ id, onInView, children, isLast = false }) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.5, // Trigger when 50% visible
    rootMargin: "-10% 0px -50% 0px" // Trigger slightly before it hits exact center
  });

  useEffect(() => {
    if (isIntersecting) {
      onInView(id);
    }
  }, [isIntersecting, id, onInView]);

  return (
    <div
      ref={ref}
      // Min-h-screen ensures we have enough room to scroll comfortably between steps
      // 'mb' adds spacing between steps.
      className={`min-h-[80vh] flex items-center max-w-xl mx-auto px-6 py-12 transition-opacity duration-500 ${isIntersecting ? 'opacity-100' : 'opacity-30'}`}
    >
      <div className="text-lg md:text-xl leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default Step;
