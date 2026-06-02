"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl" aria-hidden>
        ⚠️
      </p>
      <h1 className="mt-4 font-serif text-2xl font-bold text-tsl-forest">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We hit an unexpected problem. Please try again — if it keeps happening,
        contact support@tsl.lk.
      </p>
      <Button
        type="button"
        className="mt-8 bg-tsl-teal hover:bg-tsl-teal/90"
        onClick={() => reset()}
      >
        Try again
      </Button>
    </div>
  );
}
