import React, { useEffect, useRef, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  title: string;
  formatter?: (value: number) => string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 1000,
  title,
  formatter = String,
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationStarted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animationStarted.current) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
      },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    animationStarted.current = true;
    let startTimestamp: number | null = null;
    const step = (timestamp: number): void => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardContent className="p-0 pt-2">
          <span className="text-3xl font-bold">{formatter(count)}</span>
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default AnimatedCounter;
