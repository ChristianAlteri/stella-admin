import "./globals.css";
import { Arimo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ModalProvider } from "@/providers/modal-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const font = Arimo({
  weight: "400",

  subsets: ["latin"],
});

export const metadata = {
  title: "Stella Admin Dashboard",
  description: "Dashboard for Stella",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head></head>
        <body className={font.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system" 
            themes={["light", "dark", "galaxy"]} 
          >
            <html lang="en">
              <body className={font.className}>
                <ToastProvider />
                <ModalProvider />
                {children}
              </body>
            </html>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
