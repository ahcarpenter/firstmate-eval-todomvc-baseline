import type { Metadata } from "next";
import "todomvc-app-css/index.css";
import "./pin.css";

export const metadata: Metadata = {
  title: "Next.js • TodoMVC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
