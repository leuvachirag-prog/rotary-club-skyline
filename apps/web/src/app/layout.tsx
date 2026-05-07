import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/shared/auth-provider";

export const metadata: Metadata = {
  title: "Rotary Club of Ahmedabad Skyline",
  description: "Club management platform for Rotary Club of Ahmedabad Skyline",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
