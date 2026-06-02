import Link from "next/link";
import type { ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-4xl text-muted-foreground" aria-hidden>
          {icon}
        </div>
      )}
      <h2 className="font-serif text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel &&
        (actionHref ? (
          <Link
            href={actionHref}
            className={cn(buttonVariants(), "mt-6 bg-tsl-teal hover:bg-tsl-teal/90")}
          >
            {actionLabel}
          </Link>
        ) : (
          <Button
            type="button"
            className="mt-6 bg-tsl-teal hover:bg-tsl-teal/90"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ))}
    </div>
  );
}
