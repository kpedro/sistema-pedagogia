import { cn } from "@/lib/utils";

export function Card({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("rounded-2xl bg-white p-4 shadow-md", className)}>{children}</div>;
}
