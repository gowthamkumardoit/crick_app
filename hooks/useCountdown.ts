import { useEffect, useState } from "react";

export function useCountdown(startTime?: any) {
  const [timeLeft, setTimeLeft] = useState("00:00:00");

  useEffect(() => {
    if (!startTime) return;

    const startMs =
      typeof startTime === "number"
        ? startTime
        : startTime?.toMillis?.();

    if (!startMs) return;

    const tick = () => {
      const diff = startMs - Date.now();

      if (diff <= 0) {
        setTimeLeft("Starting");
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
          s
        ).padStart(2, "0")}`
      );
    };

    tick(); // 👈 VERY IMPORTANT
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [startTime]);

  return timeLeft;
}
