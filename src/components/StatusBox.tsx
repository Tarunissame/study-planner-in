import { Check, Minus } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { TopicStatus } from "@/lib/study";

type Props = {
  status: TopicStatus;
  overdue?: boolean;
  size?: "sm" | "md";
  onClick?: () => void;
  label?: string;
};

export function StatusBox({ status, overdue, size = "md", onClick, label }: Props) {
  const dim = size === "sm" ? "size-4" : "size-5";
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid shrink-0 place-items-center rounded-md border transition-colors duration-200",
        dim,
        status === "completed" && "border-success/70 bg-success/20 text-success",
        status === "in_progress" && "border-warning/70 bg-warning/20 text-warning",
        status === "blank" && !overdue && "border-border bg-transparent text-transparent",
        status === "blank" && overdue && "border-destructive/70 bg-destructive/15 text-destructive",
        onClick && "hover:border-primary/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      )}
    >
      <motion.span
        key={`${status}-${overdue}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="grid place-items-center"
      >
        {status === "completed" ? (
          <Check className={size === "sm" ? "size-3" : "size-3.5"} strokeWidth={3} />
        ) : status === "in_progress" ? (
          <Minus className={size === "sm" ? "size-3" : "size-3.5"} strokeWidth={3} />
        ) : overdue ? (
          <span className="size-1.5 rounded-full bg-destructive" />
        ) : null}
      </motion.span>
    </Tag>
  );
}