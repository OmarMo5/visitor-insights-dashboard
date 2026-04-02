import { useEffect, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedNumber({ value, duration = 800, decimals = 0, suffix = "", prefix = "", className = "" }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = prevValue.current;
    const end = value;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      if (el) el.textContent = `${prefix}${current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${suffix}`;
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    prevValue.current = value;
  }, [value, duration, decimals, suffix, prefix]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}
