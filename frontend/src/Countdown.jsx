import { useState, useEffect } from 'react';

export default function Countdown({ deadlineAt }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);   // re-render 4×/second
    return () => clearInterval(t);                           // stop when unmounted
  }, []);

  const secondsLeft = Math.max(0, Math.ceil((deadlineAt - now) / 1000));
  return <p><strong>{secondsLeft}s</strong> left</p>;
}