import { DriverLayout } from "@/components/driver/DriverLayout";

export default function DriverRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DriverLayout>{children}</DriverLayout>;
}
