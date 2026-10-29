import { useEffect, useState } from 'react';

/** Reads the wall clock at a fixed UTC offset, formatted HH:MM:SS. */
const readClock = (utcOffsetHours: number): string =>
  new Date(Date.now() + (utcOffsetHours * 60 + new Date().getTimezoneOffset()) * 60_000)
    .toTimeString()
    .slice(0, 8);

/** Live clock in a fixed offset label, e.g. ICT (UTC+7). */
export const useClock = (utcOffsetHours = 7): string => {
  const [time, setTime] = useState(() => readClock(utcOffsetHours));

  useEffect(() => {
    const id = window.setInterval(() => setTime(readClock(utcOffsetHours)), 1000);
    return () => window.clearInterval(id);
  }, [utcOffsetHours]);

  return time;
};
