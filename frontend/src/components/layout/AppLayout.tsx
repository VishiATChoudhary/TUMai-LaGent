import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="container py-6 flex-grow">
          {children}
        </div>
        <div className="w-full h-16"></div>
      </main>
    </div>
  );
}
