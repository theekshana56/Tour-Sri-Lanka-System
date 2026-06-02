"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function normalizeBookingNumber(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export default function TrackBookingSearchPage() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = normalizeBookingNumber(value);
    if (!num) return;
    router.push(`/track/${encodeURIComponent(num)}`);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Track your booking</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your booking reference (e.g. TSL-V-01) from your confirmation
            email.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="TSL-V-01"
                className="pl-9 font-mono"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full bg-tsl-teal hover:bg-tsl-teal/90">
              Track booking
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have a reference yet?{" "}
            <Link href="/plan" className="font-medium text-tsl-teal hover:underline">
              Plan a trip
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
