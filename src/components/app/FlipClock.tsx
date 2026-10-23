import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

function FlipDigit({ value }: { value: string }) {
  return (
    <div className="relative h-12 w-8 overflow-hidden rounded-lg border border-border bg-surface-2 sm:h-14 sm:w-10">
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={{ rotateX: -80, opacity: 0, y: "-40%" }}
          animate={{ rotateX: 0, opacity: 1, y: 0 }}
          exit={{ rotateX: 80, opacity: 0, y: "40%" }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="absolute inset-0 grid place-items-center font-display text-xl font-semibold tabular-nums sm:text-2xl"
          style={{ transformOrigin: "center" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-border/60" />
    </div>
  );
}

function Colon() {
  return <span className="pb-0.5 font-display text-xl text-muted-foreground sm:text-2xl">:</span>;
}

function Group({ text }: { text: string }) {
  return (
    <div className="flex gap-1">
      {text.split("").map((d, i) => (
        <FlipDigit key={`${i}-${d}`} value={d} />
      ))}
    </div>
  );
}

/** Live flip-style clock. Renders a stable placeholder during SSR. */
export function FlipClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = now ? String(now.getHours()).padStart(2, "0") : "--";
  const mm = now ? String(now.getMinutes()).padStart(2, "0") : "--";
  const ss = now ? String(now.getSeconds()).padStart(2, "0") : "--";

  return (
    <div className="flex items-center gap-1.5">
      <Group text={hh} />
      <Colon />
      <Group text={mm} />
      <Colon />
      <Group text={ss} />
    </div>
  );
}
