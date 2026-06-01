"use client";

import Image from "next/image";
import Link from "next/link";

export function AuthSplitLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="https://picsum.photos/seed/srilanka/800/1000"
          alt="Sri Lanka scenery"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
          <h2 className="text-3xl font-bold">Tourism Sri Lanka</h2>
          <p className="mt-2 max-w-md text-sm text-white/80">
            Discover beaches, heritage sites, and hill country adventures across
            the pearl of the Indian Ocean.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="text-lg font-semibold">
              TSL Platform
            </Link>
            <h1 className="mt-6 text-2xl font-bold">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
