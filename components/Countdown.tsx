import { clamp } from 'ramda';
import { useEffect, useState } from 'react';

export interface CountdownProps {
  endTimeMs: number;
  className?: string;
}
export default function Countdown({ endTimeMs, className }: CountdownProps) {
  const alwaysNonNegative = (seconds: number) => clamp(0, Infinity, seconds);

  const [secondsRemaining, setSecondsRemaining] = useState(alwaysNonNegative((endTimeMs - Date.now()) / 1000));
  useEffect(() => {
    setSecondsRemaining(alwaysNonNegative((endTimeMs - Date.now()) / 1000));
    const interval = setInterval(() => {
      setSecondsRemaining(alwaysNonNegative((endTimeMs - Date.now()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTimeMs]);

  return (
    <div className={className}>
      {secondsRemaining > 60 ? Math.floor(secondsRemaining / 60) : 0}:
      {Math.floor(secondsRemaining % 60)
        .toString()
        .padStart(2, '0')}
    </div>
  );
}
